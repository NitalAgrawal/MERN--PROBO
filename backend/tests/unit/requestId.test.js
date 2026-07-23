/**
 * Unit Tests: RequestId Middleware
 */
const requestId = require('../../middleware/requestId');

const mockRes = () => {
  const headers = {};
  return {
    setHeader: (key, val) => { headers[key] = val; },
    _headers: headers,
  };
};

describe('requestId middleware', () => {
  test('generates a UUID if no x-request-id header present', () => {
    const req = { headers: {}, id: undefined, requestId: undefined };
    const res = mockRes();
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(req.requestId).toBe(req.id);
    expect(res._headers['x-request-id']).toBe(req.id);
    expect(next).toHaveBeenCalled();
  });

  test('uses existing x-request-id header if present', () => {
    const customId = '12345678-1234-1234-1234-123456789012';
    const req = { headers: { 'x-request-id': customId }, id: undefined };
    const res = mockRes();
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.id).toBe(customId);
    expect(res._headers['x-request-id']).toBe(customId);
    expect(next).toHaveBeenCalled();
  });

  test('generates unique IDs for different requests', () => {
    const req1 = { headers: {}, id: undefined };
    const req2 = { headers: {}, id: undefined };
    const res = mockRes();
    const next = jest.fn();

    requestId(req1, res, next);
    requestId(req2, res, next);

    expect(req1.id).not.toBe(req2.id);
  });
});
