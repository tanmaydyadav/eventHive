const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Replace with your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,       // Replace with your API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Replace with your API secret
});

module.exports = cloudinary;
