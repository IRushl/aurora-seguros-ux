import { useCallback, useEffect, useRef, useState } from 'react';
import { removeInsured, configurationSignature, guardStep, initialJourney, STEP_NAMES, updateContact, updateInsured, validateContact, validateInsured } from '../domain.ts';
import type { Contact, JourneyState, PlanId, Step } from '../domain.ts';
import { clearJourney, persistJourney, restoreJourney } from '../persistence.ts';
import { createSimulation } from '../services/simulation.ts';
import type { Scenario } from '../services/simulation.ts';

function tabStorage() { try { return window.sessionStorage; } catch { return null; } }
function requestedStep(): Step { const name = window.location.hash.slice(1); return STEP_NAMES.includes(name as Step) ? name as Step : 'inicio'; }

export function useJourney() {
  const [state, setState] = useState(() => restoreJourney(tabStorage()));
  const stateRef = useRef(state);
  const [step, setStep] = useState(() => guardStep(requestedStep(), state));
  const stepRef = useRef(step);
  const [pending, setPending] = useState<'contact' | 'catalog' | null>(null);
  const [contactError, setContactError] = useState(false);
  const [focusVersion, setFocusVersion] = useState(0);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const active = useRef<{ controller: AbortController; generation: number } | null>(null);
  const generation = useRef(0);
  const [service] = useState(() => createSimulation(new URLSearchParams(location.search).get('scenario') as Scenario));
  const update = useCallback((change: (current: JourneyState) => JourneyState) => {
    const next = change(stateRef.current); stateRef.current = next; setState(next);
    if (!persistJourney(tabStorage(), next)) setStorageUnavailable(true);
  }, []);
  const cancel = useCallback(() => {
    generation.current++; active.current?.controller.abort(); active.current = null; setPending(null);
  }, []);
  const go = useCallback((requested: Step, replace = false) => {
    cancel(); const destination = guardStep(requested, stateRef.current);
    const url = `${location.pathname}${location.search}#${destination}`;
    if (replace || stepRef.current === destination) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
    stepRef.current = destination; setStep(destination); setFocusVersion(v => v + 1);
  }, [cancel]);
  useEffect(() => {
    history.replaceState(null, '', `${location.pathname}${location.search}#${stepRef.current}`);
    const onHistory = () => go(requestedStep(), true);
    window.addEventListener('popstate', onHistory); window.addEventListener('hashchange', onHistory);
    return () => { window.removeEventListener('popstate', onHistory); window.removeEventListener('hashchange', onHistory); active.current?.controller.abort(); };
  }, [go]);
  function begin(stage: 'contact' | 'catalog') {
    if (active.current) return null;
    const request = { controller: new AbortController(), generation: ++generation.current };
    active.current = request; setPending(stage); return request;
  }
  async function submitContact() {
    if (Object.keys(validateContact(stateRef.current.contact)).length) return false;
    const request = begin('contact'); if (!request) return false;
    setContactError(false);
    try {
      await service.request('contact', request.controller.signal);
      if (request.generation !== generation.current) return false;
      update(s => ({ ...s, contactAccepted: true })); go('asegurados'); return true;
    } catch (error) {
      if (request.generation === generation.current && !(error instanceof DOMException && error.name === 'AbortError')) setContactError(true);
      return false;
    } finally { if (request.generation === generation.current) { active.current = null; setPending(null); } }
  }
  async function loadPlans() {
    if (!stateRef.current.contactAccepted || Object.keys(validateInsured(stateRef.current.insured)).length) return;
    const request = begin('catalog'); if (!request) return;
    const signature = configurationSignature(stateRef.current.insured);
    try {
      const result = await service.request('catalog', request.controller.signal);
      if (request.generation !== generation.current) return;
      update(s => ({ ...s, confirmedConfig: signature, catalog: result, selectedPlan: null })); go('planes');
    } catch (error) {
      if (request.generation !== generation.current || (error instanceof DOMException && error.name === 'AbortError')) return;
      update(s => ({ ...s, confirmedConfig: signature, catalog: 'error', selectedPlan: null })); go('planes');
    } finally { if (request.generation === generation.current) { active.current = null; setPending(null); } }
  }
  function reset() {
    cancel(); service.reset(); clearJourney(tabStorage());
    const next = initialJourney(); stateRef.current = next; setState(next); setContactError(false); setStorageUnavailable(false);
    // Do not write an old snapshot during reset. Historic routes remain guarded after clearing.
    go('inicio', true);
  }
  return { state, step, pending, contactError, focusVersion, storageUnavailable, go, reset, submitContact, loadPlans,
    editContact: (field: keyof Contact, value: string) => { setContactError(false); update(s => updateContact(s, field, value)); },
    editInsured: (field: string, value: string) => update(s => updateInsured(s, field, value)),
    removePerson: (index: number) => update(s => removeInsured(s, index)),
    selectPlan: (plan: PlanId) => update(s => guardStep('planes', s) === 'planes' && s.catalog === 'ready' ? { ...s, selectedPlan: plan } : s),
  };
}
export type Journey = ReturnType<typeof useJourney>;
