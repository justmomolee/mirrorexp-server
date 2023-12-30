const express = require('express')
const { Transfer, validateTransfer } = require("../models/transaction")
const { User } = require("../models/user")

const router  = express.Router()

// getting all transfers
router.get('/', async(req, res) => {
  try {
    const transfers = await Transfer.find()
    res.send(transfers)
  } catch (x) { return res.status(400).send({message: "Something Went Wrong..."}) }
})


//get a single transfer
router.get('/:id', async(req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
    if (!transfer) return res.status(404).send({message: 'Transfer not found'})
    res.send(transfer)
  } catch (x) { return res.status(400).send({message: "Something Went Wrong..."}) }
})

//get all transfers of a user
router.get('/user/:email', async(req, res) => {
  try {
    const transfers = await Transfer.find({$or: [{from: req.params.email}, {to: req.params.email}]})
    if (!transfers) return res.status(404).send({message: 'Transfer not found'})
    res.send(transfers)
  } catch (x) { return res.status(400).send({message: "Something Went Wrong..."}) }
})


// making a transfer from balance to trade
router.post('/toTrade', async (req, res) => {
  const { type, from, to, amount, status, method } = req.body;
  const { error } = validateTransfer(req.body);

  if (error) return res.status(400).send({message: error.details[0].message})

  try {
    const user = await User.findOne({ email: from });
    if (!user) return res.status(404).send({message: 'User not found'})

    const { balance, trade } = user
    const newBalance = Number(balance) - Number(amount)
    const newTrade = Number(trade) + Number(amount)

    if (Number(balance) < Number(amount)) return res.status(400).send({message: 'Insufficient balance'})

    user.set({
      balance: newBalance,
      trade: newTrade
    });

    console.log(newBalance, newTrade)

    const transfer = new Transfer({ type, from, to, amount, status, method });
    await Promise.all([user.save(), transfer.save()]);
    req.app.io.emit('change');
    res.send(user);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});




// making a transfer from trade to balance
router.post('/fromTrade', async (req, res) => {
  const { type, from, to, amount, status, method } = req.body;
  const { error } = validateTransfer(req.body);

  if (error) return res.status(400).send({message: error.details[0].message})

  const user = await User.findOne({ email: from });
  if (!user) return res.status(404).send({message: 'User not found'})
  const { balance, trade } = user
  const newTrade = Number(trade) - Number(amount)
  const newBalance = Number(balance) + Number(amount)

  if (Number(trade) < Number(amount)) return res.status(400).send({message: 'Insufficient balance'})
  
  try {
    user.set({
      trade: newTrade,
      balance: newBalance
    });

    const transfer = new Transfer({ type, from, to, amount, status, method });
    await Promise.all([user.save(), transfer.save()]);

    req.app.io.emit('change');
    res.send(user);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});




// making a transfer to ctm user
router.post('/toUser', async (req, res) => {
  const { type, from, to, amount, status, method } = req.body;
  const { error } = validateTransfer(req.body);

  if (error) return res.status(400).send({message: error.details[0].message})

  const userFrom = await User.findOne({ email: from });
  const userTo = await User.findOne({ email: to });

  if (!userFrom || !userTo) return res.status(404).send({message: 'User not found'})

  if(userFrom.email === userTo.email) return res.status(400).send({message: 'You cannot transfer to yourself'})

  if (Number(userFrom.balance) < Number(amount)) return res.status(400).send({message: 'Insufficient balance'})
  
  try {
    const newBalance = Number(userFrom.balance) - Number(amount)
    const newReceiverBalance = Number(userTo.balance) + Number(amount)
    userFrom.balance = newBalance;
    userTo.balance = newReceiverBalance;

    const transfer = new Transfer({ type, from, to, amount, status, method });
    await Promise.all([userFrom.save(), userTo.save(), transfer.save()]);

    req.app.io.emit('change');
    res.send({...userFrom, ...userTo});
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});



module.exports = router