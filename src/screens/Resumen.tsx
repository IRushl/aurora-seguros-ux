import { configurationLabel, PLANS, monthlyTotal, formatCOP, planFeatures } from '../domain.ts';
import type { Journey } from '../hooks/useJourney.ts';
import { Actions, Button, Feedback } from '../components/ui.tsx';

export function Resumen({ journey }: { journey: Journey }) {
  const plan = PLANS.find(p => p.id === journey.state.selectedPlan);
  if (!plan) return null;
  return <>
    <p className="small muted">Resumen de tu selección</p>
    <h1 id="page-title" tabIndex={-1}>Tu selección está lista</h1>
    <Feedback kind="success" title="Elección guardada en esta pestaña" live={false}>Esta elección es de ejemplo y no te compromete a contratar. No has comprado un seguro ni se ha emitido una póliza.</Feedback>
    <div className="closure-grid">
      <section className="panel selection-result" aria-labelledby="result-title"><h2 id="result-title">Plan seleccionado</h2><p className="plan-name">{plan.name}</p>
        <p className="price">{formatCOP(monthlyTotal(plan, journey.state.insured))}<span className="small muted"> / mes para el grupo</span></p><p className="small muted">Precio ilustrativo: {formatCOP(plan.monthlyPerPerson)} × {journey.state.insured.quantity} personas.</p>
        <h3 className="label">Personas incluidas</h3><p>{configurationLabel(journey.state.insured)}</p>
        <dl className="result-features">{planFeatures(plan).map(([label, value]) => <div key={label}><dt className="small muted">{label}</dt><dd className="label">{value}</dd></div>)}</dl>
      </section>
      <section className="panel next-steps" aria-labelledby="next-steps-title"><h2 id="next-steps-title">¿Cómo seguiría el proceso original?</h2>
        <p className="small muted">En una contratación real, continuarías con estas etapas.</p>
        <ol><li>Detalles del plan</li><li>Datos del titular</li><li>Confirmación</li><li>Pago</li></ol>
      </section>
    </div>
    <Actions className="closure-actions" primary={<Button onClick={() => journey.go('planes')}>Volver a comparar</Button>}
      secondary={<Button secondary onClick={journey.reset}>Comenzar de nuevo</Button>} />
    <p className="small muted">Al comenzar de nuevo se borran los datos de esta pestaña.</p>
  </>;
}
