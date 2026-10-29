import { useState } from 'react';
import { Disclosure } from '../components/Disclosure.tsx';
import { updateInsured, validateInsured, validQuantity } from '../domain.ts';
import { Actions, Button, ErrorSummary, Feedback, Field } from '../components/ui.tsx';
import { useValidation } from '../hooks/useValidation.ts';
import type { Journey } from '../hooks/useJourney.ts';

export function Asegurados({ journey }: { journey: Journey }) {
  const { state, pending } = journey;
  const validation = useValidation(state.insured, validateInsured);
  const [changedSelection, setChangedSelection] = useState(false);
  const labels: Record<string, string> = { quantity: 'Cantidad de personas' };
  state.insured.ages.forEach((_, i) => labels[`age-${i}`] = `Edad de la persona ${i + 1}`);
  const busy = pending === 'catalog';
  function edit(field: string, value: string) {
    const next = updateInsured(state, field, value);
    if (state.selectedPlan && next !== state) setChangedSelection(true);
    if (field === 'quantity') {
      validation.change(field, next.insured);
      validation.reconcile(next.insured, key => key.startsWith('age-') && Number(key.slice(4)) >= next.insured.ages.length ? null : key);
    }
    else validation.change(field, next.insured);
    journey.editInsured(field, value);
  }
  function remove(index: number) {
    if (state.selectedPlan) setChangedSelection(true);
    const ages = state.insured.ages.filter((_, i) => i !== index);
    validation.reconcile({ quantity: String(ages.length), ages }, key => {
      if (!key.startsWith('age-')) return key;
      const oldIndex = Number(key.slice(4)); return oldIndex === index ? null : `age-${oldIndex > index ? oldIndex - 1 : oldIndex}`;
    });
    journey.removePerson(index);
    requestAnimationFrame(() => document.getElementById(`age-${Math.max(0, index - 1)}`)?.focus());
  }
  return <>
    <h1 id="page-title" tabIndex={-1}>¿A quiénes quieres incluir?</h1>
    <p className="muted">Indica cuántas personas quieres tener en cuenta y la edad de cada una. Así podremos mostrarte las opciones para tu grupo.</p>
    <div className="insured-layout">
      <form className="insured-form panel" aria-label="Personas incluidas" noValidate aria-busy={busy} onSubmit={e => { e.preventDefault(); if (validation.submit()) void journey.loadPlans(); }}>
        {validation.attempted && <ErrorSummary title="Revisa las edades indicadas" errors={validation.errors} labels={labels} summaryRef={validation.summaryRef} />}
        {changedSelection && <Feedback title="Personas actualizadas">Las personas cambiaron. Revisa los planes y elige de nuevo.</Feedback>}
        {busy && <Feedback title="Preparando las alternativas" kind="loading">Espera un momento mientras cargamos los planes.</Feedback>}
        <Field id="quantity" label="Cantidad de personas" inputMode="numeric" maxLength={3} value={state.insured.quantity} readOnly={busy}
          hint="Indica cuántas personas quieres incluir." error={validation.errors.quantity} onChange={e => edit('quantity', e.target.value)} onBlur={() => validation.blur('quantity')} />
        <p className="small muted">Verás tres planes y el precio mensual de ejemplo para tu grupo. Las edades no cambian este cálculo.</p>
        <div className="age-fields">{state.insured.ages.map((age, i) => <section className="person-card" key={i} aria-label={`Persona ${i + 1}`}><div className="person-heading"><span className="person-avatar" aria-hidden="true">{i + 1}</span><h2 className="label">Persona {i + 1}</h2>{state.insured.ages.length > 1 && <Button secondary disabled={busy} aria-label={`Eliminar persona ${i + 1}`} onClick={() => remove(i)}>Eliminar</Button>}</div><Field id={`age-${i}`} label={`Edad de la persona ${i + 1}`} inputMode="numeric" maxLength={3}
          value={age} placeholder="En años" readOnly={busy} error={validation.errors[`age-${i}`]} onChange={e => edit(`age-${i}`, e.target.value)} onBlur={() => validation.blur(`age-${i}`)} /></section>)}</div>
        <Button secondary disabled={busy || !validQuantity(state.insured.quantity) || Number(state.insured.quantity) >= 20} onClick={() => { const index = state.insured.ages.length; edit('quantity', String(index + 1)); requestAnimationFrame(() => document.getElementById(`age-${index}`)?.focus()); }}>Agregar persona</Button>
        <p className="small muted">Para esta demostración: de 1 a 20 personas, con edades de 0 a 130 años. No son reglas de elegibilidad.</p>
        <Actions primary={<Button type="submit" disabled={busy}>{busy ? 'Preparando las alternativas' : 'Ver planes disponibles'}</Button>}
          secondary={<Button secondary onClick={() => journey.go('inicio')}>Volver a Inicio</Button>} />
      </form>
      <aside className="contact-summary" aria-labelledby="contact-summary-title">
        <h2 className="label" id="contact-summary-title">Tus datos de contacto</h2>
        <Disclosure summary="Revisar o editar mis datos" expandedSummary="Ocultar datos de contacto">
          <div className="contact-details"><p className="small">{state.contact.name}<br />{state.contact.email}<br />{state.contact.phone}</p>
            <Button secondary onClick={() => journey.go('inicio')}>Editar datos en Inicio</Button>
          </div>
        </Disclosure>
      </aside>
    </div>
  </>;
}
