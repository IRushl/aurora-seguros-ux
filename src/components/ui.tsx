import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref, RefObject } from 'react';
import type { Errors, Step } from '../domain.ts';

export function Button({ secondary = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean; ref?: Ref<HTMLButtonElement> }) {
  return <button type="button" className={`button ${secondary ? 'button-secondary' : 'button-primary'} ${className}`} {...props} />;
}
export function Header() { return <header className="site-header"><div className="container brand"><img className="brand-logo" src="/brand/aurora-horizontal.svg" width="221" height="40" alt="Aurora Seguros" /></div></header>; }
export function Progress({ step }: { step: Step }) {
  const stage = ['inicio', 'asegurados', 'planes'].indexOf(step);
  return <nav className="progress" aria-label="Progreso del recorrido">
    <p className="small muted">Paso {stage + 1} de 3</p>
    <ol className="progress-steps">{['Inicio', 'Asegurados', 'Planes'].map((label, i) =>
      <li key={label} aria-current={i === stage ? 'step' : undefined}><span>{i + 1}</span> {label}</li>)}</ol>
  </nav>;
}
export function Field({ id, label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string; hint?: string }) {
  const described = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return <div className="field"><label htmlFor={id}>{label}</label>
    <input id={id} aria-invalid={Boolean(error)} aria-describedby={described} {...props} />
    {error && <p className="field-error small" id={`${id}-error`}>{error}</p>}
    {hint && <p className="small muted" id={`${id}-hint`}>{hint}</p>}
  </div>;
}
export function Feedback({ title, children, kind = 'info', focusRef, live = true }: { title?: string; children: ReactNode; kind?: 'info' | 'error' | 'success' | 'loading'; focusRef?: RefObject<HTMLDivElement | null>; live?: boolean }) {
  return <div className={`feedback feedback-${kind}`} tabIndex={focusRef ? -1 : undefined} ref={focusRef}
    role={live ? (kind === 'error' ? 'alert' : 'status') : undefined}>
    {title && <p className="label">{kind === 'success' && <span className="feedback-symbol" aria-hidden="true">✓ </span>}{title}</p>}<div className="small feedback-body">{children}</div>
  </div>;
}
export function ErrorSummary({ errors, labels, summaryRef, title = 'Revisa los campos indicados' }: { errors: Errors; labels: Record<string, string>; summaryRef: RefObject<HTMLDivElement | null>; title?: string }) {
  if (!Object.keys(errors).length) return null;
  return <div className="feedback feedback-error" tabIndex={-1} ref={summaryRef} aria-labelledby="error-summary-title" role="alert">
    <p className="label" id="error-summary-title">{title}</p>
    <ul className="error-links small">{Object.entries(errors).map(([id, error]) => <li key={id}>
      <a href={`#${id}`} onClick={event => { event.preventDefault(); document.getElementById(id)?.focus(); }}>{labels[id] ?? id}: {error}</a>
    </li>)}</ul>
  </div>;
}
export function Actions({ primary, secondary, className = '' }: { primary: ReactNode; secondary?: ReactNode; className?: string }) {
  return <div className={`actions ${className}`}>{primary}{secondary}</div>;
}
