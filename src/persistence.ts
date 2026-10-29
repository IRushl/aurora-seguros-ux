import { CATALOG_REVISION, initialJourney, validateContact, isConfigurationConfirmed, PLAN_IDS } from './domain.ts';
import type { JourneyState } from './domain.ts';

export const STORAGE_KEY = 'aurora.journey.v1';
export type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
// Do not trust restored flags, context signatures, unknown plan IDs or unbounded storage content.
export function restoreJourney(storage: StoragePort | null): JourneyState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw || raw.length > 10000) return initialJourney();
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return initialJourney();
    const d = data as JourneyState;
    if (d.version !== 1 || !d.contact || !d.insured ||
      !['name', 'email', 'phone'].every(k => typeof d.contact[k as keyof typeof d.contact] === 'string' && d.contact[k as keyof typeof d.contact].length <= 254) ||
      typeof d.insured.quantity !== 'string' || d.insured.quantity.length > 3 ||
      !Array.isArray(d.insured.ages) || d.insured.ages.length > 20 ||
      !d.insured.ages.every(a => typeof a === 'string' && a.length <= 3)) return initialJourney();
    const state: JourneyState = { version: 1, catalogRevision: CATALOG_REVISION, contact: d.contact, insured: d.insured,
      contactAccepted: d.contactAccepted === true && Object.keys(validateContact(d.contact)).length === 0,
      confirmedConfig: typeof d.confirmedConfig === 'string' ? d.confirmedConfig : null,
      catalog: ['ready', 'error', 'empty'].includes(d.catalog) ? d.catalog : 'idle',
      selectedPlan: typeof d.selectedPlan === 'string' && PLAN_IDS.includes(d.selectedPlan) ? d.selectedPlan : null };
    if (d.catalogRevision !== CATALOG_REVISION || !state.contactAccepted || !isConfigurationConfirmed(state)) {
      state.confirmedConfig = null; state.catalog = 'idle'; state.selectedPlan = null;
    }
    if (state.catalog !== 'ready') state.selectedPlan = null;
    return state;
  } catch { return initialJourney(); }
}
export function persistJourney(storage: StoragePort | null, state: JourneyState): boolean {
  try { if (!storage) return false; storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
export function clearJourney(storage: StoragePort | null): void {
  try { storage?.removeItem(STORAGE_KEY); } catch { /* In-memory reset still applies. */ }
}
