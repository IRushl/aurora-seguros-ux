import { useState } from 'react';
import { configurationLabel, PLANS } from '../domain.ts';
import type { PlanId } from '../domain.ts';
import type { Journey } from '../hooks/useJourney.ts';
import { Actions, Button, Feedback } from '../components/ui.tsx';
import { ComparisonTable, PlanCard, SelectionSummary } from '../components/Plans.tsx';

export function Planes({ journey }: { journey: Journey }) {
  const { state, pending } = journey;
  const [announcement, setAnnouncement] = useState('');
  const selected = PLANS.find(plan => plan.id === state.selectedPlan);
  const available = state.catalog === 'ready';
  function select(id: PlanId) { journey.selectPlan(id); setAnnouncement(`Seleccionaste ${PLANS.find(p => p.id === id)?.name}. Puedes cambiar de plan o ver el resumen de tu elección.`); }
  return <>
    <h1 id="page-title" tabIndex={-1}>Encuentra el plan que prefieras</h1>
    <p className="muted">Compara los servicios y revisa los detalles antes de elegir tu plan.</p>
    <p className="small muted">Planes y precios de ejemplo: no son una oferta comercial.</p>
    <div className="configuration-summary"><p className="label">{configurationLabel(state.insured)}</p><Button secondary onClick={() => journey.go('asegurados')}>Cambiar asegurados</Button></div>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    {pending === 'catalog' ? <Feedback title="Preparando las alternativas" kind="loading">Espera un momento mientras cargamos los planes.</Feedback> :
      available ? <><ComparisonTable /><div className="plan-grid">{PLANS.map(plan => <PlanCard key={plan.id} plan={plan} insured={state.insured} selected={plan.id === state.selectedPlan} onSelect={select} />)}</div>
        <Button className="back-to-insured" secondary onClick={() => journey.go('asegurados')}>Volver a Asegurados</Button></> : <>
        {state.catalog === 'empty' ? <>
          <Feedback title="No hay planes disponibles para mostrar">La consulta terminó sin resultados. Revisa las personas incluidas o actualiza las opciones.</Feedback>
          <Actions primary={<Button onClick={() => journey.go('asegurados')}>Revisar personas</Button>} secondary={<Button secondary onClick={() => void journey.loadPlans()}>Actualizar opciones</Button>} />
        </> : <>
          <Feedback title="No pudimos cargar los planes" kind="error">Ocurrió un problema de carga. Las personas y edades siguen guardadas. Intenta de nuevo.</Feedback>
          <Actions primary={<Button onClick={() => void journey.loadPlans()}>Reintentar carga</Button>} secondary={<Button secondary onClick={() => journey.go('asegurados')}>Revisar personas</Button>} />
        </>}
      </>}
    {selected && available && <SelectionSummary plan={selected} insured={state.insured} onContinue={() => journey.go('resumen')} />}
  </>;
}
