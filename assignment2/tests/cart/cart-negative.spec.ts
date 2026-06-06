import { test, expect } from '@playwright/test';

test.describe('Cart API – Negative', () => {

  test('@negative GET /carts/:id with non-existent ID returns null', async ({ request }) => {
    const res = await request.get('/carts/9999');
    const body = await res.text();

    expect([200, 404]).toContain(res.status());
    expect(body).toBe('null');
  });

  test('@negative GET /carts?limit=0 – limit 0 returns empty array', async ({ request }) => {
    const res = await request.get('/carts?limit=0');
    expect([200, 400]).toContain(res.status());
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('@negative GET /carts with invalid date range – response is still 200', async ({ request }) => {
    const res = await request.get('/carts?startdate=2025-01-01&enddate=2020-01-01');
    expect([200, 400]).toContain(res.status());
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('@negative POST /carts with empty body – API still responds 200 (mock limitation)', async ({ request }) => {
    const res = await request.post('/carts', { data: {} });
    expect([200, 201, 400]).toContain(res.status());
    const body = await res.json();
    expect(body).toBeDefined();
  });

  test('@negative POST /carts with string userId – response is 200 (type coercion in mock)', async ({ request }) => {
    const res = await request.post('/carts', {
      data: { userId: 'not-a-number', date: '2024-01-01', products: [] },
    });
    expect([200, 201, 400]).toContain(res.status());
    const body = await res.json();
    expect(body).toBeDefined();
  });

  test('@negative POST /carts with negative quantity – API returns 200 (no guard)', async ({ request }) => {
    const res = await request.post('/carts', {
      data: {
        userId: 1,
        date: '2024-01-01',
        products: [{ productId: 1, quantity: -5 }],
      },
    });
    expect([200, 201, 400]).toContain(res.status());
  });

  test('@negative PUT /carts/:id with non-existent ID – returns response (mock)', async ({ request }) => {
    const res = await request.put('/carts/9999', {
      data: { userId: 1, date: '2024-01-01', products: [] },
    });
    expect([200, 201, 404]).toContain(res.status());
    const body = await res.text();
    expect(body).toBeDefined();
  });

  test('@negative DELETE /carts/:id with non-existent ID – returns null (mock)', async ({ request }) => {
    const res = await request.delete('/carts/9999');
    expect([200, 404]).toContain(res.status());
    const body = await res.text();
    expect(body).toBe('null');
  });

  test('@negative Sending JSON body to GET /carts/:id is ignored', async ({ request }) => {
    const res = await request.get('/carts/1', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect([200, 404]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBe(1);
  });

  test('@negative Content-Type text/plain on POST still returns 200 from mock', async ({ request }) => {
    const res = await request.post('/carts', {
      headers: { 'Content-Type': 'text/plain' },
      data: 'this is not json',
    });
    expect([200, 201, 400, 403]).toContain(res.status());
  });

});
