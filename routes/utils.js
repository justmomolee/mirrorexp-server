const express = require('express')
const { Util, validateUtil } = require("../models/util")

const router  = express.Router()

// getting all utils
router.get('/', async(req, res) => {
  try {
    const utils = await Util.find()
    res.send(utils)
  } catch (x) { return res.status(500).send("Something Went Wrong...") }
})

// getting a util
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const util = await Util.findById(id);
    if (!util) return res.status(404).send('Util not found');

    res.status(200).send(util);
  } catch (error) { for (i in error.errors) res.status(500).send(error.errors[i].message) }
});



// creating a util
router.post('/', async (req, res) => {
  const { margin, accountName, accountNumber, bankName, walletCoin, walletAddress, rate, bonus  } = req.body;
  const { error } = validateUtil(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const util = new Util({ margin, accountName, accountNumber, bankName, walletCoin, walletAddress, rate, bonus })
    await util.save();

    res.status(200).send(util);
  } catch (error) { for (i in error.errors) res.status(500).send(error.errors[i].message) }
});



// updating a util
router.put('/:id', async (req, res) => {
  const { margin, accountName, accountNumber, bankName, walletCoin, walletAddress, rate, bonus } = req.body;
  const { id } = req.params;
  const { error } = validateUtil(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const util = await Util.findById(id);
  if (!util) return res.status(404).send('Util not found');

  try {
    util.margin = margin;
    util.accountName = accountName;
    util.accountNumber = accountNumber;
    util.bankName = bankName;
    util.walletCoin = walletCoin;
    util.walletAddress = walletAddress;
    util.rate = rate;
    util.bonus = bonus;
    await util.save();

    res.status(200).send(util);
  } catch (error) { for (i in error.errors) res.status(500).send(error.errors[i].message) }
});



// deleting a util
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const util = await Util.findByIdAndRemove(id);
    if (!util) return res.status(404).send('Util not found');

    res.status(200).send(util);
  } catch (error) { for (i in error.errors) res.status(500).send(error.errors[i].message) }
});



module.exports = router;