const { NhanVien, TaiKhoan, VaiTro, BoPhan, NhanVien_BoPhan, KhuVuc, NhanVien_KhuVuc, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const path = require('path');

const NhanVienService = {
  getAll: async () => {
    return await NhanVien.findAll({
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          include: [{ model: BoPhan }]
        },
        {
          model: KhuVuc,
          as: 'KhuVucPhuTrach',
          attributes: ['MaKhuVuc', 'TenKhuVuc'],
          through: { 
            attributes: ['NgayTao', 'TrangThai'] 
          }
        }
      ]
    });
  },
  
  getById: async (id) => {
    return await NhanVien.findByPk(id, {
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          include: [{ model: BoPhan }]
        },
        {
          model: KhuVuc,
          as: 'KhuVucPhuTrach',
          attributes: ['MaKhuVuc', 'TenKhuVuc'],
          through: { 
            attributes: ['NgayTao', 'TrangThai'] 
          }
        }
      ]
    });
  },
  
  getByTaiKhoanId: async (taiKhoanId) => {
    return await NhanVien.findOne({
      where: { MaTK: taiKhoanId },
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          include: [{ model: BoPhan }]
        },
        {
          model: KhuVuc,
          as: 'KhuVucPhuTrach',
          attributes: ['MaKhuVuc', 'TenKhuVuc'],
          through: { 
            attributes: ['NgayTao', 'TrangThai'] 
          }
        }
      ]
    });
  },
  
  create: async (data) => {
    const t = await sequelize.transaction();
    let nhanVien = null; // Khai báo bên ngoài để sử dụng sau commit
    
    try {
      const { Email, MatKhau, TenNV, NgaySinh, DiaChi, Luong, KhuVucPhuTrach, BoPhan } = data;
      
      // Kiểm tra trùng email nếu có email
      if (Email) {
        const existed = await TaiKhoan.findOne({ where: { Email } });
        if (existed) {
          throw { message: 'Email đã tồn tại', code: 'EMAIL_EXISTS' };
        }
      }

      let taiKhoan = null;
      
      // Tạo tài khoản nếu có email
      if (Email) {
        const hashedPassword = await bcrypt.hash(MatKhau || '3TShop@2025', 10); 
        // Xác định vai trò dựa trên KhuVucPhuTrach
        let maVaiTro = 2; // Mặc định là NhanVienCuaHang
        if (KhuVucPhuTrach && KhuVucPhuTrach.length > 0) {
          maVaiTro = 3; // NhanVienGiaoHang nếu có khu vực phụ trách
        }
        
        taiKhoan = await TaiKhoan.create({
          Email,
          Password: hashedPassword,
          MaVaiTro: maVaiTro,
        }, { transaction: t });
      }

      // Tạo nhân viên
      const nhanVienData = {
        TenNV,
        NgaySinh,
        DiaChi,
        Luong,
        MaTK: taiKhoan?.MaTK || null,
      };
      
      nhanVien = await NhanVien.create(nhanVienData, { transaction: t });
      
      // Nếu có danh sách khu vực phụ trách, tạo bản ghi trong NhanVien_KhuVuc
      if (KhuVucPhuTrach && Array.isArray(KhuVucPhuTrach) && KhuVucPhuTrach.length > 0) {
        for (const maKhuVuc of KhuVucPhuTrach) {
          // Kiểm tra khu vực có tồn tại không
          const khuVuc = await KhuVuc.findByPk(maKhuVuc);
          if (!khuVuc) {
            throw new Error(`Không tìm thấy khu vực với mã: ${maKhuVuc}`);
          }
          
          await NhanVien_KhuVuc.create({
            MaNV: nhanVien.MaNV,
            MaKhuVuc: maKhuVuc,
            NgayTao: new Date(),
            TrangThai: 1
          }, { transaction: t });
        }
        console.log(`Tạo nhân viên giao hàng với ${KhuVucPhuTrach.length} khu vực phụ trách: ${KhuVucPhuTrach.join(', ')}`);
      }
      
      // Nếu có danh sách bộ phận, tạo bản ghi trung gian
      if (BoPhan && Array.isArray(BoPhan)) {
        for (const dep of BoPhan) {
          await NhanVien_BoPhan.create({
            MaNV: nhanVien.MaNV,
            MaBoPhan: dep.MaBoPhan,
            NgayBatDau: dep.NgayBatDau,
            NgayKetThuc: dep.NgayKetThuc || null,
            ChucVu: dep.ChucVu || null,
            TrangThai: dep.TrangThai || 'DANGLAMVIEC',
            GhiChu: dep.GhiChu || null
          }, { transaction: t });
        }
      }
      
      await t.commit();
      
    } catch (err) {
      await t.rollback();
      throw err;
    }

    // Trả về nhân viên vừa tạo kèm tài khoản, bộ phận và khu vực phụ trách (bên ngoài transaction)
    try {
      return await NhanVien.findByPk(nhanVien.MaNV, {
        include: [
          { 
            model: TaiKhoan, 
            include: [{ model: VaiTro }] 
          },
          { 
            model: NhanVien_BoPhan, 
            include: [{ model: BoPhan }] 
          },
          {
            model: KhuVuc,
            as: 'KhuVucPhuTrach',
            attributes: ['MaKhuVuc', 'TenKhuVuc'],
            through: { 
              attributes: ['NgayTao', 'TrangThai'] 
            }
          }
        ]
      });
    } catch (err) {
      // Nếu có lỗi khi query kết quả, vẫn trả về thông tin cơ bản
      console.error('Lỗi khi lấy thông tin nhân viên vừa tạo:', err);
      return await NhanVien.findByPk(nhanVien.MaNV);
    }
  },
  
  update: async (id, data) => {
    const t = await sequelize.transaction();
    try {
      const { Email, MatKhau, TenNV, NgaySinh, DiaChi, Luong, KhuVucPhuTrach } = data;
      const nhanVien = await NhanVien.findByPk(id, {
        include: [{ model: TaiKhoan }]
      });
      if (!nhanVien) {
        throw { message: 'Không tìm thấy nhân viên', code: 'NOT_FOUND' };
      }
      
      // Cập nhật thông tin nhân viên
      const updateData = { TenNV, NgaySinh, DiaChi, Luong };
      await nhanVien.update(updateData, { transaction: t });
      
      // Cập nhật tài khoản nếu có
      if (nhanVien.TaiKhoan) {
        const taiKhoanUpdate = {};
        if (Email) {
          // Kiểm tra trùng email
          const existed = await TaiKhoan.findOne({ 
            where: { 
              Email: Email, 
              MaTK: { [Op.ne]: nhanVien.MaTK } 
            } 
          });
          if (existed) {
            throw { message: 'Email đã tồn tại', code: 'EMAIL_EXISTS' };
          }
          taiKhoanUpdate.Email = Email;
        }
        if (MatKhau) taiKhoanUpdate.Password = await bcrypt.hash(MatKhau, 10);
        
        // Cập nhật vai trò dựa trên KhuVucPhuTrach
        if (KhuVucPhuTrach !== undefined) {
          taiKhoanUpdate.MaVaiTro = (KhuVucPhuTrach && KhuVucPhuTrach.length > 0) ? 3 : 2; // 3: NhanVienGiaoHang, 2: NhanVienCuaHang
        }
        
        if (Object.keys(taiKhoanUpdate).length > 0) {
          await nhanVien.TaiKhoan.update(taiKhoanUpdate, { transaction: t });
        }
      }
      
      // Cập nhật khu vực phụ trách nếu có
      if (KhuVucPhuTrach !== undefined) {
        // Xóa các bản ghi cũ trong NhanVien_KhuVuc
        await NhanVien_KhuVuc.destroy({ where: { MaNV: id } }, { transaction: t });
        
        // Tạo các bản ghi mới nếu có khu vực phụ trách
        if (Array.isArray(KhuVucPhuTrach) && KhuVucPhuTrach.length > 0) {
          for (const maKhuVuc of KhuVucPhuTrach) {
            // Kiểm tra khu vực có tồn tại không
            const khuVuc = await KhuVuc.findByPk(maKhuVuc);
            if (!khuVuc) {
              throw new Error(`Không tìm thấy khu vực với mã: ${maKhuVuc}`);
            }
            
            await NhanVien_KhuVuc.create({
              MaNV: id,
              MaKhuVuc: maKhuVuc,
              NgayTao: new Date(),
              TrangThai: 1
            }, { transaction: t });
          }
        }
      }
      
      await t.commit();
      
      // Trả về nhân viên vừa cập nhật
      return await NhanVien.findByPk(id, {
        include: [
          { model: TaiKhoan, include: [{ model: VaiTro }] },
          { model: NhanVien_BoPhan, include: [{ model: BoPhan }] },
          {
            model: KhuVuc,
            as: 'KhuVucPhuTrach',
            attributes: ['MaKhuVuc', 'TenKhuVuc'],
            through: { 
              attributes: ['NgayTao', 'TrangThai'] 
            }
          }
        ]
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  
  delete: async (id) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;
    await nhanVien.destroy();
    return nhanVien;
  },

  chuyenBoPhan: async (MaNV, { MaBoPhanMoi, NgayChuyen, ChucVu, GhiChu, KhuVucPhuTrach }) => {
    const t = await sequelize.transaction();
    try {
      // 1. Tìm bản ghi bộ phận hiện tại
      const current = await NhanVien_BoPhan.findOne({
        where: { MaNV, TrangThai: 'DANGLAMVIEC' },
        order: [['NgayBatDau', 'DESC']],
        transaction: t
      });
      if (!current) throw { message: 'Nhân viên chưa thuộc bộ phận nào đang làm việc', code: 'NO_ACTIVE_DEPARTMENT' };
      
      // 2. Cập nhật kết thúc bộ phận cũ
      await current.update({
        NgayKetThuc: NgayChuyen,
        TrangThai: 'DAKETTHUC'
      }, { transaction: t });
      
      // 3. Tạo bản ghi bộ phận mới
      const newDep = await NhanVien_BoPhan.create({
        MaNV,
        MaBoPhan: MaBoPhanMoi,
        NgayBatDau: NgayChuyen,
        ChucVu: ChucVu || null,
        TrangThai: 'DANGLAMVIEC',
        GhiChu: GhiChu || null
      }, { transaction: t });
      
      // 4. Lấy thông tin nhân viên để kiểm tra tài khoản
      const nhanVien = await NhanVien.findByPk(MaNV, {
        include: [{ model: TaiKhoan }],
        transaction: t
      });
      
      // 5. Nếu chuyển sang bộ phận giao hàng (mã 11)
      if (MaBoPhanMoi == 11) {
        // Cập nhật vai trò tài khoản thành NhanVienGiaoHang (mã 3) nếu có tài khoản
        if (nhanVien.TaiKhoan) {
          await nhanVien.TaiKhoan.update({
            MaVaiTro: 3 // NhanVienGiaoHang
          }, { transaction: t });
          console.log(`Cập nhật vai trò thành NhanVienGiaoHang cho nhân viên ${MaNV}`);
        }
        
        // Cập nhật khu vực phụ trách nếu có
        if (KhuVucPhuTrach && Array.isArray(KhuVucPhuTrach) && KhuVucPhuTrach.length > 0) {
          // Xóa các bản ghi cũ trong NhanVien_KhuVuc
          await NhanVien_KhuVuc.destroy({ 
            where: { MaNV: MaNV },
            transaction: t 
          });
          
          // Tạo các bản ghi mới cho khu vực phụ trách
          for (const maKhuVuc of KhuVucPhuTrach) {
            // Kiểm tra khu vực có tồn tại không
            const khuVuc = await KhuVuc.findByPk(maKhuVuc);
            if (!khuVuc) {
              throw new Error(`Không tìm thấy khu vực với mã: ${maKhuVuc}`);
            }
            
            await NhanVien_KhuVuc.create({
              MaNV: MaNV,
              MaKhuVuc: maKhuVuc,
              NgayTao: new Date(),
              TrangThai: 1
            }, { transaction: t });
          }
          console.log(`Cập nhật ${KhuVucPhuTrach.length} khu vực phụ trách cho nhân viên giao hàng ${MaNV}: ${KhuVucPhuTrach.join(', ')}`);
        }
      } else {
        // 6. Nếu chuyển từ bộ phận giao hàng sang bộ phận khác
        if (current.MaBoPhan == 11) {
          // Cập nhật vai trò tài khoản thành NhanVienCuaHang (mã 2) nếu có tài khoản
          if (nhanVien.TaiKhoan) {
            await nhanVien.TaiKhoan.update({
              MaVaiTro: 2 // NhanVienCuaHang
            }, { transaction: t });
            console.log(`Cập nhật vai trò thành NhanVienCuaHang cho nhân viên ${MaNV}`);
          }
          
          // Xóa tất cả khu vực phụ trách khi chuyển khỏi bộ phận giao hàng
          await NhanVien_KhuVuc.destroy({ 
            where: { MaNV: MaNV },
            transaction: t 
          });
          console.log(`Xóa tất cả khu vực phụ trách cho nhân viên ${MaNV} khi chuyển khỏi bộ phận giao hàng`);
        }
      }
      
      await t.commit();
      return newDep;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  getLichSuBoPhan: async (MaNV) => {
    return await NhanVien_BoPhan.findAll({
      where: { MaNV },
      include: [{ model: BoPhan }],
      order: [['NgayBatDau', 'ASC']]
    });
  },

  getByBoPhan: async (MaBoPhan) => {
    return await NhanVien.findAll({
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          where: {
            MaBoPhan: MaBoPhan,
            TrangThai: 'DANGLAMVIEC'
          },
          include: [{ model: BoPhan }]
        }
      ]
    });
  },

  // Đọc danh sách phường/xã từ file Excel
  loadDistrictList: () => {
    try {
      const filePath = path.join(__dirname, '../data/district_list.xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Đọc dữ liệu từ hàng 2, cột A
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const districts = [];
      
      for (let row = 1; row <= range.e.r; row++) { // Bắt đầu từ hàng 2 (index 1)
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 }); // Cột A (index 0)
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const districtName = cell.v.toString().trim();
          if (districtName) {
            // Chuẩn hóa tên phường/xã để so sánh
            const normalizedName = districtName.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/[^a-z0-9\s]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            districts.push({
              original: districtName,
              normalized: normalizedName,
              // Tạo các biến thể tên có thể xuất hiện
              variants: [
                normalizedName,
                normalizedName.replace(/^(phuong|xa|thi tran|quan|huyen|thanh pho)\s+/, ''),
                normalizedName.replace(/^(p|x|tt|q|h|tp)\s+/, ''),
                normalizedName.replace(/\s+(phuong|xa|thi tran|quan|huyen|thanh pho)$/, ''),
                normalizedName.replace(/\s+(p|x|tt|q|h|tp)$/, '')
              ].filter(v => v && v.length > 1) // Loại bỏ chuỗi rỗng và quá ngắn
            });
          }
        }
      }
      
      console.log(`Đã tải ${districts.length} phường/xã từ file Excel`);
      return districts;
    } catch (error) {
      console.error('Lỗi khi đọc file district_list.xlsx:', error);
      return [];
    }
  },

  // Helper function để trích xuất phường/xã từ địa chỉ sử dụng dữ liệu Excel
  extractPhuongXa: (diaChi) => {
    if (!diaChi) return '';
    
    // Tải danh sách phường/xã
    const districts = NhanVienService.loadDistrictList();
    if (districts.length === 0) {
      console.warn('Không thể tải danh sách phường/xã, sử dụng phương pháp fallback');
      return NhanVienService.extractPhuongXaFallback(diaChi);
    }
    
    // Chuẩn hóa địa chỉ đầu vào
    const normalizedAddress = diaChi.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Tách địa chỉ thành các phần
    const addressParts = normalizedAddress.split(',').map(part => part.trim());
    
    // Hàm chuẩn hóa tên phường/xã để khớp với database
    const normalizeForDatabase = (name) => {
      return name
        .replace(/^(phường|phư|xã|xa|thị trấn|quận|huyện|thành phố)\s+/i, '') // Bỏ tiền tố
        .replace(/^(p|x|tt|q|h|tp)\.?\s+/i, '') // Bỏ viết tắt
        .replace(/\s+(phường|phư|xã|xa|thị trấn|quận|huyện|thành phố)$/i, '') // Bỏ hậu tố
        .replace(/\s+(p|x|tt|q|h|tp)\.?$/i, '') // Bỏ viết tắt cuối
        .trim();
    };
    
    // Tìm kiếm trong danh sách phường/xã
    for (const district of districts) {
      // Kiểm tra tên chính
      if (normalizedAddress.includes(district.normalized)) {
        const normalizedName = normalizeForDatabase(district.original);
        console.log(`Tìm thấy phường/xã: ${district.original} -> chuẩn hóa: ${normalizedName} (exact match)`);
        return normalizedName;
      }
      
      // Kiểm tra các biến thể tên
      for (const variant of district.variants) {
        if (variant.length > 2 && normalizedAddress.includes(variant)) {
          const normalizedName = normalizeForDatabase(district.original);
          console.log(`Tìm thấy phường/xã: ${district.original} -> chuẩn hóa: ${normalizedName} (variant: ${variant})`);
          return normalizedName;
        }
      }
      
      // Kiểm tra từng phần của địa chỉ
      for (const part of addressParts) {
        const cleanPart = part.trim();
        if (cleanPart.length > 2) {
          // Kiểm tra khớp hoàn toàn
          if (district.normalized === cleanPart) {
            const normalizedName = normalizeForDatabase(district.original);
            console.log(`Tìm thấy phường/xã: ${district.original} -> chuẩn hóa: ${normalizedName} (part match: ${cleanPart})`);
            return normalizedName;
          }
          
          // Kiểm tra khớp với biến thể
          for (const variant of district.variants) {
            if (variant.length > 2 && (variant === cleanPart || cleanPart.includes(variant))) {
              const normalizedName = normalizeForDatabase(district.original);
              console.log(`Tìm thấy phường/xã: ${district.original} -> chuẩn hóa: ${normalizedName} (part variant: ${variant})`);
              return normalizedName;
            }
          }
        }
      }
    }
    
    console.log(`Không tìm thấy phường/xã trong địa chỉ: ${diaChi}`);
    return '';
  },

  // Fallback method (phương pháp cũ)
  extractPhuongXaFallback: (diaChi) => {
    if (!diaChi) return '';
    
    // Chuẩn hóa địa chỉ: thay _ thành khoảng trắng, loại bỏ dấu
    let normalizedAddress = diaChi.replace(/_/g, ' ').toLowerCase();
    
    // Các pattern để tìm phường/xã trong địa chỉ
    const patterns = [
      /(?:phường|phư|p\.?)\s*([^,\s]+)/i,
      /(?:xã|xa|x\.?)\s*([^,\s]+)/i,
      /(?:thị trấn|tt\.?)\s*([^,\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = normalizedAddress.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Nếu không tìm thấy pattern, kiểm tra các từ khóa phổ biến
    const commonAreas = [
      'ben thanh', 'bến thành', 'ben nghe', 'bến nghé', 
      'sai gon', 'sài gòn', 'tan dinh', 'tân định',
      'district 1', 'quan 1', 'quận 1', 'district 3', 'quan 3', 'quận 3'
    ];
    
    for (const area of commonAreas) {
      if (normalizedAddress.includes(area)) {
        return area.replace(/\s+/g, ' ').trim();
      }
    }
    
    // Nếu không tìm thấy pattern, lấy từ đầu tiên sau dấu phẩy
    const parts = diaChi.split(',');
    if (parts.length > 1) {
      return parts[0].trim().replace(/_/g, ' ');
    }
    
    // Trường hợp cuối: trả về toàn bộ địa chỉ đã chuẩn hóa
    return normalizedAddress.replace(/\s+/g, ' ').trim();
  },

  // Tìm nhân viên giao hàng tối ưu cho một đơn hàng
  findOptimalDeliveryStaff: async (diaChi) => {
    try {
      // Trích xuất phường/xã từ địa chỉ giao hàng
      const phuongXa = NhanVienService.extractPhuongXa(diaChi);
      
      // Query tìm nhân viên giao hàng phụ trách khu vực và đếm số đơn đang giao
      let query = `
        SELECT 
          nv.MaNV,
          nv.TenNV,
          nv.DiaChi,
          GROUP_CONCAT(DISTINCT kv.TenKhuVuc ORDER BY kv.TenKhuVuc ASC SEPARATOR ', ') as KhuVucPhuTrach,
          COUNT(CASE WHEN dh.MaTTDH IN (3, 4) THEN 1 END) as SoDonDangGiao
        FROM nhanvien nv
        INNER JOIN nhanvien_bophan nvbp ON nv.MaNV = nvbp.MaNV 
        LEFT JOIN NhanVien_KhuVuc nvkv ON nv.MaNV = nvkv.MaNV AND nvkv.TrangThai = 1
        LEFT JOIN KhuVuc kv ON nvkv.MaKhuVuc = kv.MaKhuVuc
        LEFT JOIN dondathang dh ON nv.MaNV = dh.MaNV_Giao 
        WHERE nvbp.MaBoPhan = 11 
          AND nvbp.TrangThai = 'DANGLAMVIEC'
        GROUP BY nv.MaNV, nv.TenNV, nv.DiaChi
        ORDER BY `;

      // Thêm điều kiện ưu tiên nếu có phường/xã
      if (phuongXa) {
        query += `
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM NhanVien_KhuVuc nvkv2 
              INNER JOIN KhuVuc kv2 ON nvkv2.MaKhuVuc = kv2.MaKhuVuc 
              WHERE nvkv2.MaNV = nv.MaNV 
                AND nvkv2.TrangThai = 1 
                AND (
                  kv2.TenKhuVuc = :phuongXa OR
                  kv2.TenKhuVuc LIKE :phuongXaPattern OR 
                  LOWER(REPLACE(REPLACE(REPLACE(kv2.TenKhuVuc, ' ', ''), 'ư', 'u'), 'đ', 'd')) = 
                  LOWER(REPLACE(REPLACE(REPLACE(:phuongXa, ' ', ''), 'ư', 'u'), 'đ', 'd')) OR
                  CONCAT('phường ', LOWER(kv2.TenKhuVuc)) = LOWER(:phuongXa) OR
                  LOWER(kv2.TenKhuVuc) = LOWER(REPLACE(:phuongXa, 'phường ', ''))
                )
            ) THEN 0 
            ELSE 1 
          END,`;
      }
      
      query += `
          SoDonDangGiao ASC, 
          nv.MaNV ASC
        LIMIT 1
      `;

      const deliveryStaff = await sequelize.query(query, {
        replacements: phuongXa ? { 
          phuongXa: phuongXa,
          phuongXaPattern: `%${phuongXa}%`
        } : {},
        type: sequelize.QueryTypes.SELECT
      });
      
      if (deliveryStaff.length === 0) {
        throw new Error(`Không tìm thấy nhân viên giao hàng khả dụng`);
      }

      return deliveryStaff[0];
    } catch (error) {
      console.error('Lỗi khi tìm nhân viên giao hàng tối ưu:', error);
      throw error;
    }
  },

  // Lấy danh sách nhân viên giao hàng khả dụng cho một khu vực
  getAvailableDeliveryStaff: async (diaChi) => {
    try {
      const phuongXa = NhanVienService.extractPhuongXa(diaChi);
      console.log(`Địa chỉ giao hàng: ${diaChi}`);
      console.log(`Phường/xã được xác định: ${phuongXa}`);
      
      // Query để lấy tất cả nhân viên giao hàng, có ưu tiên khu vực nếu tìm thấy
      let query = `
        SELECT 
          nv.MaNV,
          nv.TenNV,
          nv.DiaChi,
          COUNT(CASE WHEN dh.MaTTDH IN (2, 3) THEN 1 END) as SoDonDangGiao,
          GROUP_CONCAT(DISTINCT kv.TenKhuVuc ORDER BY kv.TenKhuVuc ASC SEPARATOR ', ') as KhuVucPhuTrach,
          CASE 
            WHEN :phuongXa IS NOT NULL AND :phuongXa != '' AND EXISTS (
              SELECT 1 FROM NhanVien_KhuVuc nvkv2 
              INNER JOIN KhuVuc kv2 ON nvkv2.MaKhuVuc = kv2.MaKhuVuc 
              WHERE nvkv2.MaNV = nv.MaNV 
                AND nvkv2.TrangThai = 1 
                AND (
                  kv2.TenKhuVuc = :phuongXa OR
                  kv2.TenKhuVuc LIKE :phuongXaPattern OR 
                  LOWER(REPLACE(REPLACE(REPLACE(kv2.TenKhuVuc, ' ', ''), 'ư', 'u'), 'đ', 'd')) = 
                  LOWER(REPLACE(REPLACE(REPLACE(:phuongXa, ' ', ''), 'ư', 'u'), 'đ', 'd')) OR
                  CONCAT('phường ', LOWER(kv2.TenKhuVuc)) = LOWER(:phuongXa) OR
                  LOWER(kv2.TenKhuVuc) = LOWER(REPLACE(:phuongXa, 'phường ', ''))
                )
            ) THEN 'PHUTRACH' 
            ELSE 'KHAC' 
          END as LoaiPhuTrach
        FROM NhanVien nv
        INNER JOIN NhanVien_BoPhan nvbp ON nv.MaNV = nvbp.MaNV 
        LEFT JOIN NhanVien_KhuVuc nvkv ON nv.MaNV = nvkv.MaNV AND nvkv.TrangThai = 1
        LEFT JOIN KhuVuc kv ON nvkv.MaKhuVuc = kv.MaKhuVuc
        LEFT JOIN DonDatHang dh ON nv.MaNV = dh.MaNV_Giao 
        WHERE nvbp.MaBoPhan = 11 
          AND nvbp.TrangThai = 'DANGLAMVIEC'
        GROUP BY nv.MaNV, nv.TenNV, nv.DiaChi
        ORDER BY `;

      // Thêm điều kiện sắp xếp ưu tiên nếu có phường/xã
      if (phuongXa) {
        query += `
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM NhanVien_KhuVuc nvkv3 
              INNER JOIN KhuVuc kv3 ON nvkv3.MaKhuVuc = kv3.MaKhuVuc 
              WHERE nvkv3.MaNV = nv.MaNV 
                AND nvkv3.TrangThai = 1 
                AND (
                  kv3.TenKhuVuc = :phuongXa OR
                  kv3.TenKhuVuc LIKE :phuongXaPattern OR
                  LOWER(REPLACE(REPLACE(REPLACE(kv3.TenKhuVuc, ' ', ''), 'ư', 'u'), 'đ', 'd')) = 
                  LOWER(REPLACE(REPLACE(REPLACE(:phuongXa, ' ', ''), 'ư', 'u'), 'đ', 'd')) OR
                  CONCAT('phường ', LOWER(kv3.TenKhuVuc)) = LOWER(:phuongXa) OR
                  LOWER(kv3.TenKhuVuc) = LOWER(REPLACE(:phuongXa, 'phường ', ''))
                )
            ) THEN 0 
            ELSE 1 
          END,`;
      }
      
      query += `
          SoDonDangGiao ASC, 
          nv.TenNV ASC
      `;

      const deliveryStaffList = await sequelize.query(query, {
        replacements: { 
          phuongXa: phuongXa || null,
          phuongXaPattern: phuongXa ? `%${phuongXa}%` : null
        },
        type: sequelize.QueryTypes.SELECT
      });

      console.log(`Tìm thấy ${deliveryStaffList.length} nhân viên giao hàng`);
      
      // Log thêm thông tin để debug
      if (phuongXa) {
        const priorityStaff = deliveryStaffList.filter(staff => staff.LoaiPhuTrach === 'PHUTRACH');
        console.log(`Có ${priorityStaff.length} nhân viên phụ trách khu vực ${phuongXa}`);
        
        // Log chi tiết nhân viên phụ trách
        if (priorityStaff.length > 0) {
          console.log('Nhân viên phụ trách:', priorityStaff.map(s => `${s.TenNV} (${s.KhuVucPhuTrach || 'Không có khu vực'})`));
        } else {
          console.log('Kiểm tra tất cả khu vực của nhân viên:');
          deliveryStaffList.forEach(staff => {
            console.log(`- ${staff.TenNV}: "${staff.KhuVucPhuTrach || 'Không có khu vực'}" vs "${phuongXa}"`);
            
            if (staff.KhuVucPhuTrach) {
              const khuVucList = staff.KhuVucPhuTrach.split(', ');
              khuVucList.forEach(khuVuc => {
                const khuVucNormalized = khuVuc.toLowerCase().replace(/\s+/g, '').replace(/ư/g, 'u').replace(/đ/g, 'd');
                const phuongXaNormalized = phuongXa.toLowerCase().replace(/\s+/g, '').replace(/ư/g, 'u').replace(/đ/g, 'd');
                const withoutPhuong = phuongXa.toLowerCase().replace(/^phường\s+/i, '');
                
                console.log(`  - Khu vực "${khuVuc}":`);
                console.log(`    + Exact: ${khuVuc === phuongXa}`);
                console.log(`    + Pattern: ${khuVuc.includes(phuongXa)}`);
                console.log(`    + Normalized: "${khuVucNormalized}" = "${phuongXaNormalized}" -> ${khuVucNormalized === phuongXaNormalized}`);
                console.log(`    + Without prefix: "${khuVuc.toLowerCase()}" = "${withoutPhuong}" -> ${khuVuc.toLowerCase() === withoutPhuong}`);
              });
            }
          });
        }
      }

      return deliveryStaffList;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên giao hàng:', error);
      throw error;
    }
  },

  // Lấy thống kê công việc của nhân viên giao hàng
  getDeliveryStaffWorkload: async (MaNV = null) => {
    try {
      let whereClause = '';
      let replacements = {};
      
      if (MaNV) {
        whereClause = 'AND nv.MaNV = :MaNV';
        replacements.MaNV = MaNV;
      }
      
      const workloadStats = await sequelize.query(`
        SELECT 
          nv.MaNV,
          nv.TenNV,
          GROUP_CONCAT(DISTINCT kv.TenKhuVuc ORDER BY kv.TenKhuVuc ASC SEPARATOR ', ') as KhuVucPhuTrach,
          COUNT(CASE WHEN dh.MaTTDH = 3 THEN 1 END) as DonDaPhanCong,
          COUNT(CASE WHEN dh.MaTTDH = 4 THEN 1 END) as DonDangGiao,
          COUNT(CASE WHEN dh.MaTTDH = 5 AND DATE(dh.ThoiGianGiao) = CURDATE() THEN 1 END) as DonDaGiaoHomNay,
          COUNT(CASE WHEN dh.MaTTDH IN (3, 4) THEN 1 END) as TongDonDangXuLy
        FROM nhanvien nv
        INNER JOIN nhanvien_bophan nvbp ON nv.MaNV = nvbp.MaNV 
        LEFT JOIN NhanVien_KhuVuc nvkv ON nv.MaNV = nvkv.MaNV AND nvkv.TrangThai = 1
        LEFT JOIN KhuVuc kv ON nvkv.MaKhuVuc = kv.MaKhuVuc
        LEFT JOIN dondathang dh ON nv.MaNV = dh.MaNV_Giao 
        WHERE nvbp.MaBoPhan = 11 
          AND nvbp.TrangThai = 'DANGLAMVIEC'
          ${whereClause}
        GROUP BY nv.MaNV, nv.TenNV
        ORDER BY TongDonDangXuLy ASC, nv.TenNV ASC
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      return MaNV ? (workloadStats[0] || null) : workloadStats;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê công việc nhân viên giao hàng:', error);
      throw error;
    }
  },

  // Phân công đơn hàng cho nhân viên giao hàng
  assignOrderToDeliveryStaff: async (MaDDH, MaNV, GhiChu = null) => {
    const t = await sequelize.transaction();
    try {
      // Import model DonDatHang nếu cần (giả sử đã có)
      const { DonDatHang } = require('../models');
      
      // Cập nhật đơn hàng
      await DonDatHang.update({
        MaNV_Giao: MaNV,
        MaTTDH: 3, // Trạng thái "Đã phân công"
        ThoiGianGiao: new Date()
      }, {
        where: { MaDDH: MaDDH },
        transaction: t
      });
      
      await t.commit();
      
      // Lấy thông tin đơn hàng đã cập nhật
      const updatedOrder = await DonDatHang.findByPk(MaDDH);
      
      // Lấy thông tin nhân viên giao hàng
      const nhanVien = await NhanVien.findByPk(MaNV, {
        attributes: ['MaNV', 'TenNV', 'KhuVuc']
      });
      
      return {
        MaDDH: MaDDH,
        MaNV: MaNV,
        MaTTDH: 3,
        NgayPhanCong: new Date(),
        GhiChu: GhiChu,
        NhanVien: nhanVien
      };
    } catch (error) {
      await t.rollback();
      console.error('Lỗi khi phân công đơn hàng:', error);
      throw error;
    }
  },

};

module.exports = NhanVienService;