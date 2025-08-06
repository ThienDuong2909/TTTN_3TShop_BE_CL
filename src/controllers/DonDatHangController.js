const DonDatHangService = require("../services/DonDatHangService");
const response = require("../utils/response");
const { getMaNVFromMaTK } = require("../utils/auth");

const DonDatHangController = {
  // Lấy danh sách đơn hàng theo trạng thái
  getByStatus: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      if (!status) {
        return response.error(
          res,
          null,
          "Vui lòng cung cấp trạng thái đơn hàng",
          400
        );
      }

      // Parse các tham số thành số nguyên
      const parsedStatus = status === "all" ? "all" : parseInt(status);
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Giới hạn tối đa 100 items

      // Validate status nếu không phải 'all'
      if (parsedStatus !== "all" && (isNaN(parsedStatus) || parsedStatus < 0)) {
        return response.error(
          res,
          null,
          "Trạng thái đơn hàng không hợp lệ",
          400
        );
      }

      const data = await DonDatHangService.getByStatus(
        parsedStatus,
        parsedPage,
        parsedLimit
      );
      return response.success(
        res,
        data,
        "Lấy danh sách đơn hàng theo trạng thái thành công"
      );
    } catch (err) {
      console.error("Error in getByStatus:", err);
      return response.error(
        res,
        err.message || "Lỗi khi lấy danh sách đơn hàng"
      );
    }
  },

  // Lấy tất cả đơn hàng
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Parse các tham số thành số nguyên
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await DonDatHangService.getAll(parsedPage, parsedLimit);
      return response.success(
        res,
        data,
        "Lấy danh sách tất cả đơn hàng thành công"
      );
    } catch (err) {
      console.error("Error in getAll:", err);
      return response.error(
        res,
        err.message || "Lỗi khi lấy danh sách đơn hàng"
      );
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await DonDatHangService.getById(id);

      if (!data) {
        return response.notFound(res, "Không tìm thấy đơn hàng");
      }

      return response.success(res, data, "Lấy chi tiết đơn hàng thành công");
    } catch (err) {
      console.error("Error in getById:", err);
      return response.error(
        res,
        err.message || "Lỗi khi lấy chi tiết đơn hàng"
      );
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { maTTDH, maNVDuyet, maNVGiao } = req.body;

      if (!maTTDH) {
        return response.error(
          res,
          null,
          "Vui lòng cung cấp mã trạng thái đơn hàng",
          400
        );
      }

      const data = await DonDatHangService.updateStatus(
        id,
        maTTDH,
        maNVDuyet,
        maNVGiao
      );

      if (!data) {
        return response.notFound(res, "Không tìm thấy đơn hàng");
      }

      return response.success(
        res,
        data,
        "Cập nhật trạng thái đơn hàng thành công"
      );
    } catch (err) {
      console.error("Error in updateStatus:", err);
      return response.error(
        res,
        err.message || "Lỗi khi cập nhật trạng thái đơn hàng"
      );
    }
  },

  // Cập nhật trạng thái nhiều đơn hàng cùng lúc
  updateBatchStatus: async (req, res) => {
    try {
      const { orders } = req.body;

      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return response.error(
          res,
          null,
          "Vui lòng cung cấp danh sách đơn hàng hợp lệ",
          400
        );
      }

      // Validate từng đơn hàng trong batch
      for (const order of orders) {
        if (!order.id || !order.maTTDH) {
          return response.error(
            res,
            null,
            "Mỗi đơn hàng phải có id và maTTDH",
            400
          );
        }
      }

      const results = await DonDatHangService.updateBatchStatus(orders);

      return response.success(
        res,
        results,
        `Cập nhật trạng thái thành công ${results.success} đơn hàng`
      );
    } catch (err) {
      console.error("Error in updateBatchStatus:", err);
      return response.error(
        res,
        err.message || "Lỗi khi cập nhật trạng thái đơn hàng"
      );
    }
  },

  // Lấy đơn hàng theo khách hàng
  getByCustomer: async (req, res) => {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const data = await DonDatHangService.getByCustomer(
        customerId,
        page,
        limit
      );
      return response.success(
        res,
        data,
        "Lấy danh sách đơn hàng của khách hàng thành công"
      );
    } catch (err) {
      console.error("Error in getByCustomer:", err);
      return response.error(
        res,
        err.message || "Lỗi khi lấy danh sách đơn hàng của khách hàng"
      );
    }
  },

  // Lấy thông tin chi tiết đầy đủ của đơn hàng
  getDetailById: async (req, res) => {
    try {
      const { id } = req.params;

      console.log("Getting order detail for ID:", id);

      if (!id || isNaN(id)) {
        return response.error(res, null, "Mã đơn hàng không hợp lệ", 400);
      }

      const data = await DonDatHangService.getDetailById(parseInt(id));

      if (!data) {
        return response.notFound(res, "Không tìm thấy đơn hàng");
      }

      console.log("Order detail retrieved successfully for ID:", id);
      return response.success(
        res,
        data,
        "Lấy thông tin chi tiết đơn hàng thành công"
      );
    } catch (err) {
      console.error("Error in getDetailById:", err);
      console.error("Full error:", err.stack);
      return response.error(
        res,
        err.message || "Lỗi khi lấy thông tin chi tiết đơn hàng"
      );
    }
  },

  // Lấy thống kê đơn hàng theo trạng thái (tối ưu hiệu suất)
  getStatistics: async (req, res) => {
    try {
      const statistics = await DonDatHangService.getOrderStatistics();
      return response.success(
        res,
        statistics,
        "Lấy thống kê đơn hàng thành công"
      );
    } catch (err) {
      console.error("Error in getStatistics:", err);
      return response.error(
        res,
        err.message || "Lỗi khi lấy thống kê đơn hàng"
      );
    }
  },

  // Cập nhật nhân viên giao hàng cho đơn hàng
  updateDeliveryStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { maNVGiao } = req.body;

      // Validate input
      if (!id || isNaN(id)) {
        return response.error(res, null, "Mã đơn hàng không hợp lệ", 400);
      }

      if (!maNVGiao || isNaN(maNVGiao)) {
        return response.error(
          res,
          null,
          "Mã nhân viên giao hàng không hợp lệ",
          400
        );
      }

      console.log(
        `Updating delivery staff for order ${id} with employee ${maNVGiao}`
      );

      const data = await DonDatHangService.updateDeliveryStaff(
        parseInt(id),
        parseInt(maNVGiao)
      );

      console.log("Delivery staff updated successfully");
      return response.success(
        res,
        data,
        "Cập nhật nhân viên giao hàng thành công"
      );
    } catch (err) {
      console.error("Error in updateDeliveryStaff:", err);

      // Handle specific error messages
      if (err.message.includes("Không tìm thấy đơn hàng")) {
        return response.notFound(res, err.message);
      }

      if (err.message.includes("Không tìm thấy nhân viên")) {
        return response.error(res, null, err.message, 404);
      }

      if (
        err.message.includes("Chỉ có thể phân công") ||
        err.message.includes("không thuộc bộ phận giao hàng")
      ) {
        return response.error(res, null, err.message, 400);
      }

      return response.error(
        res,
        err.message || "Lỗi khi cập nhật nhân viên giao hàng"
      );
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { maTTDH, maNVDuyet, maNVGiao } = req.body;

      // Validate input
      if (!id || isNaN(id)) {
        return response.error(res, null, "Mã đơn hàng không hợp lệ", 400);
      }

      if (!maTTDH || isNaN(maTTDH)) {
        return response.error(res, null, "Mã trạng thái không hợp lệ", 400);
      }

      console.log(`Updating order ${id} status to ${maTTDH}`);

      const data = await DonDatHangService.updateStatus(
        parseInt(id),
        parseInt(maTTDH),
        maNVDuyet ? parseInt(maNVDuyet) : null,
        maNVGiao ? parseInt(maNVGiao) : null
      );

      if (!data) {
        return response.notFound(res, "Không tìm thấy đơn hàng");
      }

      console.log("Order status updated successfully");
      return response.success(
        res,
        data,
        "Cập nhật trạng thái đơn hàng thành công"
      );
    } catch (err) {
      console.error("Error in updateStatus:", err);
      return response.error(
        res,
        err.message || "Lỗi khi cập nhật trạng thái đơn hàng"
      );
    }
  },

  // Cập nhật trạng thái nhiều đơn hàng cùng lúc
  updateBatchStatus: async (req, res) => {
    try {
      const { orders } = req.body;

      // Validate input
      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return response.error(
          res,
          null,
          "Danh sách đơn hàng không hợp lệ",
          400
        );
      }

      // Validate each order in the array
      for (const order of orders) {
        if (
          !order.id ||
          isNaN(order.id) ||
          !order.maTTDH ||
          isNaN(order.maTTDH)
        ) {
          return response.error(
            res,
            null,
            "Thông tin đơn hàng không hợp lệ",
            400
          );
        }
      }

      console.log(`Updating batch status for ${orders.length} orders`);

      const results = await DonDatHangService.updateBatchStatus(orders);

      console.log(
        `Batch update completed: ${results.success} success, ${results.failed} failed`
      );
      return response.success(
        res,
        results,
        "Cập nhật trạng thái đơn hàng hàng loạt thành công"
      );
    } catch (err) {
      console.error("Error in updateBatchStatus:", err);
      return response.error(
        res,
        err.message || "Lỗi khi cập nhật trạng thái đơn hàng hàng loạt"
      );
    }
  },

  // === METHODS CHO NHÂN VIÊN GIAO HÀNG ===

  // Lấy đơn hàng được phân công cho nhân viên giao hàng
  getAssignedOrders: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const maTK = req.user.MaTK; // Lấy MaTK từ JWT token

      if (!maTK) {
        return response.error(
          res,
          null,
          "Không xác định được tài khoản",
          400
        );
      }

      // Lấy MaNV từ MaTK
      const maNVGiao = await getMaNVFromMaTK(maTK);

      if (!maNVGiao) {
        return response.error(
          res,
          null,
          "Không tìm thấy thông tin nhân viên",
          400
        );
      }

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const parsedStatus = status ? parseInt(status) : null;

      const data = await DonDatHangService.getAssignedOrders(
        maNVGiao,
        parsedPage,
        parsedLimit,
        parsedStatus
      );
      return response.success(
        res,
        data,
        "Lấy danh sách đơn hàng được phân công thành công"
      );
    } catch (err) {
      console.error("Error in getAssignedOrders:", err);
      return response.error(
        res,
        err.message || "Lỗi khi lấy danh sách đơn hàng được phân công"
      );
    }
  },

  // Xác nhận đã giao hàng xong
  confirmDelivery: async (req, res) => {
    try {
      const { id } = req.params;
      const maTK = req.user.MaTK; // Lấy MaTK từ JWT token

      if (!maTK) {
        return response.error(
          res,
          null,
          "Không xác định được tài khoản",
          400
        );
      }

      // Lấy MaNV từ MaTK
      const maNVGiao = await getMaNVFromMaTK(maTK);

      if (!maNVGiao) {
        return response.error(
          res,
          null,
          "Không tìm thấy thông tin nhân viên",
          400
        );
      }

      if (!id || isNaN(id)) {
        return response.error(res, null, "Mã đơn hàng không hợp lệ", 400);
      }

      const data = await DonDatHangService.confirmDelivery(
        parseInt(id),
        maNVGiao
      );

      if (!data) {
        return response.notFound(
          res,
          "Không tìm thấy đơn hàng hoặc đơn hàng không được phân công cho bạn"
        );
      }

      return response.success(res, data, "Xác nhận giao hàng thành công");
    } catch (err) {
      console.error("Error in confirmDelivery:", err);
      return response.error(res, err.message || "Lỗi khi xác nhận giao hàng");
    }
  },
  getRevenueReport: async (req, res) => {
    try {
      const { ngayBatDau, ngayKetThuc } = req.body;
      if (!ngayBatDau || !ngayKetThuc) {
        return response.error(
          res,
          null,
          "Thiếu ngày bắt đầu hoặc ngày kết thúc"
        );
      }
      const data = await DonDatHangService.getRevenueReport(
        ngayBatDau,
        ngayKetThuc
      );
      return response.success(res, data, "Lấy báo cáo doanh thu thành công");
    } catch (err) {
      return response.error(res, err.message || "Lỗi lấy báo cáo doanh thu");
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const { maKH, maDDH } = req.body;
      if (!maKH || !maDDH) {
        return response.error(
          res,
          null,
          "Thiếu mã khách hàng hoặc mã đơn hàng",
          400
        );
      }
      const data = await DonDatHangService.cancelOrder(maKH, maDDH);
      if (!data) {
        return response.notFound(res, "Không tìm thấy đơn hàng để hủy");
      }
      return response.success(res, data, "Hủy đơn hàng thành công");
    } catch (err) {
      return response.error(res, err.message || "Lỗi khi hủy đơn hàng");
    }
  },
};

module.exports = DonDatHangController;
