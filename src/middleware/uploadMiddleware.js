const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilterImage = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images are allowed'));
};

const fileFilterDocument = (req, file, cb) => {
  const filetypes = /xlsx|xls|csv/;
  // Mime types for excel can be tricky, relying on extension is safer for now or adding specific mimes
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Only Excel files are allowed'));
};

const uploadImage = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilterImage
});

const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilterDocument
});

module.exports = { upload: uploadImage, uploadDocument }; // Exporting 'upload' as default image uploader for backward compatibility if needed, but better to be explicit.
// Wait, previous code exported 'upload' directly. I should maintain compatibility.
module.exports = uploadImage;
module.exports.uploadImage = uploadImage;
module.exports.uploadDocument = uploadDocument;
