const express = require('express');
const app = express();

app.use(express.json());
// For text/plain test cases in cart-negative.spec.ts
app.use(express.text({ type: 'text/plain' }));

// MOCK DATA
const products = [
  { id: 1, title: 'Fjallraven Backpack', price: 109.95, description: 'desc', category: "men's clothing", image: 'http://example.com/1.jpg', rating: { rate: 3.9, count: 120 } },
  { id: 2, title: 'Mens Casual T-Shirt', price: 22.30, description: 'desc', category: "men's clothing", image: 'http://example.com/2.jpg', rating: { rate: 4.1, count: 259 } },
  { id: 3, title: 'Mens Cotton Jacket', price: 55.99, description: 'desc', category: "men's clothing", image: 'http://example.com/3.jpg', rating: { rate: 4.7, count: 500 } },
  { id: 4, title: 'Womens X Large T-Shirt', price: 15.99, description: 'desc', category: "men's clothing", image: 'http://example.com/4.jpg', rating: { rate: 2.1, count: 430 } },
  { id: 5, title: 'John Hardy Bracelet', price: 695.00, description: 'desc', category: "jewelery", image: 'http://example.com/5.jpg', rating: { rate: 4.6, count: 400 } },
];

const carts = [
  { id: 1, userId: 1, date: '2020-03-02T00:00:00.000Z', products: [{ productId: 1, quantity: 4 }], __v: 0 },
  { id: 2, userId: 1, date: '2020-01-02T00:00:00.000Z', products: [{ productId: 2, quantity: 4 }], __v: 0 },
  { id: 3, userId: 2, date: '2020-03-01T00:00:00.000Z', products: [{ productId: 1, quantity: 2 }], __v: 0 },
];

// ROUTES

// Auth
app.post('/auth/login', (req, res) => {
  if (req.body && req.body.username === 'mor_2314' && req.body.password === '83r5^_') {
    return res.status(200).json({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' });
  }
  return res.status(401).json({ error: 'invalid credentials' });
});

// Products
app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const prod = products.find(p => p.id === id);
  if (prod) return res.json(prod);
  res.status(200).send('null');
});

// Carts
app.get('/carts', (req, res) => {
  let result = carts;
  if (req.query.limit) {
    if (parseInt(req.query.limit) === 0) return res.json([]);
    result = result.slice(0, parseInt(req.query.limit));
  }
  if (req.query.startdate && req.query.enddate) {
    if (req.query.startdate > req.query.enddate) {
      return res.json([]);
    }
  }
  res.json(result);
});

app.get('/carts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 9999) return res.status(200).send('null');
  const cart = carts.find(c => c.id === id) || { id, userId: 1, date: '2020-01-01', products: [], __v: 0 };
  res.json(cart);
});

app.get('/carts/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  res.json(carts.filter(c => c.userId === userId));
});

app.post('/carts', (req, res) => {
  const body = req.body;
  if (typeof body === 'string') {
    return res.status(200).json({ id: 21, products: [], __v: 0 });
  }
  res.status(200).json({
    id: 21,
    userId: body.userId || 1,
    date: body.date || '2024-01-01',
    products: body.products || [],
    __v: 0
  });
});

app.put('/carts/:id', (req, res) => {
  const body = req.body;
  res.status(200).json({
    id: parseInt(req.params.id) || 1,
    userId: body.userId || 1,
    date: body.date || '2024-01-01',
    products: body.products || [],
    __v: 0
  });
});

app.patch('/carts/:id', (req, res) => {
  res.status(200).json({
    id: parseInt(req.params.id) || 1,
    userId: req.body.userId || 1,
    date: req.body.date || '2024-01-01',
    products: req.body.products || [],
    __v: 0
  });
});

app.delete('/carts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 9999) return res.status(200).send('null');
  const cart = carts.find(c => c.id === id) || { id, userId: 1, date: '2020-01-01', products: [], __v: 0 };
  res.status(200).json(cart);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Mock FakeStore API listening at http://localhost:${port}`);
});
