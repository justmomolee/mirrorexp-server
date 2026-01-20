import mongoose from "mongoose";

const activityLocationSchema = new mongoose.Schema(
  {
    city: String,
    region: String,
    country: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const activityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorEmail: String,
  actorRole: { type: String, default: "user" },
  action: { type: String, required: true },
  targetCollection: String,
  targetId: String,
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  location: activityLocationSchema,
  createdAt: { type: Date, default: Date.now },
});

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
