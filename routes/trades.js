const express = require('express')
const { Deposit, Transaction } = require("../models/transaction")
const { User } = require("../models/user")
const { Util } = require("../models/util")

const router  = express.Router()

// getting all trades
router.get('/', async(req, res) => {
  try {
    const trades = await Trade.find()
    res.send(trades)
  } catch (x) { return res.status(500).send({message: "Something Went Wrong..."}) }
})


// getting a trade
router.get('/:id', async(req, res) => {
  const { id } = req.params
  try {
    const trade = await Trade.findById(id)
    if (!trade) return res.status(404).send({message: "Trade not found..."})
    res.send(trade);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});


router.get('/all-trades', async (req, res) => {
  try {
    const trades = await Trade.find();
    res.status(200).send(trades);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
});



// getting all trades of a user
router.get('/user/:email', async(req, res) => {
  const { email } = req.params
  try {
    const trades = await Trade.find({ email, status: 'pending' })
    if (!trades) return res.status(404).send({message: "Trade not found..."})
    res.send(trades);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});





// making a trade
router.post('/', async (req, res) => {
  const { id, amount, package } = req.body;

  const user = await User.findById( id );
  if (!user) return res.status(404).send({message: 'User not found'});

  if (user.trade < amount) return res.status(400).send({message: 'Insufficient funds'});
  
  try {
    const newTradeBal = Number(user.trade) - Number(amount);
    user.set({ trade: newTradeBal });


    const transaction = new Transaction({ 
      tradeData: { package, interest: ""},
      type: "trade", amount, 
      user: {
        id, email: user.email,
        name: user.fullName
      },
    });

    await Promise.all([user.save(), transaction.save()]);

    res.status(200).send({ message: 'Success'});
  } catch (error) { for (i in error.errors) res.status(500).send({message: error.errors[i].message}) }
});




// updating a trade
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = validateTrade(req.body);

  if (error) return res.status(400).send({message: error.details[0].message});

  const trade = await Transaction.findById(id);
  if (!trade) return res.status(404).send({message: 'Trade not found'});

  try {
    if (trade.status === 'pending') {
      trade.status = 'completed';
      const tradeAmt = trade.amount + trade.spread;
      await User.findOneAndUpdate({ email: trade.email }, {$inc: {trade: tradeAmt}})
    }
    await trade.save();
    res.send(trade);
  } catch (error) { for (i in error.errors) res.status(500).send({message: error.errors[i].message}) }
})


// deleting a trade
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const trade = await Transaction.findByIdAndRemove(id);
    if (!trade) return res.status(404).send({message: 'Trade not found'});

    res.send(trade);
  } catch (error) { for (i in error.errors) res.status(500).send({message: error.errors[i].message}) }
})



module.exports = router