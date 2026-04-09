import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { Trader, validateTrader } from "../models/trader.js";
import { Transaction } from "../models/transaction.js";
import { User } from "../models/user.js";
import { auth, requireAdmin } from "../middleware/auth.js";
import { recordActivity } from "../utils/activityLogger.js";

const router = express.Router();

const defaultTraderSeeds = [
  {
    name: "Amara Cole",
    handle: "amarafx",
    specialization: "Scalping",
    markets: ["Forex", "Indices"],
    riskLevel: "Moderate",
    minimumBalance: 500,
    winRate: 78,
    roi: 32,
    bio: "Short intraday setups with disciplined exits on liquid sessions.",
    avatarUrl: "",
    avatarPublicId: "",
    isActive: true,
  },
  {
    name: "Noah Grant",
    handle: "noahcrypto",
    specialization: "Swing Trading",
    markets: ["Crypto"],
    riskLevel: "High",
    minimumBalance: 750,
    winRate: 71,
    roi: 44,
    bio: "Momentum-driven crypto entries with clear invalidation levels.",
    avatarUrl: "",
    avatarPublicId: "",
    isActive: true,
  },
  {
    name: "Sophia Reed",
    handle: "sophiaxau",
    specialization: "Gold Momentum",
    markets: ["Commodities", "Forex"],
    riskLevel: "Moderate",
    minimumBalance: 1000,
    winRate: 80,
    roi: 39,
    bio: "Gold and macro-driven FX setups built around session liquidity.",
    avatarUrl: "",
    avatarPublicId: "",
    isActive: true,
  },
  {
    name: "Ethan Vale",
    handle: "ethanindices",
    specialization: "Breakout Trading",
    markets: ["Indices"],
    riskLevel: "Low",
    minimumBalance: 400,
    winRate: 74,
    roi: 27,
    bio: "Index breakouts with simple risk caps and steady trade frequency.",
    avatarUrl: "",
    avatarPublicId: "",
    isActive: true,
  },
];
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || "mirrorexp/traders";

const parseBoolean = (value, fallback = true) => {
  if (value === undefined) return fallback;
  return value === true || value === "true";
};

const normalizeMarkets = (value) => {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))];
  }

  if (typeof value === "string") {
    return [...new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean))];
  }

  return [];
};

const normalizeTraderPayload = (body) => {
  const markets = normalizeMarkets(body.markets ?? body.marketCategory);

  return {
    name: body.name?.trim(),
    handle:
      typeof body.handle === "string"
        ? body.handle.trim().replace(/^@/, "").toLowerCase()
        : undefined,
    specialization: body.specialization?.trim(),
    markets,
    marketCategory: markets[0] || "",
    riskLevel: body.riskLevel?.trim() || "Moderate",
    minimumBalance: Number(body.minimumBalance ?? 0),
    winRate: Number(body.winRate ?? 0),
    roi: Number(body.roi ?? 0),
    bio: body.bio?.trim() || "",
    avatarUrl: body.avatarUrl?.trim() || "",
    avatarPublicId: body.avatarPublicId?.trim() || "",
    isActive: parseBoolean(body.isActive, true),
  };
};

const getCopyCountMap = async () => {
  const copyCounts = await User.aggregate([
    { $match: { copiedTraders: { $exists: true, $ne: [] } } },
    { $unwind: "$copiedTraders" },
    { $group: { _id: "$copiedTraders", count: { $sum: 1 } } },
  ]);

  return new Map(copyCounts.map((entry) => [entry._id.toString(), entry.count]));
};

const serializeTrader = (trader, copiedTraderIds = new Set(), copyCountMap = new Map()) => {
  const data = trader.toObject();
  const markets = normalizeMarkets(data.markets?.length ? data.markets : data.marketCategory);

  return {
    ...data,
    markets,
    marketCategory: markets[0] || data.marketCategory || "",
    isCopied: copiedTraderIds.has(trader._id.toString()),
    copyCount: copyCountMap.get(trader._id.toString()) || 0,
  };
};

router.get("/", auth, async (req, res) => {
  try {
    const showAll = req.authUser.isAdmin && req.query.includeInactive === "true";
    const traders = await Trader.find(showAll ? {} : { isActive: true }).sort({ createdAt: -1 });
    const copiedTraderIds = new Set((req.authUser.copiedTraders || []).map((id) => id.toString()));
    const copyCountMap = await getCopyCountMap();

    res.send(traders.map((trader) => serializeTrader(trader, copiedTraderIds, copyCountMap)));
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch traders." });
  }
});

router.post("/avatar-signature", auth, requireAdmin, async (req, res) => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).send({ message: "Cloudinary is not configured." });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${cloudinaryFolder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(`${paramsToSign}${process.env.CLOUDINARY_API_SECRET}`)
      .digest("hex");

    res.send({
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: cloudinaryFolder,
      signature,
      timestamp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to prepare avatar upload." });
  }
});

router.post("/seed", auth, requireAdmin, async (req, res) => {
  try {
    const operations = defaultTraderSeeds.map((seedTrader) => {
      const payload = normalizeTraderPayload(seedTrader);

      return {
        updateOne: {
          filter: { handle: payload.handle },
          update: { $set: payload },
          upsert: true,
        },
      };
    });

    const result = await Trader.bulkWrite(operations);

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_seed_traders",
      targetCollection: "traders",
      metadata: {
        insertedCount: result.upsertedCount || 0,
        updatedCount: result.modifiedCount || 0,
      },
    });

    res.send({
      message: "Test traders seeded successfully.",
      insertedCount: result.upsertedCount || 0,
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to seed traders." });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).send({ message: "Trader not found." });
    if (!trader.isActive && !req.authUser.isAdmin) {
      return res.status(404).send({ message: "Trader not found." });
    }

    const copiedTraderIds = new Set((req.authUser.copiedTraders || []).map((id) => id.toString()));
    const copyCountMap = await getCopyCountMap();
    res.send(serializeTrader(trader, copiedTraderIds, copyCountMap));
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: "Invalid trader ID." });
    }
    res.status(500).send({ message: "Failed to fetch trader." });
  }
});

router.post("/", auth, requireAdmin, async (req, res) => {
  const payload = normalizeTraderPayload(req.body);
  const { error } = validateTrader(payload);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const trader = await new Trader(payload).save();

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_create_trader",
      targetCollection: "traders",
      targetId: trader._id.toString(),
      metadata: {
        handle: trader.handle,
        specialization: trader.specialization,
        markets: trader.markets,
      },
    });

    res.status(201).send({ message: "Trader created successfully.", trader });
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(400).send({ message: "Trader handle already exists." });
    }
    res.status(500).send({ message: "Failed to create trader." });
  }
});

router.put("/:id", auth, requireAdmin, async (req, res) => {
  const payload = normalizeTraderPayload(req.body);
  const { error } = validateTrader(payload);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const trader = await Trader.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true },
    );

    if (!trader) return res.status(404).send({ message: "Trader not found." });

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_update_trader",
      targetCollection: "traders",
      targetId: trader._id.toString(),
      metadata: {
        handle: trader.handle,
        specialization: trader.specialization,
        markets: trader.markets,
      },
    });

    res.send({ message: "Trader updated successfully.", trader });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: "Invalid trader ID." });
    }
    if (error?.code === 11000) {
      return res.status(400).send({ message: "Trader handle already exists." });
    }
    res.status(500).send({ message: "Failed to update trader." });
  }
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const trader = await Trader.findByIdAndDelete(req.params.id);
    if (!trader) return res.status(404).send({ message: "Trader not found." });

    await User.updateMany({}, { $pull: { copiedTraders: trader._id } });
    await Transaction.deleteMany({
      type: "trade",
      status: "pending",
      "tradeData.traderId": trader._id,
    });

    await recordActivity({
      req,
      actor: req.authUser,
      action: "admin_delete_trader",
      targetCollection: "traders",
      targetId: trader._id.toString(),
      metadata: { handle: trader.handle },
    });

    res.send({ message: "Trader deleted successfully." });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: "Invalid trader ID." });
    }
    res.status(500).send({ message: "Failed to delete trader." });
  }
});

router.post("/:id/copy", auth, async (req, res) => {
  if (req.authUser.isAdmin) {
    return res.status(403).send({ message: "Admins cannot copy traders." });
  }

  try {
    const trader = await Trader.findOne({ _id: req.params.id, isActive: true });
    if (!trader) return res.status(404).send({ message: "Trader not found." });

    const user = await User.findById(req.authUser._id);
    if (!user) return res.status(404).send({ message: "User not found." });

    const alreadyCopied = (user.copiedTraders || []).some((id) => id.toString() === trader._id.toString());
    if (!alreadyCopied) {
      user.copiedTraders.push(trader._id);
      await user.save();
    }

    await recordActivity({
      req,
      actor: req.authUser,
      action: "user_copy_trader",
      targetCollection: "traders",
      targetId: trader._id.toString(),
      metadata: { handle: trader.handle },
    });

    res.send({ message: "Trader copied successfully." });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: "Invalid trader ID." });
    }
    res.status(500).send({ message: "Failed to copy trader." });
  }
});

router.delete("/:id/copy", auth, async (req, res) => {
  if (req.authUser.isAdmin) {
    return res.status(403).send({ message: "Admins cannot uncopy traders." });
  }

  try {
    const trader = await Trader.findById(req.params.id);
    if (!trader) return res.status(404).send({ message: "Trader not found." });

    const user = await User.findById(req.authUser._id);
    if (!user) return res.status(404).send({ message: "User not found." });

    user.copiedTraders = (user.copiedTraders || []).filter((id) => id.toString() !== trader._id.toString());
    await user.save();

    await recordActivity({
      req,
      actor: req.authUser,
      action: "user_uncopy_trader",
      targetCollection: "traders",
      targetId: trader._id.toString(),
      metadata: { handle: trader.handle },
    });

    res.send({ message: "Trader removed successfully." });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({ message: "Invalid trader ID." });
    }
    res.status(500).send({ message: "Failed to remove trader." });
  }
});

export default router;
