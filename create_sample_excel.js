const XLSX = require('xlsx');
const path = require('path');

// Tạo dữ liệu mẫu cho danh sách 168 phường/xã TP.HCM
const districtData = [
  ['Phường/Xã'], // Header
  ['Phường Bến Nghé'],
  ['Phường Bến Thành'],
  ['Phường Đa Kao'],
  ['Phường Cô Giang'],
  ['Phường Cầu Kho'],
  ['Phường Cầu Ông Lãnh'],
  ['Phường Nguyễn Cư Trinh'],
  ['Phường Nguyễn Thái Bình'],
  ['Phường Phạm Ngũ Lão'],
  ['Phường Tân Định'],
  ['Thủ Đức'],
  ['Phường Linh Trung'],
  ['Phường Linh Xuân'],
  ['Phường Linh Chiểu'],
  ['Phường Linh Tây'],
  ['Phường Tam Bình'],
  ['Phường Tam Phú'],
  ['Phường Hiệp Bình Chánh'],
  ['Phường Hiệp Bình Phước'],
  ['Phường Thủ Đức'],
  ['Phường Bình Chiểu'],
  ['Phường Bình Thọ'],
  ['Phường Trường Thọ'],
  ['Quận 1'],
  ['Quận 2'],
  ['Quận 3'],
  ['Quận 4'],
  ['Quận 5'],
  ['Quận 6'],
  ['Quận 7'],
  ['Quận 8'],
  ['Quận 9'],
  ['Quận 10'],
  ['Quận 11'],
  ['Quận 12'],
  ['Quận Bình Tân'],
  ['Quận Bình Thạnh'],
  ['Quận Gò Vấp'],
  ['Quận Phú Nhuận'],
  ['Quận Tân Bình'],
  ['Quận Tân Phú'],
  ['Huyện Bình Chánh'],
  ['Huyện Cần Giờ'],
  ['Huyện Củ Chi'],
  ['Huyện Hóc Môn'],
  ['Huyện Nhà Bè']
];

// Tạo workbook và worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(districtData);

// Thêm worksheet vào workbook
XLSX.utils.book_append_sheet(wb, ws, 'Districts');

// Lưu file
const filePath = path.join(__dirname, 'src', 'data', 'district_list.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Đã tạo file Excel mẫu tại: ${filePath}`);
console.log(`File chứa ${districtData.length - 1} phường/xã`);
