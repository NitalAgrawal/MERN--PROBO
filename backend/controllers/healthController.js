const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const HTTP_STATUS = require('../constants/httpStatus');
const sendResponse = require('../utils/sendResponse');
const metricsService = require('../services/metrics/metricsService');
const cacheService = require('../services/cache/cacheService');

const getMongoStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

const getCloudinaryStatus = async () => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return { status: 'unconfigured' };
    }
    const res = await cloudinary.api.ping();
    return { status: res && res.status === 'ok' ? 'healthy' : 'degraded' };
  } catch (err) {
    return { status: 'unconfigured_or_unreachable', details: err.message };
  }
};

const getAIProviderStatus = () => {
  const provider = process.env.AI_PROVIDER || 'gemini';
  const hasKey = Boolean(
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENROUTER_API_KEY
  );
  return {
    provider,
    status: hasKey ? 'healthy' : 'unconfigured',
  };
};

const getHealth = async (req, res) => {
  const cachedHealth = await cacheService.get('health_status');
  if (cachedHealth) {
    return sendResponse(res, HTTP_STATUS.OK, true, 'StoryNest API health status (cached)', cachedHealth);
  }

  const mongoStatus = getMongoStatus();
  const cloudinaryStatus = await getCloudinaryStatus();
  const aiStatus = getAIProviderStatus();
  const metrics = metricsService.getMetrics();

  const healthData = {
    mongoDB: { status: mongoStatus },
    cloudinary: cloudinaryStatus,
    aiProvider: aiStatus,
    serverUptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    performanceMetrics: metrics,
    timestamp: new Date().toISOString(),
  };

  await cacheService.set('health_status', healthData, 10);

  sendResponse(res, HTTP_STATUS.OK, true, 'StoryNest API health status', healthData);
};

const getReadiness = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      ready: true,
      status: 'Ready for production traffic',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    success: false,
    ready: false,
    status: 'Service Unavailable: Database not connected',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
  getReadiness,
};
