import { ActivityLog } from "../models/activityLog.js";

export const recordActivity = async ({
  req,
  actor,
  action,
  targetCollection,
  targetId,
  metadata = {},
}) => {
  try {
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.ip;

    await ActivityLog.create({
      actorId: actor?._id,
      actorEmail: actor?.email,
      actorRole: actor?.isAdmin ? "admin" : "user",
      action,
      targetCollection,
      targetId,
      metadata,
      ipAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Failed to record activity", error);
  }
};
