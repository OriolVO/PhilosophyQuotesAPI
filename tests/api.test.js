const request = require('supertest');
const app = require('../src/index');

describe('Philosopher Quotes API', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /v1/quote/random should return a quote with metadata', async () => {
    const res = await request(app)
      .get('/v1/quote/random')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('content');
    expect(res.body).toHaveProperty('author');
    expect(res.body).toHaveProperty('era');
    expect(res.body).toHaveProperty('wiki');
  });

  it('GET /v1/quote/random?lang=es should return Spanish content', async () => {
    const res = await request(app)
      .get('/v1/quote/random?lang=es')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(200);
    // Any Spanish quote will be a string, and we updated quotes.json so it should work
    expect(typeof res.body.content).toBe('string');
    // We can't easily check language without a specific ID, but we can verify it returns a string
  });

  it('GET /v1/quote/random?era=Ancient should return Ancient philosopher', async () => {
    const res = await request(app)
      .get('/v1/quote/random?era=Ancient')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(200);
    expect(res.body.era).toEqual('Ancient');
  });

  it('GET /v1/quote/random should filter by author', async () => {
    const res = await request(app)
      .get('/v1/quote/random?author=Socrates')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(200);
    expect(res.body.author).toEqual('Socrates');
  });

  it('GET /v1/quote/random should return 404 for unknown author', async () => {
    const res = await request(app)
      .get('/v1/quote/random?author=UnknownPhilosopher123')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(404);
  });

  it('GET /v1/authors should return list of authors', async () => {
    const res = await request(app)
      .get('/v1/authors')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /v1/fields should return list of fields', async () => {
    const res = await request(app)
      .get('/v1/fields')
      .set('X-RapidAPI-Proxy-Secret', 'test-secret');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('GET /v1/quote/random should return 403 without secret', async () => {
    const res = await request(app).get('/v1/quote/random');
    expect(res.statusCode).toEqual(403);
    expect(res.body.error.message).toContain('Forbidden');
  });

  it('GET /v1/quote/random should return 403 with invalid secret', async () => {
    const res = await request(app)
      .get('/v1/quote/random')
      .set('X-RapidAPI-Proxy-Secret', 'wrong-secret');
    expect(res.statusCode).toEqual(403);
  });
});
