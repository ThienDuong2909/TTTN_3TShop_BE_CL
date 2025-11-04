// test_fpgrowth_config.js
// Script test các API FP-Growth Configuration

const BASE_URL = "http://localhost:8080/api/fpgrowth";
const AUTH_URL = "http://localhost:8080/api/auth";

// Màu sắc cho console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
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

// Lưu token admin để test
let adminToken = "";

// =============================================================================
// 1. Test GET /api/fpgrowth/health (Public)
// =============================================================================
async function testHealth() {
  logSection("TEST 1: GET /api/fpgrowth/health (Public)");

  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess("Health check thành công");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Health check thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
  }
}

// =============================================================================
// 2. Test GET /api/fpgrowth/config (Public)
// =============================================================================
async function testGetConfig() {
  logSection("TEST 2: GET /api/fpgrowth/config (Public)");

  try {
    const response = await fetch(`${BASE_URL}/config`);
    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess("Lấy config thành công");
      console.log("Response:", JSON.stringify(data, null, 2));
      return data.data;
    } else {
      logError("Lấy config thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
    return null;
  }
}

// =============================================================================
// 3. Test POST /api/fpgrowth/config (Không có token - nên fail)
// =============================================================================
async function testUpdateConfigWithoutAuth() {
  logSection("TEST 3: POST /api/fpgrowth/config (Không có token - nên fail)");

  try {
    const response = await fetch(`${BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        min_sup: 0.3,
        min_conf: 0.7,
      }),
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      logSuccess("Đúng! API yêu cầu authentication");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Sai! API không yêu cầu authentication");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
  }
}

// =============================================================================
// 4. Login để lấy admin token
// =============================================================================
async function loginAsAdmin() {
  logSection("TEST 4: Đăng nhập để lấy admin token");

  try {
    logInfo("Đăng nhập với admin credentials...");

    // Thử đăng nhập với admin
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@gmail.com", // Thay đổi theo admin của bạn
        password: "12345678", // Thay đổi theo password admin
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      adminToken = data.token;
      logSuccess("Đăng nhập thành công");
      logInfo(`Token: ${adminToken.substring(0, 20)}...`);
      return true;
    } else {
      logError("Đăng nhập thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
      logInfo(
        "⚠️  Vui lòng tạo tài khoản admin hoặc cập nhật credentials trong file test"
      );
      return false;
    }
  } catch (error) {
    logError(`Lỗi khi đăng nhập: ${error.message}`);
    return false;
  }
}

// =============================================================================
// 5. Test POST /api/fpgrowth/config (Có token - nên thành công)
// =============================================================================
async function testUpdateConfigWithAuth(currentConfig) {
  logSection("TEST 5: POST /api/fpgrowth/config (Có admin token)");

  if (!adminToken) {
    logError("Không có admin token. Bỏ qua test này.");
    return;
  }

  try {
    // Thay đổi config một chút
    const newMinSup = currentConfig?.min_sup
      ? Math.max(0.1, currentConfig.min_sup - 0.1)
      : 0.3;
    const newMinConf = currentConfig?.min_conf
      ? Math.max(0.5, currentConfig.min_conf - 0.1)
      : 0.7;

    logInfo(`Cập nhật: min_sup=${newMinSup}, min_conf=${newMinConf}`);

    const response = await fetch(`${BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        min_sup: newMinSup,
        min_conf: newMinConf,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess("Cập nhật config thành công");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Cập nhật config thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
  }
}

// =============================================================================
// 6. Test POST /api/fpgrowth/config với dữ liệu không hợp lệ
// =============================================================================
async function testUpdateConfigInvalidData() {
  logSection("TEST 6: POST /api/fpgrowth/config với dữ liệu không hợp lệ");

  if (!adminToken) {
    logError("Không có admin token. Bỏ qua test này.");
    return;
  }

  // Test case 1: min_sup > 1
  try {
    logInfo("Test case: min_sup = 1.5 (> 1)");

    const response = await fetch(`${BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        min_sup: 1.5,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      logSuccess("Đúng! API reject min_sup > 1");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Sai! API accept min_sup > 1");
    }
  } catch (error) {
    logError(`Lỗi: ${error.message}`);
  }

  // Test case 2: min_conf <= 0
  try {
    logInfo("Test case: min_conf = 0 (<= 0)");

    const response = await fetch(`${BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        min_conf: 0,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      logSuccess("Đúng! API reject min_conf <= 0");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Sai! API accept min_conf <= 0");
    }
  } catch (error) {
    logError(`Lỗi: ${error.message}`);
  }

  // Test case 3: Không có tham số nào
  try {
    logInfo("Test case: Không có tham số");

    const response = await fetch(`${BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!data.success) {
      logSuccess("Đúng! API yêu cầu ít nhất 1 tham số");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Sai! API accept request rỗng");
    }
  } catch (error) {
    logError(`Lỗi: ${error.message}`);
  }
}

// =============================================================================
// 7. Test POST /api/fpgrowth/refresh
// =============================================================================
async function testRefreshModel() {
  logSection("TEST 7: POST /api/fpgrowth/refresh");

  if (!adminToken) {
    logError("Không có admin token. Bỏ qua test này.");
    return;
  }

  try {
    logInfo("Gọi API refresh model...");

    const response = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess("Refresh model thành công");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Refresh model thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
  }
}

// =============================================================================
// 8. Test cập nhật chỉ 1 tham số (min_sup only)
// =============================================================================
async function testUpdateOnlyMinSup() {
  logSection("TEST 8: POST /api/fpgrowth/config (chỉ min_sup)");

  if (!adminToken) {
    logError("Không có admin token. Bỏ qua test này.");
    return;
  }

  try {
    logInfo("Cập nhật chỉ min_sup = 0.35");

    const response = await fetch(`${BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        min_sup: 0.35,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess("Cập nhật min_sup thành công");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      logError("Cập nhật min_sup thất bại");
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    logError(`Lỗi khi gọi API: ${error.message}`);
  }
}

// =============================================================================
// Main test runner
// =============================================================================
async function runAllTests() {
  log("\n🚀 BẮT ĐẦU TEST FP-GROWTH CONFIG API", "yellow");
  log("=".repeat(80), "yellow");

  // Test public endpoints
  await testHealth();
  const currentConfig = await testGetConfig();

  // Test authentication
  await testUpdateConfigWithoutAuth();

  // Login và test authenticated endpoints
  const loginSuccess = await loginAsAdmin();

  if (loginSuccess) {
    await testUpdateConfigWithAuth(currentConfig);
    await testUpdateConfigInvalidData();
    await testUpdateOnlyMinSup();
    await testRefreshModel();

    // Restore lại config ban đầu (nếu có)
    if (currentConfig) {
      logSection("RESTORE: Khôi phục config ban đầu");
      try {
        await fetch(`${BASE_URL}/config`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            min_sup: currentConfig.min_sup,
            min_conf: currentConfig.min_conf,
          }),
        });
        logSuccess("Đã khôi phục config ban đầu");
      } catch (error) {
        logError(`Không thể khôi phục config: ${error.message}`);
      }
    }
  } else {
    logInfo("\n⚠️  Bỏ qua các test cần authentication do không đăng nhập được");
    logInfo("💡 Tạo tài khoản admin hoặc cập nhật credentials trong file test");
  }

  log("\n✨ HOÀN THÀNH TẤT CẢ TEST", "yellow");
  log("=".repeat(80), "yellow");
}

// Chạy tests
runAllTests().catch((error) => {
  logError(`Lỗi khi chạy tests: ${error.message}`);
  process.exit(1);
});
