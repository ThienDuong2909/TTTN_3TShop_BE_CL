// FpGrowthService.js
// Service xử lý các API liên quan đến FP-Growth (MIN_SUP, MIN_CONF)

const FpGrowthRulesService = require("./FpGrowthRulesService");

class FpGrowthService {
  constructor() {
    this.PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
  }

  /**
   * Lấy cấu hình hiện tại (MIN_SUP, MIN_CONF) từ Python API
   * @returns {Promise<Object>} - { min_sup, min_conf, transactions, rules }
   */
  async getConfig() {
    try {
      const resp = await fetch(`${this.PYTHON_API_URL}/config`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Python API returned status ${resp.status}: ${errorText}`
        );
      }

      const data = await resp.json();
      return {
        success: true,
        data: {
          min_sup: data.min_sup,
          min_conf: data.min_conf,
          transactions: data.transactions,
          rules: data.rules,
        },
      };
    } catch (error) {
      console.error("Error fetching FP-Growth config:", error);
      return {
        success: false,
        error: error.message || "Không thể kết nối đến Python API",
      };
    }
  }

  /**
   * Cập nhật cấu hình MIN_SUP và/hoặc MIN_CONF
   * @param {Object} params - { min_sup?, min_conf? }
   * @returns {Promise<Object>} - { ok, old_config, new_config, transactions, rules }
   */
  async updateConfig({ min_sup, min_conf }) {
    try {
      // Validate input
      if (min_sup !== undefined && min_sup !== null) {
        if (typeof min_sup !== "number" || min_sup <= 0 || min_sup > 1) {
          return {
            success: false,
            error: "min_sup phải là số trong khoảng (0, 1]",
          };
        }
      }

      if (min_conf !== undefined && min_conf !== null) {
        if (typeof min_conf !== "number" || min_conf <= 0 || min_conf > 1) {
          return {
            success: false,
            error: "min_conf phải là số trong khoảng (0, 1]",
          };
        }
      }

      // Tạo body request
      const requestBody = {};
      if (min_sup !== undefined && min_sup !== null) {
        requestBody.min_sup = min_sup;
      }
      if (min_conf !== undefined && min_conf !== null) {
        requestBody.min_conf = min_conf;
      }

      // Kiểm tra có dữ liệu để update không
      if (Object.keys(requestBody).length === 0) {
        return {
          success: false,
          error:
            "Cần cung cấp ít nhất một trong hai tham số: min_sup hoặc min_conf",
        };
      }

      // Gọi API Python
      const resp = await fetch(`${this.PYTHON_API_URL}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Python API returned status ${resp.status}: ${errorText}`
        );
      }

      const data = await resp.json();

      // Kiểm tra response từ Python
      if (!data.ok) {
        return {
          success: false,
          error: data.error || "Cập nhật thất bại",
        };
      }

      return {
        success: true,
        data: {
          old_config: data.old_config,
          new_config: data.new_config,
          transactions: data.transactions,
          rules: data.rules,
        },
      };
    } catch (error) {
      console.error("Error updating FP-Growth config:", error);
      return {
        success: false,
        error: error.message || "Không thể kết nối đến Python API",
      };
    }
  }

  /**
   * Refresh model (rebuild với config hiện tại)
   * @returns {Promise<Object>}
   */
  async refreshModel() {
    try {
      const resp = await fetch(`${this.PYTHON_API_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Python API returned status ${resp.status}: ${errorText}`
        );
      }

      const data = await resp.json();
      return {
        success: true,
        data: {
          transactions: data.transactions,
          rules: data.rules,
        },
      };
    } catch (error) {
      console.error("Error refreshing FP-Growth model:", error);
      return {
        success: false,
        error: error.message || "Không thể kết nối đến Python API",
      };
    }
  }

  /**
   * Refresh model từ cache (nếu có) hoặc rebuild
   * @param {boolean} force - true: luôn rebuild, false: load từ cache nếu có
   * @returns {Promise<Object>}
   */
  async refreshModelFromCache(force = false) {
    try {
      const resp = await fetch(
        `${this.PYTHON_API_URL}/refresh?force=${force}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Python API returned status ${resp.status}: ${errorText}`
        );
      }

      const data = await resp.json();
      return {
        success: true,
        data: {
          ok: data.ok,
          transactions: data.transactions,
          rules: data.rules,
          loaded_from_cache: !force, // Indicator về việc có load từ cache không
        },
      };
    } catch (error) {
      console.error("Error refreshing FP-Growth model from cache:", error);
      return {
        success: false,
        error: error.message || "Không thể kết nối đến Python API",
      };
    }
  }

  /**
   * Kiểm tra health của Python API
   * @returns {Promise<Object>}
   */
  async checkHealth() {
    try {
      const resp = await fetch(`${this.PYTHON_API_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) {
        throw new Error(`Python API returned status ${resp.status}`);
      }

      const data = await resp.json();
      return {
        success: true,
        data: {
          ok: data.ok,
          transactions: data.transactions,
          rules: data.rules,
          min_sup: data.min_sup,
          min_conf: data.min_conf,
        },
      };
    } catch (error) {
      console.error("Error checking Python API health:", error);
      return {
        success: false,
        error: error.message || "Python API không hoạt động",
      };
    }
  }

  /**
   * Lấy tất cả rules gần đây từ Python API (không qua DB)
   * Trả về format giống getRulesWithDetails
   */
  async getAllRuleRecent() {
    try {
      const resp = await fetch(`${this.PYTHON_API_URL}/all-rule-recent`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Python API returned status ${resp.status}: ${errorText}`
        );
      }

      const data = await resp.json();
      const rules = data.rules || [];

      if (rules.length === 0) {
        return {
          success: true,
          data: {
            rules: [],
            total: 0,
          },
        };
      }

      // Thu thập tất cả MaSP để lấy thông tin chi tiết
      const allMaSP = new Set();
      rules.forEach((rule) => {
        if (Array.isArray(rule.antecedent)) {
          rule.antecedent.forEach((id) => allMaSP.add(id));
        }
        // Lấy tất cả MaSP từ itemsets (hỗ trợ cả [id] và [[id]])
        if (Array.isArray(rule.itemsets)) {
          rule.itemsets.forEach((item) => {
            if (Array.isArray(item)) {
              item.forEach((id) => allMaSP.add(id));
            } else {
              allMaSP.add(item);
            }
          });
        }
      });

      // Lấy chi tiết sản phẩm
      const productsResult = await FpGrowthRulesService.getProductDetails([
        ...allMaSP,
      ]);
      if (!productsResult.success) {
        return productsResult;
      }

      const productMap = {};
      productsResult.data.forEach((p) => {
        productMap[p.MaSP] = p;
      });

      // Format rules
      const rulesWithDetails = rules.map((rule, index) => {
        const antecedentIds = rule.antecedent || [];
        const itemsetIds = rule.itemsets || [];

        const antecedentProducts = antecedentIds
          .map((id) => productMap[id])
          .filter(Boolean);

        // Chuẩn hóa itemsets thành mảng lồng nhau (list of lists) nếu Python trả về mảng phẳng
        // Ví dụ: [7] -> [[7]], [[7]] -> [[7]]
        const normalizedItemsetIds = (itemsetIds.length > 0 && !Array.isArray(itemsetIds[0]))
          ? [itemsetIds]
          : itemsetIds;

        // Chuyển đổi itemsets từ IDs thành Detailed Products
        const itemsetsDetailed = normalizedItemsetIds.map((subset) => {
          if (Array.isArray(subset)) {
            return subset.map((id) => productMap[id]).filter(Boolean);
          }
          return [];
        });

        // Lấy consequent_id (sản phẩm đầu tiên của tập hợp gợi ý đầu tiên)
        const firstConsequentId = Array.isArray(itemsetIds[0])
          ? (itemsetIds[0] && itemsetIds[0][0])
          : itemsetIds[0];

        const consequentProduct = productMap[firstConsequentId];

        return {
          rule_id: `recent_${index + 1}`,
          antecedent_ids: antecedentIds,
          itemset_ids: itemsetIds, // Giữ nguyên format gốc từ Python
          support: rule.support,
          confidence: rule.confidence,
          lift: rule.lift,
          antecedent_products: antecedentProducts,
          itemsets_detailed: itemsetsDetailed, // Luôn trả về mảng lồng nhau chứa chi tiết SP
          // Duy trì các trường cũ để tương thích với các component khác
          consequent_id: firstConsequentId,
          consequent_product: consequentProduct,
          interpretation: FpGrowthRulesService.generateRuleInterpretation(
            antecedentProducts,
            consequentProduct,
            rule
          ),
        };
      });

      return {
        success: true,
        data: {
          rules: rulesWithDetails,
          total: rulesWithDetails.length,
          model_info: {
            source: "Python API (Recent Rules)",
            created_at: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllRuleRecent:", error);
      return {
        success: false,
        error: error.message || "Không thể lấy rules mới nhất từ Python API",
      };
    }
  }

  /**
   * Lấy rules với thông tin chi tiết sản phẩm
   */
  async getRulesWithDetails(options) {
    return await FpGrowthRulesService.getRulesWithProductDetails(options);
  }

  /**
   * Tìm kiếm rules theo sản phẩm
   */
  async searchRulesByProduct(options) {
    return await FpGrowthRulesService.searchRulesByProduct(options);
  }

  /**
   * Lấy top sản phẩm được recommend nhiều nhất
   */
  async getTopRecommendedProducts(options) {
    return await FpGrowthRulesService.getTopRecommendedProducts(options);
  }

  /**
   * Lấy model metadata mới nhất
   */
  async getLatestModelMetadata() {
    return await FpGrowthRulesService.getLatestModelMetadata();
  }
}

module.exports = new FpGrowthService();
