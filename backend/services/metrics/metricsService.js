class MetricsService {
  constructor() {
    this.aiGenDurations = [];
    this.uploadDurations = [];
    this.exportDurations = [];
    this.responseTimes = [];
    this.maxHistory = 100;
  }

  recordAIGeneration(durationMs) {
    this._pushMetric(this.aiGenDurations, durationMs);
  }

  recordUpload(durationMs) {
    this._pushMetric(this.uploadDurations, durationMs);
  }

  recordExport(durationMs) {
    this._pushMetric(this.exportDurations, durationMs);
  }

  recordResponseTime(durationMs) {
    this._pushMetric(this.responseTimes, durationMs);
  }

  _pushMetric(array, val) {
    if (typeof val === 'number' && !isNaN(val)) {
      array.push(val);
      if (array.length > this.maxHistory) {
        array.shift();
      }
    }
  }

  _calculateAvg(array) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / array.length) * 100) / 100;
  }

  getMetrics() {
    return {
      aiGeneration: {
        lastDurationMs: this.aiGenDurations[this.aiGenDurations.length - 1] || 0,
        avgDurationMs: this._calculateAvg(this.aiGenDurations),
        count: this.aiGenDurations.length,
      },
      uploads: {
        lastDurationMs: this.uploadDurations[this.uploadDurations.length - 1] || 0,
        avgDurationMs: this._calculateAvg(this.uploadDurations),
        count: this.uploadDurations.length,
      },
      exports: {
        lastDurationMs: this.exportDurations[this.exportDurations.length - 1] || 0,
        avgDurationMs: this._calculateAvg(this.exportDurations),
        count: this.exportDurations.length,
      },
      httpResponse: {
        lastDurationMs: this.responseTimes[this.responseTimes.length - 1] || 0,
        avgResponseTimeMs: this._calculateAvg(this.responseTimes),
        count: this.responseTimes.length,
      },
    };
  }
}

module.exports = new MetricsService();
