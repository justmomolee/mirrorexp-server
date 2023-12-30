const express = require('express')
const { Transaction } = require("../models/transaction")

const router  = express.Router()



// getting single transaction
router.get('/:id', async(req, res) => {
  const { id } = req.params

  try {
    const transaction = await Transaction.findById(id)

    if(!transaction) return res.status(400).send({message: "Transaction not found..."})   
    res.send(transaction);
  } 
  catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
})



// getting all transactions
router.get('/', async (req, res) => {
  try {
    let transactions = await Transaction.find()
    if (!transactions || transactions.length === 0) return res.status(400).send({message: "Transactions not found..."})

    transactions = arr.flat();
    transactions.sort((a, b) => b.date - a.date);

    res.send(transactions);
  } 
  catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});




// get all transactions by user
router.get('/user/:email', async(req, res) => {
  const { email } = req.params
  
  try {
    let transactions = await Transaction.find({"user.email": email})
    if (!transactions || transactions.length === 0) return res.status(400).send({message: "Transactions not found..."})

    transactions = arr.flat();
    transactions.sort((a, b) => b.date - a.date);

    res.send(transactions);
  } 
  catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});


// Delete a transaction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let transaction = await Transaction.findByIdAndRemove(id);

    if(!transaction) return res.status(400).send({message: "Transaction not found..."})   
    res.send(transaction);
  } catch(e){ for(i in e.errors) res.status(500).send({message: e.errors[i].message}) }
});



module.exports = router