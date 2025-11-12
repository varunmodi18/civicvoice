
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|mp4/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, .pdf, and .mp4 files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Single file upload (backward compatibility)
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.originalname });
});

// Multiple file upload (up to 3 files)
router.post('/multiple', protect, upload.array('files', 3), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const files = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));
  
  res.status(201).json({ files });
});

module.exports = router;
