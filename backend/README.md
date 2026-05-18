# YJ Watches Backend

This backend powers the YJ Watches timepiece storefront with MongoDB, JWT authentication, and a cart API.

## Quick Start

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI`, `JWT_SECRET`, and optionally `PORT`.
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Seed the database:
   ```bash
   npm run seed
   ```
5. Start the API server:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/yjwatches
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
```

`CORS_ORIGIN` is optional and can be set to a comma-separated list of allowed front-end origins. If omitted, the backend uses a permissive CORS policy for local development.

## Run Commands

- `npm start` — start the server
- `npm run dev` — start with nodemon
- `npm run seed` — seed watch products and demo user

## API Endpoints

### Auth

- `POST /api/auth/register`
  - Body: `{ fullname, email, password }`
  - Response: `{ user, token }`

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ user, token }`

### Products

- `GET /api/products`
  - Query: `search`, `category`
  - Response: `[{ id, name, description, price, image, category, stock }]`

- `GET /api/products/:id`
  - Response: `{ id, name, description, price, image, category, stock }`

### Cart

Protected by JWT in `Authorization: Bearer <token>`.

- `GET /api/cart`
  - Response: `[{ id, name, price, image, category, description, quantity }]`

- `POST /api/cart`
  - Body: `{ productId }`
  - Adds a product or increases quantity.

- `PUT /api/cart/:productId`
  - Body: `{ quantity }`
  - Updates quantity or removes if quantity is 0.

- `DELETE /api/cart/:productId`
  - Removes the item.

## Database Seed

The seed command inserts initial watch products and a demo user:

- email: `demo@yjwatches.com`
- password: `Demo1234`

Run:
```bash
npm run seed
```
