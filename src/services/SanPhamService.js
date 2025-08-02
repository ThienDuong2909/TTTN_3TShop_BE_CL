const {
  SanPham,
  ChiTietSanPham,
  NhaCungCap,
  LoaiSP,
  KichThuoc,
  Mau,
  AnhSanPham,
  ThayDoiGia,
  sequelize,
  CT_DotGiamGia,

  DotGiamGia,
} = require("../models");
const { Op } = require("sequelize");

const removeVietnameseTones = (str) => {
  // Loại bỏ dấu tiếng Việt
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Loại bỏ các ký tự đặc biệt, chuyển về chữ thường, bỏ khoảng trắng
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  str = str.replace(/\s+/g, "");
  return str.toLowerCase();
};
const SanPhamService = {
  getAll: async () => {
    const today = new Date().toISOString().split("T")[0];
    return await SanPham.findAll({
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
        {
          model: ChiTietSanPham,
          as: "ChiTietSanPhams",
          include: [
            { model: KichThuoc, attributes: ["TenKichThuoc"] },
            { model: Mau, attributes: ["TenMau", "MaHex"] },
          ],
          attributes: ["MaCTSP", "MaKichThuoc", "MaMau", "SoLuongTon"],
        },
        // Giá hiện tại
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
        // Giảm giá nếu có
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
  },

  getAllProducts: async ({ page = 1, pageSize = 8 } = {}) => {
    const offset = (page - 1) * pageSize;
    const { rows, count } = await SanPham.findAndCountAll({
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
        {
          model: ChiTietSanPham,
          as: "ChiTietSanPhams",
          include: [
            { model: KichThuoc, attributes: ["TenKichThuoc"] },
            { model: Mau, attributes: ["TenMau", "MaHex"] },
          ],
          attributes: ["MaCTSP", "MaKichThuoc", "MaMau", "SoLuongTon"],
        },
      ],
      limit: pageSize,
      offset,
      distinct: true,
    });
  },
  getNewProducts: async () => {
    const today = new Date();
    const before30Days = new Date(today);
    before30Days.setDate(today.getDate() - 30);

    const todayStr = today.toISOString().split("T")[0];
    const before30DaysStr = before30Days.toISOString().split("T")[0];

    return await SanPham.findAll({
      where: {
        NgayTao: {
          [Op.gte]: before30DaysStr,
          [Op.lte]: todayStr,
        },
      },
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
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
            NgayApDung: { [Op.lte]: todayStr },
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
                NgayBatDau: { [Op.lte]: todayStr },
                NgayKetThuc: { [Op.gte]: todayStr },
              },
              required: true,
              attributes: ["NgayBatDau", "NgayKetThuc", "MoTa"],
            },
          ],
          attributes: ["PhanTramGiam"],
        }, // Thêm trường isNew để đánh dấu sản phẩm mới
      ],
    });
  },
  getById: async (id) => {
    const today = new Date().toISOString().split("T")[0];
    return await SanPham.findByPk(id, {
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
        {
          model: ChiTietSanPham,
          include: [{ model: KichThuoc }, { model: Mau }],
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
        // Giảm giá nếu có
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
  },

  getBySupplier: async (supplierId) => {
    return await SanPham.findAll({
      where: { MaNCC: supplierId },
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        {
          model: ChiTietSanPham,
          include: [{ model: KichThuoc }, { model: Mau }],
        },
      ],
    });
  },

  getProductDetails: async () => {
    return await ChiTietSanPham.findAll({
      include: [
        {
          model: SanPham,
          include: [
            { model: NhaCungCap },
            { model: LoaiSP },
            { model: AnhSanPham },
          ],
        },
        { model: KichThuoc },
        { model: Mau },
      ],
    });
  },

  getProductDetailById: async (id) => {
    return await ChiTietSanPham.findByPk(id, {
      include: [
        {
          model: SanPham,
          include: [
            { model: NhaCungCap },
            { model: LoaiSP },
            { model: AnhSanPham },
          ],
        },
        { model: KichThuoc },
        { model: Mau },
      ],
    });
  },

  create: async (data) => {
    return await SanPham.create(data);
  },

  update: async (id, data) => {
    const sanPham = await SanPham.findByPk(id);
    if (!sanPham) return null;
    await sanPham.update(data);
    return sanPham;
  },

  delete: async (id) => {
    const sanPham = await SanPham.findByPk(id);
    if (!sanPham) return null;
    await sanPham.destroy();
    return sanPham;
  },

  getColorsSizesByProductId: async (productId) => {
    return await ChiTietSanPham.findAll({
      where: { MaSP: productId },
      include: [
        {
          model: KichThuoc,
          attributes: ["MaKichThuoc", "TenKichThuoc"],
        },
        {
          model: Mau,
          attributes: ["MaMau", "TenMau", "MaHex"],
        },
        {
          model: SanPham,
          attributes: ["MaSP", "TenSP", "MaLoaiSP", "MaNCC", "MoTa"],
          include: [
            {
              model: NhaCungCap,
              attributes: ["MaNCC", "TenNCC", "DiaChi", "SDT", "Email"],
            },
            {
              model: LoaiSP,
              attributes: ["MaLoaiSP", "TenLoai"],
            },
          ],
        },
      ],
      attributes: ["MaCTSP", "MaSP", "MaKichThuoc", "MaMau", "SoLuongTon"],
    });
  },

  getAvailableSizesAndColors: async (productId) => {
    const chiTietSanPham = await ChiTietSanPham.findAll({
      where: { MaSP: productId },
      include: [
        {
          model: KichThuoc,
          attributes: ["MaKichThuoc", "TenKichThuoc"],
        },
        {
          model: Mau,
          attributes: ["MaMau", "TenMau", "MaHex"],
        },
      ],
      attributes: ["MaKichThuoc", "MaMau", "SoLuongTon"],
    });

    // Lấy danh sách size và màu duy nhất
    const sizes = [];
    const colors = [];
    const sizeMap = new Map();
    const colorMap = new Map();

    chiTietSanPham.forEach((item) => {
      // Thêm size nếu chưa có
      if (!sizeMap.has(item.KichThuoc.MaKichThuoc)) {
        sizeMap.set(item.KichThuoc.MaKichThuoc, true);
        sizes.push({
          MaKichThuoc: item.KichThuoc.MaKichThuoc,
          TenKichThuoc: item.KichThuoc.TenKichThuoc,
        });
      }

      // Thêm màu nếu chưa có
      if (!colorMap.has(item.Mau.MaMau)) {
        colorMap.set(item.Mau.MaMau, true);
        colors.push({
          MaMau: item.Mau.MaMau,
          TenMau: item.Mau.TenMau,
          MaHex: item.Mau.MaHex,
        });
      }
    });

    return {
      sizes,
      colors,
      totalSizes: sizes.length,
      totalColors: colors.length,
    };
  },
  getChiTietSanPham: async (maCTSP) => {
    const chiTiet = await ChiTietSanPham.findOne({
      where: { MaCTSP: maCTSP },
      include: [
        { model: SanPham, attributes: ["MaSP", "TenSP"] },
        { model: KichThuoc, attributes: ["TenKichThuoc"] },
        { model: Mau, attributes: ["TenMau", "MaHex"] },
      ],
    });
    if (!chiTiet) {
      throw new Error("Chi tiết sản phẩm không tồn tại");
    }
    return chiTiet;
  },
  getCurrentDiscount: async (maSP) => {
    const today = new Date().toISOString().split("T")[0];

    const discount = await CT_DotGiamGia.findOne({
      where: { MaSP: maSP },
      include: [
        {
          model: DotGiamGia,
          where: {
            NgayBatDau: { [Op.lte]: today },
            NgayKetThuc: { [Op.gte]: today },
          },
          required: true,
        },
      ],
      attributes: ["PhanTramGiam"],
    });

    return discount ? Number(discount.PhanTramGiam) : 0;
  },

  getCurrentPrice: async (maSP) => {
    console.log("maSP:", maSP, "Type:", typeof maSP); // Debug kiểu dữ liệu
    const parsedMaSP = Number(maSP); // Ép kiểu thành số nguyên
    if (isNaN(parsedMaSP)) {
      throw new Error("MaSP không hợp lệ");
    }

    const today = new Date().toISOString().split("T")[0];
    const price = await ThayDoiGia.findOne({
      where: {
        MaSP: parsedMaSP,
        NgayApDung: { [Op.lte]: today },
      },
      order: [["NgayApDung", "DESC"]],
    });

    console.log("price:", price.dataValues); // Debug dữ liệu trả về
    if (!price) {
      throw new Error("Không tìm thấy giá hiện tại cho sản phẩm");
    }
    return price.Gia;
  },
  getStockByMaCTSP: async (maCTSP) => {
    const chiTiet = await ChiTietSanPham.findByPk(maCTSP);
    if (!chiTiet) {
      throw new Error("Không tìm thấy chi tiết sản phẩm");
    }
    return chiTiet.SoLuongTon;
  },
  updateStock: async (MaCTSP, SoLuongTon) => {
    const chiTiet = await ChiTietSanPham.findByPk(MaCTSP);
    if (!chiTiet) throw new Error("Không tìm thấy chi tiết sản phẩm");
    chiTiet.SoLuongTon = SoLuongTon;
    await chiTiet.save();
    return chiTiet;
  },
  updateMultipleStocks: async (items) => {
    if (!Array.isArray(items)) throw new Error("Dữ liệu phải là mảng");
    const results = [];
    for (const item of items) {
      const { MaCTSP, SoLuongTon } = item;
      if (MaCTSP === undefined || SoLuongTon === undefined) {
        results.push({
          MaCTSP,
          success: false,
          message: "Thiếu MaCTSP hoặc SoLuongTon",
        });
        continue;
      }
      try {
        const chiTiet = await ChiTietSanPham.findByPk(MaCTSP);
        if (!chiTiet) {
          results.push({
            MaCTSP,
            success: false,
            message: "Không tìm thấy chi tiết sản phẩm",
          });
          continue;
        }
        chiTiet.SoLuongTon = SoLuongTon;
        await chiTiet.save();
        results.push({ MaCTSP, success: true });
      } catch (err) {
        results.push({ MaCTSP, success: false, message: err.message });
      }
    }
    return results;
  },
  createProduct: async ({
    TenSP,
    MaLoaiSP,
    MaNCC,
    MoTa,
    details,
    images,
    Gia,
    NgayApDung,
  }) => {
    return await sequelize.transaction(async (t) => {
      // 1. Tạo sản phẩm
      const product = await SanPham.create(
        { TenSP, MaLoaiSP, MaNCC, MoTa },
        { transaction: t }
      );

      // 2. Tạo chi tiết sản phẩm
      for (const detail of details) {
        await ChiTietSanPham.create(
          {
            MaSP: product.MaSP,
            MaKichThuoc: detail.MaKichThuoc,
            MaMau: detail.MaMau,
            SoLuongTon: detail.SoLuongTon,
          },
          { transaction: t }
        );
      }

      // 3. Lưu ảnh sản phẩm từ URL
      let index = 1;
      for (const img of images) {
        await AnhSanPham.create(
          {
            MaSP: product.MaSP,
            TenFile: img.TenFile,
            DuongDan: img.url,
            AnhChinh: img.AnhChinh || (index === 1 ? 1 : 0),
            ThuTu: img.ThuTu || index,
            MoTa: img.MoTa || "",
          },
          { transaction: t }
        );
        index++;
      }

      // 4. Thêm giá sản phẩm vào bảng ThayDoiGia
      if (Gia) {
        const today = new Date().toISOString().split("T")[0];
        const ngayApDungMoi = NgayApDung || today;

        // Validate ngày áp dụng không được trong quá khứ (trừ hôm nay)
        const ngayApDungDate = new Date(ngayApDungMoi);
        const todayDate = new Date(today);

        if (ngayApDungDate < todayDate) {
          throw new Error(
            `Ngày áp dụng giá (${ngayApDungMoi}) không được nhỏ hơn ngày hiện tại (${today})`
          );
        }

        await ThayDoiGia.create(
          {
            MaSP: product.MaSP,
            Gia: Gia,
            NgayThayDoi: today,
            NgayApDung: ngayApDungMoi,
          },
          { transaction: t }
        );
      }

      return product;
    });
  },
  updateProductInfo: async ({
    id,
    TenSP,
    MaLoaiSP,
    MaNCC,
    MoTa,
    Gia,
    NgayApDung,
    images,
  }) => {
    const product = await SanPham.findByPk(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    // Cập nhật thông tin cơ bản
    if (TenSP !== undefined) product.TenSP = TenSP;
    if (MaLoaiSP !== undefined) product.MaLoaiSP = MaLoaiSP;
    if (MaNCC !== undefined) product.MaNCC = MaNCC;
    if (MoTa !== undefined) product.MoTa = MoTa;
    await product.save();

    // Cập nhật lại ảnh sản phẩm nếu có images
    if (images && Array.isArray(images)) {
      // Xóa toàn bộ ảnh cũ
      await AnhSanPham.destroy({ where: { MaSP: id } });
      // Thêm lại ảnh mới
      let index = 1;
      for (const img of images) {
        await AnhSanPham.create({
          MaSP: id,
          TenFile: img.TenFile,
          DuongDan: img.url,
          AnhChinh: img.AnhChinh || (index === 1 ? 1 : 0),
          ThuTu: img.ThuTu || index,
          MoTa: img.MoTa || "",
        });
        index++;
      }
    }

    // So sánh giá và validate ngày áp dụng
    if (Gia !== undefined) {
      // Lấy giá hiện tại (áp dụng mới nhất)
      const latestPrice = await ThayDoiGia.findOne({
        where: { MaSP: id },
        order: [["NgayApDung", "DESC"]],
      });

      if (!latestPrice || Number(latestPrice.Gia) !== Number(Gia)) {
        const today = new Date().toISOString().split("T")[0];
        const ngayApDungMoi = NgayApDung || today;

        // Validate ngày áp dụng: phải lớn hơn ngày áp dụng của giá hiện tại
        if (latestPrice) {
          const ngayApDungHienTai = new Date(latestPrice.NgayApDung);
          const ngayApDungMoiDate = new Date(ngayApDungMoi);

          if (ngayApDungMoiDate <= ngayApDungHienTai) {
            throw new Error(
              `Ngày áp dụng giá mới (${ngayApDungMoi}) phải lớn hơn ngày áp dụng của giá hiện tại (${latestPrice.NgayApDung}). Không thể đặt ngày áp dụng trong quá khứ so với giá đang có hiệu lực.`
            );
          }
        } else {
          // Nếu chưa có giá nào, validate ngày áp dụng không được nhỏ hơn ngày hiện tại
          const todayDate = new Date(today);
          const ngayApDungMoiDate = new Date(ngayApDungMoi);

          if (ngayApDungMoiDate < todayDate) {
            throw new Error(
              `Ngày áp dụng giá (${ngayApDungMoi}) không được nhỏ hơn ngày hiện tại (${today})`
            );
          }
        }

        await ThayDoiGia.create({
          MaSP: id,
          Gia: Gia,
          NgayThayDoi: today,
          NgayApDung: ngayApDungMoi,
        });
      }
    }
    return product;
  },
  getBestSellers: async () => {
    const today = new Date();
    const before30Days = new Date(today);
    before30Days.setDate(today.getDate() - 30);

    const donDatHangs = await require("../models/DonDatHang").findAll({
      where: {
        NgayTao: {
          [Op.gte]: before30Days,
          [Op.lte]: today,
        },
        MaTTDH: 5, // Chỉ lấy đơn hàng đã hoàn thành
      },
      attributes: ["MaDDH"],
    });

    const maDDHs = donDatHangs.map((d) => d.MaDDH);
    if (maDDHs.length === 0) return [];

    const { CT_DonDatHang, ChiTietSanPham, SanPham } = require("../models");
    const bestSellers = await CT_DonDatHang.findAll({
      where: { MaDDH: { [Op.in]: maDDHs } },
      attributes: [
        "MaCTSP",
        [
          require("sequelize").fn("SUM", require("sequelize").col("SoLuong")),
          "totalSold",
        ],
      ],
      group: ["MaCTSP"],
      raw: true,
    });

    const maCTSPs = bestSellers.map((b) => b.MaCTSP);
    if (maCTSPs.length === 0) return [];

    const chiTietSPs = await ChiTietSanPham.findAll({
      where: { MaCTSP: { [Op.in]: maCTSPs } },
      attributes: ["MaCTSP", "MaSP"],
      raw: true,
    });

    // Map MaCTSP -> MaSP
    const mapCTSPtoSP = {};
    chiTietSPs.forEach((ct) => {
      mapCTSPtoSP[ct.MaCTSP] = ct.MaSP;
    });

    // Gom nhóm tổng số lượng bán theo MaSP
    const spSoldMap = {};
    bestSellers.forEach((item) => {
      const maSP = mapCTSPtoSP[item.MaCTSP];
      if (!maSP) return;
      if (!spSoldMap[maSP]) spSoldMap[maSP] = 0;
      spSoldMap[maSP] += Number(item.totalSold);
    });

    // Lấy danh sách MaSP bán chạy, sắp xếp giảm dần theo số lượng bán
    const sortedMaSPs = Object.entries(spSoldMap)
      .sort((a, b) => b[1] - a[1])
      .map(([maSP]) => Number(maSP));

    if (sortedMaSPs.length === 0) return [];

    const todayStr = today.toISOString().split("T")[0];
    const products = await SanPham.findAll({
      where: { MaSP: { [Op.in]: sortedMaSPs } },
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
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
          where: { NgayApDung: { [Op.lte]: todayStr } },
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
                NgayBatDau: { [Op.lte]: todayStr },
                NgayKetThuc: { [Op.gte]: todayStr },
              },
              required: true,
              attributes: ["NgayBatDau", "NgayKetThuc", "MoTa"],
            },
          ],
          attributes: ["PhanTramGiam"],
        },
      ],
    });

    // Sắp xếp lại theo thứ tự bán chạy và thêm trường totalSold
    const productMap = {};
    products.forEach((p) => {
      productMap[p.MaSP] = p;
    });
    return sortedMaSPs
      .map((maSP) => {
        const prod = productMap[maSP];
        if (prod) {
          prod.dataValues.totalSold = spSoldMap[maSP] || 0;
          return prod;
        }
        return null;
      })
      .filter(Boolean);
  },
  searchProducts: async (keyword) => {
    if (!keyword) return [];

    const allProducts = await SanPham.findAll({
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
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
            NgayApDung: { [Op.lte]: new Date().toISOString().split("T")[0] },
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
                NgayBatDau: {
                  [Op.lte]: new Date().toISOString().split("T")[0],
                },
                NgayKetThuc: {
                  [Op.gte]: new Date().toISOString().split("T")[0],
                },
              },
              required: true,
              attributes: ["NgayBatDau", "NgayKetThuc", "MoTa"],
            },
          ],
          attributes: ["PhanTramGiam"],
        },
      ],
    });

    const processedKeyword = removeVietnameseTones(keyword);

    // Lọc sản phẩm theo tiêu chí tìm kiếm
    const filtered = allProducts.filter((sp) => {
      const name = removeVietnameseTones(sp.TenSP || "");
      return name.includes(processedKeyword);
    });

    return filtered;
  },
  getAllDiscountProducts: async () => {
    const today = new Date().toISOString().split("T")[0];

    return await SanPham.findAll({
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { model: ThayDoiGia },
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
          required: true,
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
  },

  addProductDetail: async ({ MaSP, MaKichThuoc, MaMau, SoLuongTon }) => {
    // Kiểm tra đã tồn tại chưa
    const existed = await ChiTietSanPham.findOne({
      where: { MaSP, MaKichThuoc, MaMau },
    });
    if (existed) throw new Error("Chi tiết sản phẩm đã tồn tại");
    const detail = await ChiTietSanPham.create({
      MaSP,
      MaKichThuoc,
      MaMau,
      SoLuongTon,
    });
    return detail;
  },
};

module.exports = SanPhamService;
