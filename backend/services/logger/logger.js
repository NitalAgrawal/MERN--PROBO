const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

/**
 * Helper for logging AI Provider events
 */
logger.logAI = function (level, message, metadata = {}) {
  const logMethod = typeof this[level] === 'function' ? this[level].bind(this) : this.info.bind(this);
  logMethod(
    {
      category: 'AI_PROVIDER',
      ...metadata,
    },
    message
  );
};

/**
 * Helper for logging Export engine events
 */
logger.logExport = function (level, message, metadata = {}) {
  const logMethod = typeof this[level] === 'function' ? this[level].bind(this) : this.info.bind(this);
  logMethod(
    {
      category: 'EXPORT_ENGINE',
      ...metadata,
    },
    message
  );
};

module.exports = logger;
