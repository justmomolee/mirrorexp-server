const express = require('express')
const { Util } = require("../models/util")

const router  = express.Router()

// getting all utils
router.get('/', async(req, res) => {
  try {
    const utils = await Util.find()
    res.send(utils[0])
  } catch (x) { return res.status(500).send("Something Went Wrong...") }
})



// updating a util
router.put('/:id/:coinId', async (req, res) => {
  const { name, address, network, price } = req.body;
  const { id, coinId } = req.params;

  try {
    const util = await Util.findByIdAndUpdate(
      id,
      {
        $set: {
          [`coins.$[coinElem].name`]: name,
          [`coins.$[coinElem].address`]: address,
          [`coins.$[coinElem].network`]: network,
          [`coins.$[coinElem].price`]: price,
        },
      },
      {
        arrayFilters: [{ 'coinElem._id': mongoose.Types.ObjectId(coinId) }],
        new: true,
        runValidators: true,
      }
    );

    if (!util) return res.status(404).send('Util not found');

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