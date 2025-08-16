const {
  LoaiSP,
  SanPham,
  AnhSanPham,
  ChiTietSanPham,
  ThayDoiGia,
  CT_DotGiamGia,
  DotGiamGia,
  Mau,
  KichThuoc,
} = require("../models");
const { Sequelize, Op } = require("sequelize");

const LoaiSPService = {
  // Lấy tất cả loại sản phẩm
  async getAll() {
    return await LoaiSP.findAll({
      attributes: {
        include: [
          // Thêm cột đếm số lượng sản phẩm
          [
            Sequelize.fn("COUNT", Sequelize.col("SanPhams.MaSP")),
            "soLuongSanPham",
          ],
        ],
      },
      include: [
        {
          model: SanPham,
          attributes: [], // Không lấy chi tiết sản phẩm, chỉ cần đếm
        },
      ],
      group: ["LoaiSP.MaLoaiSP"],
    });
  },

  // Lấy loại sản phẩm theo id
  async getById(id) {
    return await LoaiSP.findByPk(id);
  },

  // Thêm loại sản phẩm mới
  async create(data) {
    return await LoaiSP.create(data);
  },

  // Cập nhật loại sản phẩm
  async update(id, data) {
    const loaiSP = await LoaiSP.findByPk(id);
    if (!loaiSP) return null;
    await loaiSP.update(data);
    return loaiSP;
  },

  // Xóa loại sản phẩm
  async delete(id) {
    const loaiSP = await LoaiSP.findByPk(id);
    if (!loaiSP) return null;

    // Kiểm tra xem có sản phẩm nào thuộc loại này không
    const productCount = await SanPham.count({
      where: { MaLoaiSP: id }
    });

    if (productCount > 0) {
      throw new Error(`Không thể xóa loại sản phẩm này vì còn ${productCount} sản phẩm thuộc loại này. Vui lòng xóa hoặc chuyển các sản phẩm sang loại khác trước.`);
    }

    await loaiSP.destroy();
    return true;
  },
  getProductsById: async (id) => {
    console.log("Lấy sản phẩm theo mã loại:", id);
    const today = new Date().toISOString().split("T")[0];

    return await SanPham.findAll({
      where: { MaLoaiSP: id },
      include: [
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
  },
};

module.exports = LoaiSPService;
