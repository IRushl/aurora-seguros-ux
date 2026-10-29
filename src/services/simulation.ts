export type Scenario = 'contact-failure' | 'catalog-failure' | 'catalog-empty' | 'slow-contact' | 'slow-catalog' | null;
export function createSimulation(scenario: Scenario) {
  const review = ['contact-failure', 'catalog-failure', 'catalog-empty', 'slow-contact', 'slow-catalog'].includes(scenario ?? '') ? scenario : null;
  const attempts = new Map<string, number>();
  return {
    reset() { attempts.clear(); },
    async request(stage: 'contact' | 'catalog', signal: AbortSignal): Promise<'ready' | 'empty'> {
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      const attempt = (attempts.get(stage) ?? 0) + 1; attempts.set(stage, attempt);
      // Local, PII-free observability. No telemetry or network calls.
      globalThis.performance?.mark(`aurora:${stage}:request`);
      // The normal local path has no artificial timer. Latency belongs only to explicit QA scenarios.
      const delay = review === `slow-${stage}` ? 2200 : review ? 350 : 0;
      if (delay) await new Promise<void>((resolve, reject) => {
        const abort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
        const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); },
          delay);
        signal.addEventListener('abort', abort, { once: true });
      });
      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      if (attempt === 1 && review === `${stage}-failure`) throw new Error('Simulated recoverable failure');
      if (attempt === 1 && stage === 'catalog' && review === 'catalog-empty') return 'empty';
      return 'ready';
    },
  };
}
