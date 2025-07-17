module.exports = {
  success: (res, data, message = 'Thành công', status = 200) => {
    return res.status(status).json({ success: true, message, data });
  },
  error: (res, error, message = 'Có lỗi xảy ra', status = 500) => {
    console.log(error);
    return res.status(status).json({ success: false, message, error });
  },
  notFound: (res, message = 'Không tìm thấy', status = 404) => {
    return res.status(status).json({ success: false, message });
  },
  validationError: (res, errors, message = 'Dữ liệu không hợp lệ', status = 400) => {
    return res.status(status).json({ success: false, message, errors });
  },
};
