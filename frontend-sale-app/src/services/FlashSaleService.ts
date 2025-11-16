const API_BASE = 'http://localhost:3001';

export type SaleStatus = 'upcoming' | 'active' | 'ended';

export interface PurchaseResult {
  success: boolean;
  message: string;
}

export async function getSaleStatus(): Promise<SaleStatus> {
  const res = await fetch(`${API_BASE}/status`);
  const data = await res.json();
  return data.status;
}

export async function attemptPurchase(userId: string): Promise<PurchaseResult> {
  const res = await fetch(`${API_BASE}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return await res.json();
}

export async function getUserPurchaseStatus(userId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/user/${userId}`);
  const data = await res.json();
  return data.hasPurchased;
}

export async function getUserPurchases(userId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/user/${userId}/purchases`);
  return res.json();
}
