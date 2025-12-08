# 3TShop Backend - AI Coding Instructions

## Project Overview

Node.js/Express e-commerce backend for a Vietnamese shoe store with role-based access control, FP-Growth recommendation engine, order management, and automated email notifications. Uses Sequelize ORM with MySQL.

## Architecture Patterns

### Three-Layer Architecture

- **Controllers** (`src/controllers/`): Handle HTTP requests, call services, return standardized responses
- **Services** (`src/services/`): Business logic as classes with static/instance methods
- **Models** (`src/models/`): Sequelize models with associations defined in `src/models/index.js`

Example controller pattern:

```javascript
const NhanVienController = {
  getAll: async (req, res) => {
    try {
      const data = await NhanVienService.getAll();
      return response.success(res, data, "Lấy danh sách nhân viên thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },
};
```

### Response Utilities

Always use `src/utils/response.js` for consistent API responses:

- `response.success(res, data, message, status)` - Success responses
- `response.error(res, error, message, status)` - Error handling
- `response.notFound(res, message)` - 404 responses
- `response.validationError(res, errors, message)` - Validation errors

## Permission System (RBAC)

### Authorization Middleware

Use `authorize(permissions, options)` from `src/middlewares/authorize.js`:

```javascript
// Single permission
router.post('/', authenticateJWT, authorize('sanpham.tao'), SanPhamController.createProduct);

// Multiple permissions (OR logic)
router.get('/supplier/:id', authenticateJWT, authorize(['sanpham.xem', 'toanquyen']), ...);

// Context-aware permissions
router.put('/:id', authenticateJWT, authorize('donhang.capnhat_trangthai_duocgiao', {
  context: (req) => ({ assignedTo: req.params.id })
}), ...);
```

### Permission Naming Convention

Format: `{entity}.{action}[_scope]`

- `sanpham.xem` - View products
- `donhang.xem_cua_minh` - View own orders
- `donhang.xem_duoc_giao` - View assigned orders
- `toanquyen` - Admin override

### Adding New Permissions

1. Add to `setup_permission_system.sql` migration
2. Run migration: `node setup_permission_system.js`
3. Assign to roles via `PhanQuyen_VaiTro` table
4. Use in routes with `authorize()` middleware

See `PERMISSION_SYSTEM_GUIDE.md` for complete permission list.

## Database & Sequelize

### Model Conventions

- Models use Vietnamese naming: `MaSP` (product ID), `TenSP` (product name), `NgayTao` (created date)
- All models in `src/models/index.js` have `freezeTableName: true` and `timestamps: false`
- Foreign keys explicitly defined in associations

### Complex Associations Example

Many-to-many with through table:

```javascript
NhanVien.belongsToMany(KhuVuc, {
  through: NhanVien_KhuVuc,
  foreignKey: "MaNV",
  otherKey: "MaKhuVuc",
  as: "KhuVucPhuTrach",
});
```

### Database Configuration

Uses environment variables with fallback to hardcoded production values in `src/configs/database.js`. Required env vars:

- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`

## Route Organization

### Dual Endpoint Pattern

Routes serve both Vietnamese and English endpoints:

```javascript
router.use("/nhanvien", nhanVienRoutes); // Vietnamese
router.use("/employees", nhanVienRoutes); // English for frontend
```

### Route Structure

1. **Public routes first** - No authentication
2. **Authenticated routes** - After `router.use(authenticateJWT)`
3. **Authorized routes** - With specific permissions

Example from `src/routes/sanpham.js`:

```javascript
// Public
router.get("/", SanPhamController.getAll);
router.get("/search", SanPhamController.searchProducts);

// Authenticated + Authorized
router.post(
  "/",
  authenticateJWT,
  authorize("sanpham.tao", "toanquyen"),
  SanPhamController.createProduct
);
```

## External Integrations

### FP-Growth Python Service

Recommendation engine runs as separate Python service at `http://localhost:8000` (configurable via `PYTHON_API_URL`):

```javascript
const FpGrowthService = require("../services/FpGrowthService");
const recommendations = await FpGrowthService.getRecommendations(productIds);
```

Models: `FP_ModelMetadata`, `FP_Rules`, `FP_FrequentItemsets`

### Email Service

NodeMailer integration for automated order notifications. Configure via env:

- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

See `EMAIL_SETUP.md` for Gmail App Password setup.

### Firebase Admin (Push Notifications)

Initialized in services using `firebase-admin` with `delivery-3tshop-firebase.json` credential file.

### Google OAuth

Uses `google-auth-library` OAuth2Client. Required: `GOOGLE_CLIENT_ID` env var.

## Key Features & Workflows

### Order Management with Delivery Assignment

Orders (`DonDatHang`) have two NhanVien references:

- `MaNV_Duyet` - Approver
- `MaNV_Giao` - Delivery person (assigned based on `KhuVuc`)

Status workflow: `TrangThaiDH` table with state machine logic in `DonDatHangService`.

### Stock Management

Product details (`ChiTietSanPham`) track inventory by color/size. Stock updates cascade through:

1. `PhieuNhap` (receipts) increase stock
2. `DonDatHang` (orders) reserve/decrease stock
3. `PhieuTraHang` (returns) restore stock

### Discount System

`DotGiamGia` (discount periods) with many-to-many to `SanPham` via `CT_DotGiamGia`.

## Development Workflow

### Running the Application

```powershell
npm run dev      # Development with nodemon
npm start        # Production
```

Health checks: `/health` and `/api/health`

### Testing

No automated tests configured. Manual testing scripts in root:

- `test_role_api.js` - Role permission tests
- `test_fpgrowth_rules.js` - Recommendation engine tests
- `test-email.js` - Email service validation

### Logging

API request/response logging via `src/middlewares/logger.js`. Configure:

- `API_LOGGING=false` - Disable logging
- `LOG_TO_FILE=true` - Write to `logs/api-YYYY-MM-DD.log`

Color-coded console output: 🟢 success, 🟡 client errors, 🔴 server errors

### Docker Deployment

Multi-stage build in `Dockerfile`:

- Build stage: Install all deps, prepare app
- Run stage: Node 20 Alpine, production deps only
- Exposes port 8080

## Common Patterns

### Service Methods with Transaction Support

```javascript
create: async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await Model.create(data, { transaction });
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

### Excel Export Pattern

Services use `exceljs` to generate reports:

```javascript
const ExcelJS = require("exceljs");
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Sheet");
// ... populate data
const buffer = await workbook.xlsx.writeBuffer();
```

### File Upload Handling

Multer middleware in `src/middlewares/upload.js` for images. Files stored in `uploads/` directory.

## Important Notes

- **Vietnamese Messages**: All user-facing messages in Vietnamese
- **JWT Secret**: Defaults to hardcoded value if `JWT_SECRET` not set (security risk)
- **CORS**: Configured for specific frontend origins in `server.js`
- **Sequelize Logging**: Disabled by default (`logging: false`)
- **Migrations**: SQL files in `src/migrations/` - run manually with database tools

## Adding New Features

1. **Model** - Create Sequelize model, add to `src/models/index.js` with associations
2. **Service** - Implement business logic in `src/services/`
3. **Controller** - Create controller methods using response utilities
4. **Routes** - Add to `src/routes/`, register in `src/routes/index.js`
5. **Permissions** - If restricted, add permission and use `authorize()` middleware
6. **Documentation** - Create `{FEATURE}_API.md` in root (follow existing patterns)

## Reference Files

- `PERMISSION_SYSTEM_GUIDE.md` - Complete RBAC documentation
- `FP_GROWTH_IMPLEMENTATION_SUMMARY.md` - Recommendation engine details
- `SETUP_GUIDE.md` - FP-Growth initial setup
- `src/middlewares/README.md` - API logging documentation
