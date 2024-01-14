const express = require('express')
const { Transaction } = require("../models/transaction")
const { User } = require("../models/user")

const router  = express.Router()

// getting all transactions
router.get('/', async(req, res) => {
  try {
    const transactions = await Transaction.find()
    res.send(transactions)
  } catch (x) { return res.status(400).send({message: "Something Went Wrong..."}) }
})


//get a single transaction
router.get('/:id', async(req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    if (!transaction) return res.status(404).send({message: 'Transaction not found'})
    res.send(transaction)
  } catch (x) { return res.status(400).send({message: "Something Went Wrong..."}) }
})

// making a transaction from deposit to trade
router.post('/toTrade', async (req, res) => {
  const { id, amount } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).send({message: 'User not found'})

  try {
    const { deposit, interest, trade } = user 

    const newDeposit = Number(deposit) + Number(interest) - Number(amount)
    const newTrade = Number(trade) + Number(amount)

    if ((Number(deposit) + Number(interest)) < Number(amount)) return res.status(400).send({message: 'Insufficient Balance, fund your account and try again'})

    user.set({
      deposit: newDeposit,
      interest: 0,
      trade: newTrade
    });


    const transaction = new Transaction({ 
      type: "transfer", amount, 
      user: {
        id, email: user.email,
        name: user.fullName
      },
      status: "success"
    });

    await Promise.all([user.save(), transaction.save()]);
    res.send({message: "success"});
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});




// making a transaction from trade to deposit
router.post('/fromTrade', async (req, res) => {
  const { id, amount } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).send({message: 'User not found'})

  try {
    const { deposit, trade } = user 

    const newTrade = Number(trade) - Number(amount)

    if (Number(trade) < Number(amount)) return res.status(400).send({message: 'Insufficient trade Balance, fund your account and try again'})

    user.set({
      deposit: Number(deposit) + Number(amount),
      trade: newTrade
    });


    const transaction = new Transaction({ 
      type: "transfer", amount, 
      user: {
        id, email: user.email,
        name: user.fullName
      },
      status: "success"
    });

    await Promise.all([user.save(), transaction.save()]);
    res.send({message: "success"});
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});


module.exports = router