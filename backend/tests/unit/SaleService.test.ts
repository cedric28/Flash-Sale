import { SaleService } from '../../src/services/SaleService';
import { PrismaSaleStorage } from '../../src/services/PrismaSaleStorage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure test product exists and reset stock
  await prisma.product.upsert({
    where: { id: 1 },
    update: { stock: 100 },
    create: { id: 1, name: 'Flash Sale Product', stock: 100 },
  });
  await prisma.purchase.deleteMany({});
});

describe('SaleService', () => {
  let storage: PrismaSaleStorage;
  let service: SaleService;

  beforeEach(async () => {
    storage = new PrismaSaleStorage(prisma);
    service = new SaleService(storage);
    // Reset stock and purchases before each test
    await prisma.product.update({ where: { id: 1 }, data: { stock: 100 } });
    await prisma.purchase.deleteMany({});
  });

  it('should start with sale upcoming', () => {
    expect(service.getSaleStatus()).toBe('upcoming');
  });

  it('should not allow purchase before sale is active', async () => {
    const result = await service.attemptPurchase('user1');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not active/);
  });

  it('should allow purchase when sale is active', async () => {
    // Simulate active sale
    (service as any).saleStart = new Date(Date.now() - 1000);
    (service as any).saleEnd = new Date(Date.now() + 10000);
    const result = await service.attemptPurchase('user1');
    expect(result.success).toBe(true);
  });

  it('should not allow more than one purchase per user', async () => {
    (service as any).saleStart = new Date(Date.now() - 1000);
    (service as any).saleEnd = new Date(Date.now() + 10000);
    await service.attemptPurchase('user1');
    const result = await service.attemptPurchase('user1');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Already purchased or out of stock./);
  });

  it('should not allow purchase when out of stock', async () => {
    (service as any).saleStart = new Date(Date.now() - 1000);
    (service as any).saleEnd = new Date(Date.now() + 10000);
    await storage.setStock(0);
    const result = await service.attemptPurchase('user2');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Already purchased or out of stock./);
  });

  it('should track user purchase status', async () => {
    (service as any).saleStart = new Date(Date.now() - 1000);
    (service as any).saleEnd = new Date(Date.now() + 10000);
    await service.attemptPurchase('user3');
    expect(await service.hasUserPurchased('user3')).toBe(true);
    expect(await service.hasUserPurchased('user4')).toBe(false);
  });
});
