/**
 * Unit Tests: MetricsService
 */
const metricsService = require('../../services/metrics/metricsService');

describe('MetricsService', () => {
  beforeEach(() => {
    metricsService.aiGenDurations = [];
    metricsService.uploadDurations = [];
    metricsService.exportDurations = [];
    metricsService.responseTimes = [];
  });

  test('records AI generation duration', () => {
    metricsService.recordAIGeneration(3200);
    const m = metricsService.getMetrics();
    expect(m.aiGeneration.lastDurationMs).toBe(3200);
    expect(m.aiGeneration.count).toBe(1);
  });

  test('records upload duration', () => {
    metricsService.recordUpload(450);
    const m = metricsService.getMetrics();
    expect(m.uploads.lastDurationMs).toBe(450);
    expect(m.uploads.count).toBe(1);
  });

  test('records export duration', () => {
    metricsService.recordExport(1500);
    const m = metricsService.getMetrics();
    expect(m.exports.lastDurationMs).toBe(1500);
    expect(m.exports.count).toBe(1);
  });

  test('records HTTP response time', () => {
    metricsService.recordResponseTime(25);
    const m = metricsService.getMetrics();
    expect(m.httpResponse.lastDurationMs).toBe(25);
  });

  test('calculates average correctly', () => {
    metricsService.recordAIGeneration(1000);
    metricsService.recordAIGeneration(3000);
    const m = metricsService.getMetrics();
    expect(m.aiGeneration.avgDurationMs).toBe(2000);
  });

  test('returns zero averages when no data', () => {
    const m = metricsService.getMetrics();
    expect(m.aiGeneration.avgDurationMs).toBe(0);
    expect(m.uploads.avgDurationMs).toBe(0);
  });

  test('caps history at maxHistory limit', () => {
    for (let i = 0; i < 110; i++) {
      metricsService.recordAIGeneration(100);
    }
    expect(metricsService.aiGenDurations.length).toBe(100);
  });

  test('ignores NaN values', () => {
    metricsService.recordAIGeneration(NaN);
    const m = metricsService.getMetrics();
    expect(m.aiGeneration.count).toBe(0);
  });
});
