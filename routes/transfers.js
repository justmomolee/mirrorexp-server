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
    const depositPlusInterest = Number(deposit) + Number(interest)

    const newDeposit = depositPlusInterest - Number(amount)
    const newTrade = Number(trade) + Number(amount)
    console.log(newDeposit, newTrade, depositPlusInterest)

    if (depositPlusInterest < Number(amount)) return res.status(400).send({message: 'Insufficient Balance, fund your account and try again'})

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
      }
    });

    const result = await Promise.all([user.save(), transaction.save()]);
    console.log(result)
    res.send({message: "success"});
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});




// making a transaction from trade to deposit
router.post('/fromTrade', async (req, res) => {
  const { type, from, to, amount, status, method } = req.body;
  const { error } = validateTransaction(req.body);

  if (error) return res.status(400).send({message: error.details[0].message})

  const user = await User.findOne({ email: from });
  if (!user) return res.status(404).send({message: 'User not found'})
  const { deposit, trade } = user
  const newTrade = Number(trade) - Number(amount)
  const newDeposit = Number(deposit) + Number(amount)

  if (Number(trade) < Number(amount)) return res.status(400).send({message: 'Insufficient deposit'})
  
  try {
    user.set({
      trade: newTrade,
      deposit: newDeposit
    });

    const transaction = new Transaction({ type, from, to, amount, status, method });
    await Promise.all([user.save(), transaction.save()]);

    req.app.io.emit('change');
    res.send(user);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});




// making a transaction to ctm user
router.post('/toUser', async (req, res) => {
  const { type, from, to, amount, status, method } = req.body;
  const { error } = validateTransaction(req.body);

  if (error) return res.status(400).send({message: error.details[0].message})

  const userFrom = await User.findOne({ email: from });
  const userTo = await User.findOne({ email: to });

  if (!userFrom || !userTo) return res.status(404).send({message: 'User not found'})

  if(userFrom.email === userTo.email) return res.status(400).send({message: 'You cannot transaction to yourself'})

  if (Number(userFrom.deposit) < Number(amount)) return res.status(400).send({message: 'Insufficient deposit'})
  
  try {
    const newDeposit = Number(userFrom.deposit) - Number(amount)
    const newReceiverBalance = Number(userTo.deposit) + Number(amount)
    userFrom.deposit = newDeposit;
    userTo.deposit = newReceiverBalance;

    const transaction = new Transaction({ type, from, to, amount, status, method });
    await Promise.all([userFrom.save(), userTo.save(), transaction.save()]);

    req.app.io.emit('change');
    res.send({...userFrom, ...userTo});
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});



module.exports = router