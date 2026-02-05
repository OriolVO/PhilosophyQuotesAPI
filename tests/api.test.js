const request = require('supertest');
const app = require('../src/index');

describe('Philosopher Quotes API', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /v1/quote/random should return a quote', async () => {
    const res = await request(app).get('/v1/quote/random');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('content');
    expect(res.body).toHaveProperty('author');
  });

  it('GET /v1/quote/random should filter by author', async () => {
    const res = await request(app).get('/v1/quote/random?author=Socrates');
    expect(res.statusCode).toEqual(200);
    expect(res.body.author).toEqual('Socrates');
  });

  it('GET /v1/quote/random should return 404 for unknown author', async () => {
    const res = await request(app).get('/v1/quote/random?author=UnknownPhilosopher123');
    expect(res.statusCode).toEqual(404);
  });

  it('GET /v1/authors should return list of authors', async () => {
    const res = await request(app).get('/v1/authors');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /v1/fields should return list of fields', async () => {
    const res = await request(app).get('/v1/fields');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
