const ActivityLog = require("../model/activityLogModel");

const log = (action, entity) => async (req, res, next) => {
  res.on("finish", async () => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user?.isAdmin) {
      try {
        await ActivityLog.create({
          adminId:    req.user._id,
          adminEmail: req.user.email,
          action,
          entity,
          entityId:   req.params?.id || req.params?.productId || "",
          details:    JSON.stringify(req.body || {}).slice(0, 300),
          ip:         req.ip,
        });
      } catch {}
    }
  });
  next();
};

module.exports = log;
