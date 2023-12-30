const express = require('express')
const { Transaction } = require("../models/transaction")
const { User } = require("../models/user")
const { alertAdmin, depositMail } = require("../utils/mailer")

const router  = express.Router()


// getting all deposits
router.get('/', async(req, res) => {
  try {
    const deposits = await Transaction.find({ type: "deposit" })
    res.send(deposits)
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
})



// get all deposits by user
router.get('/user/:email', async(req, res) => {
  const { email } = req.params

  try {
    const deposits = await Transaction.find({ "user.email": email });
    if (!deposits || deposits.length === 0) return res.status(400).send({message: "Deposits not found..."})
    res.send(deposits);
  }
  catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
})


// making a deposit
router.post('/', async (req, res) => {
  const { type, email, amount, image } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send({message: 'Something went wrong'})
  
  try {
    const userData = {
      id: user._id, email, name: user.fullName,
    }

    // Create a new Deposit instance
    const deposit = new Transaction({ type, user: userData, amount });
    await deposit.save();

    const date = deposit.date;

    alertAdmin(email, amount, date, type, image)
    res.send({message: 'Deposit successful and pending approval...', deposit});
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});


// updating a deposit
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, amount, status } = req.body;

  const deposit = await Transaction.findById(id);
  if (!deposit) return res.status(404).send({message: 'Deposit not found'})

  const user = await User.findOne({ email: email });
  if (!user) return res.status(400).send({message: 'Something went wrong'})
  
  try {
    const [updatedDeposit, updatedUser] = await Promise.all([
      Transaction.findByIdAndUpdate(id, { amount, status }, { new: true }),
      User.findOneAndUpdate({ email }, { $inc: { balance: amount } }, { new: true })
    ]);

    if (!updatedDeposit || !updatedUser) throw new Error('Failed to update deposit and user')
    const { fullName, email } = updatedUser;
    const { date } = updatedDeposit;

    depositMail(fullName, amount, date, email)
    res.send(updatedDeposit);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});


module.exports = router;
