const request = require('supertest');
const express = require('express');
const app = express();

// Import the routes from server.js
require('../src/server')(app);

describe('GET /api/tasks', () => {
  it('responds with json containing a list of tasks', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('completed');
  });
});