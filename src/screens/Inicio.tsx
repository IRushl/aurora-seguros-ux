import { useRef, useState } from 'react';
import { Disclosure } from '../components/Disclosure.tsx';
import { validateContact } from '../domain.ts';
import type { Contact } from '../domain.ts';
import { Button, ErrorSummary, Feedback, Field } from '../components/ui.tsx';
import { useValidation } from '../hooks/useValidation.ts';
import type { Journey } from '../hooks/useJourney.ts';

const labels = { name: 'Nombre', email: 'Correo electrónico', phone: 'Celular' };
export function Inicio({ journey }: { journey: Journey }) {
  const { state, pending, contactError } = journey;
  const validation = useValidation(state.contact, validateContact);
  const [help, setHelp] = useState(false);
  const helpButton = useRef<HTMLButtonElement>(null);
  const failure = useRef<HTMLDivElement>(null);
  const busy = pending === 'contact';
  function edit(field: keyof Contact, value: string) {
    validation.change(field, { ...state.contact, [field]: value }); journey.editContact(field, value);
  }
  async function submit() {
    if (!validation.submit()) return;
    const success = await journey.submitContact();
    if (!success) requestAnimationFrame(() => failure.current?.focus());
  }
  return <><div className="start-layout">
    <section className="orientation" aria-labelledby="page-title">
      <h1 id="page-title" tabIndex={-1}>Cotiza tu Seguro Salud Flex</h1>
      <p className="muted">Conoce las opciones de Salud Flex, elige a quiénes quieres incluir y compara servicios antes de seleccionar un plan.</p>
      <img className="health-illustration" src="/salud-flex.svg" width="320" height="160" alt="" />
      <ol className="orientation-steps"><li>Ingresa tus datos</li><li>Indica a quiénes quieres incluir</li><li>Compara y elige tu plan</li></ol>
    </section>
    <form className="contact-form panel" noValidate aria-label="Datos de contacto" aria-busy={busy} onSubmit={e => { e.preventDefault(); void submit(); }}>
      <h2 className="contact-form-title">Comencemos con tus datos</h2>
      {validation.attempted && <ErrorSummary errors={validation.errors} labels={labels} summaryRef={validation.summaryRef} />}
      {validation.corrected && <Feedback kind="success" title="Datos corregidos">Ya puedes pulsar Cotizar para continuar.</Feedback>}
      {state.contactAccepted && !busy && <Feedback title="Tus datos siguen aquí">Puedes revisarlos y editarlos antes de continuar.</Feedback>}
      {busy && <Feedback title="Preparando el siguiente paso" kind="loading">Espera un momento mientras preparamos el siguiente paso.</Feedback>}
      {contactError && <Feedback title="No pudimos continuar" kind="error" focusRef={failure}>Tus datos siguen aquí. Reintenta o revisa la información.</Feedback>}
      <Field id="name" label="Nombre" autoComplete="name" maxLength={100} value={state.contact.name} readOnly={busy} placeholder="Tu nombre"
        error={validation.errors.name} onChange={e => edit('name', e.target.value)} onBlur={() => validation.blur('name')} />
      <div className="contact-pair">
        <Field id="email" label="Correo electrónico" type="email" inputMode="email" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={254}
          value={state.contact.email} readOnly={busy} placeholder="nombre@ejemplo.com" error={validation.errors.email}
          onChange={e => edit('email', e.target.value)} onBlur={() => validation.blur('email')} />
        <Field id="phone" label="Celular" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={state.contact.phone} readOnly={busy}
          placeholder="Tu número de celular" error={validation.errors.phone} onChange={e => edit('phone', e.target.value)} onBlur={() => validation.blur('phone')} />
      </div>
      <Button type="submit" disabled={busy}>{busy ? 'Preparando el siguiente paso' : contactError ? 'Reintentar' : 'Cotizar'}</Button>
      {contactError && <Button secondary onClick={() => document.getElementById('name')?.focus()}>Revisar mis datos</Button>}
      <p className="small muted data-purpose">Tu nombre identifica este recorrido. El correo y el celular completan los datos de contacto del ejercicio; solo se guardan en esta pestaña.</p>
      <div className="help-region">
        <Button secondary ref={helpButton} aria-expanded={help} aria-controls="context-help" onClick={() => setHelp(v => !v)}>¿Necesitas ayuda?</Button>
        {help && <section id="context-help" className="feedback" aria-label="Ayuda sobre el proceso">
          <h3 className="label">¿Cómo funciona el recorrido?</h3>
          <p className="small">Completa tus datos, indica personas y edades, compara alternativas y revisa tu selección. Puedes volver para corregir la información.</p>
          <Button secondary onClick={() => { setHelp(false); helpButton.current?.focus(); }}>Volver al formulario</Button>
        </section>}
      </div>
    </form>
  </div><section className="faq panel" aria-labelledby="faq-title"><h2 id="faq-title">Antes de empezar</h2>
    <Disclosure summary="¿Qué podré comparar?"><p>La cantidad de consultas generales, el acceso a especialistas y la hospitalización de tres alternativas ficticias, con sus límites y precios de ejemplo.</p></Disclosure>
    <Disclosure summary="¿Seleccionar un plan equivale a comprar?"><p>No. El recorrido termina en un resumen. En un proceso comercial tendrías que revisar condiciones, completar tus datos y confirmar antes del pago.</p></Disclosure>
    <Disclosure summary="¿Qué información necesito?"><p>Un nombre, un correo con formato válido, un celular y las edades de las personas que quieres incluir. Puedes usar datos de ejemplo para explorar.</p></Disclosure>
  </section></>;
}
