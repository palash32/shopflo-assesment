import { test, expect } from '@playwright/test';
import { CART_PAYLOADS } from '../../utils/api-helpers';
import {
  compileSchema, validateSchema,
  CART_SCHEMA, CART_CREATE_SCHEMA,
} from '../../utils/schema-validator';

const validateCartGet = compileSchema(CART_SCHEMA);
const validateCartCreate = compileSchema(CART_CREATE_SCHEMA);

test.describe('Cart CRUD – Positive', () => {

  test('@positive GET /carts – returns array of carts with status 200', async ({ request }) => {
    const res = await request.get('/carts');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('@positive GET /carts – each cart conforms to cart schema', async ({ request }) => {
    const res = await request.get('/carts');
    const body = await res.json();

    for (const cart of body) {
      const { valid, errors } = validateSchema(validateCartGet, cart);
      expect(valid, `Cart id=${cart.id} schema errors:\n  ${errors}`).toBe(true);
    }
  });

  test('@positive GET /carts/:id – returns single cart by ID', async ({ request }) => {
    const res = await request.get('/carts/1');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.id).toBe(1);
    expect(typeof body.userId).toBe('number');
  });

  test('@positive GET /carts/:id – single cart has products array', async ({ request }) => {
    const res = await request.get('/carts/1');
    const body = await res.json();

    expect(Array.isArray(body.products)).toBe(true);
    body.products.forEach((p: { productId: number; quantity: number }) => {
      expect(typeof p.productId).toBe('number');
      expect(typeof p.quantity).toBe('number');
    });
  });

  test('@positive GET /carts?limit=3 – returns at most 3 carts', async ({ request }) => {
    const res = await request.get('/carts?limit=3');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.length).toBeLessThanOrEqual(3);
  });

  test('@positive GET /carts – date range filter returns carts', async ({ request }) => {
    const res = await request.get('/carts?startdate=2019-01-01&enddate=2020-12-31');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('@positive GET /carts/user/:userId – returns carts for a specific user', async ({ request }) => {
    const res = await request.get('/carts/user/1');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    body.forEach((cart: { userId: number }) => {
      expect(cart.userId).toBe(1);
    });
  });

  test('@positive POST /carts – creates a cart and returns it with an ID', async ({ request }) => {
    const res = await request.post('/carts', { data: CART_PAYLOADS.VALID });
    const body = await res.json();

    expect([200, 201]).toContain(res.status());
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);
  });

  test('@positive POST /carts – response includes sent products', async ({ request }) => {
    const res = await request.post('/carts', { data: CART_PAYLOADS.VALID });
    const body = await res.json();

    expect([200, 201]).toContain(res.status());
    expect(body.products).toBeDefined();
    const { valid, errors } = validateSchema(validateCartCreate, body);
    expect(valid, `Schema errors:\n  ${errors}`).toBe(true);
  });

  test('@positive POST /carts – date field preserved in response', async ({ request }) => {
    const res = await request.post('/carts', { data: CART_PAYLOADS.VALID });
    const body = await res.json();

    expect(body.date).toBe(CART_PAYLOADS.VALID.date);
  });

  test('@positive PUT /carts/:id – full update returns 200', async ({ request }) => {
    const res = await request.put('/carts/1', { data: CART_PAYLOADS.UPDATED });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.id).toBe(1);
  });

  test('@positive PUT /carts/:id – updated products reflected in response', async ({ request }) => {
    const res = await request.put('/carts/1', { data: CART_PAYLOADS.UPDATED });
    const body = await res.json();

    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products[0].productId).toBe(CART_PAYLOADS.UPDATED.products[0].productId);
  });

  test('@positive PATCH /carts/:id – partial update returns 200', async ({ request }) => {
    const res = await request.patch('/carts/1', { data: CART_PAYLOADS.PARTIAL_UPDATE });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.id).toBe(1);
  });

  test('@positive DELETE /carts/:id – returns 200 with deleted cart data', async ({ request }) => {
    const res = await request.delete('/carts/6');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.id).toBe(6);
  });

  test('@positive DELETE /carts/:id – response body is not null', async ({ request }) => {
    const res = await request.delete('/carts/5');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).not.toBeNull();
  });

});
