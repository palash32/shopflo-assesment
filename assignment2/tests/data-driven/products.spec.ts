import { test, expect } from '@playwright/test';
import { compileSchema, validateSchema, PRODUCT_SCHEMA, CART_CREATE_SCHEMA } from '../../utils/schema-validator';

const validateProduct = compileSchema(PRODUCT_SCHEMA);
const validateCartCreate = compileSchema(CART_CREATE_SCHEMA);

const PRODUCT_TEST_DATA: Array<{
  id: number;
  expectedCategory: string;
  minPrice: number;
  maxPrice: number;
}> = [
    { id: 1, expectedCategory: "men's clothing", minPrice: 100, maxPrice: 200 },
    { id: 2, expectedCategory: "men's clothing", minPrice: 20, maxPrice: 30 },
    { id: 3, expectedCategory: "men's clothing", minPrice: 50, maxPrice: 60 },
    { id: 4, expectedCategory: "men's clothing", minPrice: 10, maxPrice: 16 },
    { id: 5, expectedCategory: "jewelery", minPrice: 695, maxPrice: 700 },
  ];

test.describe('Data-Driven – GET /products/:id', () => {

  for (const { id, expectedCategory, minPrice, maxPrice } of PRODUCT_TEST_DATA) {
    test(`@data-driven Product ID ${id} – schema valid, category="${expectedCategory}", price in range`, async ({ request }) => {
      const res = await request.get(`/products/${id}`);
      const body = await res.json();

      expect(res.status()).toBe(200);
      expect(body.id).toBe(id);

      const { valid, errors } = validateSchema(validateProduct, body);
      expect(valid, `Product ${id} schema errors:\n  ${errors}`).toBe(true);

      expect(body.category).toBe(expectedCategory);
      expect(body.price).toBeGreaterThanOrEqual(minPrice);
      expect(body.price).toBeLessThanOrEqual(maxPrice);

      expect(body.title.trim().length).toBeGreaterThan(0);
      expect(body.rating.rate).toBeGreaterThanOrEqual(0);
      expect(body.rating.rate).toBeLessThanOrEqual(5);
      expect(body.image).toMatch(/^https?:\/\//);
    });
  }

});

const CART_PRODUCT_DATA: Array<{
  productId: number;
  quantity: number;
  label: string;
}> = [
    { productId: 1, quantity: 1, label: 'Fjallraven Backpack' },
    { productId: 2, quantity: 3, label: 'Mens Casual T-Shirt' },
    { productId: 3, quantity: 2, label: 'Mens Cotton Jacket' },
    { productId: 4, quantity: 1, label: 'Womens X Large T-Shirt' },
  ];

test.describe('Data-Driven – POST /carts with product IDs', () => {

  for (const { productId, quantity, label } of CART_PRODUCT_DATA) {
    test(`@data-driven Cart with productId=${productId} (${label}) qty=${quantity}`, async ({ request }) => {
      const payload = {
        userId: 5,
        date: '2024-06-01',
        products: [{ productId, quantity }],
      };

      const res = await request.post('/carts', { data: payload });
      const body = await res.json();

      expect([200, 201]).toContain(res.status());
      const { valid, errors } = validateSchema(validateCartCreate, body);
      expect(valid, `Cart schema errors for productId=${productId}:\n  ${errors}`).toBe(true);

      expect(body.id).toBeGreaterThan(0);

      const inResponse = body.products.some(
        (p: { productId: number; quantity: number }) =>
          p.productId === productId && p.quantity === quantity
      );
      expect(inResponse, `productId ${productId} qty ${quantity} not found in response`).toBe(true);

      expect(body.date).toBe(payload.date);
    });
  }

});

const MULTI_PRODUCT_CARTS = [
  {
    label: 'Two electronics',
    products: [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 2 }],
  },
  {
    label: 'Jewellery + clothing',
    products: [{ productId: 5, quantity: 1 }, { productId: 3, quantity: 1 }],
  },
  {
    label: 'Three different items',
    products: [
      { productId: 1, quantity: 1 },
      { productId: 6, quantity: 2 },
      { productId: 7, quantity: 3 },
    ],
  },
];

test.describe('Data-Driven – POST /carts multi-product builds', () => {

  for (const { label, products } of MULTI_PRODUCT_CARTS) {
    test(`@data-driven Cart: "${label}" – all products in response`, async ({ request }) => {
      const res = await request.post('/carts', {
        data: { userId: 3, date: '2024-06-15', products },
      });
      const body = await res.json();

      expect([200, 201]).toContain(res.status());
      expect(body.id).toBeGreaterThan(0);

      for (const expected of products) {
        const found = body.products.some(
          (p: { productId: number; quantity: number }) =>
            p.productId === expected.productId && p.quantity === expected.quantity
        );
        expect(
          found,
          `productId=${expected.productId} qty=${expected.quantity} missing in "${label}"`
        ).toBe(true);
      }
    });
  }

});
