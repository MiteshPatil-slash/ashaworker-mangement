const multer = require('multer');
const path = require('path');

// Files are kept in memory and saved into the database (as base64 data URLs), not on disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and document files (JPG, PNG, WEBP, PDF, DOC) are permitted'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit (MongoDB documents max out at 16 MB)
  fileFilter
});

module.exports = upload;
