import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/** Native details semantics; animation is optional, reversible and never gates an action. */
export function Disclosure({ summary, expandedSummary, children, className = '' }: { summary: ReactNode; expandedSummary?: ReactNode; children: ReactNode; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = `disclosure-${useId()}`;
  const details = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const desiredOpen = useRef(false);
  const generation = useRef(0);
  function finish(open: boolean) {
    const node = details.current; if (!node) return;
    node.open = open; node.dataset.state = open ? 'open' : 'closed'; node.style.overflow = '';
    setExpanded(open);
    if (body.current) body.current.inert = !open;
  }
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => { if (preference.matches) { generation.current++; animation.current?.cancel(); animation.current = null; finish(desiredOpen.current); } };
    preference.addEventListener('change', onChange);
    return () => { generation.current++; animation.current?.cancel(); preference.removeEventListener('change', onChange); };
  }, []);
  function toggle() {
    const node = details.current, content = body.current; if (!node || !content) return;
    const target = !desiredOpen.current; desiredOpen.current = target; setExpanded(target);
    const request = ++generation.current, start = node.getBoundingClientRect().height;
    animation.current?.cancel(); animation.current = null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof node.animate !== 'function') { finish(target); return; }
    node.open = true; content.inert = !target; node.dataset.state = target ? 'opening' : 'closing';
    const css = getComputedStyle(node);
    const border = parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
    const end = target ? node.getBoundingClientRect().height : node.querySelector('summary')!.getBoundingClientRect().height + border;
    node.style.overflow = 'hidden';
    const motion = node.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
    animation.current = motion;
    void motion.finished.then(() => { if (generation.current === request) { animation.current = null; finish(target); } }, () => { /* Reversal/unmount intentionally cancels the previous animation. */ });
  }
  return <details ref={details} className={`disclosure ${className}`} data-state="closed" onToggle={() => {
    const node = details.current;
    if (node && !animation.current && node.open !== desiredOpen.current) { desiredOpen.current = node.open; finish(node.open); }
  }}>
    <summary aria-expanded={expanded} aria-controls={contentId} onClick={event => { event.preventDefault(); toggle(); }}><span className="disclosure-label">{expanded && expandedSummary ? expandedSummary : summary}</span>
      <svg className="disclosure-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </summary><div className="disclosure-body" id={contentId} ref={body}>{children}</div>
  </details>;
}
