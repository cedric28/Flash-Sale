import { Request, Response } from 'express';
import { SaleService } from '../services/SaleService';
import { PrismaClient } from '@prisma/client';
import { PrismaSaleStorage } from '../services/PrismaSaleStorage';

const prisma = new PrismaClient();
const saleService = new SaleService(new PrismaSaleStorage(prisma));

export const getSaleStatus = (req: Request, res: Response) => {
  const status = saleService.getSaleStatus();
  res.json({ status });
};

export const attemptPurchase = async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const result = await saleService.attemptPurchase(userId);
  res.status(result.success ? 200 : 400).json(result);
};

export const getUserPurchaseStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const hasPurchased = await saleService.hasUserPurchased(userId);
  res.json({ userId, hasPurchased });
};

export const getUserPurchases = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { Product: true }
  });
  res.json(purchases);
};