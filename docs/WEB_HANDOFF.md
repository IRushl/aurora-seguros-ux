# Handoff técnico · Aurora Salud Flex

## Fuente y composición

UI y arquitectura aprobadas; limpieza editorial aplicada en Figma 05/06. Inter 400/700 local, paleta y variables semánticas del archivo. Los doce frames principales conservan sus IDs. `src/design/figma-tokens.json` y `scripts/generate-tokens.mjs` producen los tokens CSS. Sin imágenes de pantallas como interfaz.

Referencia 1440: contenido máximo 1152; S01 dos columnas de 528, separación 96. S02 columnas 736/384 y separación 32. Referencia 768: márgenes 48, formulario/contacto apilados, pares de campos y tabla de comparación con tarjetas compactas. Referencia 390: márgenes 24, una columna y tarjetas completas. Breakpoints de implementación: 768 y 1200, con anchuras fluidas intermedias.

S03 reserva espacio según altura real de la selección fija mediante ResizeObserver, más margen y safe-area. El componente no depende del final de las tarjetas. Selección identificada con texto, `aria-pressed`, borde y superficie. D01 no es un cuarto paso comercial.

## Estado y transiciones

`JourneyState` contiene contacto, aceptación del primer avance, cantidad/edades, firma de configuración confirmada, estado de catálogo e ID seleccionado. No almacena un precio calculado: S03/D01 derivan el total desde PLANS y la configuración. No contiene información clínica. Cambiar un dato previo relevante invalida resultados dependientes; conservar valores no equivale a conservar una confirmación obsoleta.

La firma identifica cantidad/edades con valores numéricos. Entrada directa sin contacto aceptado vuelve a Inicio; sin configuración válida vuelve a Asegurados; sin plan/catálogo vigente, el cierre vuelve a Comparación. Selección permanece en S03; solo Ver resumen de mi elección abre D01. Regreso conserva contexto. Reinicio borra `sessionStorage`, React, selección, errores, carga y cola de solicitudes. Historial no elude las guardas.

Persistencia limitada a la pestaña; conserva recarga. Restauración valida versión, tipos, límites, plan y coherencia de firma. Almacenamiento bloqueado permite continuar en memoria con aviso contextual. No se envían valores a ningún servicio o herramienta de analítica.

## Concurrencia y errores

Una referencia síncrona impide solicitudes simultáneas, incluso antes del siguiente render. AbortController + contador de generación cancelan/ignoran respuestas anteriores tras navegar o reiniciar. Los inputs permanecen legibles en espera; submit deshabilitado solo durante un intento en curso. Cada intento de servicio tiene una marca de performance local, sin PII. Los errores controlados de las URLs de README son reproducibles y recuperables.

## Accesibilidad

Etiquetas nativas, tipos/inputMode/autocomplete; `aria-invalid` y `aria-describedby` para errores. Al enviar inválido, foco al resumen; enlaces llevan al control correcto. Validar al salir de un campo editado no mueve el foco. Cambio de pantalla enfoca H1; selección se anuncia sin desplazar foco. Botones y navegación semánticos, foco visible exterior, ayuda expandible no modal y enlace para saltar al contenido. La comparación tablet es una tabla con encabezados asociados; las tarjetas mantienen nombres y características equivalentes.

Pruebas automatizadas y de teclado no constituyen por sí solas conformidad completa WCAG ni prueba con lector de pantalla. El informe QA separa resultados y límites.

## Reglas técnicas y límites comerciales

Nombre Unicode sin obligar apellidos; correo sintáctico; celular diez dígitos y prefijo +57 opcional. Cantidad 1–20 y edad entera 0–130 son supuestos técnicos acotados del prototipo, no suscripción o elegibilidad comercial. Cero años admitido. El catálogo es ficticio, con precios ilustrativos en COP; ver CATALOGUE.md. La base mensual se multiplica por cantidad, sin factor de edad. D01 usa selección/cantidad/edades del usuario; su registro es local. Los pasos Detalles, Titular, Confirmación y Pago son texto informativo sin controles comerciales.

## Ejecución y publicación

README contiene comandos reproducibles, escenarios y estructura. Compilar con `npm run build`; salida `dist`. GitHub/Vercel preparados, sin subir ni publicar. Sin secretos ni archivos personales en el paquete de código. El backend, servicios comerciales, instrumentación productiva y pruebas con personas permanecen fuera de esta versión.

## Evolución de producto v2

S01 añade SVG original `public/salud-flex.svg`, descripción del recorrido, propósito de contacto y FAQ bajo el formulario. El recurso es local, vectorial y tiene dimensiones intrínsecas; 320×160 en desktop y 160×80 en tablet/mobile. No desplaza el CTA con una fotografía de gran tamaño.

S02 representa cada persona, permite agregar/eliminar y conserva las restantes edades; el foco pasa al nuevo campo o al anterior al eliminar. La cantidad directa sigue disponible. Los errores se recalculan al quitar una persona. Cambios invalidan resultados dependientes.

`useValidation.reconcile` reasigna campos editados y errores visibles cuando cambian los índices. Eliminar una persona borra su error y desplaza el de las siguientes; no muestra errores prematuros en campos sin revisar. La cantidad conserva validación al blur y envío.

S03 amplía PlanCard y añade PlanDetails; `details/summary` nativos, sin modal ni ruta nueva. Desktop mantiene tres columnas; tablet usa una tabla de diferencias y tarjetas verticales sin repetir la lista principal; mobile tarjetas completas. Precio, contexto y prestaciones comparten dominio con D01. La selección fija usa su altura real incluso al ampliar texto o abrir detalles. Cerrar detalle conserva la selección; al volver desde D01 puede mostrarse contraído.

`catalogRevision` invalida confirmación/catálogo/selección de una versión anterior, preservando contacto y edades. Se mantiene la clave de sesión v1 como contenedor compatible; no se promete continuidad de una selección cuyo catálogo cambió. `monthlyTotal` y `planFeatures` evitan información fija o duplicada en D01.

Figma 05/06 actualizado con doce IDs principales conservados, componentes nativos y tres estados expandidos. Sus formularios son fixtures de 2 personas 34/58; no son un motor de entradas. Variables de selección actualizan nombre, importe y prestaciones; reinicio también limpia las variables nuevas. La funcionalidad dinámica se comprueba en React con acciones reales y recarga. Las diferencias menores de rasterización y tamaño de controles nativos se registran en las comparativas; no se declara igualdad de píxel.

## Contrato vigente v3 — identidad y microinteracciones

Se conserva arquitectura, estado, catálogo y rutas. Cabecera: SVG horizontal original de 221×40; texto accesible único, sin un reinicio implícito al pulsar la marca. Favicon vectorial. Figma mantiene logo editable con cuatro variantes y el mismo recurso exportado se usa en React.

Los nuevos textos están en UX_COPY.md. El formulario muestra Comencemos con tus datos en los tres tamaños. Mobile usa ilustración 128×64 y separación 16 para mantener Cotizar completo en 390×844; tablet y desktop conservan su composición. S03 usa Ver resumen de mi elección y D01 Comenzar de nuevo, preservando las transiciones anteriores.

Disclosure.tsx mantiene details/summary; Web Animations API 200 ms cancelable, reversible y sin bloquear selección/navegación. CSS usa tokens 150/180/200 ms; prefers-reduced-motion cancela movimiento activo y elimina giro, escala y transiciones. La barra fija no tiene un ancestro animado con transform. Los mensajes conservan contraste completo, incluso durante su entrada. Ver MOTION.md.

Servicio local normal sin temporizador artificial. Solo los parámetros documentados activan demora/fallo/vacío. createSimulation valida la lista de escenarios; valores desconocidos usan flujo normal. Slow-catalog y slow-contact muestran 2,2 s en su etapa; otras respuestas de revisión 350 ms. QA_SCENARIOS.md describe los doce estados. Sin nuevo panel técnico visible.

Figma 05/06: 40 vistas (38 conservadas + procesamiento S02 y fallo de catálogo), doce IDs principales, 48 componentes y tres tokens de duración. Se verifican geometría, contenido y reacciones; las capturas no certifican motion temporal ni una implementación de formularios dinámicos en Figma. La web es referencia funcional. Sin alteraciones en páginas documentales aprobadas.

## Correcciones finales aceptadas

S03 vacío usa status informativo: consulta completada sin resultados, con Revisar personas y Actualizar opciones. Fallo usa alert y explica problema de carga, con Reintentar carga y Revisar personas. Ambas rutas conservan cantidad/edades y evitan selección ficticia. Son escenarios distintos, no reglas de elegibilidad.

Disclosure mantiene estado explícito para aria-expanded, un ID único useId/aria-controls y etiqueta abierta Ocultar detalles del plan. Cerrar/revertir y movimiento reducido actualizan estado/etiqueta sin esperar a otra navegación. Se conserva la semántica details/summary y se sincronizan aperturas nativas externas.

S02 conserva columnas y formulario aprobados; contacto plegado en una superficie discreta sin sombra. Abrir permite leer valores y Editar datos en Inicio conserva la sesión. Los estados extremos de cantidad y edad se verifican sin inventar reglas comerciales. S02 no requirió cambio adicional de dominio después de las pruebas de coherencia.

Figma actualiza únicamente estas correcciones: contacto reutilizable, etiqueta abierta y vacío/fallo. Doce frames principales preservados, 41 vistas con un estado de contacto expandido y 50 componentes. QA_FINAL.md y RELEASE.md son la referencia final de comprobación y preparación.
