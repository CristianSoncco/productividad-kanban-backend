const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('Authentication Endpoints', () => {
  // Register endpoint test
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'jestuser@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should return an error if user already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'jestuser@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  // Login endpoint test
  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jestuser@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return an error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wronguser@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  // Protected route test
  describe('GET /api/tasks', () => {
    let token;

    // Obtain a valid token before running the tests
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jestuser@example.com', password: 'password123' });

      token = res.body.token;
    });

    it('should return tasks for an authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return an error if no token is provided', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token, authorization denied');
    });

    it('should return an error if the token is invalid', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });
  });
});
