import express from "express";
import { ActivityLog } from "../models/activityLog.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, requireAdmin, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const action = req.query.action;

  const filter = {};
  if (action) filter.action = action;

  try {
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.send({ logs });
  } catch (error) {
    console.error("Failed to fetch activity logs", error);
    res.status(500).send({ message: "Unable to fetch activity logs" });
  }
});

export default router;
