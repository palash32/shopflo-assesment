import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Compile a JSON Schema and return a validator function.
 * Throws an error with full details if the schema itself is invalid.
 */
export function compileSchema<T>(schema: object): ValidateFunction<T> {
  return ajv.compile<T>(schema);
}

/**
 * Validate data against a compiled validator.
 * Returns an object with { valid, errors } so tests can assert cleanly.
 */
export function validateSchema<T>(
  validate: ValidateFunction<T>,
  data: unknown,
): { valid: boolean; errors: string } {
  const valid = validate(data);
  const errors = valid
    ? ''
    : ajv.errorsText(validate.errors, { separator: '\n  ' });
  return { valid, errors };
}

// ─── Exported schemas ─────────────────────────────────────────────────────────

export const CART_SCHEMA = {
  type: 'object',
  required: ['id', 'userId', 'date', 'products', '__v'],
  properties: {
    id:       { type: 'integer' },
    userId:   { type: 'integer' },
    date:     { type: 'string' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'integer' },
          quantity:  { type: 'integer' },
        },
      },
    },
    __v: { type: 'integer' },
  },
} as const;

/** Schema returned from POST /carts (created cart — no __v in response) */
export const CART_CREATE_SCHEMA = {
  type: 'object',
  required: ['id', 'userId', 'date', 'products'],
  properties: {
    id:       { type: 'integer' },
    userId:   { type: 'integer' },
    date:     { type: 'string'  },
    products: {
      type: 'array',
      items: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'integer' },
          quantity:  { type: 'integer' },
        },
      },
    },
  },
} as const;

export const PRODUCT_SCHEMA = {
  type: 'object',
  required: ['id', 'title', 'price', 'description', 'category', 'image', 'rating'],
  properties: {
    id:          { type: 'integer' },
    title:       { type: 'string'  },
    price:       { type: 'number'  },
    description: { type: 'string'  },
    category:    { type: 'string'  },
    image:       { type: 'string'  },
    rating: {
      type: 'object',
      required: ['rate', 'count'],
      properties: {
        rate:  { type: 'number'  },
        count: { type: 'integer' },
      },
    },
  },
} as const;

export const AUTH_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 10 },
  },
} as const;
