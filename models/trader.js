import Joi from "joi";
import mongoose from "mongoose";

const traderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  handle: {
    type: String,
    required: true,
    trim: true,
    maxLength: 30,
    unique: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  markets: {
    type: [
      {
        type: String,
        trim: true,
        maxLength: 50,
      },
    ],
    required: true,
    default: [],
    validate: {
      validator: (value) => Array.isArray(value) && value.length > 0,
      message: "At least one market is required.",
    },
  },
  marketCategory: {
    type: String,
    trim: true,
    default: "",
    maxLength: 50,
  },
  riskLevel: {
    type: String,
    trim: true,
    default: "Moderate",
    maxLength: 20,
  },
  minimumBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  winRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  roi: {
    type: Number,
    default: 0,
    min: 0,
  },
  bio: {
    type: String,
    trim: true,
    default: "",
    maxLength: 280,
  },
  avatarUrl: {
    type: String,
    trim: true,
    default: "",
    maxLength: 500,
  },
  avatarPublicId: {
    type: String,
    trim: true,
    default: "",
    maxLength: 200,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

traderSchema.index({ handle: 1 }, { unique: true });

export const Trader = mongoose.model("Trader", traderSchema);

export const validateTrader = (trader) => {
  const schema = {
    name: Joi.string().trim().min(2).max(50).required(),
    handle: Joi.string().trim().min(2).max(30).required(),
    specialization: Joi.string().trim().min(2).max(50).required(),
    markets: Joi.array().items(Joi.string().trim().min(2).max(50)).min(1).required(),
    marketCategory: Joi.string().trim().allow(""),
    riskLevel: Joi.string().trim().min(2).max(20).required(),
    minimumBalance: Joi.number().min(0).required(),
    winRate: Joi.number().min(0).max(100).required(),
    roi: Joi.number().min(0).required(),
    bio: Joi.string().allow("").max(280),
    avatarUrl: Joi.string().allow("").max(500),
    avatarPublicId: Joi.string().allow("").max(200),
    isActive: Joi.boolean().required(),
  };

  return Joi.validate(trader, schema);
};
