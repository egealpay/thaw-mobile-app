import { saveEntitlementCache } from '../storage/mmkv';

// RevenueCat scaffold — no paywall in MVP.
// When Purchases is properly initialized, replace this stub.

export interface EntitlementCache {
  isPro: boolean;
  fetchedAt: number;
}

export function hasProAccess(): boolean {
  return false;
}

export async function fetchEntitlements(): Promise<EntitlementCache> {
  const cache: EntitlementCache = { isPro: false, fetchedAt: Date.now() };
  saveEntitlementCache(cache);
  return cache;
}
