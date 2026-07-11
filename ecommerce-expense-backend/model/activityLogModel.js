const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  adminId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  adminEmail: { type: String },
  action:     { type: String, required: true },
  entity:     { type: String },
  entityId:   { type: String },
  details:    { type: String },
  ip:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
