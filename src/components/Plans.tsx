import { useEffect, useRef } from 'react';
import { PLANS, formatCOP, monthlyTotal, planFeatures } from '../domain.ts';
import type { Insured, Plan, PlanId } from '../domain.ts';
import { Button } from './ui.tsx';
import { Disclosure } from './Disclosure.tsx';

export function PlanCard({ plan, insured, selected, onSelect }: { plan: Plan; insured: Insured; selected: boolean; onSelect: (id: PlanId) => void }) {
  return <article className={`plan-card ${selected ? 'plan-selected' : ''}`} aria-labelledby={`plan-${plan.id}`}>
    <h2 id={`plan-${plan.id}`}>{plan.name}</h2>
    <p className="small muted plan-description">{plan.description}</p>
    <div className="plan-price"><p className="price">{formatCOP(monthlyTotal(plan, insured))}</p><p className="small muted">/ mes para {insured.quantity} {Number(insured.quantity) === 1 ? 'persona' : 'personas'}</p><p className="small muted">{formatCOP(plan.monthlyPerPerson)} por persona</p></div>
    <dl className="plan-features">
      {planFeatures(plan).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <Button aria-pressed={selected} aria-label={selected ? `${plan.name}, seleccionado` : `Elegir ${plan.name}`} onClick={() => onSelect(plan.id)}>{selected ? 'Seleccionado' : `Elegir ${plan.name}`}</Button>
    <PlanDetails plan={plan} quantity={insured.quantity} />
  </article>;
}
export function PlanDetails({ plan, quantity }: { plan: Plan; quantity: string }) {
  return <Disclosure className="plan-details" summary={<>Ver detalles del plan<span className="sr-only"> {plan.name}</span></>} expandedSummary={<>Ocultar detalles del plan<span className="sr-only"> {plan.name}</span></>}><div className="details-content">
    <section><h3 className="label">Qué incluye</h3><ul><li>Medicina general: orientación inicial sobre síntomas y seguimiento, hasta {plan.generalLimit} consultas por persona cada mes.</li>
      {plan.specialistLimit > 0 && <li>Especialistas: consultas de una especialidad médica, hasta {plan.specialistLimit} por persona cada mes.</li>}
      {plan.hospitalDays > 0 && <li>Hospitalización: estancia en habitación compartida, hasta {plan.hospitalDays} días por persona cada año. No incluye procedimientos ni medicamentos.</li>}</ul></section>
    <section><h3 className="label">Qué no incluye</h3><p>{!plan.specialists && 'Consultas con especialistas. '}{!plan.hospital && 'Hospitalización. '}Ninguna alternativa incluye urgencias, cirugías, medicamentos ni exámenes diagnósticos en este catálogo.</p></section>
    <section><h3 className="label">Límites y condiciones del ejemplo</h3><p>Cada persona tiene su propio límite. Lo que no use no pasa a otra persona ni se acumula. Los límites se cuentan por mes o año calendario. En un seguro real tendrías que revisar la red médica, los copagos (lo que pagarías por atención), los periodos de espera y las autorizaciones. Este ejercicio no los simula.</p></section>
    <section><h3 className="label">Cómo se obtiene el precio</h3><p>{formatCOP(plan.monthlyPerPerson)} por persona × {quantity} = {formatCOP(plan.monthlyPerPerson * Number(quantity))} al mes. Las edades no modifican este cálculo.</p></section>
  </div></Disclosure>;
}
export function ComparisonTable() {
  return <div className="comparison-table"><table><caption className="sr-only">Comparación de características ilustrativas entre Esencial, Plus y Premium</caption>
    <thead><tr><th scope="col">Servicios y límites por persona</th>{PLANS.map(plan => <th scope="col" key={plan.id}>{plan.name}</th>)}</tr></thead>
    <tbody>{['Consultas generales', 'Especialistas', 'Hospitalización'].map((label, index) =>
      <tr key={label}><th scope="row">{label}</th>{PLANS.map(plan => <td key={plan.id}>{planFeatures(plan)[index][1]}</td>)}</tr>)}</tbody>
  </table></div>;
}
export function SelectionSummary({ plan, insured, onContinue }: { plan: Plan; insured: Insured; onContinue: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const keepFocusVisible = () => {
      const focused = document.activeElement;
      if (!ref.current || !(focused instanceof HTMLElement) || ref.current.contains(focused)) return;
      const target = focused.getBoundingClientRect(), bar = ref.current.getBoundingClientRect();
      if (target.bottom > bar.top && target.top < bar.bottom) window.scrollBy(0, target.bottom - bar.top + 16);
    };
    const onFocus = () => requestAnimationFrame(keepFocusVisible);
    const update = () => { if (ref.current) document.documentElement.style.setProperty('--selection-reserve', `${ref.current.offsetHeight + 48}px`); onFocus(); };
    const observer = new ResizeObserver(update); if (ref.current) observer.observe(ref.current); update();
    document.addEventListener('focusin', onFocus);
    return () => { observer.disconnect(); document.removeEventListener('focusin', onFocus); document.documentElement.style.removeProperty('--selection-reserve'); };
  }, []);
  return <aside className="selection-summary container" ref={ref} aria-label="Selección actual y siguiente acción">
    <div className="selection-description"><p className="small success">Plan seleccionado</p><p className="label selection-update" key={plan.id}>{plan.name} · {formatCOP(monthlyTotal(plan, insured))} / mes</p></div>
    <Button onClick={onContinue}>Ver resumen de mi elección</Button>
  </aside>;
}
