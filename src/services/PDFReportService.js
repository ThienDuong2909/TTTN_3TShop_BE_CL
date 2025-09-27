const PDFDocument = require('pdfkit');
const fs = require('fs-extra');

class PDFReportService {
  constructor() {
    this.pageMargin = 50;
    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.currentY = 0;
    this.vietnameseFont = null;
    this.vietnameseFontBold = null;
    this.footerReserve = 50; // mặc định chỉ dành cho số trang
    this.tableTopOffset = 25; // khoảng cách từ top margin tới header bảng ở các trang tiếp theo
  }

  /**
   * Khởi tạo font tiếng Việt
   */
  initializeVietnameseFont(doc) {
    try {
      // Tìm font hệ thống hỗ trợ tiếng Việt
      const possibleFontPaths = [
        // Windows fonts
        'C:/Windows/Fonts/arial.ttf',
        'C:/Windows/Fonts/times.ttf',
        'C:/Windows/Fonts/calibri.ttf',
        // Linux fonts  
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        // macOS fonts
        '/System/Library/Fonts/Arial.ttf'
      ];

      const possibleBoldFontPaths = [
        // Windows bold fonts
        'C:/Windows/Fonts/arialbd.ttf',
        'C:/Windows/Fonts/timesbd.ttf',
        'C:/Windows/Fonts/calibrib.ttf',
        // Linux bold fonts
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        // macOS bold fonts
        '/System/Library/Fonts/Arial Bold.ttf'
      ];

      // Đăng ký font thường
      for (const fontPath of possibleFontPaths) {
        if (fs.existsSync(fontPath)) {
          console.log(`Đã tìm thấy font: ${fontPath}`);
          doc.registerFont('VietnameseFont', fontPath);
          this.vietnameseFont = 'VietnameseFont';
          break;
        }
      }

      // Đăng ký font đậm
      for (const boldFontPath of possibleBoldFontPaths) {
        if (fs.existsSync(boldFontPath)) {
          console.log(`Đã tìm thấy font đậm: ${boldFontPath}`);
          doc.registerFont('VietnameseFontBold', boldFontPath);
          this.vietnameseFontBold = 'VietnameseFontBold';
          break;
        }
      }

      if (this.vietnameseFont || this.vietnameseFontBold) {
        return true;
      }

      console.log('Không tìm thấy font hệ thống, sử dụng font mặc định');
      return false;
    } catch (error) {
      console.error('Lỗi khi khởi tạo font:', error);
      return false;
    }
  }

  /**
   * Làm sạch text tiếng Việt cho PDF
   */
  sanitizeVietnameseText(text) {
    if (!text) return '';
    
    // Chuyển đổi một số ký tự đặc biệt nếu cần
    return text.toString()
      .replace(/â/g, 'â')
      .replace(/ă/g, 'ă')
      .replace(/ê/g, 'ê')
      .replace(/ô/g, 'ô')
      .replace(/ơ/g, 'ơ')
      .replace(/ư/g, 'ư');
  }

  /**
   * Tạo báo cáo PDF tồn kho
   * @param {Object} data - Dữ liệu báo cáo
   * @param {string} ngayBaoCao - Ngày báo cáo
   * @param {string} nguoiLap - Tên người lập báo cáo
   * @returns {Promise<Buffer>} Buffer của file PDF
   */
  async createInventoryReportPDF(data, ngayBaoCao, nguoiLap = '') {
    return new Promise((resolve, reject) => {
      try {
        this.footerReserve = nguoiLap ? 140 : 50; // dành chỗ trước để không phải tách chữ ký
        const doc = new PDFDocument({ size: 'A4', margin: this.pageMargin, bufferPages: true, info: { Title: `Báo cáo tồn kho ngày ${ngayBaoCao}`, Author: nguoiLap || 'Hệ thống 3TShop', Subject: 'Báo cáo tồn kho', Creator: '3TShop System' } });
        this.initializeVietnameseFont(doc);
        const buffers = []; doc.on('data', buffers.push.bind(buffers)); doc.on('end', () => resolve(Buffer.concat(buffers)));
        const groupedData = this.groupDataByCategory(data);
        this.createHeader(doc, ngayBaoCao);
        this.createTableHeader(doc);
        this.createTableContent(doc, groupedData);
        if (nguoiLap) this.createFooter(doc, nguoiLap); // đặt chữ ký ngay dưới phần Tổng trị giá
        this.addPageNumbersAfterGeneration(doc);
        doc.end();
      } catch (error) { reject(error); }
    });
  }

  /**
   * Nhóm dữ liệu theo loại sản phẩm
   */
  groupDataByCategory(data) {
    const grouped = {};
    
    data.forEach((item, index) => {
      const category = item.loaiSanPham || 'Không xác định';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        ...item,
        stt: index + 1
      });
    });

    return grouped;
  }

  /**
   * Tạo header cho báo cáo
   */
  createHeader(doc, ngayBaoCao) {
    // Sử dụng font tiếng Việt nếu có
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }

    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    // Thông tin công ty
    doc.fontSize(12)
       .text(this.sanitizeVietnameseText('Cửa hàng 3TShop'), this.pageMargin, this.pageMargin)
       .text(this.sanitizeVietnameseText('97, Man Thiện, phường Tăng Nhơn Phú, TP. HCM'), this.pageMargin, this.pageMargin + 15)
       .text('043 8822209', this.pageMargin, this.pageMargin + 30);

    // 1. Ngày lập báo cáo
    doc.fontSize(12);
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }
    doc.text(this.sanitizeVietnameseText(`Ngày lập báo cáo: ${currentDate}`), 0, this.pageMargin + 60, {
         width: this.pageWidth,
         align: 'center'
       });

    // 2. Tiêu đề báo cáo
    doc.fontSize(18);
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }
    doc.text(this.sanitizeVietnameseText('BÁO CÁO TỒN KHO'), 0, this.pageMargin + 85, {
         width: this.pageWidth,
         align: 'center'
       });

    // 3. Ngày báo cáo (tính đến ngày)
    const formattedDate = this.formatDate(ngayBaoCao);
    doc.fontSize(12);
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }
    doc.text(this.sanitizeVietnameseText(`Tính đến ngày: ${formattedDate}`), 0, this.pageMargin + 115, {
         width: this.pageWidth,
         align: 'center'
       });

    // Giảm khoảng trống đầu trang: dùng vị trí hiện tại của doc.y
    this.currentY = doc.y + 35; // thay vì cố định 150
  }

  /**
   * Tạo header cho bảng
   */
  createTableHeader(doc) {
    const headers = ['STT', 'Mã sản phẩm', 'Tên sản phẩm', 'SL Tồn', 'Đơn giá nhập', 'Trị giá'];
    const columnWidths = [40, 75, 200, 65, 85, 105]; // Mở rộng cột "Trị giá" để chứa số tiền lớn
    const startX = (this.pageWidth - 570) / 2; // Căn giữa trang hoàn toàn

    // Vẽ background cho header
    doc.rect(startX, this.currentY, 570, 25)
       .fillAndStroke('#f0f0f0', '#000000');

    // Vẽ đường kẻ dọc ngăn cách các cột header
    let columnX = startX;
    for (let i = 0; i < columnWidths.length; i++) {
      columnX += columnWidths[i];
      if (i < columnWidths.length - 1) { // Không vẽ đường cuối cùng
        doc.moveTo(columnX, this.currentY)
           .lineTo(columnX, this.currentY + 25)
           .stroke('#000000');
      }
    }

    // Vẽ text header
    doc.fillColor('black')
       .fontSize(10);
    
    // Sử dụng font tiếng Việt nếu có
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }

    let currentX = startX + 5;
    headers.forEach((header, index) => {
      doc.text(this.sanitizeVietnameseText(header), currentX, this.currentY + 7, {
        width: columnWidths[index] - 10,
        align: 'center'
      });
      currentX += columnWidths[index];
    });

    this.currentY += 30;
  }

  /**
   * Tạo nội dung bảng
   */
  createTableContent(doc, groupedData) {
    const columnWidths = [40, 75, 200, 65, 85, 105];
    const startX = (this.pageWidth - 570) / 2;
    const footerReserve = this.footerReserve; // dùng biến động
    let globalSTT = 1, totalValue = 0;
    Object.keys(groupedData).forEach(category => {
      if (this.currentY > this.pageHeight - footerReserve - 70) { // 70px cho header category
        this.addNewPage(doc, true); // true => inventory
      }
      doc.fontSize(11).fillColor('black'); if (this.vietnameseFont) doc.font(this.vietnameseFont);
      doc.text(this.sanitizeVietnameseText(category), startX, this.currentY + 5);
      this.currentY += 25;
      groupedData[category].forEach(item => {
        if (this.currentY > this.pageHeight - footerReserve - 40) { // 40px tối thiểu dòng
          this.addNewPage(doc, true);
        }
        this.createTableRow(doc, { stt: globalSTT, maSanPham: item.maSanPham, tenSanPham: item.tenSanPham, soLuongTon: item.soLuongTon, giaNhap: item.giaNhap, triGia: item.giaTriTonKho }, startX, columnWidths);
        globalSTT++;
      });
      const categoryTotal = groupedData[category].reduce((sum, item) => sum + item.giaTriTonKho, 0);
      totalValue += categoryTotal;
      doc.fontSize(10); if (this.vietnameseFont) doc.font(this.vietnameseFont);
      if (this.currentY > this.pageHeight - footerReserve - 40) { this.addNewPage(doc, true); }
      doc.text(this.sanitizeVietnameseText('Tổng trị giá'), startX + 360, this.currentY + 5);
      if (this.vietnameseFontBold) doc.font(this.vietnameseFontBold);
      doc.fontSize(8).text(this.formatCurrency(categoryTotal), startX + 465, this.currentY + 5, { width: 100, align: 'center', ellipsis: true });
      if (this.vietnameseFont) doc.font(this.vietnameseFont);
      this.currentY += 30;
    });
    this.currentY += 10;
    if (this.currentY > this.pageHeight - footerReserve - 35) { this.addNewPage(doc, true); }
    const startX2 = startX;
    doc.rect(startX2, this.currentY, 570, 25).fillAndStroke('#e6e6e6', '#FFFFFF');
    doc.fontSize(12); if (this.vietnameseFont) doc.font(this.vietnameseFont);
    doc.fillColor('black').fontSize(11).text(this.sanitizeVietnameseText('TỔNG TRỊ GIÁ'), startX2 + 5, this.currentY + 7, { width: 400, align: 'right' });
    if (this.vietnameseFontBold) doc.font(this.vietnameseFontBold);
    doc.fontSize(9).text(this.formatCurrency(totalValue), startX2 + 465, this.currentY + 7, { width: 100, align: 'center', ellipsis: true });
    if (this.vietnameseFont) doc.font(this.vietnameseFont);
    this.currentY += 35;
  }

  /**
   * Tạo một dòng trong bảng
   */
  createTableRow(doc, rowData, startX, columnWidths) {
    // Tính toán độ cao dòng dựa trên tên sản phẩm
    const tenSanPham = this.sanitizeVietnameseText(rowData.tenSanPham);
    const maxWidth = columnWidths[2] - 10; // Width của cột tên sản phẩm
    
    // Ước tính số dòng cần thiết cho tên sản phẩm
    const estimatedLines = Math.ceil(tenSanPham.length / (maxWidth / 6)); // Ước tính 6 pixel per character
    const minRowHeight = 20;
    const rowHeight = Math.max(minRowHeight, estimatedLines * 12 + 8); // 12px per line + padding
    
    // Vẽ border cho dòng với chiều cao động
    doc.rect(startX, this.currentY, 570, rowHeight)
       .stroke('#cccccc');

    // Vẽ đường kẻ dọc ngăn cách các cột
    let columnX = startX;
    for (let i = 0; i < columnWidths.length; i++) {
      columnX += columnWidths[i];
      if (i < columnWidths.length - 1) { // Không vẽ đường cuối cùng
        doc.moveTo(columnX, this.currentY)
           .lineTo(columnX, this.currentY + rowHeight)
           .stroke('#cccccc');
      }
    }

    doc.fontSize(9)
       .fillColor('black');
    
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }

    let currentX = startX + 5;
    const values = [
      rowData.stt.toString(),
      rowData.maSanPham,
      rowData.tenSanPham,
      rowData.soLuongTon.toString(),
      this.formatCurrency(rowData.giaNhap),
      this.formatCurrency(rowData.triGia)
    ];

    values.forEach((value, index) => {
      const align = index === 2 ? 'left' : 'center'; // Tên sản phẩm align left
      const sanitizedValue = this.sanitizeVietnameseText(value);
      
      // Đối với tên sản phẩm, cho phép text wrap và không dùng ellipsis
      const textOptions = {
        width: columnWidths[index] - 10,
        align: align
      };
      
      if (index !== 2) {
        // Các cột khác vẫn giữ ellipsis và center vertically
        textOptions.ellipsis = true;
        // Giảm font size cho cột tiền tệ để tránh xuống hàng
        if (index === 4 || index === 5) {
          doc.fontSize(8);
        }
        doc.text(sanitizedValue, currentX, this.currentY + (rowHeight - 12) / 2, textOptions);
        // Reset font size về 9
        if (index === 4 || index === 5) {
          doc.fontSize(9);
        }
      } else {
        // Cột tên sản phẩm cho phép wrap và align top
        doc.text(sanitizedValue, currentX, this.currentY + 5, textOptions);
      }
      
      currentX += columnWidths[index];
    });

    this.currentY += rowHeight;
  }

  /**
   * Tạo footer với thông tin người lập
   */
  createFooter(doc, nguoiLap) {
    if (!nguoiLap) return;
    const blockHeight = 90;
    let startY = this.currentY + 10; // ngay dưới tổng
    // Nếu (do tính toán) không đủ chỗ vì lỗi dự phòng -> xuống trang mới nhưng sẽ rất hiếm
    if (startY + blockHeight > this.pageHeight - this.pageMargin - 30) {
      // Trước khi add page, cố gắng đưa lùi lại 1 chút nếu còn khoảng trắng phía trên >40
      if (startY - 40 > this.pageMargin) {
        startY = startY - 40;
      } else {
        doc.addPage();
        startY = this.pageMargin + this.tableTopOffset; // trang mới (trường hợp bất khả kháng)
      }
    }
    this.currentY = startY;
    doc.fontSize(10);
    if (this.vietnameseFont) doc.font(this.vietnameseFont);
    const x = doc.page.width - this.pageMargin - 180;
    doc.text(this.sanitizeVietnameseText('Người lập phiếu'), x, this.currentY, { width: 180, align: 'center' });
    doc.text(this.sanitizeVietnameseText('(Ký và ghi rõ họ tên)'), x, this.currentY + 15, { width: 180, align: 'center' });
    doc.text(this.sanitizeVietnameseText(nguoiLap), x, this.currentY + 65, { width: 180, align: 'center' });
    this.currentY += blockHeight;
  }

  /**
   * Thêm trang mới với số trang
   */
  addNewPage(doc, isInventory = false) {
    doc.addPage();
    this.currentY = this.pageMargin + this.tableTopOffset; // giảm khoảng trắng đầu trang mới
    if (isInventory) { this.createTableHeader(doc); }
  }

  /**
   * Tạo báo cáo PDF lợi nhuận sản phẩm
   * @param {Object} data - Dữ liệu báo cáo lợi nhuận
   * @param {string} ngayBatDau - Ngày bắt đầu
   * @param {string} ngayKetThuc - Ngày kết thúc
   * @param {string} nguoiLap - Tên người lập báo cáo
   * @returns {Promise<Buffer>} Buffer của file PDF
   */
  async createProfitReportPDF(data, ngayBatDau, ngayKetThuc, nguoiLap = '') {
    return new Promise((resolve, reject) => {
      try {
        this.footerReserve = nguoiLap ? 140 : 50; // dành chỗ trước để giữ tổng + chữ ký cùng trang
        const doc = new PDFDocument({ size: 'A4', margin: this.pageMargin, bufferPages: true, info: { Title: `Báo cáo lợi nhuận sản phẩm từ ${ngayBatDau} đến ${ngayKetThuc}`, Author: nguoiLap || 'Hệ thống 3TShop', Subject: 'Báo cáo lợi nhuận sản phẩm', Creator: '3TShop System' } });
        this.initializeVietnameseFont(doc);
        const buffers = []; doc.on('data', buffers.push.bind(buffers)); doc.on('end', () => resolve(Buffer.concat(buffers)));
        const groupedData = this.groupDataByCategory(data);
        this.createProfitReportHeader(doc, ngayBatDau, ngayKetThuc);
        this.createProfitTableHeader(doc);
        this.createProfitTableContent(doc, groupedData);
        if (nguoiLap) this.createFooter(doc, nguoiLap);
        this.addPageNumbersAfterGeneration(doc);
        doc.end();
      } catch (error) { reject(error); }
    });
  }

  /**
   * Tạo header cho báo cáo lợi nhuận
   */
  createProfitReportHeader(doc, ngayBatDau, ngayKetThuc) {
    // Sử dụng font tiếng Việt nếu có
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }

    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    // Thông tin công ty
    doc.fontSize(12)
       .text(this.sanitizeVietnameseText('Cửa hàng 3TShop'), this.pageMargin, this.pageMargin)
       .text(this.sanitizeVietnameseText('97, Man Thiện, phường Tăng Nhơn Phú, TP. HCM'), this.pageMargin, this.pageMargin + 15)
       .text('043 8822209', this.pageMargin, this.pageMargin + 30);

    // 1. Ngày lập báo cáo
    doc.fontSize(12);
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }
    doc.text(this.sanitizeVietnameseText(`Ngày lập báo cáo: ${currentDate}`), 0, this.pageMargin + 60, {
         width: this.pageWidth,
         align: 'center'
       });

    // 2. Tiêu đề báo cáo
    doc.fontSize(18);
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }
    doc.text(this.sanitizeVietnameseText('BÁO CÁO LỢI NHUẬN SẢN PHẨM'), 0, this.pageMargin + 85, {
         width: this.pageWidth,
         align: 'center'
       });

    // 3. Khoảng thời gian báo cáo
    const formattedStartDate = this.formatDate(ngayBatDau);
    const formattedEndDate = this.formatDate(ngayKetThuc);
    doc.fontSize(12);
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }
    doc.text(this.sanitizeVietnameseText(`Từ ngày: ${formattedStartDate} đến ngày: ${formattedEndDate}`), 0, this.pageMargin + 115, {
         width: this.pageWidth,
         align: 'center'
       });

    this.currentY = doc.y + 35; // giảm khoảng trắng đầu trang
  }

  /**
   * Tạo header cho bảng lợi nhuận
   */
  createProfitTableHeader(doc) {
    const headers = ['STT', 'Mã SP', 'Tên sản phẩm', 'Trị giá nhập', 'Trị giá xuất', 'Lợi nhuận', '% LN'];
    const columnWidths = [35, 60, 180, 80, 80, 80, 55]; // Tổng = 570
    const startX = (this.pageWidth - 570) / 2;

    // Vẽ background cho header
    doc.rect(startX, this.currentY, 570, 25)
       .fillAndStroke('#f0f0f0', '#000000');

    // Vẽ đường kẻ dọc ngăn cách các cột header
    let columnX = startX;
    for (let i = 0; i < columnWidths.length; i++) {
      columnX += columnWidths[i];
      if (i < columnWidths.length - 1) {
        doc.moveTo(columnX, this.currentY)
           .lineTo(columnX, this.currentY + 25)
           .stroke('#000000');
      }
    }

    // Vẽ text header
    doc.fillColor('black')
       .fontSize(9);
    
    if (this.vietnameseFont) {
      doc.font(this.vietnameseFont);
    }

    let currentX = startX + 5;
    headers.forEach((header, index) => {
      doc.text(this.sanitizeVietnameseText(header), currentX, this.currentY + 8, {
        width: columnWidths[index] - 10,
        align: 'center'
      });
      currentX += columnWidths[index];
    });

    this.currentY += 30;
  }

  /**
   * Tạo nội dung bảng lợi nhuận
   */
  createProfitTableContent(doc, groupedData) {
    const columnWidths = [35, 60, 180, 80, 80, 80, 55];
    const startX = (this.pageWidth - 570) / 2; const footerReserve = this.footerReserve;
    let globalSTT = 1, totalImportValue = 0, totalExportValue = 0, totalProfit = 0;
    Object.keys(groupedData).forEach(category => {
      if (this.currentY > this.pageHeight - footerReserve - 70) { this.addNewProfitPage(doc, true); }
      doc.fontSize(11).fillColor('black'); if (this.vietnameseFont) doc.font(this.vietnameseFont);
      doc.text(this.sanitizeVietnameseText(category), startX, this.currentY + 5);
      this.currentY += 25;
      groupedData[category].forEach(item => {
        // Tính trước chiều cao dòng để kiểm tra phân trang
        const rowHeight = this.computeProfitRowHeight(item.tenSanPham, columnWidths[2]);
        if (this.currentY + rowHeight > this.pageHeight - footerReserve - 25) { // 25px buffer an toàn
          this.addNewProfitPage(doc, true);
        }
        this.createProfitTableRow(doc, { stt: globalSTT, maSanPham: item.maSanPham, tenSanPham: item.tenSanPham, tongTriGiaNhap: item.tongTriGiaNhap, tongTriGiaXuat: item.tongTriGiaXuat, loiNhuan: item.loiNhuan, phanTramLoiNhuan: item.phanTramLoiNhuan }, startX, columnWidths, rowHeight);
        globalSTT++;
      });
      const categoryImportTotal = groupedData[category].reduce((s, i) => s + i.tongTriGiaNhap, 0);
      const categoryExportTotal = groupedData[category].reduce((s, i) => s + i.tongTriGiaXuat, 0);
      const categoryProfitTotal = groupedData[category].reduce((s, i) => s + i.loiNhuan, 0);
      totalImportValue += categoryImportTotal; totalExportValue += categoryExportTotal; totalProfit += categoryProfitTotal;
      if (this.currentY > this.pageHeight - footerReserve - 40) { this.addNewProfitPage(doc, true); }
      // Hàng tổng nhóm
      doc.fontSize(10); if (this.vietnameseFont) doc.font(this.vietnameseFont);
      doc.text(this.sanitizeVietnameseText('Tổng:'), startX + columnWidths[0] + columnWidths[1] + 20, this.currentY + 5); // trong vùng cột tên sản phẩm
      // Giá trị tổng cho từng cột tiền tệ (nhập, xuất, lợi nhuận)
      if (this.vietnameseFontBold) doc.font(this.vietnameseFontBold);
      doc.fontSize(8)
        .text(this.formatCurrency(categoryImportTotal), startX + columnWidths[0] + columnWidths[1] + columnWidths[2], this.currentY + 5, { width: columnWidths[3], align: 'center', ellipsis: true })
        .text(this.formatCurrency(categoryExportTotal), startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], this.currentY + 5, { width: columnWidths[4], align: 'center', ellipsis: true })
        .text(this.formatCurrency(categoryProfitTotal), startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4], this.currentY + 5, { width: columnWidths[5], align: 'center', ellipsis: true });
      if (this.vietnameseFont) doc.font(this.vietnameseFont);
      this.currentY += 30;
    });
    this.currentY += 10;
    if (this.currentY > this.pageHeight - footerReserve - 35) { this.addNewProfitPage(doc, true); }
    doc.rect(startX, this.currentY, 570, 25).fillAndStroke('#e6e6e6', '#FFFFFF');
    const separatorX = startX + 450; doc.moveTo(separatorX, this.currentY).lineTo(separatorX, this.currentY + 25).stroke('#000000');
    doc.fontSize(12); if (this.vietnameseFont) doc.font(this.vietnameseFont);
    doc.fillColor('black').fontSize(11).text(this.sanitizeVietnameseText('TỔNG LỢI NHUẬN:'), startX + 5, this.currentY + 7, { width: 400, align: 'right' });
    if (this.vietnameseFontBold) doc.font(this.vietnameseFontBold);
    doc.fontSize(9).text(this.formatCurrency(totalProfit), startX + 465, this.currentY + 7, { width: 100, align: 'center', ellipsis: true });
    if (this.vietnameseFont) doc.font(this.vietnameseFont);
    this.currentY += 35;
  }

  /**
   * Tính chiều cao dòng cho bảng lợi nhuận dựa trên tên sản phẩm
   */
  computeProfitRowHeight(tenSanPham, nameColWidth) {
    const maxWidth = nameColWidth - 6; // trừ padding nhỏ
    const sanitized = this.sanitizeVietnameseText(tenSanPham || '');
    // Ước lượng số ký tự trên một dòng ~ (maxWidth / 6) tương tự phần tồn kho
    const estimatedLines = Math.ceil(sanitized.length / (maxWidth / 6)) || 1;
    const minRowHeight = 20;
    return Math.max(minRowHeight, estimatedLines * 12 + 8); // 12px mỗi dòng + padding
  }

  /**
   * Tạo một dòng trong bảng lợi nhuận
   */
  createProfitTableRow(doc, rowData, startX, columnWidths, rowHeightOverride = null) {
    const nameColWidth = columnWidths[2];
    const rowHeight = rowHeightOverride || this.computeProfitRowHeight(rowData.tenSanPham, nameColWidth);
    doc.rect(startX, this.currentY, 570, rowHeight).stroke('#cccccc');
    let columnX = startX;
    for (let i = 0; i < columnWidths.length; i++) {
      columnX += columnWidths[i];
      if (i < columnWidths.length - 1) {
        doc.moveTo(columnX, this.currentY).lineTo(columnX, this.currentY + rowHeight).stroke('#cccccc');
      }
    }
    doc.fontSize(8).fillColor('black');
    if (this.vietnameseFont) { doc.font(this.vietnameseFont); }
    let currentX = startX + 3;
    const values = [
      rowData.stt.toString(),
      rowData.maSanPham,
      rowData.tenSanPham,
      this.formatCurrency(rowData.tongTriGiaNhap),
      this.formatCurrency(rowData.tongTriGiaXuat),
      this.formatCurrency(rowData.loiNhuan),
      rowData.phanTramLoiNhuan.toFixed(1) + '%'
    ];
    values.forEach((value, index) => {
      const align = index === 2 ? 'left' : 'center';
      const sanitizedValue = this.sanitizeVietnameseText(value);
      const textOptions = { width: columnWidths[index] - 6, align, ellipsis: index === 2 ? false : true };
      const yPos = index === 2 ? this.currentY + 5 : this.currentY + (rowHeight - 12) / 2;
      doc.text(sanitizedValue, currentX, yPos, textOptions);
      currentX += columnWidths[index];
    });
    this.currentY += rowHeight;
  }

  /**
   * Thêm trang mới cho báo cáo lợi nhuận với số trang
   */
  addNewProfitPage(doc) {
    doc.addPage();
    this.currentY = this.pageMargin + this.tableTopOffset;
    this.createProfitTableHeader(doc);
  }
  /**
   * Thêm số trang sau khi tạo PDF
   */
  addPageNumbersAfterGeneration(doc) {
    try {
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        const y = doc.page.height - doc.page.margins.bottom - 15;
        const x = doc.page.margins.left;
        const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        doc.fontSize(10)
          .fillColor('#666666')
          .text(`Trang ${i + 1} / ${range.count}`,
                x,
                y,
                { width, align: 'center' });
      }
    } catch (e) {
      console.error('Không thể thêm số trang sau khi tạo PDF:', e);
    }
  }

  /**
   * Format ngày tháng
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Format tiền tệ VND
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

}

module.exports = PDFReportService;
