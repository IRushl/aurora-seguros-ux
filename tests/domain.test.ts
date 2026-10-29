import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configurationSignature, guardStep, initialJourney, updateContact, updateInsured, validateContact, validateInsured, configurationLabel } from '../src/domain.ts';
import { clearJourney, persistJourney, restoreJourney, STORAGE_KEY } from '../src/persistence.ts';
import { createSimulation } from '../src/services/simulation.ts';
import { PLANS, monthlyTotal, removeInsured, CATALOG_REVISION } from '../src/domain.ts';

const contact = { name: 'Álex', email: 'alex@example.com', phone: '+57 300 000 0000' };
function configured() { const state = initialJourney(); state.contact = contact; state.contactAccepted = true; state.insured = { quantity: '2', ages: ['34', '58'] }; state.confirmedConfig = configurationSignature(state.insured); state.catalog = 'ready'; state.selectedPlan = 'C'; return state; }
function storage() { const map = new Map<string, string>(); return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } }; }
test('accepts a single Unicode name, formatted phone and email without claiming verification', () => assert.deepEqual(validateContact(contact), {}));
test('empty and malformed contacts identify their own fields', () => {
  assert.deepEqual(Object.keys(validateContact(initialJourney().contact)), ['name', 'email', 'phone']);
  const errors = validateContact({ name: '123', email: 'alex@', phone: 'not-a-phone' }); assert.deepEqual(Object.keys(errors), ['name', 'email', 'phone']);
});
test('all ages are required; zero is an age; quantity safety limit is not eligibility', () => {
  assert.deepEqual(validateInsured({ quantity: '1', ages: ['0'] }), {});
  assert.ok(validateInsured({ quantity: '2', ages: ['34', ''] })['age-1']);
  assert.ok(validateInsured({ quantity: '1', ages: ['-1'] })['age-0']);
  assert.ok(validateInsured({ quantity: '21', ages: ['34'] }).quantity);
});
test('removing people keeps remaining ages and invalidates dependent selection', () => {
  const state = updateInsured(configured(), 'quantity', '1'); assert.deepEqual(state.insured.ages, ['34']);
  assert.equal(state.selectedPlan, null); assert.equal(state.confirmedConfig, null); assert.equal(state.catalog, 'idle');
});
test('changing an age preserves contact and other ages while invalidating old results', () => {
  const previous = configured(), state = updateInsured(previous, 'age-0', '35');
  assert.deepEqual(state.insured.ages, ['35', '58']); assert.deepEqual(state.contact, contact);
  assert.equal(state.selectedPlan, null); assert.equal(previous.selectedPlan, 'C');
});
test('contact edits require accepted continuation again; unrelated ages stay present', () => {
  const next = updateContact(configured(), 'name', 'Valeria'); assert.equal(next.contactAccepted, false);
  assert.deepEqual(next.insured.ages, ['34', '58']); assert.equal(guardStep('resumen', next), 'inicio');
});
test('direct entry guards cannot manufacture a result', () => {
  assert.equal(guardStep('resumen', initialJourney()), 'inicio');
  const s = configured(); s.confirmedConfig = null; assert.equal(guardStep('planes', s), 'asegurados');
  s.confirmedConfig = configurationSignature(s.insured); s.selectedPlan = null; assert.equal(guardStep('resumen', s), 'planes');
});
test('summary adapts to quantity and configured ages', () => {
  assert.equal(configurationLabel({ quantity: '1', ages: ['1'] }), '1 persona · 1 año');
  assert.equal(configurationLabel({ quantity: '3', ages: ['7', '40', '68'] }), '3 personas · 7, 40 y 68 años');
});
test('session reload restores coherent state; clear does not resurrect selection', () => {
  const tab = storage(); assert.equal(persistJourney(tab, configured()), true); assert.equal(restoreJourney(tab).selectedPlan, 'C');
  clearJourney(tab); assert.equal(tab.getItem(STORAGE_KEY), null); assert.deepEqual(restoreJourney(tab), initialJourney());
});
test('malformed, oversized, unrecognized and tampered stored context is rejected', () => {
  const tab = storage(); for (const raw of ['{bad json', JSON.stringify({ version: 99 }), 'x'.repeat(11000)]) { tab.setItem(STORAGE_KEY, raw); assert.deepEqual(restoreJourney(tab), initialJourney()); }
  tab.setItem(STORAGE_KEY, JSON.stringify({ ...configured(), selectedPlan: 'pretend-commercial' })); assert.equal(restoreJourney(tab).selectedPlan, null);
  const changed = configured(); changed.insured.ages[0] = '35'; tab.setItem(STORAGE_KEY, JSON.stringify(changed)); assert.equal(restoreJourney(tab).selectedPlan, null);
});
test('unavailable storage has a safe in-memory fallback', () => {
  const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  assert.deepEqual(restoreJourney(bad), initialJourney()); assert.equal(persistJourney(bad, configured()), false); assert.doesNotThrow(() => clearJourney(bad));
});
test('contact failure is reproducible once and recovers on retry', async () => {
  const api = createSimulation('contact-failure'); await assert.rejects(api.request('contact', new AbortController().signal));
  assert.equal(await api.request('contact', new AbortController().signal), 'ready');
});
test('aborted work cannot finish as an accepted response', async () => {
  const api = createSimulation('slow-contact'), controller = new AbortController();
  const response = api.request('contact', controller.signal); controller.abort(); await assert.rejects(response, { name: 'AbortError' });
});
test('empty catalogue is independent from transport failure and can be retried', async () => {
  const api = createSimulation('catalog-empty'); assert.equal(await api.request('catalog', new AbortController().signal), 'empty');
  assert.equal(await api.request('catalog', new AbortController().signal), 'ready');
});
test('illustrative price depends only on quantity and is deterministic', () => {
  for (const plan of PLANS) {
    assert.equal(monthlyTotal(plan, { quantity: '3', ages: ['55', '33', '20'] }), plan.monthlyPerPerson * 3);
    assert.equal(monthlyTotal(plan, { quantity: '3', ages: ['0', '1', '130'] }), plan.monthlyPerPerson * 3);
  }
});
test('middle removal keeps order, exact age strings and invalidates selection', () => {
  const s = configured(); s.insured = { quantity: '3', ages: ['55', '33', '20'] };
  const next = removeInsured(s, 1); assert.deepEqual(next.insured, { quantity: '2', ages: ['55', '20'] }); assert.equal(next.selectedPlan, null);
});
test('catalogue revision invalidates stale selections but preserves contact and ages', () => {
  const tab = storage(); const s = configured(); tab.setItem(STORAGE_KEY, JSON.stringify({ ...s, catalogRevision: 'old' }));
  const next = restoreJourney(tab); assert.equal(next.catalogRevision, CATALOG_REVISION); assert.equal(next.selectedPlan, null);
  assert.deepEqual(next.contact, s.contact); assert.deepEqual(next.insured, s.insured);
});
