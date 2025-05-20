const multer = require("multer");

// Storage
const storage = multer.diskStorage({
    destination:function(_, _, cb) {
        return cb(null, "./public/temp");
    },
    filename:function(_, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter
const fileFilter = (request, file, cb) => {
    if(!file.mimetype.startsWith("image/")) return cb(new Error("Invalid image format", false));
    return cb(null, true);
}

// Limit 
const limits = { fileSize: 1024 * 1024 * 5 }; // 5MB

// Initialize multer
const upload = multer({ storage, fileFilter, limits });

module.exports = upload;