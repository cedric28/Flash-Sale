import express from 'express';
import cors from 'cors';
import { getSaleStatus, attemptPurchase, getUserPurchaseStatus, getUserPurchases } from './controllers/FlashSaleController';

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint: Get sale status
app.get('/status', getSaleStatus);

// Endpoint: Attempt purchase
app.post('/purchase', attemptPurchase);

// Endpoint: Check user purchase status
app.get('/user/:userId', getUserPurchaseStatus);
// Endpoint: Get all purchases for a user
app.get('/user/:userId/purchases', getUserPurchases);

/**
 * Scalability & Fault Tolerance:
 * - For production, use distributed cache (Redis) or DB for state.
 * - SaleService is SOLID-compliant and accepts any storage provider.
 * - For concurrency control, use atomic operations or message queues in distributed environments.
 */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Flash Sale API running on port ${PORT}`);
});
