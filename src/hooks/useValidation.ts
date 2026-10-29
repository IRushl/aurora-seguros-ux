import { useRef, useState } from 'react';
import type { Errors } from '../domain.ts';

export function useValidation<T>(value: T, validate: (value: T) => Errors) {
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [corrected, setCorrected] = useState(false);
  const dirty = useRef(new Set<string>());
  const summaryRef = useRef<HTMLDivElement>(null);
  function change(field: string, nextValue: T) {
    dirty.current.add(field);
    if (attempted || errors[field]) {
      const found = validate(nextValue)[field];
      const next = attempted ? validate(nextValue) : { ...errors };
      if (found) next[field] = found; else delete next[field];
      setCorrected(Object.keys(errors).length > 0 && Object.keys(next).length === 0); setErrors(next);
    }
  }
  function blur(field: string) {
    if (!dirty.current.has(field) && !attempted) return;
    const found = validate(value)[field];
    setErrors(current => { const next = { ...current }; if (found) next[field] = found; else delete next[field]; return next; });
  }
  function submit() {
    const next = validate(value); setErrors(next); setAttempted(true); setCorrected(false);
    if (Object.keys(next).length) { requestAnimationFrame(() => summaryRef.current?.focus()); return false; }
    return true;
  }
  function reconcile(nextValue: T, mapField: (field: string) => string | null) {
    // Structural changes must move touched state with the person, not the old index.
    const fields = [...dirty.current].map(mapField).filter((key): key is string => key !== null);
    dirty.current = new Set(fields);
    const found = validate(nextValue);
    const shown = new Set(Object.keys(errors).map(mapField).filter((key): key is string => key !== null));
    const next = attempted ? found : Object.fromEntries(Object.entries(found).filter(([key]) => shown.has(key)));
    setCorrected(Object.keys(errors).length > 0 && Object.keys(next).length === 0); setErrors(next);
  }
  return { errors, attempted, corrected, summaryRef, change, blur, submit, reconcile };
}
