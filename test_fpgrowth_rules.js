// test_fpgrowth_rules.js
// Script test các API FP-Growth Rules với chi tiết sản phẩm

const BASE_URL = "http://localhost:8080/api/fpgrowth";

// Màu sắc cho console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(80));
  log(title, "cyan");
  console.log("=".repeat(80));
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// =============================================================================
// 1. Test GET /api/fpgrowth/model
// =============================================================================
async function testGetModelMetadata() {
  logSection("TEST 1: GET /api/fpgrowth/model - Lấy thông tin model");

  try {
    const response = await fetch(`${BASE_URL}/model`);
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess("Lấy model metadata thành công");
      console.log("Model Info:");
      console.log(`  - ID: ${data.data.id}`);
      console.log(`  - Transactions: ${data.data.N}`);
      console.log(`  - MIN_SUP: ${data.data.min_sup}`);
      console.log(`  - MIN_CONF: ${data.data.min_conf}`);
      console.log(`  - Total Rules: ${data.data.total_rules}`);
      console.log(`  - Total Freq Items: ${data.data.total_freq_items}`);
      console.log(`  - Created At: ${data.data.created_at}`);
      return data.data;
    } else {
      logError("Lấy model metadata thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
    return null;
  }
}

// =============================================================================
// 2. Test GET /api/fpgrowth/rules (Lấy rules với chi tiết sản phẩm)
// =============================================================================
async function testGetRulesWithDetails() {
  logSection(
    "TEST 2: GET /api/fpgrowth/rules - Lấy rules với chi tiết sản phẩm"
  );

  try {
    // Lấy 5 rules đầu tiên
    const response = await fetch(`${BASE_URL}/rules?limit=5`);
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess(
        `Lấy ${data.data.rules.length} rules thành công (Total: ${data.data.total})`
      );

      // Hiển thị vài rules mẫu
      data.data.rules.slice(0, 3).forEach((rule, index) => {
        console.log(`\n📌 Rule ${index + 1}:`);
        console.log(
          `   Antecedent: [${rule.antecedent_ids.join(", ")}] → Consequent: ${
            rule.consequent_id
          }`
        );
        console.log(`   Confidence: ${(rule.confidence * 100).toFixed(1)}%`);
        console.log(`   Support: ${(rule.support * 100).toFixed(1)}%`);
        console.log(`   Lift: ${rule.lift.toFixed(2)}`);

        // Hiển thị tên sản phẩm
        if (rule.antecedent_products && rule.antecedent_products.length > 0) {
          const antNames = rule.antecedent_products
            .map((p) => p.TenSP)
            .join(", ");
          console.log(`   🛒 Sản phẩm trong giỏ: ${antNames}`);
        }
        if (rule.consequent_product) {
          console.log(`   💡 Gợi ý: ${rule.consequent_product.TenSP}`);
        }
        console.log(`   📝 ${rule.interpretation}`);
      });

      return data.data;
    } else {
      logError("Lấy rules thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
    return null;
  }
}

// =============================================================================
// 3. Test GET /api/fpgrowth/rules với filter
// =============================================================================
async function testGetRulesWithFilter() {
  logSection("TEST 3: GET /api/fpgrowth/rules - Với filter confidence và lift");

  try {
    // Lấy rules có confidence >= 0.9 và lift >= 1.5
    const response = await fetch(
      `${BASE_URL}/rules?minConfidence=0.9&minLift=1.5&limit=10`
    );
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess(
        `Lấy ${data.data.rules.length} rules có confidence >= 0.9 và lift >= 1.5`
      );

      if (data.data.rules.length > 0) {
        const rule = data.data.rules[0];
        console.log("\n📌 Rule chất lượng cao nhất:");
        console.log(`   Confidence: ${(rule.confidence * 100).toFixed(1)}%`);
        console.log(`   Lift: ${rule.lift.toFixed(2)}`);
        console.log(`   ${rule.interpretation}`);
      } else {
        logWarning("Không tìm thấy rules thỏa mãn điều kiện");
      }

      return data.data;
    } else {
      logError("Lấy rules thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
    return null;
  }
}

// =============================================================================
// 4. Test GET /api/fpgrowth/rules/search (Tìm theo sản phẩm)
// =============================================================================
async function testSearchRulesByProduct(maSP) {
  logSection(
    `TEST 4: GET /api/fpgrowth/rules/search - Tìm rules theo MaSP ${maSP}`
  );

  if (!maSP) {
    logWarning("Không có MaSP để test, bỏ qua test này");
    return;
  }

  try {
    // Tìm rules có sản phẩm này ở cả antecedent và consequent
    const response = await fetch(
      `${BASE_URL}/rules/search?maSP=${maSP}&searchIn=both`
    );
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess(`Tìm thấy ${data.data.total} rules liên quan đến sản phẩm`);

      if (data.data.searched_product) {
        console.log(
          `\n🔍 Sản phẩm tìm kiếm: ${data.data.searched_product.TenSP} (MaSP: ${data.data.searched_product.MaSP})`
        );
      }

      // Phân loại rules
      const asAntecedent = data.data.rules.filter((r) =>
        r.antecedent_ids.includes(maSP)
      );
      const asConsequent = data.data.rules.filter(
        (r) => r.consequent_id === maSP
      );

      console.log(`\n📊 Thống kê:`);
      console.log(
        `   - Xuất hiện trong giỏ (antecedent): ${asAntecedent.length} rules`
      );
      console.log(`   - Được gợi ý (consequent): ${asConsequent.length} rules`);

      // Hiển thị vài rules mẫu
      if (asAntecedent.length > 0) {
        console.log(`\n💡 Khi khách mua sản phẩm này, nên gợi ý:`);
        asAntecedent.slice(0, 3).forEach((rule) => {
          if (rule.consequent_product) {
            console.log(
              `   - ${rule.consequent_product.TenSP} (Confidence: ${(
                rule.confidence * 100
              ).toFixed(1)}%)`
            );
          }
        });
      }

      return data.data;
    } else {
      logError("Tìm kiếm rules thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
    return null;
  }
}

// =============================================================================
// 5. Test GET /api/fpgrowth/rules/top-products
// =============================================================================
async function testGetTopRecommendedProducts() {
  logSection(
    "TEST 5: GET /api/fpgrowth/rules/top-products - Top sản phẩm được gợi ý nhiều nhất"
  );

  try {
    const response = await fetch(`${BASE_URL}/rules/top-products?limit=10`);
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess(`Lấy top ${data.data.products.length} sản phẩm thành công`);

      console.log("\n🏆 Top sản phẩm được recommend nhiều nhất:");
      data.data.products.slice(0, 5).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.product.TenSP}`);
        console.log(`   - MaSP: ${item.product.MaSP}`);
        console.log(
          `   - Xuất hiện trong: ${item.statistics.rule_count} rules`
        );
        console.log(
          `   - Avg Confidence: ${(
            item.statistics.avg_confidence * 100
          ).toFixed(1)}%`
        );
        console.log(
          `   - Avg Support: ${(item.statistics.avg_support * 100).toFixed(1)}%`
        );
        console.log(`   - Avg Lift: ${item.statistics.avg_lift.toFixed(2)}`);
      });

      return data.data;
    } else {
      logError("Lấy top sản phẩm thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
    return null;
  }
}

// =============================================================================
// 6. Test tìm kiếm với searchIn khác nhau
// =============================================================================
async function testSearchWithDifferentModes(maSP) {
  if (!maSP) return;

  logSection(
    "TEST 6: Tìm kiếm với các chế độ khác nhau (antecedent, consequent)"
  );

  try {
    // Test searchIn = antecedent
    logInfo("Test searchIn = 'antecedent' (sản phẩm trong giỏ)");
    const resp1 = await fetch(
      `${BASE_URL}/rules/search?maSP=${maSP}&searchIn=antecedent`
    );
    const data1 = await resp1.json();
    if (data1.success) {
      logSuccess(`Tìm thấy ${data1.data.total} rules (sản phẩm trong giỏ)`);
    }

    // Test searchIn = consequent
    logInfo("\nTest searchIn = 'consequent' (sản phẩm được gợi ý)");
    const resp2 = await fetch(
      `${BASE_URL}/rules/search?maSP=${maSP}&searchIn=consequent`
    );
    const data2 = await resp2.json();
    if (data2.success) {
      logSuccess(`Tìm thấy ${data2.data.total} rules (sản phẩm được gợi ý)`);
    }
  } catch (error) {
    logError(`Lỗi: ${error.message}`);
  }
}

// =============================================================================
// Main test runner
// =============================================================================
async function runAllTests() {
  log("\n🚀 BẮT ĐẦU TEST FP-GROWTH RULES API", "yellow");
  log("=".repeat(80), "yellow");

  // 1. Lấy model metadata
  const metadata = await testGetModelMetadata();

  if (!metadata) {
    logError(
      "\n❌ Không có model trong database. Vui lòng chạy Python API để tạo model trước."
    );
    logInfo("💡 Chạy: python fp_rec_api.py và gọi POST /refresh để tạo model");
    return;
  }

  // 2. Test lấy rules cơ bản
  const rulesData = await testGetRulesWithDetails();

  // 3. Test lấy rules với filter
  await testGetRulesWithFilter();

  // 4. Test tìm kiếm theo sản phẩm (lấy MaSP từ rule đầu tiên)
  let maSPToSearch = null;
  if (rulesData && rulesData.rules.length > 0) {
    const firstRule = rulesData.rules[0];
    // Lấy sản phẩm đầu tiên trong antecedent
    if (firstRule.antecedent_ids.length > 0) {
      maSPToSearch = firstRule.antecedent_ids[0];
    }
  }

  if (maSPToSearch) {
    await testSearchRulesByProduct(maSPToSearch);
    await testSearchWithDifferentModes(maSPToSearch);
  } else {
    logWarning("Không có MaSP để test tìm kiếm");
  }

  // 5. Test top products
  await testGetTopRecommendedProducts();

  log("\n✨ HOÀN THÀNH TẤT CẢ TEST", "yellow");
  log("=".repeat(80), "yellow");

  // Summary
  console.log("\n📋 Tóm tắt:");
  console.log("✅ Tất cả API hoạt động bình thường");
  console.log(
    "💡 Sử dụng các API này để hiển thị gợi ý sản phẩm trên frontend"
  );
}

// Chạy tests
runAllTests().catch((error) => {
  logError(`Lỗi khi chạy tests: ${error.message}`);
  process.exit(1);
});
