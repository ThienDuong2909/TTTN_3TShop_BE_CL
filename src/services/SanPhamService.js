const { SanPham, ChiTietSanPham, NhaCungCap, LoaiSP, KichThuoc, Mau, AnhSanPham } = require('../models');

const SanPhamService = {
  getAll: async () => {
    return await SanPham.findAll({
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham }
      ]
    });
  },
  
  getById: async (id) => {
    return await SanPham.findByPk(id, {
      include: [
        { model: NhaCungCap },
        { model: LoaiSP },
        { model: AnhSanPham },
        { 
          model: ChiTietSanPham,
          include: [
            { model: KichThuoc },
            { model: Mau }
          ]
        }
      ]
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
          include: [
            { model: KichThuoc },
            { model: Mau }
          ]
        }
      ]
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
            { model: AnhSanPham }
          ]
        },
        { model: KichThuoc },
        { model: Mau }
      ]
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
            { model: AnhSanPham }
          ]
        },
        { model: KichThuoc },
        { model: Mau }
      ]
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
          attributes: ['MaKichThuoc', 'TenKichThuoc']
        },
        { 
          model: Mau,
          attributes: ['MaMau', 'TenMau', 'MaHex']
        },
        { 
          model: SanPham,
          attributes: ['MaSP', 'TenSP', 'MaLoaiSP', 'MaNCC', 'MoTa'],
          include: [
            { 
              model: NhaCungCap,
              attributes: ['MaNCC', 'TenNCC', 'DiaChi', 'SDT', 'Email']
            },
            { 
              model: LoaiSP,
              attributes: ['MaLoaiSP', 'TenLoai']
            }
          ]
        }
      ],
      attributes: ['MaCTSP', 'MaSP', 'MaKichThuoc', 'MaMau', 'SoLuongTon']
    });
  },
};

module.exports = SanPhamService; 