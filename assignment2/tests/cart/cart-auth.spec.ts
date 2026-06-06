import { test, expect } from '@playwright/test';
import { AUTH_CREDENTIALS, getAuthToken } from '../../utils/api-helpers';
import { compileSchema, validateSchema, AUTH_RESPONSE_SCHEMA } from '../../utils/schema-validator';

const validateAuthResponse = compileSchema(AUTH_RESPONSE_SCHEMA);

test.describe('Authentication – /auth/login', () => {

  test('@positive POST /auth/login – valid credentials return 200', async ({ request }) => {
    const res = await request.post('/auth/login', {
      data: AUTH_CREDENTIALS.VALID,
    });
    expect(res.ok()).toBe(true);
  });

  test('@positive POST /auth/login – response contains a token string', async ({ request }) => {
    const res = await request.post('/auth/login', { data: AUTH_CREDENTIALS.VALID });
    const body = await res.json();

    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(10);
  });

  test('@positive POST /auth/login – response conforms to auth schema', async ({ request }) => {
    const res = await request.post('/auth/login', { data: AUTH_CREDENTIALS.VALID });
    const body = await res.json();

    const { valid, errors } = validateSchema(validateAuthResponse, body);
    expect(valid, `Auth schema errors:\n  ${errors}`).toBe(true);
  });

  test('@positive POST /auth/login – token is a valid JWT (3-part structure)', async ({ request }) => {
    const token = await getAuthToken(request);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
    parts.forEach(part => expect(part.length).toBeGreaterThan(0));
  });

  test('@positive GET /carts with Bearer token – request accepted (200)', async ({ request }) => {
    const token = await getAuthToken(request);

    const res = await request.get('/carts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test('@positive GET /products with Bearer token – request accepted (200)', async ({ request }) => {
    const token = await getAuthToken(request);

    const res = await request.get('/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('@positive POST /carts with Bearer token – cart created successfully', async ({ request }) => {
    const token = await getAuthToken(request);

    const res = await request.post('/carts', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        userId: 5,
        date: '2024-06-01',
        products: [{ productId: 3, quantity: 2 }],
      },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBeDefined();
  });

  test('@negative POST /auth/login – wrong password returns 401', async ({ request }) => {
    const res = await request.post('/auth/login', {
      data: AUTH_CREDENTIALS.INVALID,
    });
    expect([401, 403]).toContain(res.status());
  });

  test('@negative POST /auth/login – wrong credentials response has no token', async ({ request }) => {
    const res = await request.post('/auth/login', { data: AUTH_CREDENTIALS.INVALID });
    const body = await res.text();
    expect(body).not.toContain('"token"');
  });

  test('@negative POST /auth/login – empty body returns non-200', async ({ request }) => {
    const res = await request.post('/auth/login', { data: {} });
    expect(res.status()).not.toBe(200);
  });

  test('@negative GET /carts with invalid Bearer token – returns 200 or 401', async ({ request }) => {
    const res = await request.get('/carts', {
      headers: { Authorization: 'Bearer this.is.invalid' },
    });
    expect([200, 401, 403]).toContain(res.status());
  });

  test('@negative POST /auth/login – missing username field returns non-200', async ({ request }) => {
    const res = await request.post('/auth/login', {
      data: { password: 'secret' },
    });
    expect(res.status()).not.toBe(200);
  });

  test('@negative POST /auth/login – missing password field returns non-200', async ({ request }) => {
    const res = await request.post('/auth/login', {
      data: { username: 'mor_2314' },
    });
    expect(res.status()).not.toBe(200);
  });

});
