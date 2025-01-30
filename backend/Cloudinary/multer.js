const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloud"); // Import the Cloudinary configuration

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "EventHive/Tickets", // Folder name in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // File naming convention
  },
});

const upload = multer({ storage });

module.exports = upload;
