import { SaleStatus } from '../services/FlashSaleService';

export function prettifySaleStatus(status: SaleStatus, locale: Record<string, string>): string {
  return locale[status] || 'Unknown';
}
