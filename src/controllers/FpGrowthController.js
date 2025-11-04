// FpGrowthController.js
// Controller xử lý các request liên quan đến FP-Growth configuration

const FpGrowthService = require("../services/FpGrowthService");

class FpGrowthController {
  /**
   * GET /api/fpgrowth/config
   * Lấy cấu hình hiện tại của FP-Growth (MIN_SUP, MIN_CONF)
   */
  async getConfig(req, res) {
    try {
      const result = await FpGrowthService.getConfig();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể lấy cấu hình FP-Growth",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lấy cấu hình FP-Growth thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getConfig:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy cấu hình FP-Growth",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/fpgrowth/config
   * Cập nhật cấu hình FP-Growth (MIN_SUP, MIN_CONF)
   * Body: { min_sup?: number, min_conf?: number }
   */
  async updateConfig(req, res) {
    try {
      const { min_sup, min_conf } = req.body;

      // Validate: phải có ít nhất 1 tham số
      if (
        min_sup === undefined &&
        min_sup === null &&
        min_conf === undefined &&
        min_conf === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp ít nhất một tham số: min_sup hoặc min_conf",
        });
      }

      const result = await FpGrowthService.updateConfig({ min_sup, min_conf });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || "Không thể cập nhật cấu hình FP-Growth",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật cấu hình FP-Growth thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in updateConfig:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật cấu hình FP-Growth",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/fpgrowth/refresh
   * Làm mới model FP-Growth (rebuild với config hiện tại)
   */
  async refreshModel(req, res) {
    try {
      const result = await FpGrowthService.refreshModel();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể làm mới model FP-Growth",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Làm mới model FP-Growth thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in refreshModel:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi làm mới model FP-Growth",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/fpgrowth/health
   * Kiểm tra trạng thái của Python API
   */
  async checkHealth(req, res) {
    try {
      const result = await FpGrowthService.checkHealth();

      if (!result.success) {
        return res.status(503).json({
          success: false,
          message: result.error || "Python API không hoạt động",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Python API hoạt động bình thường",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in checkHealth:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi kiểm tra health",
        error: error.message,
      });
    }
  }
}

module.exports = new FpGrowthController();
