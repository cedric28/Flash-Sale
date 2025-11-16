import { PrismaClient } from '@prisma/client';
import { ISaleStorage } from './SaleService';

export class PrismaSaleStorage implements ISaleStorage {
  private prisma: PrismaClient;
  private productId: number;

  constructor(prisma: PrismaClient, productId: number = 1) {
    this.prisma = prisma;
    this.productId = productId;
  }

  async getStock(): Promise<number> {
    const product = await this.prisma.product.findUnique({ where: { id: this.productId } });
    return product?.stock ?? 0;
  }

  async setStock(stock: number): Promise<void> {
    await this.prisma.product.update({ where: { id: this.productId }, data: { stock } });
  }

  async hasUserPurchased(userId: string): Promise<boolean> {
    const purchase = await this.prisma.purchase.findUnique({ where: { userId } });
    return !!purchase;
  }

  async addPurchase(userId: string): Promise<boolean> {
    const MAX_RETRIES = 100;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          // Lock the product row for update
          const products = await tx.$queryRawUnsafe<any[]>(
            `SELECT * FROM "Product" WHERE id = $1 FOR UPDATE`,
            this.productId
          );
          const product = products[0];
          if (!product || product.stock <= 0) return false;

          // Check if user already purchased
          const alreadyPurchased = await tx.purchase.findUnique({ where: { userId } });
          if (alreadyPurchased) return false;

          // Decrement stock and create purchase
          await tx.product.update({ where: { id: this.productId }, data: { stock: product.stock - 1 } });
          await tx.purchase.create({ data: { userId, productId: this.productId } });
          return true;
        }, { isolationLevel: 'Serializable' });
      } catch (e: any) {
        if (e.code === '40001' || e.message?.includes('could not serialize access')) {
          await new Promise(res => setTimeout(res, Math.floor(Math.random() * 191) + 10));
          continue;
        }
        if (e.code === 'P2002') return false;
        throw e;
      }
    }
    return false;
  }
}
