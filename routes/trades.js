import express from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/transaction.js';
import { Trader } from '../models/trader.js';
import { User } from '../models/user.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { recordActivity } from '../utils/activityLogger.js';

const router  = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const linkedTradeFilter = {
      type: 'trade',
      'tradeData.traderId': { $exists: true },
    };

    if (req.authUser.isAdmin) {
      const trades = await Transaction.find(linkedTradeFilter).sort({ status: 1, date: -1 });
      return res.send(trades);
    }

    const copiedTraderIds = (req.authUser.copiedTraders || []).map((id) => id.toString());
    if (!copiedTraderIds.length) {
      return res.send([]);
    }

    const trades = await Transaction.find({
      ...linkedTradeFilter,
      status: 'pending',
      'tradeData.traderId': {
        $in: copiedTraderIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    }).sort({ date: -1 });

    const dedupedTrades = [
      ...new Map(
        trades.map((trade) => [trade._id.toString(), trade]),
      ).values(),
    ];

    res.send(dedupedTrades);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Something Went Wrong..." });
  }
});



// creating a live trade
router.post('/', auth, requireAdmin, async (req, res) => {
  const { traderId, package: instrument, interest, summary } = req.body;
  const profitRate = Number(interest);
  
  if (!traderId || !instrument?.trim()) {
    return res.status(400).send({ message: 'Trader and instrument are required.' });
  }

  if (!Number.isFinite(profitRate) || profitRate < 0 || profitRate > 1) {
    return res.status(400).send({ message: 'Interest rate must be between 0 and 1.' });
  }

  try {
    const trader = await Trader.findById(traderId);
    if (!trader) {
      return res.status(404).send({ message: 'Trader not found.' });
    }

    const markets =
      Array.isArray(trader.markets) && trader.markets.length
        ? trader.markets
        : [trader.marketCategory].filter(Boolean);

    const trade = new Transaction({ 
      tradeData: {
        package: instrument.trim(),
        interest: profitRate,
        traderId: trader._id,
        traderName: trader.name,
        specialization: trader.specialization,
        markets,
        marketCategory: markets[0] || '',
        requiredBalance: trader.minimumBalance,
        summary: summary?.trim() || '',
      },
      type: "trade", amount: 0,
    });

    await trade.save()

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_create_trade",
      targetCollection: "transactions",
      targetId: trade._id.toString(),
      metadata: {
        traderId: trader._id.toString(),
        traderHandle: trader.handle,
        instrument: instrument.trim(),
        interest: profitRate,
      },
    });

    res.status(200).send({ message: 'Live trade created successfully.'});
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: 'Invalid trader ID.' });
    }
    res.status(500).send({ message: 'Failed to create live trade.' });
  }
});




// closing a live trade
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trade = await Transaction.findById(id).session(session);
    if (!trade) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ message: 'Trade not found' });
    }

    if (trade.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message: 'Only active trades can be closed.' });
    }

    if (!trade.tradeData.traderId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message: 'Trade is not linked to a trader.' });
    }

    const requiredBalance = Number(trade.tradeData.requiredBalance || 0);
    const users = await User.find({
      copiedTraders: trade.tradeData.traderId,
      deposit: { $gte: Math.max(requiredBalance, 0) },
    }).session(session);

    let totalDistributed = 0;
    let eligibleUsers = 0;
    
    for (const user of users) {
      const calculatedInterest = Number((trade.tradeData.interest * user.deposit).toFixed(2));
      if (calculatedInterest <= 0) continue;
      user.interest += calculatedInterest;
      await user.save({ session });
      totalDistributed += calculatedInterest;
      eligibleUsers += 1;
    }

    trade.status = 'success';
    trade.amount = Number(totalDistributed.toFixed(2));

    await trade.save({ session });
    await session.commitTransaction();
    session.endSession();

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_close_trade",
      targetCollection: "transactions",
      targetId: trade._id.toString(),
      metadata: { totalDistributed, eligibleUsers },
    });

    res.send({
      message: "Live trade closed successfully.",
      totalDistributed: Number(totalDistributed.toFixed(2)),
      eligibleUsers,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


// deleting a live trade
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const trade = await Transaction.findByIdAndRemove(id);
    if (!trade) return res.status(404).send({message: 'Trade not found'});

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_delete_trade",
      targetCollection: "transactions",
      targetId: id,
    });

    res.send(trade);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to delete live trade.' });
  }
})



export default router;
