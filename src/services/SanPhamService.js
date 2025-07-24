const {
  SanPham,
  ChiTietSanPham,
  NhaCungCap,
  LoaiSP,
  KichThuoc,
  Mau,
  AnhSanPham,
  ThayDoiGia,
  CT_DotGiamGia,
  DotGiamGia,
} = require("../models");
const { Op } = require("sequelize");

const SanPhamService = {
  getAll: async () => {
    const today = new Date().toISOString().split("T")[0];

    return await SanPham.findAll({
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
  getById: async (id) => {
    const today = new Date().toISOString().split("T")[0];
    return await SanPham.findByPk(id, {
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
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
};

module.exports = SanPhamService;
