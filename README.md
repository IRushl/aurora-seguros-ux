# Aurora Seguros · Seguro Salud Flex

Aplicación React + TypeScript + Vite basada en el [Figma aprobado](https://www.figma.com/design/PbI8RstoZhAILmhjxQ1BV3?node-id=124-1360). Incluye Inicio, Asegurados, Comparación y Resumen. Aurora Seguros es ficticia; esta es una prueba de producto, sin backend comercial.

## Ejecutar

Node.js 24.x, fijado para mantener el mismo entorno local y de publicación. Instalar dependencias bloqueadas por `package-lock.json`:

```sh
npm ci
npm run dev
```

Abrir la URL que muestra Vite (por defecto `http://127.0.0.1:5173`). Usar datos de ejemplo como `Alex`, `alex@example.com`, `3000000000`; la aplicación no transmite los datos a un servidor.

Producción local:

```sh
npm run build
npm run preview
```

## Probar

```sh
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

Las pruebas de navegador utilizan la compilación de producción en el puerto 4173. Si existe un navegador instalado por este entorno en `work/pw-browsers`, el lanzador lo reutiliza. En una copia nueva, Playwright usa su instalación habitual. Reporte JSON y trazas de errores: `work/qa/`. No se incluyen en el repositorio.

Escenarios reproducibles: abrir una URL con el parámetro indicado y completar el recorrido. Cada falla ocurre en el primer intento y permite reintentar. Reiniciar restablece el escenario.

| URL | Comportamiento |
| --- | --- |
| `/?scenario=contact-failure` | Fallo recuperable al continuar desde Inicio |
| `/?scenario=slow-contact` | Espera de 2,2 s para comprobar envíos repetidos y cancelación |
| `/?scenario=catalog-failure` | Fallo de carga de alternativas, con reintento |
| `/?scenario=catalog-empty` | Respuesta sin alternativas; recuperación con reintento |

Sin escenario, no hay espera artificial. Los escenarios de revisión usan 350 ms por respuesta y 2,2 s en la etapa marcada como lenta; son controles para demostrar estados, no mediciones de una integración real. No hay un panel técnico visible en el recorrido.

## Datos, guardas y alcance

- Estado React y `sessionStorage`, clave `aurora.journey.v1`: conserva valores y selección en la misma pestaña, incluso al recargar. Cerrar la pestaña termina esa sesión. No se promete recuperación entre dispositivos.
- Reiniciar elimina el estado guardado y vuelve a Inicio sin errores; navegación histórica y respuestas pendientes no restauran una selección anterior.
- Elegir un plan permanece en Comparación. La región fija muestra selección y **Ver resumen de mi elección**. Volver conserva el contexto; cambiar asegurados invalida resultados y selección anteriores. El resumen usa los valores actuales.
- Guardas de contexto para `#inicio`, `#asegurados`, `#planes`, `#resumen`; datos corruptos o IDs desconocidos no fabrican una confirmación.
- Validación de nombre con escritura Unicode y una sola palabra admitida; correo por formato; celular de diez dígitos con prefijo +57 opcional. No verifica identidad, entregabilidad ni titularidad.
- Cantidad de 1 a 20 y edad entera de 0 a 130 son límites técnicos de esta implementación, **no reglas de elegibilidad de Aurora**. El límite de personas evita generar formularios sin cota; el de edad controla entradas plausibles. Requieren confirmación antes de un producto real.
- Tres alternativas ficticias Esencial/Plus/Premium en `src/domain.ts`; precio ilustrativo = base por persona × cantidad. Las edades no cambian el importe; no es prima actuarial ni cotización vinculante. Catálogo, límites y exclusiones: [CATALOGUE.md](docs/CATALOGUE.md). Una aclaración contextual en S03; D01 informa que la contratación no se ha realizado. Sin llamadas, pagos, OTP, pólizas ni analítica externa.
- Marcas `performance` locales registran intentos de servicio sin datos personales para verificar duplicados; no se envían a terceros.

## Organización

```text
src/components/     Button, Field, Feedback, Progress, planes y selección fija
src/screens/        Inicio, Asegurados, Planes, Resumen
src/hooks/          Navegación, concurrencia y validación
src/services/       Respuestas locales y fallos reproducibles
src/domain.ts       Estado, reglas, comparación ilustrativa y guardas
src/persistence.ts  Restauración defensiva y limpieza de sesión
src/design/         Exportación de variables Figma
src/styles/         Tokens generados y composición responsive
tests/              Lógica y escenarios reales de navegador
docs/WEB_HANDOFF.md  Contrato técnico y límites
docs/QA_WEB.md       Resultados verificados de esta versión
```

`npm run tokens` regenera CSS desde la exportación de Figma. No se usa Tailwind ni un sistema visual alternativo. Inter 400/700 se sirve desde los archivos del proyecto.

## Preparado para GitHub y Vercel

Repositorio de destino creado por Ivan: [IRushl/aurora-seguros-ux](https://github.com/IRushl/aurora-seguros-ux), privado según su indicación. Primer push pendiente de autorización; no hay despliegue en Vercel. `vercel.json` declara Vite, `npm ci`, `npm run build` y `dist`. La navegación por hash funciona como sitio estático y no requiere rutas de backend.

El código versionable incluye fuentes, recursos, pruebas, configuración, lockfile y documentación técnica seleccionada. No incluye `node_modules`, cachés, capturas de trabajo, PDF fuente, notas personales, credenciales o documentación interna del proceso de selección. `.gitignore` conserva esa separación; los originales internos permanecen en el espacio de trabajo. El push y la publicación en Vercel requieren autorizaciones independientes.

Referencias de implementación: [Vite](https://vite.dev/guide/), [entradas controladas de React](https://react.dev/reference/react-dom/components/input). Las versiones exactas usadas están fijadas en el lockfile.

## Catálogo y evidencia v2

Catálogo y reglas: [CATALOGUE.md](docs/CATALOGUE.md). Base por persona: Esencial $55.000, Plus $95.000, Premium $145.000 COP/mes. Ejemplo de 3 personas de 55/33/20 años: Plus $285.000 COP/mes; todas las prestaciones y condiciones son ficticias. El SVG es original del proyecto. FAQ y detalles usan disclosures HTML nativos. Agregar/eliminar personas conserva los demás datos y limpia una selección obsoleta.

Suite actual: 17 pruebas de lógica y 61 E2E. Incluye seis regresiones de edades, tres detalles responsive y edición de personas. Para capturas de evidencia: `node scripts/capture-evolution.mjs` con preview local activo y Chromium instalado. No se ha publicado esta evolución.

## Identidad, copy y motion v3

SVG original en la cabecera y favicon; recursos en public/brand y licencia Inter incluida. Guías: [BRAND.md](docs/BRAND.md), [UX_COPY.md](docs/UX_COPY.md), [MOTION.md](docs/MOTION.md) y [QA_SCENARIOS.md](docs/QA_SCENARIOS.md).

Acciones vigentes: Ver planes disponibles → Ver resumen de mi elección → Volver a comparar / Comenzar de nuevo. Catálogo, fórmula y conservación de edades sin cambios. Acordeones nativos con animación reversible de 200 ms, botones 150 ms y mensajes 180 ms; movimiento reducido elimina animación sin perder acciones. Texto de errores siempre a contraste completo.

Para revisar carga de planes: `/?scenario=slow-catalog` (2,2 s); carga de contacto: `/?scenario=slow-contact`. Flujo normal inmediato, sin spinner o espera añadida. Los doce estados se reproducen según QA_SCENARIOS.md. Suite final: 17 pruebas de lógica y 61 de navegador. No publicado.

## Versión candidata · QA final

Arquitectura y UI aprobadas, con correcciones puntuales aceptadas. El contacto de S02 queda plegado con revisión/edición; S03 distingue consulta vacía de problema de carga, y los detalles alternan Ver/Ocultar con aria-expanded y aria-controls. Cantidad y acciones de personas conservan edades y precio en los límites de la demostración.

Resultados: [QA_FINAL.md](docs/QA_FINAL.md). Preparación y autorización de publicación: [RELEASE.md](docs/RELEASE.md). Vacío ofrece Revisar personas / Actualizar opciones; fallo ofrece Reintentar carga / Revisar personas. El flujo normal y el catálogo ficticio conservan su alcance.
