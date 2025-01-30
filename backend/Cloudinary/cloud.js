const cloudinary = require("cloudinary").v2;
const CLOUDINARY_CLOUD_NAME = "dcim81ufy";
const CLOUDINARY_API_KEY= 929981291569337;
const CLOUDINARY_API_SECRET = "EDGlfbAeqrtlM-PI8qCG179rmlM" ;
// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME, // Replace with your Cloudinary cloud name
  api_key: CLOUDINARY_API_KEY,       // Replace with your API key
  api_secret: CLOUDINARY_API_SECRET, // Replace with your API secret
});

module.exports = cloudinary;
