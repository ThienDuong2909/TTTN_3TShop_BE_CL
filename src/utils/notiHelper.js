const admin = require("firebase-admin");

// Khởi tạo Firebase Admin SDK
let isInitialized = false;

/**
 * Khởi tạo Firebase Admin SDK
 * Chỉ khởi tạo một lần duy nhất
 */
function initializeFirebase() {
  if (!isInitialized) {
    try {
      const serviceAccount = require("../../delivery-3tshop-firebase.json");

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
          "https://delivery-3tshop-default-rtdb.asia-southeast1.firebasedatabase.app",
      });

      isInitialized = true;
      console.log("✓ Firebase Admin SDK đã được khởi tạo thành công");
    } catch (error) {
      console.error("✗ Lỗi khởi tạo Firebase Admin SDK:", error.message);
      throw new Error("Không thể khởi tạo Firebase Admin SDK");
    }
  }
}

/**
 * Lấy instance của Firebase Realtime Database
 * @returns {admin.database.Database} Firebase Database instance
 */
function getDatabase() {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.database();
}

/**
 * Lấy instance của Firebase Cloud Messaging
 * @returns {admin.messaging.Messaging} Firebase Messaging instance
 */
function getMessaging() {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.messaging();
}

/**
 * Lấy server timestamp của Firebase
 * @returns {object} Firebase server timestamp
 */
function getServerTimestamp() {
  return admin.database.ServerValue.TIMESTAMP;
}

module.exports = {
  initializeFirebase,
  getDatabase,
  getMessaging,
  getServerTimestamp,
  admin,
};
