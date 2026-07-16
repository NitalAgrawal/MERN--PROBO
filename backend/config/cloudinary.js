const cloudinary = require('cloudinary').v2;

/**
 * Initialize Cloudinary with credentials from environment variables.
 * Avatar upload will be wired up in a later phase.
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
};

module.exports = { configureCloudinary, cloudinary };
