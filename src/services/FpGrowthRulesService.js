// FpGrowthRulesService.js
// Service để lấy và xử lý các Association Rules từ DB

const {
  FP_ModelMetadata,
  FP_Rules,
  FP_FrequentItemsets,
  SanPham,
  NhaCungCap,
  LoaiSP,
  AnhSanPham,
  ThayDoiGia,
  ChiTietSanPham,
  KichThuoc,
  Mau,
  CT_DotGiamGia,
  DotGiamGia,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

class FpGrowthRulesService {
  /**
   * Lấy thông tin model metadata mới nhất
   */
  async getLatestModelMetadata() {
    try {
      const metadata = await FP_ModelMetadata.findOne({
        order: [["created_at", "DESC"]],
      });

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      console.error("Error fetching model metadata:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy model metadata theo config cụ thể
   */
  async getModelMetadataByConfig(min_sup, min_conf) {
    try {
      const metadata = await FP_ModelMetadata.findOne({
        where: { min_sup, min_conf },
        order: [["created_at", "DESC"]],
      });

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      console.error("Error fetching model by config:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách tất cả rules của model
   */
  async getAllRules({ modelId, limit = 100, offset = 0 } = {}) {
    try {
      let model_id = modelId;

      // Nếu không truyền modelId, lấy model mới nhất
      if (!model_id) {
        const metadataResult = await this.getLatestModelMetadata();
        if (!metadataResult.success || !metadataResult.data) {
          return {
            success: false,
            error: "Không tìm thấy model nào trong database",
          };
        }
        model_id = metadataResult.data.id;
      }

      const { rows, count } = await FP_Rules.findAndCountAll({
        where: { model_id },
        order: [
          ["confidence", "DESC"],
          ["lift", "DESC"],
          ["support", "DESC"],
        ],
        limit,
        offset,
      });

      return {
        success: true,
        data: {
          rules: rows,
          total: count,
          model_id,
        },
      };
    } catch (error) {
      console.error("Error fetching rules:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy thông tin chi tiết sản phẩm
   */
  async getProductDetails(maSPList) {
    try {
      if (!Array.isArray(maSPList) || maSPList.length === 0) {
        return {
          success: false,
          error: "Danh sách MaSP không hợp lệ",
        };
      }

      const today = new Date().toISOString().split("T")[0];

      const products = await SanPham.findAll({
        where: {
          MaSP: {
            [Op.in]: maSPList,
          },
        },
        include: [
          { model: NhaCungCap },
          { model: LoaiSP },
          { model: AnhSanPham },
          {
            model: ChiTietSanPham,
            as: "ChiTietSanPhams",
            include: [
              { model: KichThuoc, attributes: ["TenKichThuoc"] },
              { model: Mau, attributes: ["TenMau", "MaHex"] },
            ],
            attributes: ["MaCTSP", "MaKichThuoc", "MaMau", "SoLuongTon"],
          },
          {
            model: ThayDoiGia,
            where: {
              NgayApDung: { [Op.lte]: today },
            },
            separate: true,
            limit: 1,
            order: [["NgayApDung", "DESC"]],
            attributes: ["Gia", "NgayApDung"],
          },
          {
            model: CT_DotGiamGia,
            include: [
              {
                model: DotGiamGia,
                where: {
                  NgayBatDau: { [Op.lte]: today },
                  NgayKetThuc: { [Op.gte]: today },
                },
                required: true,
                attributes: ["NgayBatDau", "NgayKetThuc", "MoTa"],
              },
            ],
            attributes: ["PhanTramGiam"],
          },
        ],
      });

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      console.error("Error fetching product details:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy rules với thông tin chi tiết sản phẩm
   * Trả về: Khi có itemset A -> recommends B thì hiển thị chi tiết của cả A và B
   */
  async getRulesWithProductDetails({
    modelId,
    limit = 50,
    offset = 0,
    minConfidence,
    minLift,
  } = {}) {
    try {
      // Lấy rules
      const rulesResult = await this.getAllRules({ modelId, limit, offset });
      if (!rulesResult.success) {
        return rulesResult;
      }

      const { rules, total, model_id } = rulesResult.data;

      // Lọc theo confidence và lift nếu có
      let filteredRules = rules;
      if (minConfidence) {
        filteredRules = filteredRules.filter(
          (r) => r.confidence >= minConfidence
        );
      }
      if (minLift) {
        filteredRules = filteredRules.filter((r) => r.lift >= minLift);
      }

      if (filteredRules.length === 0) {
        return {
          success: true,
          data: {
            rules: [],
            total: 0,
            model_id,
          },
        };
      }

      // Thu thập tất cả MaSP cần lấy thông tin
      const allMaSP = new Set();
      filteredRules.forEach((rule) => {
        // Antecedent (A)
        if (Array.isArray(rule.antecedent)) {
          rule.antecedent.forEach((maSP) => allMaSP.add(maSP));
        }
        // Consequent (b)
        allMaSP.add(rule.consequent);
      });

      // Lấy thông tin chi tiết của tất cả sản phẩm
      const productsResult = await this.getProductDetails([...allMaSP]);
      if (!productsResult.success) {
        return productsResult;
      }

      // Tạo map MaSP -> Product Details
      const productMap = {};
      productsResult.data.forEach((product) => {
        productMap[product.MaSP] = product;
      });

      // Gắn thông tin sản phẩm vào rules
      const rulesWithDetails = filteredRules.map((rule) => {
        const antecedentProducts = rule.antecedent
          .map((maSP) => productMap[maSP])
          .filter(Boolean); // Loại bỏ undefined

        const consequentProduct = productMap[rule.consequent];

        return {
          rule_id: rule.id,
          antecedent_ids: rule.antecedent, // Danh sách MaSP trong giỏ
          consequent_id: rule.consequent, // MaSP được recommend
          itemset: rule.itemset, // Toàn bộ itemset
          support: rule.support,
          confidence: rule.confidence,
          lift: rule.lift,
          // Thông tin chi tiết sản phẩm
          antecedent_products: antecedentProducts, // Sản phẩm trong giỏ
          consequent_product: consequentProduct, // Sản phẩm được gợi ý
          // Diễn giải
          interpretation: this.generateRuleInterpretation(
            antecedentProducts,
            consequentProduct,
            rule
          ),
        };
      });

      // Lấy metadata
      const metadata = await FP_ModelMetadata.findByPk(model_id);

      return {
        success: true,
        data: {
          model_info: {
            id: metadata.id,
            transactions: metadata.N,
            min_sup: metadata.min_sup,
            min_conf: metadata.min_conf,
            total_rules: metadata.total_rules,
            created_at: metadata.created_at,
          },
          rules: rulesWithDetails,
          total: filteredRules.length,
          limit,
          offset,
        },
      };
    } catch (error) {
      console.error("Error fetching rules with product details:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Tạo diễn giải cho rule
   */
  generateRuleInterpretation(antecedentProducts, consequentProduct, rule) {
    if (!antecedentProducts || antecedentProducts.length === 0) {
      return "Dữ liệu sản phẩm không đầy đủ";
    }

    const antecedentNames = antecedentProducts
      .map((p) => `"${p.TenSP}"`)
      .join(", ");

    if (!consequentProduct) {
      return `Khi khách hàng mua ${antecedentNames}, có thể gợi ý thêm sản phẩm khác`;
    }

    const confidencePercent = (rule.confidence * 100).toFixed(1);
    const supportPercent = (rule.support * 100).toFixed(1);

    return `Khách hàng mua ${antecedentNames} thì có ${confidencePercent}% khả năng sẽ mua "${consequentProduct.TenSP
      }" (xuất hiện cùng nhau trong ${supportPercent}% đơn hàng)`;
  }

  /**
   * Tìm kiếm rules theo MaSP cụ thể (trong antecedent hoặc consequent)
   */
  async searchRulesByProduct({ maSP, modelId, searchIn = "both" } = {}) {
    try {
      if (!maSP) {
        return {
          success: false,
          error: "Vui lòng cung cấp MaSP",
        };
      }

      // Lấy model_id
      let model_id = modelId;
      if (!model_id) {
        const metadataResult = await this.getLatestModelMetadata();
        if (!metadataResult.success || !metadataResult.data) {
          return {
            success: false,
            error: "Không tìm thấy model nào trong database",
          };
        }
        model_id = metadataResult.data.id;
      }

      // Tìm rules
      let whereClause = { model_id };

      if (searchIn === "antecedent") {
        // Tìm rules có maSP trong antecedent (sản phẩm trong giỏ)
        whereClause.antecedent = {
          [Op.like]: `%${maSP}%`,
        };
      } else if (searchIn === "consequent") {
        // Tìm rules có maSP là consequent (sản phẩm được gợi ý)
        whereClause.consequent = maSP;
      } else {
        // Tìm cả 2
        whereClause[Op.or] = [
          { antecedent: { [Op.like]: `%${maSP}%` } },
          { consequent: maSP },
        ];
      }

      const rules = await FP_Rules.findAll({
        where: whereClause,
        order: [
          ["confidence", "DESC"],
          ["lift", "DESC"],
        ],
      });

      // Lấy thông tin chi tiết sản phẩm cho các rules tìm được
      const allMaSP = new Set([maSP]);
      rules.forEach((rule) => {
        if (Array.isArray(rule.antecedent)) {
          rule.antecedent.forEach((id) => allMaSP.add(id));
        }
        allMaSP.add(rule.consequent);
      });

      const productsResult = await this.getProductDetails([...allMaSP]);
      if (!productsResult.success) {
        return productsResult;
      }

      const productMap = {};
      productsResult.data.forEach((product) => {
        productMap[product.MaSP] = product;
      });

      const rulesWithDetails = rules.map((rule) => ({
        rule_id: rule.id,
        antecedent_ids: rule.antecedent,
        consequent_id: rule.consequent,
        support: rule.support,
        confidence: rule.confidence,
        lift: rule.lift,
        antecedent_products: rule.antecedent
          .map((id) => productMap[id])
          .filter(Boolean),
        consequent_product: productMap[rule.consequent],
        interpretation: this.generateRuleInterpretation(
          rule.antecedent.map((id) => productMap[id]).filter(Boolean),
          productMap[rule.consequent],
          rule
        ),
      }));

      return {
        success: true,
        data: {
          searched_product: productMap[maSP],
          rules: rulesWithDetails,
          total: rulesWithDetails.length,
          search_in: searchIn,
        },
      };
    } catch (error) {
      console.error("Error searching rules by product:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy top N sản phẩm được recommend nhiều nhất
   */
  async getTopRecommendedProducts({ modelId, limit = 10 } = {}) {
    try {
      // Lấy model_id
      let model_id = modelId;
      if (!model_id) {
        const metadataResult = await this.getLatestModelMetadata();
        if (!metadataResult.success || !metadataResult.data) {
          return {
            success: false,
            error: "Không tìm thấy model nào trong database",
          };
        }
        model_id = metadataResult.data.id;
      }

      // Query để đếm số lần xuất hiện của mỗi MaSP ở consequent
      const topProducts = await sequelize.query(
        `
        SELECT 
          consequent as MaSP,
          COUNT(*) as rule_count,
          AVG(confidence) as avg_confidence,
          AVG(support) as avg_support,
          AVG(lift) as avg_lift
        FROM FP_Rules
        WHERE model_id = :model_id
        GROUP BY consequent
        ORDER BY rule_count DESC, avg_confidence DESC
        LIMIT :limit
      `,
        {
          replacements: { model_id, limit },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (topProducts.length === 0) {
        return {
          success: true,
          data: {
            products: [],
            total: 0,
          },
        };
      }

      // Lấy thông tin chi tiết sản phẩm
      const maSPList = topProducts.map((p) => p.MaSP);
      const productsResult = await this.getProductDetails(maSPList);

      if (!productsResult.success) {
        return productsResult;
      }

      const productMap = {};
      productsResult.data.forEach((product) => {
        productMap[product.MaSP] = product;
      });

      // Gắn thông tin vào kết quả
      const result = topProducts.map((item) => ({
        product: productMap[item.MaSP],
        statistics: {
          rule_count: item.rule_count,
          avg_confidence: parseFloat(item.avg_confidence),
          avg_support: parseFloat(item.avg_support),
          avg_lift: parseFloat(item.avg_lift),
        },
      }));

      return {
        success: true,
        data: {
          products: result,
          total: result.length,
        },
      };
    } catch (error) {
      console.error("Error getting top recommended products:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new FpGrowthRulesService();
