const db = require("../../models");
const { ValidationError } = require("../errors/CustomError");

class NotificationService {
  static async createNotification(payload) {
    const notificationData = await db.Notifications.create({
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    if (!notificationData) return false;
    await notificationData.save();
    return notificationData;
  }
}

module.exports = NotificationService;
