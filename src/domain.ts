export type Step = 'inicio' | 'asegurados' | 'planes' | 'resumen';
export type PlanId = 'A' | 'B' | 'C';
export type Contact = { name: string; email: string; phone: string };
export type Insured = { quantity: string; ages: string[] };
export type Errors = Record<string, string>;
export type CatalogStatus = 'idle' | 'ready' | 'error' | 'empty';
export interface JourneyState {
  version: 1;
  catalogRevision: string;
  contact: Contact;
  contactAccepted: boolean;
  insured: Insured;
  confirmedConfig: string | null;
  catalog: CatalogStatus;
  selectedPlan: PlanId | null;
}

export const CATALOG_REVISION = 'illustrative-2026-10-v2';
// Authored for this exercise. No commercial offer or eligibility engine.
export const PLANS = [
  { id: 'A', name: 'Esencial', description: 'Una opción centrada en consultas de medicina general.', monthlyPerPerson: 55000, general: true, specialists: false, hospital: false, generalLimit: 2, specialistLimit: 0, hospitalDays: 0 },
  { id: 'B', name: 'Plus', description: 'Más consultas generales y acceso a especialistas.', monthlyPerPerson: 95000, general: true, specialists: true, hospital: false, generalLimit: 4, specialistLimit: 2, hospitalDays: 0 },
  { id: 'C', name: 'Premium', description: 'Más consultas y una estancia hospitalaria limitada.', monthlyPerPerson: 145000, general: true, specialists: true, hospital: true, generalLimit: 6, specialistLimit: 4, hospitalDays: 3 },
] as const;
export type Plan = (typeof PLANS)[number];
export const PLAN_IDS: readonly string[] = PLANS.map(p => p.id);
export const STEP_NAMES: Step[] = ['inicio', 'asegurados', 'planes', 'resumen'];

export function initialJourney(): JourneyState {
  return { version: 1, catalogRevision: CATALOG_REVISION, contact: { name: '', email: '', phone: '' }, contactAccepted: false,
    insured: { quantity: '1', ages: [''] }, confirmedConfig: null, catalog: 'idle', selectedPlan: null };
}
export function normalizePhone(value: string): string {
  let digits = value.replace(/[\s().-]/g, '');
  if (digits.startsWith('+57')) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  return digits;
}
export function validateContact(contact: Contact): Errors {
  const errors: Errors = {};
  const name = contact.name.trim();
  if (!name) errors.name = 'Escribe tu nombre.';
  else if (name.length > 100 || !/\p{L}/u.test(name) || !/^[\p{L}\p{M}\s.'’\-]+$/u.test(name))
    errors.name = 'Escribe tu nombre usando letras. No necesitas incluir apellidos.';
  const email = contact.email.trim();
  if (!email) errors.email = 'Escribe tu correo.';
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Usa un formato como nombre@ejemplo.com.';
  if (!contact.phone.trim()) errors.phone = 'Escribe tu celular.';
  else if (!/^\+?[\d\s().-]+$/.test(contact.phone.trim()) || !/^\d{10}$/.test(normalizePhone(contact.phone.trim())))
    errors.phone = 'Escribe 10 dígitos. Puedes incluir el prefijo +57.';
  return errors;
}
export function validQuantity(value: string): boolean {
  return /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 20;
}
export function validateInsured(insured: Insured): Errors {
  const errors: Errors = {};
  if (!validQuantity(insured.quantity)) errors.quantity = insured.quantity ?
    'Para este prototipo, ingresa entre 1 y 20 personas.' : 'Indica la cantidad de personas.';
  const count = validQuantity(insured.quantity) ? Number(insured.quantity) : insured.ages.length;
  for (let i = 0; i < count; i++) {
    const age = insured.ages[i]?.trim() ?? '';
    if (!age) errors[`age-${i}`] = 'Escribe la edad.';
    else if (!/^\d{1,3}$/.test(age) || Number(age) > 130)
      errors[`age-${i}`] = 'Escribe una edad en años completos, entre 0 y 130.';
  }
  return errors;
}
export function configurationSignature(insured: Insured): string {
  return JSON.stringify({ quantity: Number(insured.quantity), ages: insured.ages.map(age => Number(age)) });
}
export function isConfigurationConfirmed(state: JourneyState): boolean {
  return Object.keys(validateInsured(state.insured)).length === 0 &&
    state.insured.ages.length === Number(state.insured.quantity) &&
    state.confirmedConfig === configurationSignature(state.insured);
}
export function guardStep(step: Step, state: JourneyState): Step {
  if (step === 'inicio') return step;
  if (!state.contactAccepted || Object.keys(validateContact(state.contact)).length) return 'inicio';
  if (step === 'asegurados') return step;
  if (!isConfigurationConfirmed(state)) return 'asegurados';
  if (step === 'resumen' && (state.catalog !== 'ready' || !state.selectedPlan || !PLAN_IDS.includes(state.selectedPlan))) return 'planes';
  return step;
}
export function updateContact(state: JourneyState, field: keyof Contact, value: string): JourneyState {
  if (state.contact[field] === value) return state;
  return { ...state, contact: { ...state.contact, [field]: value }, contactAccepted: false,
    confirmedConfig: null, catalog: 'idle', selectedPlan: null };
}
export function updateInsured(state: JourneyState, field: string, value: string): JourneyState {
  let insured: Insured;
  if (field === 'quantity') {
    const ages = validQuantity(value) ? Array.from({ length: Number(value) }, (_, i) => state.insured.ages[i] ?? '') : state.insured.ages;
    insured = { quantity: value, ages };
  } else {
    const index = Number(field.replace('age-', ''));
    if (!Number.isInteger(index) || index < 0 || index >= state.insured.ages.length) return state;
    insured = { ...state.insured, ages: state.insured.ages.map((age, i) => i === index ? value : age) };
  }
  if (JSON.stringify(insured) === JSON.stringify(state.insured)) return state;
  return { ...state, insured, confirmedConfig: null, catalog: 'idle', selectedPlan: null };
}
export function configurationLabel(insured: Insured): string {
  const ages = insured.ages.map(age => String(Number(age)));
  const list = ages.length <= 1 ? ages[0] : ages.slice(0, -1).join(', ') + ' y ' + ages.at(-1);
  return `${Number(insured.quantity)} ${Number(insured.quantity) === 1 ? 'persona' : 'personas'} · ${list} ${ages.length === 1 && Number(ages[0]) === 1 ? 'año' : 'años'}`;
}

export function monthlyTotal(plan: Plan, insured: Insured): number {
  return plan.monthlyPerPerson * Number(insured.quantity);
}
export function formatCOP(value: number): string {
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value) + ' COP';
}
export function planFeatures(plan: Plan): [string, string][] {
  return [
    ['Consultas generales', `${plan.generalLimit} por persona / mes`],
    ['Especialistas', plan.specialistLimit ? `${plan.specialistLimit} por persona / mes` : 'No incluidos'],
    ['Hospitalización', plan.hospitalDays ? `Hasta ${plan.hospitalDays} días por persona / año` : 'No incluida'],
  ];
}
export function removeInsured(state: JourneyState, index: number): JourneyState {
  if (state.insured.ages.length <= 1 || index < 0 || index >= state.insured.ages.length) return state;
  const ages = state.insured.ages.filter((_, i) => i !== index);
  return { ...state, insured: { quantity: String(ages.length), ages }, confirmedConfig: null, catalog: 'idle', selectedPlan: null };
}
