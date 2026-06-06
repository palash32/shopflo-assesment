import { APIRequestContext } from '@playwright/test';

export const BASE_URL = 'https://fakestoreapi.com';

// ─── Valid FakeStore test credentials ──────────────────────────────────────────
export const AUTH_CREDENTIALS = {
  VALID:   { username: 'mor_2314',  password: '83r5^_' },
  INVALID: { username: 'ghost',     password: 'wrong'  },
};

// ─── Sample cart payloads ──────────────────────────────────────────────────────
export const CART_PAYLOADS = {
  VALID: {
    userId: 5,
    date:   '2024-01-15',
    products: [
      { productId: 5, quantity: 1 },
      { productId: 1, quantity: 5 },
    ],
  },
  UPDATED: {
    userId: 5,
    date: '2024-02-01',
    products: [
      { productId: 2, quantity: 3 },
    ],
  },
  PARTIAL_UPDATE: {
    products: [
      { productId: 3, quantity: 2 },
    ],
  },
  MISSING_PRODUCTS: {
    userId: 5,
    date: '2024-01-15',
    // products field intentionally omitted
  },
};

// ─── Auth helper ───────────────────────────────────────────────────────────────
export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth/login', {
    data: AUTH_CREDENTIALS.VALID,
  });
  const body = await res.json();
  return body.token as string;
}

// ─── Type helpers ──────────────────────────────────────────────────────────────
export interface CartProduct {
  productId: number;
  quantity: number;
}

export interface Cart {
  id?:       number;
  userId:    number;
  date:      string;
  products:  CartProduct[];
  __v?:      number;
}

export interface Product {
  id:          number;
  title:       string;
  price:       number;
  description: string;
  category:    string;
  image:       string;
  rating: {
    rate:  number;
    count: number;
  };
}
