// SaleStatus type for clarity
export type SaleStatus = 'upcoming' | 'active' | 'ended';

// Interface for storage provider (Dependency Inversion Principle)
export interface ISaleStorage {
  getStock(): Promise<number>;
  setStock(stock: number): Promise<void>;
  hasUserPurchased(userId: string): Promise<boolean>;
  addPurchase(userId: string): Promise<boolean>;
}

// SaleService follows SOLID principles and accepts a storage provider
export class SaleService {
  private saleStart: Date;
  private saleEnd: Date;
  private storage: ISaleStorage;

  constructor(storage: ISaleStorage) {
    this.saleStart = new Date(Date.now() + 60 * 1000); // Sale starts in 1 min
    this.saleEnd = new Date(Date.now() + 10 * 60 * 1000); // Sale ends in 10 min
    this.storage = storage;
  }

  /**
   * Returns the current sale status.
   */
  getSaleStatus(): SaleStatus {
    const now = new Date();
    if (now < this.saleStart) return 'upcoming';
    if (now > this.saleEnd) return 'ended';
    return 'active';
  }

  /**
   * Attempts to purchase an item for a user.
   */
  async attemptPurchase(userId: string): Promise<{ success: boolean; message: string }> {
    if (this.getSaleStatus() !== 'active') {
      return { success: false, message: 'Sale is not active.' };
    }
    const status: boolean = await this.storage.addPurchase(userId);
    return {
      success: status,
      message: status ? 'Purchase successful!' : 'Already purchased or out of stock.'
    };
  }

  /**
   * Checks if a user has purchased.
   */
  async hasUserPurchased(userId: string): Promise<boolean> {
    return await this.storage.hasUserPurchased(userId);
  }
}
