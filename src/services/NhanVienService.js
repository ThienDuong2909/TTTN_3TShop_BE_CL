const { NhanVien, TaiKhoan, VaiTro, BoPhan, NhanVien_BoPhan, sequelize } = require('../models');
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
        }
      ]
    });
  },
  
  create: async (data) => {
    const t = await sequelize.transaction();
    try {
      const { Email, Password, TenNV, NgaySinh, DiaChi, Luong, KhuVuc, departments } = data;
      // Kiểm tra trùng email
      const existed = await TaiKhoan.findOne({ where: { Email } });
      if (existed) {
        throw { message: 'Email đã tồn tại', code: 'EMAIL_EXISTS' };
      }
      // Tạo tài khoản
      const hashedPassword = await bcrypt.hash(Password, 10);
      
      // Xác định vai trò dựa trên KhuVuc
      let maVaiTro = 2; // Mặc định là NhanVienCuaHang
      if (KhuVuc) {
        maVaiTro = 3; // NhanVienGiaoHang nếu có KhuVuc
      }
      
      const taiKhoan = await TaiKhoan.create({
        Email,
        Password: hashedPassword,
        MaVaiTro: maVaiTro,
      }, { transaction: t });
      // Tạo nhân viên với KhuVuc nếu có
      const nhanVienData = {
        TenNV,
        NgaySinh,
        DiaChi,
        Luong,
        MaTK: taiKhoan.MaTK,
      };
      
      // Thêm KhuVuc nếu có (dành cho nhân viên giao hàng)
      if (KhuVuc) {
        nhanVienData.KhuVuc = KhuVuc;
        console.log(`Tạo nhân viên giao hàng với khu vực: ${KhuVuc}`);
      }
      
      const nhanVien = await NhanVien.create(nhanVienData, { transaction: t });
      
      // Nếu có danh sách bộ phận, tạo bản ghi trung gian
      if (departments && Array.isArray(departments)) {
        for (const dep of departments) {
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
      // Trả về nhân viên vừa tạo kèm tài khoản và bộ phận
      return await NhanVien.findByPk(nhanVien.MaNV, {
        include: [
          { model: TaiKhoan, include: [{ model: VaiTro }] },
          { model: NhanVien_BoPhan, include: [{ model: BoPhan }] }
        ]
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  
  update: async (id, data) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;

    // Nếu có Email mới, cập nhật vào TaiKhoan
    if (data.Email) {
      // Kiểm tra trùng email với tài khoản khác
      const existed = await TaiKhoan.findOne({ where: { Email: data.Email, MaTK: { [Op.ne]: nhanVien.MaTK } } });
      if (existed) {
        throw { message: 'Email đã tồn tại', code: 'EMAIL_EXISTS' };
      }
      await TaiKhoan.update(
        { Email: data.Email },
        { where: { MaTK: nhanVien.MaTK } }
      );
    }

    // Cập nhật các trường khác của nhân viên
    const updateData = { ...data };
    delete updateData.Email; // Không update Email vào bảng NhanVien
    await nhanVien.update(updateData);

    // Trả về nhân viên đã cập nhật (kèm tài khoản)
    return await NhanVien.findByPk(id, {
      include: [
        { model: TaiKhoan, include: [{ model: VaiTro }] },
        { model: NhanVien_BoPhan, include: [{ model: BoPhan }] }
      ]
    });
  },
  
  delete: async (id) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;
    await nhanVien.destroy();
    return nhanVien;
  },

  chuyenBoPhan: async (MaNV, { MaBoPhanMoi, NgayChuyen, ChucVu, GhiChu, KhuVuc }) => {
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
      
      // 4. Nếu chuyển sang bộ phận giao hàng (mã 11) và có KhuVuc, cập nhật vào bảng NhanVien
      if (MaBoPhanMoi == 11 && KhuVuc) {
        await NhanVien.update(
          { KhuVuc: KhuVuc },
          { 
            where: { MaNV },
            transaction: t 
          }
        );
        console.log(`Cập nhật khu vực '${KhuVuc}' cho nhân viên ${MaNV}`);
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
      
      // Nếu không tìm thấy phường/xã cụ thể, tìm tất cả nhân viên giao hàng
      const whereClause = phuongXa ? 
        "AND (nv.KhuVuc LIKE :phuongXa OR nv.KhuVuc IS NULL)" : 
        "";
      
      // Query tìm nhân viên giao hàng phụ trách khu vực và đếm số đơn đang giao
      const deliveryStaff = await sequelize.query(`
        SELECT 
          nv.MaNV,
          nv.TenNV,
          nv.KhuVuc,
          nv.DiaChi,
          COUNT(CASE WHEN dh.MaTTDH IN (3, 4) THEN 1 END) as SoDonDangGiao
        FROM nhanvien nv
        INNER JOIN nhanvien_bophan nvbp ON nv.MaNV = nvbp.MaNV 
        LEFT JOIN dondathang dh ON nv.MaNV = dh.MaNV_Giao 
        WHERE nvbp.MaBoPhan = 11 
          AND nvbp.TrangThai = 'DANGLAMVIEC'
          ${whereClause}
        GROUP BY nv.MaNV, nv.TenNV, nv.KhuVuc, nv.DiaChi
        ORDER BY 
          ${phuongXa ? "CASE WHEN nv.KhuVuc LIKE :phuongXa THEN 0 ELSE 1 END," : ""}
          SoDonDangGiao ASC, 
          nv.MaNV ASC
        LIMIT 1
      `, {
        replacements: phuongXa ? { phuongXa: `%${phuongXa}%` } : {},
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
          nv.KhuVuc,
          nv.DiaChi,
          COUNT(CASE WHEN dh.MaTTDH IN (2, 3) THEN 1 END) as SoDonDangGiao,
          CASE 
            WHEN :phuongXa IS NOT NULL AND :phuongXa != '' AND (
              nv.KhuVuc = :phuongXa OR
              nv.KhuVuc LIKE :phuongXaPattern OR 
              LOWER(REPLACE(REPLACE(REPLACE(nv.KhuVuc, ' ', ''), 'ư', 'u'), 'đ', 'd')) = 
              LOWER(REPLACE(REPLACE(REPLACE(:phuongXa, ' ', ''), 'ư', 'u'), 'đ', 'd')) OR
              CONCAT('phường ', LOWER(nv.KhuVuc)) = LOWER(:phuongXa) OR
              LOWER(nv.KhuVuc) = LOWER(REPLACE(:phuongXa, 'phường ', ''))
            ) THEN 'PHUTRACH' 
            ELSE 'KHAC' 
          END as LoaiPhuTrach
        FROM NhanVien nv
        INNER JOIN NhanVien_BoPhan nvbp ON nv.MaNV = nvbp.MaNV 
        LEFT JOIN DonDatHang dh ON nv.MaNV = dh.MaNV_Giao 
        WHERE nvbp.MaBoPhan = 11 
          AND nvbp.TrangThai = 'DANGLAMVIEC'
        GROUP BY nv.MaNV, nv.TenNV, nv.KhuVuc, nv.DiaChi
        ORDER BY `;

      // Thêm điều kiện sắp xếp ưu tiên nếu có phường/xã
      if (phuongXa) {
        query += `
          CASE 
            WHEN nv.KhuVuc = :phuongXa OR
                 nv.KhuVuc LIKE :phuongXaPattern OR
                 LOWER(REPLACE(REPLACE(REPLACE(nv.KhuVuc, ' ', ''), 'ư', 'u'), 'đ', 'd')) = 
                 LOWER(REPLACE(REPLACE(REPLACE(:phuongXa, ' ', ''), 'ư', 'u'), 'đ', 'd')) OR
                 CONCAT('phường ', LOWER(nv.KhuVuc)) = LOWER(:phuongXa) OR
                 LOWER(nv.KhuVuc) = LOWER(REPLACE(:phuongXa, 'phường ', ''))
            THEN 0 
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
          console.log('Nhân viên phụ trách:', priorityStaff.map(s => `${s.TenNV} (${s.KhuVuc})`));
        } else {
          console.log('Kiểm tra tất cả KhuVuc của nhân viên:');
          deliveryStaffList.forEach(staff => {
            console.log(`- ${staff.TenNV}: "${staff.KhuVuc}" vs "${phuongXa}"`);
            // Thêm kiểm tra từng điều kiện
            const khuVucNormalized = staff.KhuVuc.toLowerCase().replace(/\s+/g, '').replace(/ư/g, 'u').replace(/đ/g, 'd');
            const phuongXaNormalized = phuongXa.toLowerCase().replace(/\s+/g, '').replace(/ư/g, 'u').replace(/đ/g, 'd');
            const withoutPhuong = phuongXa.toLowerCase().replace(/^phường\s+/i, '');
            
            console.log(`  - Exact: ${staff.KhuVuc === phuongXa}`);
            console.log(`  - Pattern: ${staff.KhuVuc.includes(phuongXa)}`);
            console.log(`  - Normalized: "${khuVucNormalized}" = "${phuongXaNormalized}" -> ${khuVucNormalized === phuongXaNormalized}`);
            console.log(`  - Without prefix: "${staff.KhuVuc.toLowerCase()}" = "${withoutPhuong}" -> ${staff.KhuVuc.toLowerCase() === withoutPhuong}`);
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
          nv.KhuVuc,
          COUNT(CASE WHEN dh.MaTTDH = 3 THEN 1 END) as DonDaPhanCong,
          COUNT(CASE WHEN dh.MaTTDH = 4 THEN 1 END) as DonDangGiao,
          COUNT(CASE WHEN dh.MaTTDH = 5 AND DATE(dh.ThoiGianGiao) = CURDATE() THEN 1 END) as DonDaGiaoHomNay,
          COUNT(CASE WHEN dh.MaTTDH IN (3, 4) THEN 1 END) as TongDonDangXuLy
        FROM nhanvien nv
        INNER JOIN nhanvien_bophan nvbp ON nv.MaNV = nvbp.MaNV 
        LEFT JOIN dondathang dh ON nv.MaNV = dh.MaNV_Giao 
        WHERE nvbp.MaBoPhan = 11 
          AND nvbp.TrangThai = 'DANGLAMVIEC'
          ${whereClause}
        GROUP BY nv.MaNV, nv.TenNV, nv.KhuVuc
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