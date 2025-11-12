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
   * GET /api/fpgrowth/refresh-cache
   * Làm mới model từ cache (không force rebuild)
   * Query params: force? (true/false, mặc định: false)
   */
  async refreshModelFromCache(req, res) {
    try {
      const force = req.query.force === "true" || req.query.force === true;

      const result = await FpGrowthService.refreshModelFromCache(force);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể làm mới model FP-Growth từ cache",
        });
      }

      return res.status(200).json({
        success: true,
        message: force
          ? "Đã rebuild model FP-Growth thành công"
          : "Đã load model FP-Growth từ cache thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in refreshModelFromCache:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi làm mới model FP-Growth từ cache",
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

  /**
   * GET /api/fpgrowth/rules
   * Lấy danh sách rules với thông tin chi tiết sản phẩm
   * Query params: modelId?, limit?, offset?, minConfidence?, minLift?
   */
  async getRulesWithDetails(req, res) {
    try {
      const {
        modelId,
        limit = 50,
        offset = 0,
        minConfidence,
        minLift,
      } = req.query;

      const result = await FpGrowthService.getRulesWithDetails({
        modelId: modelId ? parseInt(modelId) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
        minConfidence: minConfidence ? parseFloat(minConfidence) : undefined,
        minLift: minLift ? parseFloat(minLift) : undefined,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể lấy danh sách rules",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách rules thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getRulesWithDetails:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách rules",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/fpgrowth/rules/search
   * Tìm kiếm rules theo MaSP cụ thể
   * Query params: maSP (required), modelId?, searchIn? (antecedent|consequent|both)
   */
  async searchRulesByProduct(req, res) {
    try {
      const { maSP, modelId, searchIn = "both" } = req.query;

      if (!maSP) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp MaSP để tìm kiếm",
        });
      }

      const result = await FpGrowthService.searchRulesByProduct({
        maSP: parseInt(maSP),
        modelId: modelId ? parseInt(modelId) : undefined,
        searchIn,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể tìm kiếm rules",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Tìm kiếm rules thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in searchRulesByProduct:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tìm kiếm rules",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/fpgrowth/rules/top-products
   * Lấy top sản phẩm được recommend nhiều nhất
   * Query params: modelId?, limit?
   */
  async getTopRecommendedProducts(req, res) {
    try {
      const { modelId, limit = 10 } = req.query;

      const result = await FpGrowthService.getTopRecommendedProducts({
        modelId: modelId ? parseInt(modelId) : undefined,
        limit: parseInt(limit),
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể lấy top sản phẩm",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lấy top sản phẩm thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getTopRecommendedProducts:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy top sản phẩm",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/fpgrowth/model
   * Lấy thông tin model metadata mới nhất
   */
  async getModelMetadata(req, res) {
    try {
      const result = await FpGrowthService.getLatestModelMetadata();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Không thể lấy thông tin model",
        });
      }

      if (!result.data) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy model nào trong database",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lấy thông tin model thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in getModelMetadata:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thông tin model",
        error: error.message,
      });
    }
  }
}

module.exports = new FpGrowthController();
