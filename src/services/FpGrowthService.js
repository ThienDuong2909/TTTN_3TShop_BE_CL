// FpGrowthService.js
// Service xử lý các API liên quan đến FP-Growth (MIN_SUP, MIN_CONF)

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
}

module.exports = new FpGrowthService();
