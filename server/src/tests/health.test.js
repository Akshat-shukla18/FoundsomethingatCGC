const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Health Endpoints', () => {
  it('should return live status', async () => {
    const res = await request(app).get('/health/live');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should return ready status based on db connection', async () => {
    // If not connected, should return 503
    if (mongoose.connection.readyState !== 1) {
      const res = await request(app).get('/health/ready');
      expect(res.statusCode).toBe(503);
      expect(res.body.status).toBe('unavailable');
    }
  });
});

