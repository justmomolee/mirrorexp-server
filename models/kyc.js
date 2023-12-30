const Joi = require("joi");
const mongoose = require("mongoose");


// Kyc schema
const kycSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 225
  },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 225
  },
  kyc: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 225
  },
  status: {
    type: Boolean,
    default: false
  }
});



// kyc model
const Kyc = mongoose.model("Kyc", kycSchema);


// validate Kyc
function validateKyc(kyc) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(225).required(),
    email: Joi.string().min(5).max(225).required(),
    kyc: Joi.string().min(5).max(225).required(),
  });

  return schema.validate(kyc);
}


// exports
exports.Kyc = Kyc;
exports.validateKyc = validateKyc;