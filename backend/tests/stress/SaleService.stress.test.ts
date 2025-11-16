import { SaleService } from '../../src/services/SaleService';
import { PrismaSaleStorage } from '../../src/services/PrismaSaleStorage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.product.update({ where: { id: 1 }, data: { stock: 100 } });
  await prisma.purchase.deleteMany({});
});

describe('SaleService Stress Test', () => {
  it('should not oversell and allow only one purchase per user under high concurrency', async () => {
    const initialStock = 100;
    const userCount = 1000;
    const storage = new PrismaSaleStorage(prisma);
    const service = new SaleService(storage);
    // Simulate active sale
    (service as any).saleStart = new Date(Date.now() - 1000);
    (service as any).saleEnd = new Date(Date.now() + 10000);

    // Reset stock and purchases before test
    await prisma.product.update({ where: { id: 1 }, data: { stock: initialStock } });
    await prisma.purchase.deleteMany({});

    // Simulate concurrent purchase attempts with retry until all stock is sold
    const userIds = Array.from({ length: userCount }, (_, i) => `user${i}`);
    let remainingUserIds = [...userIds];
    let successCount = 0;
    let attempts = 0;
    while (successCount < initialStock && remainingUserIds.length > 0 && attempts < 10) {
      const purchasePromises = remainingUserIds.map(userId => service.attemptPurchase(userId));
      const results = await Promise.all(purchasePromises);
      const successes = results.map((r, i) => r.success ? remainingUserIds[i] : null).filter(Boolean);
      successCount += successes.length;
      // Remove successful users from remainingUserIds
      remainingUserIds = remainingUserIds.filter(userId => !successes.includes(userId));
      attempts++;
    }
    console.log(`Total successful purchases: ${successCount}`);
    expect(successCount).toBe(initialStock);

    // Ensure no overselling
    expect(await storage.getStock()).toBe(0);

    // Ensure no user purchased more than once
    const doublePurchaseResults = await Promise.all(userIds.map(userId => service.attemptPurchase(userId)));
    doublePurchaseResults.forEach(r => {
      if (r.success) {
        throw new Error('User was able to purchase more than once!');
      }
    });
  }, 30000);
});

