import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: true,
});
addFormats(ajv);

const SCHEMA_DIR = path.join(__dirname, '../../schemas/snapshot');

function loadContract(filename: string): object {
  const filePath = path.join(SCHEMA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

const cartContractSchema = loadContract('cart-contract-v1.json');
const productContractSchema = loadContract('product-contract-v1.json');

const validateCartContract = ajv.compile(cartContractSchema);
const validateProductContract = ajv.compile(productContractSchema);

function assertContract(
  validate: ReturnType<typeof ajv.compile>,
  data: unknown,
  label: string,
): void {
  const valid = validate(data);
  if (!valid) {
    const msg = ajv.errorsText(validate.errors, {
      separator: '\n  ',
      dataVar: label,
    });
    throw new Error(`CONTRACT VIOLATION – ${label}:\n  ${msg}`);
  }
}

test.describe('Contract – GET /carts/:id (cart-contract-v1)', () => {

  const CART_IDS_TO_VERIFY = [1, 2, 3];

  for (const id of CART_IDS_TO_VERIFY) {
    test(`@contract Cart ID=${id} conforms to cart-contract-v1 schema`, async ({ request }) => {
      const res = await request.get(`/carts/${id}`);
      const body = await res.json();

      expect(res.status()).toBe(200);
      assertContract(validateCartContract, body, `GET /carts/${id}`);
    });
  }

  test('@contract GET /carts – every cart in list conforms to contract', async ({ request }) => {
    const res = await request.get('/carts?limit=5');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    for (const cart of body) {
      assertContract(validateCartContract, cart, `cart id=${cart.id}`);
    }
  });

  test('@contract GET /carts/user/:userId – all carts conform to contract', async ({ request }) => {
    const res = await request.get('/carts/user/1');
    const body = await res.json();

    expect(res.status()).toBe(200);
    for (const cart of body) {
      assertContract(validateCartContract, cart, `user cart id=${cart.id}`);
    }
  });

  test('@contract Cart contract – extra field would break the contract (self-test)', () => {
    const cartWithExtraField = {
      id: 1,
      userId: 1,
      date: '2020-01-01T00:00:00.000Z',
      products: [{ productId: 1, quantity: 1 }],
      __v: 0,
      undocumentedField: 'this should break the contract',
    };

    const isValid = validateCartContract(cartWithExtraField);
    expect(isValid).toBe(false);
    expect(validateCartContract.errors?.some(
      e => e.keyword === 'additionalProperties'
    )).toBe(true);
  });

  test('@contract Cart contract – missing required field breaks contract (self-test)', () => {
    const cartMissingDate = {
      id: 1,
      userId: 1,
      products: [{ productId: 1, quantity: 1 }],
      __v: 0,
    };

    const isValid = validateCartContract(cartMissingDate);
    expect(isValid).toBe(false);
    expect(validateCartContract.errors?.some(
      e => e.keyword === 'required'
    )).toBe(true);
  });

});

test.describe('Contract – GET /products/:id (product-contract-v1)', () => {

  const PRODUCT_IDS_TO_VERIFY = [1, 2, 3, 4, 5];

  for (const id of PRODUCT_IDS_TO_VERIFY) {
    test(`@contract Product ID=${id} conforms to product-contract-v1 schema`, async ({ request }) => {
      const res = await request.get(`/products/${id}`);
      const body = await res.json();

      expect(res.status()).toBe(200);
      assertContract(validateProductContract, body, `GET /products/${id}`);
    });
  }

  test('@contract GET /products – all products in list conform to contract', async ({ request }) => {
    const res = await request.get('/products?limit=10');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    for (const product of body) {
      assertContract(validateProductContract, product, `product id=${product.id}`);
    }
  });

  test('@contract Product rating.rate out of range breaks contract (self-test)', () => {
    const productWithBadRating = {
      id: 1,
      title: 'Test',
      price: 10.0,
      description: 'Test desc',
      category: 'test',
      image: 'https://example.com/img.jpg',
      rating: { rate: 10, count: 100 },
    };

    const isValid = validateProductContract(productWithBadRating);
    expect(isValid).toBe(false);
  });

});

test.describe('Contract – Schema file integrity', () => {

  test('@contract cart-contract-v1.json is parseable and has required top-level fields', () => {
    const schema = cartContractSchema as Record<string, unknown>;
    expect(schema.$schema).toBeDefined();
    expect(schema.$id).toContain('cart-contract-v1');
    expect(schema.type).toBe('object');
    expect(schema.required).toBeDefined();
    expect(Array.isArray(schema.required)).toBe(true);
  });

  test('@contract product-contract-v1.json is parseable and has required top-level fields', () => {
    const schema = productContractSchema as Record<string, unknown>;
    expect(schema.$schema).toBeDefined();
    expect(schema.$id).toContain('product-contract-v1');
    expect(schema.type).toBe('object');
    expect(schema.required).toBeDefined();
  });

});
