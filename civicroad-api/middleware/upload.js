const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDirectory = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname) || "";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image uploads are allowed.");
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
});

module.exports = upload;
