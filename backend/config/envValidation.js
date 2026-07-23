const logger = require('../services/logger/logger');

const validateEnv = () => {
  const requiredEnv = [
    { key: 'MONGO_URI', description: 'MongoDB connection URI' },
    { key: 'JWT_SECRET', description: 'JWT signing secret' },
    { key: 'AI_PROVIDER', description: 'AI Provider configuration' },
    { key: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary Cloud Name' },
    { key: 'CLOUDINARY_API_KEY', description: 'Cloudinary API Key' },
    { key: 'CLOUDINARY_API_SECRET', description: 'Cloudinary API Secret' },
  ];

  const missing = [];

  for (const item of requiredEnv) {
    if (!process.env[item.key] || process.env[item.key].trim() === '') {
      missing.push(`${item.key} (${item.description})`);
    }
  }

  if (missing.length > 0) {
    logger.error({ missing }, '❌ Startup Failed: Missing required environment variables.');
    if (process.env.NODE_ENV !== 'test') {
      console.error('❌ Startup Error: The following required environment variables are missing:');
      missing.forEach((m) => console.error(`   - ${m}`));
      process.exit(1);
    }
  } else {
    logger.info('✅ Environment variable validation passed.');
  }
};

module.exports = validateEnv;
