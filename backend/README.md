# Flash Sale Backend

## API Endpoints

- `GET /status` — Get current flash sale status (upcoming, active, ended)
- `POST /purchase` — Attempt to purchase (body: `{ userId }`)
- `GET /user/:userId` — Check if a user has secured an item
- `GET /user/:userId/purchases` - check all items from user's purchase

## Project Structure

```
backend/
  src/
    app.ts
    types.d.ts
    controllers/
      FlashSaleController.ts
    services/
      SaleService.ts
      PrismaSaleStorage.ts
  prisma/
    schema.prisma
  tests/
    unit/
      SaleService.test.ts
    stress/
      SaleService.stress.test.ts
  package.json
  README.md
  tsconfig.json
  jest.config.js
```

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up database (PostgreSQL via Docker Compose):**
   ```bash
   docker-compose up db
   ```
3. **Run Prisma migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. **Start backend server:**
   ```bash
   npm start
   ```

## Running Tests

- **Unit & Integration Tests:**
  ```bash
  npm test
  ```
- **Stress Test:**
  ```bash
  npm test
  # Stress test runs with all tests; see tests/stress/SaleService.stress.test.ts for details
  ```

## Architecture & Design Choices

- **SOLID Principles:** Business logic is in `SaleService`, data access via `PrismaSaleStorage`.
- **Scalability:** Uses PostgreSQL, can be extended to Redis/RabbitMQ. Dockerized for local cloud simulation.
- **Concurrency Control:** DB and backend logic prevent overselling and double purchases.
- **Testing:** Unit and stress tests ensure correctness under load.
