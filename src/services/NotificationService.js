const {
  getDatabase,
  getMessaging,
  getServerTimestamp,
} = require("../utils/notiHelper");
const ThongBaoService = require("./ThongBaoService");

class NotificationService {
  /**
   * Gửi thông báo cho nhân viên qua FCM
   * @param {number} maNhanVien - Mã nhân viên nhận thông báo
   * @param {object} notificationData - Dữ liệu thông báo
   * @returns {Promise<object>} Kết quả gửi thông báo
   */
  async sendNotificationToEmployee(maNhanVien, notificationData) {
    try {
      const {
        title,
        body,
        data = {},
        maDDH,
        loaiThongBao = "PHAN_CONG_DON_HANG",
      } = notificationData;

      // Lấy tất cả token của nhân viên
      const tokens = await ThongBaoService.getTokensByEmployee(maNhanVien);

      if (!tokens || tokens.length === 0) {
        console.log(`Không tìm thấy token cho nhân viên ${maNhanVien}`);
        return {
          success: false,
          message: "Không tìm thấy thiết bị đăng ký",
          sentCount: 0,
          failedCount: 0,
        };
      }

      // Lọc lấy danh sách FCM tokens
      const fcmTokens = tokens
        .filter((t) => t.provider === "fcm")
        .map((t) => t.token);

      if (fcmTokens.length === 0) {
        console.log(`Không có token FCM cho nhân viên ${maNhanVien}`);
        return {
          success: false,
          message: "Không có thiết bị FCM đăng ký",
          sentCount: 0,
          failedCount: 0,
        };
      }

      // Tạo thông báo trong Realtime Database
      const db = getDatabase();
      const notificationRef = db.ref(`notifications/${maNhanVien}`).push();
      const notificationId = notificationRef.key;

      const notificationRecord = {
        id: notificationId,
        maNhanVien: maNhanVien,
        tieuDe: title,
        noiDung: body,
        loaiThongBao: loaiThongBao,
        maDDH: maDDH || null,
        ngayTao: getServerTimestamp(),
        daDoc: false,
        ...data,
      };

      // Lưu vào Realtime Database
      await notificationRef.set(notificationRecord);

      // Cấu hình message FCM
      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: {
          notificationId: notificationId,
          maNhanVien: String(maNhanVien),
          loaiThongBao: loaiThongBao,
          maDDH: maDDH ? String(maDDH) : "",
          ...Object.keys(data).reduce((acc, key) => {
            acc[key] = String(data[key]);
            return acc;
          }, {}),
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "default",
            priority: "high",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      // Gửi đến tất cả thiết bị
      const messaging = getMessaging();
      let sentCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const token of fcmTokens) {
        try {
          await messaging.send({
            ...message,
            token: token,
          });
          sentCount++;
          console.log(
            `✓ Đã gửi thông báo đến token: ${token.substring(0, 20)}...`
          );
        } catch (error) {
          failedCount++;
          errors.push({
            token: token.substring(0, 20) + "...",
            error: error.message,
          });
          console.error(
            `✗ Lỗi gửi thông báo đến token ${token.substring(0, 20)}...:`,
            error.message
          );
        }
      }

      console.log(
        `📊 Kết quả: Đã gửi ${sentCount}/${fcmTokens.length} thông báo cho nhân viên ${maNhanVien}`
      );

      return {
        success: sentCount > 0,
        message: `Đã gửi ${sentCount}/${fcmTokens.length} thông báo`,
        sentCount: sentCount,
        failedCount: failedCount,
        totalTokens: fcmTokens.length,
        notificationId: notificationId,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Error in sendNotificationToEmployee:", error);
      throw error;
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   * @param {number} maNhanVien - Mã nhân viên
   * @param {string} notificationId - ID thông báo
   */
  async markNotificationAsRead(maNhanVien, notificationId) {
    try {
      const db = getDatabase();
      const notificationRef = db.ref(
        `notifications/${maNhanVien}/${notificationId}`
      );

      await notificationRef.update({
        daDoc: true,
        ngayDoc: getServerTimestamp(),
      });

      console.log(`✓ Đã đánh dấu thông báo ${notificationId} là đã đọc`);

      return {
        success: true,
        message: "Đã đánh dấu thông báo là đã đọc",
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Xóa thông báo
   * @param {number} maNhanVien - Mã nhân viên
   * @param {string} notificationId - ID thông báo
   */
  async deleteNotification(maNhanVien, notificationId) {
    try {
      const db = getDatabase();
      const notificationRef = db.ref(
        `notifications/${maNhanVien}/${notificationId}`
      );

      await notificationRef.remove();

      console.log(`✓ Đã xóa thông báo ${notificationId}`);

      return {
        success: true,
        message: "Đã xóa thông báo",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách thông báo của nhân viên
   * @param {number} maNhanVien - Mã nhân viên
   * @param {number} limit - Số lượng thông báo tối đa
   */
  async getNotificationsByEmployee(maNhanVien, limit = 50) {
    try {
      const db = getDatabase();
      const notificationsRef = db
        .ref(`notifications/${maNhanVien}`)
        .orderByChild("ngayTao")
        .limitToLast(limit);

      const snapshot = await notificationsRef.once("value");
      const notifications = [];

      snapshot.forEach((childSnapshot) => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Sắp xếp giảm dần theo ngày tạo
      notifications.sort((a, b) => {
        const timeA = a.ngayTao?._seconds || a.ngayTao || 0;
        const timeB = b.ngayTao?._seconds || b.ngayTao || 0;
        return timeB - timeA;
      });

      console.log(
        `✓ Lấy được ${notifications.length} thông báo cho nhân viên ${maNhanVien}`
      );

      return {
        success: true,
        data: notifications,
        total: notifications.length,
      };
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  }

  /**
   * Đếm số thông báo chưa đọc
   * @param {number} maNhanVien - Mã nhân viên
   */
  async countUnreadNotifications(maNhanVien) {
    try {
      const db = getDatabase();
      const notificationsRef = db
        .ref(`notifications/${maNhanVien}`)
        .orderByChild("daDoc")
        .equalTo(false);

      const snapshot = await notificationsRef.once("value");
      const count = snapshot.numChildren();

      return {
        success: true,
        unreadCount: count,
      };
    } catch (error) {
      console.error("Error counting unread notifications:", error);
      throw error;
    }
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * @param {number} maNhanVien - Mã nhân viên
   */
  async markAllAsRead(maNhanVien) {
    try {
      const db = getDatabase();
      const notificationsRef = db.ref(`notifications/${maNhanVien}`);

      const snapshot = await notificationsRef.once("value");
      const updates = {};

      snapshot.forEach((childSnapshot) => {
        const notification = childSnapshot.val();
        if (!notification.daDoc) {
          updates[`${childSnapshot.key}/daDoc`] = true;
          updates[`${childSnapshot.key}/ngayDoc`] = getServerTimestamp();
        }
      });

      if (Object.keys(updates).length > 0) {
        await notificationsRef.update(updates);
      }

      console.log(
        `✓ Đã đánh dấu ${Object.keys(updates).length / 2} thông báo là đã đọc`
      );

      return {
        success: true,
        message: `Đã đánh dấu ${
          Object.keys(updates).length / 2
        } thông báo là đã đọc`,
      };
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
