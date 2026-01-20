import express from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/transaction.js';
import { User } from '../models/user.js';
import { auth, requireAdmin } from '../middleware/auth.js';
import { recordActivity } from '../utils/activityLogger.js';

const router  = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const trades = await Transaction.find({ type: 'trade' }).sort({ date: 'asc' });
    res.send(trades);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Something Went Wrong..." });
  }
});



// making a trade
router.post('/', auth, requireAdmin, async (req, res) => {
  const { package:plan, interest } = req.body;
  
  try {
    const trade = new Transaction({ 
      tradeData: { package: plan, interest},
      type: "trade", amount: 0,
    });

    await trade.save()

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_create_trade",
      targetCollection: "transactions",
      targetId: trade._id.toString(),
      metadata: { plan, interest },
    });

    res.status(200).send({ message: 'Success'});
  } catch (error) { for (i in error.errors) res.status(500).send({message: error.errors[i].message}) }
});




// updating a trade
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

    // Check and update user balances
    const users = await User.find({ deposit: { $gt: 0 } }).session(session);
    
    for (const user of users) {
      const calculatedInterest = trade.tradeData.interest * user.deposit;
      user.interest += calculatedInterest;
      await user.save({ session });
    }

    // Update trade status
    if (trade.status === 'pending') {
      trade.status = 'success';
    }

    await trade.save({ session });
    await session.commitTransaction();
    session.endSession();

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_close_trade",
      targetCollection: "transactions",
      targetId: trade._id.toString(),
    });

    res.send({message: "Trade successfully updated"});
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


// deleting a trade
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
  } catch (error) { for (i in error.errors) res.status(500).send({message: error.errors[i].message}) }
})



export default router;
