import { ActivityLog } from "../models/activityLog.js";
import { getRequestContext } from "./requestContext.js";

export const recordActivity = async ({
  req,
  actor,
  action,
  targetCollection,
  targetId,
  metadata = {},
}) => {
  try {
    const ctx = await getRequestContext(req);
    const mergedMetadata = {
      ...metadata,
      route: req.originalUrl,
      method: req.method,
    };

    await ActivityLog.create({
      actorId: actor?._id,
      actorEmail: actor?.email,
      actorRole: actor?.isAdmin ? "admin" : "user",
      action,
      targetCollection,
      targetId,
      metadata: mergedMetadata,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      location: ctx.location,
    });
  } catch (error) {
    console.error("Failed to record activity", error);
  }
};
