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
  BinhLuan,
  CT_DonDatHang,
  KhachHang,
} = require("../models");
const { Op } = require("sequelize");

const removeVietnameseTones = (str) => {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
  str = str.replace(/\s+/g, "");
  return str.toLowerCase();
};
// Hàm chung tính avgRate cho danh sách sản phẩm
const calculateAvgRateForProducts = async (products) => {
  for (const product of products) {
    try {
      // Lấy tất cả MaCTSP của sản phẩm này
      const maCTSPs = product.ChiTietSanPhams?.map((ctsp) => ctsp.MaCTSP) || [];

      if (maCTSPs.length === 0) {
        product.dataValues.BinhLuan = {
          avgRate: 0,
          luotBinhLuan: 0,
        };
        continue;
      }

      // Lấy tất cả MaCTDDH từ các MaCTSP
      const ctDonDatHangs = await CT_DonDatHang.findAll({
        where: { MaCTSP: { [Op.in]: maCTSPs } },
        attributes: ["MaCTDDH"],
        raw: true,
      });

      const maCTDDHs = ctDonDatHangs.map((ct) => ct.MaCTDDH);

      if (maCTDDHs.length === 0) {
        product.dataValues.BinhLuan = {
          avgRate: 0,
          luotBinhLuan: 0,
        };
        continue;
      }

      // Lấy tất cả bình luận cho sản phẩm này
      const binhLuans = await BinhLuan.findAll({
        where: { MaCTDonDatHang: { [Op.in]: maCTDDHs } },
        attributes: ["SoSao"],
        raw: true,
      });

      const luotBinhLuan = binhLuans.length;

      if (luotBinhLuan === 0) {
        product.dataValues.BinhLuan = {
          avgRate: 0,
          luotBinhLuan: 0,
        };
      } else {
        // Tính số sao trung bình
        const totalStars = binhLuans.reduce((sum, bl) => sum + bl.SoSao, 0);
        const avgRate = Math.round((totalStars / luotBinhLuan) * 10) / 10;

        product.dataValues.BinhLuan = {
          avgRate: avgRate,
          luotBinhLuan: luotBinhLuan,
        };
      }
    } catch (error) {
      console.error(
        `Error calculating BinhLuan for product ${product.MaSP}:`,
        error
      );
      product.dataValues.BinhLuan = {
        avgRate: 0,
        luotBinhLuan: 0,
      };
    }
  }

  return products;
};
const SanPhamService = {
  getAll: async () => {
    const today = new Date().toISOString().split("T")[0];
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
    return await calculateAvgRateForProducts(allProducts);
  },

  getAllProducts: async ({ page = 1, pageSize = 8 } = {}) => {
    const offset = (page - 1) * pageSize;
    const { rows, count } = await SanPham.findAndCountAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM BinhLuan bl
              JOIN CT_DonDatHang ctd ON bl.MaCTDonDatHang = ctd.MaCTDDH
              JOIN ChiTietSanPham ctsp2 ON ctd.MaCTSP = ctsp2.MaCTSP
              WHERE ctsp2.MaSP = SanPham.MaSP
            )`),
            "SoLuongBinhLuan",
          ],
          [
            sequelize.literal(`(
              SELECT ROUND(AVG(bl2.SoSao),2) FROM BinhLuan bl2
              JOIN CT_DonDatHang ctd2 ON bl2.MaCTDonDatHang = ctd2.MaCTDDH
              JOIN ChiTietSanPham ctsp3 ON ctd2.MaCTSP = ctsp3.MaCTSP
              WHERE ctsp3.MaSP = SanPham.MaSP
            )`),
            "SoSaoTrungBinh",
          ],
        ],
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
      ],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return { rows, count };
  },

  getNewProducts: async () => {
    const today = new Date();
    const before30Days = new Date(today);
    before30Days.setDate(today.getDate() - 30);

    const todayStr = today.toISOString().split("T")[0];
    const before30DaysStr = before30Days.toISOString().split("T")[0];

    const products = await SanPham.findAll({
      where: {
        NgayTao: {
          [Op.gte]: before30DaysStr,
          [Op.lte]: today,
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
        },
      ],
    });

    // Tính avgRate cho sản phẩm mới
    return await calculateAvgRateForProducts(products);
  },
  getById: async (id) => {
    const today = new Date().toISOString().split("T")[0];
    const product = await SanPham.findByPk(id, {
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
          attributes: ["Gia", "NgayThayDoi", "NgayApDung"],
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
    const productsWithBinhLuan = await calculateAvgRateForProducts([product]);

    const comments = await sequelize.query(
      `
      SELECT 
        bl.MaBL,
        bl.MoTa,
        bl.SoSao,
        bl.NgayBinhLuan,
        kh.MaKH,
        kh.TenKH,
        ctsp.MaKichThuoc,
        ctsp.MaMau,
        kt.TenKichThuoc,
        m.TenMau,
        m.MaHex
      FROM BinhLuan bl
      JOIN CT_DonDatHang ctddh ON bl.MaCTDonDatHang = ctddh.MaCTDDH
      JOIN ChiTietSanPham ctsp ON ctddh.MaCTSP = ctsp.MaCTSP
      JOIN KhachHang kh ON bl.MaKH = kh.MaKH
      LEFT JOIN KichThuoc kt ON ctsp.MaKichThuoc = kt.MaKichThuoc
      LEFT JOIN Mau m ON ctsp.MaMau = m.MaMau
      WHERE ctsp.MaSP = :productId
      ORDER BY bl.NgayBinhLuan DESC
    `,
      {
        replacements: { productId: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    product.dataValues.BinhLuan.DanhSachBinhLuan = comments;

    // Trả về sản phẩm đầu tiên (vì chỉ có 1 sản phẩm)
    return productsWithBinhLuan[0];
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
        {
          TenSP,
          MaLoaiSP,
          MaNCC,
          MoTa,
          NgayTao: new Date(),
        },
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

    console.log(
      `Calculating best sellers from ${before30Days.toISOString()} to ${today.toISOString()}`
    );
    const donDatHangs = await require("../models/DonDatHang").findAll({
      where: {
        NgayTao: {
          [Op.gte]: before30Days,
          [Op.lte]: today,
        },
        MaTTDH: 4, // Chỉ lấy đơn hàng đã hoàn thành
      },
      attributes: ["MaDDH"],
    });

    console.log(`Found ${donDatHangs.length} orders in the last 30 days.`);

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

    const productsWithAvgRate = await calculateAvgRateForProducts(products);

    // Sắp xếp lại theo thứ tự bán chạy và thêm trường totalSold
    const productMap = {};
    productsWithAvgRate.forEach((p) => {
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

    return await calculateAvgRateForProducts(filtered);
  },
  getAllDiscountProducts: async () => {
    const today = new Date().toISOString().split("T")[0];

    const products = await SanPham.findAll({
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
    return await calculateAvgRateForProducts(products);
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
  getRecommendations: async (
    maCTSPList,
    k = 8,
    excludeInCart = true,
    requireInStock = false
  ) => {
    try {
      const fetch = require("node-fetch");
      const { Op } = require("sequelize");
      const {
        SanPham,
        NhaCungCap,
        LoaiSP,
        AnhSanPham,
        ThayDoiGia,
        CT_DotGiamGia,
        DotGiamGia,
        KichThuoc,
        Mau,
        ChiTietSanPham,
      } = require("../models");

      const PYTHON_API_URL =
        process.env.PYTHON_API_URL || "http://localhost:8000";

      // 1) Gọi API Python
      const resp = await fetch(`${PYTHON_API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: maCTSPList.map(Number),
          k: Number(k),
          exclude_incart: Boolean(excludeInCart),
          require_instock: Boolean(requireInStock),
          group_by_antecedent: true,
          per_group_k: Number(k),
        }),
      });

      if (!resp.ok) {
        throw new Error(`Python API returned status ${resp.status}`);
      }

      const data = await resp.json();
      // data = { items: [...], groups: [...] }
      const groups = Array.isArray(data?.groups) ? data.groups : [];

      if (groups.length === 0) {
        return { groups: [] };
      }

      // 2) Tìm số lượng antecedent nhiều nhất
      const maxAntecedentLength = Math.max(
        ...groups.map((g) => (g.antecedent || []).length)
      );

      // 3) Lọc chỉ lấy các nhóm có số lượng antecedent = max
      const filteredGroups = groups.filter(
        (g) => (g.antecedent || []).length === maxAntecedentLength
      );

      // 4) Lấy tất cả MaSP từ các nhóm đã lọc
      const allMaSP = Array.from(
        new Set(
          filteredGroups.flatMap((g) =>
            (Array.isArray(g.items) ? g.items : [])
              .map((x) => Number(x.MaSP))
              .filter(Boolean)
          )
        )
      );

      if (allMaSP.length === 0) {
        return { groups: [] };
      }

      // 5) Lấy thông tin chi tiết sản phẩm
      const today = new Date().toISOString().split("T")[0];
      const products = await SanPham.findAll({
        where: { MaSP: { [Op.in]: allMaSP } },
        include: [
          { model: NhaCungCap },
          { model: LoaiSP },
          { model: AnhSanPham },
          {
            model: ThayDoiGia,
            where: { NgayApDung: { [Op.lte]: today } },
            separate: true,
            limit: 1,
            order: [["NgayApDung", "DESC"]],
            attributes: ["Gia", "NgayApDung"],
          },
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

      const productsWithBinhLuan = await calculateAvgRateForProducts(products);

      // 6) Map MaSP -> product object
      const productMap = {};
      productsWithBinhLuan.forEach((p) => {
        productMap[p.MaSP] = p;
      });

      // 7) Build nhóm kết quả với thông tin đầy đủ
      const resultGroups = [];
      for (const g of filteredGroups) {
        const items = Array.isArray(g.items) ? g.items : [];
        const products = [];

        for (const item of items) {
          const maSP = Number(item.MaSP);
          const prod = productMap[maSP];

          if (prod) {
            const productData = prod.toJSON?.() || prod;
            products.push({
              ...productData,
              _rec: {
                MaSP: maSP,
                score: item.score,
                confidence: item.confidence,
                support: item.support,
                lift: item.lift,
                antecedent: item.antecedent || [],
                rule_size: item.rule_size || 0,
              },
            });
          }

          // Giới hạn mỗi nhóm tối đa k sản phẩm
          if (products.length >= k) break;
        }

        if (products.length > 0) {
          resultGroups.push({
            antecedent: g.antecedent || [],
            antecedentLength: (g.antecedent || []).length,
            products: products,
          });
        }
      }

      return {
        groups: resultGroups,
        maxAntecedentLength: maxAntecedentLength,
        totalGroups: resultGroups.length,
      };
    } catch (error) {
      console.error("Error calling recommendation API:", error);
      throw new Error(`Không thể lấy gợi ý sản phẩm: ${error.message}`);
    }
  },
};

module.exports = SanPhamService;
