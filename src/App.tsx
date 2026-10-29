import { useLayoutEffect } from 'react';
import { useJourney } from './hooks/useJourney.ts';
import { Feedback, Header, Progress } from './components/ui.tsx';
import { Inicio } from './screens/Inicio.tsx';
import { Asegurados } from './screens/Asegurados.tsx';
import { Planes } from './screens/Planes.tsx';
import { Resumen } from './screens/Resumen.tsx';

export default function App() {
  const journey = useJourney();
  const { step, focusVersion } = journey;
  useLayoutEffect(() => {
    document.getElementById('page-title')?.focus({ preventScroll: true }); window.scrollTo(0, 0);
    document.title = `${{ inicio: 'Inicio', asegurados: 'Asegurados', planes: 'Planes', resumen: 'Plan seleccionado' }[step]} | Aurora Seguros`;
  }, [step, focusVersion]);
  return <>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Saltar al contenido</a><Header />
    <main key={step} id="main-content" tabIndex={-1} className={`container main-content page-${step} ${step === 'planes' && journey.state.selectedPlan ? 'has-selection' : ''}`}>
      {step !== 'resumen' && <Progress step={step} />}
      {journey.storageUnavailable && <Feedback>No pudimos conservar el progreso al recargar esta pestaña. Puedes continuar con el recorrido abierto.</Feedback>}
      {step === 'inicio' && <Inicio journey={journey} />}
      {step === 'asegurados' && <Asegurados journey={journey} />}
      {step === 'planes' && <Planes journey={journey} />}
      {step === 'resumen' && <Resumen journey={journey} />}
    </main>
  </>;
}
