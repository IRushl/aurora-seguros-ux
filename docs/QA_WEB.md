# Verificación web vigente

Versión candidata local: consultar [QA_FINAL.md](QA_FINAL.md). La evidencia anterior se conserva en outputs/archive.

## Resultado de la ronda final

| Control | Aprobadas | Fallidas | Alcance |
| --- | ---: | ---: | --- |
| Pruebas de lógica | 17 | 0 | Validación, estado, guardas, catálogo, precio y persistencia |
| Navegador Chromium | 61 | 0 | Flujo real, límites, integridad, estados, teclado y responsive |
| Análisis axe | 25 | 0 | Reglas ejecutadas de WCAG 2.x A/AA, incluidos vacío/fallo y contacto expandido |
| Smoke del paquete limpio | 4 | 0 | S01→S02→S03→D01 en 1440/768/390/320 |

Compilación de producción local: correcta. Instalación reproducible: Aprobada: npm ci y build en una carpeta limpia con Node 24. La primera comprobación offline encontró un paquete ausente en caché; se completó con descarga autorizada del lockfile.

Primera ronda: 60/61 pruebas de navegador aprobadas. El único fallo correspondió a un selector de test que apuntaba a dos regiones status; se acotó al mensaje de feedback. La ronda final completa pasa sin omisiones ni casos inestables. El script de captura de foco se ajustó para navegar con Tab después del uso del ratón; se verificó el foco de teclado real.

## Correcciones aceptadas y verificadas

| ID | Situación anterior | Resultado |
| --- | --- | --- |
| C01 | Vacío y fallo compartían estilo de error, explicación y acciones | Vacío informativo: consulta sin resultados, Revisar personas / Actualizar opciones. Fallo anunciable: problema de carga, Reintentar carga / Revisar personas |
| C02 | El detalle abierto conservaba la etiqueta Ver | Alterna Ver/Ocultar detalles del plan, aria-expanded refleja la intención y aria-controls enlaza un cuerpo único. Teclado, reversión y movimiento reducido conservados |
| C03 | Datos de contacto visibles en una tarjeta de alto protagonismo | Resumen discreto plegado, sin sombra, con revisión y edición de valores en Inicio |
| C04 | Preparación de entorno genérica | Node 24.x fijado en package/lock/.nvmrc; instalación npm ci y salida dist configuradas para Vercel |

S02 no mostró un defecto adicional de sincronización en las pruebas ejecutadas: cantidad válida = número de filas; Agregar/Eliminar actualizan cantidad y mantienen las edades restantes. Entradas inválidas no avanzan ni generan filas sin cota. Se probaron 0, 21, negativos, decimales, texto y vacío; 1/20 personas y edades 0/130 válidas como límites de demostración, 131 inválida. Quitar una fila intermedia reindexa sus datos y errores.

## Integridad y recorrido

55/33/20 se conserva al escribir, pegar, regresar, recargar y llegar a D01. Plus para tres personas = $285.000 COP/mes. Premium para veinte = $2.900.000; el mismo plan para una persona de 0 o 130 años = $145.000, sin factor por edad. Importes ficticios y deterministas; no elegibilidad comercial.

Se comprobaron validaciones, resumen de errores/foco/enlaces, corrección, procesamiento reproducible, prevención de duplicados, falla/reintento, catálogo vacío, navegación, persistencia por pestaña, cambio de plan, invalidación de selección y reinicio con historial protegido. El CTA Ver resumen de mi elección abre D01 con contexto vigente.

## Responsive, accesibilidad y motion

Navegador en 1440, 768, 390 y 320 px, más cinco anchos intermedios/adyacentes de la regresión. Sin scroll horizontal indebido en los escenarios probados. Barra fija estable; reserva de espacio y foco comprobados, también con texto al 200%. En el final del documento, el último control queda por encima de la barra y puede activarse.

Etiquetas asociadas, mensajes status/alert diferenciados, foco visible, Enter/Espacio en acordeones y edición de contacto accesible. aria-controls existe y es único por instancia. Movimiento reducido cancela animaciones en curso y conserva estado. Los errores mantienen contraste durante toda su entrada.

Hover medido: rgb(22, 123, 120) → rgb(16, 99, 96); pressed: rgb(13, 81, 79), escala 0,99; foco de teclado: borde exterior de 3px. Sin animación decorativa nueva. Carga solo en escenarios explícitos; flujo normal sin temporizador artificial.

## Correspondencia con Figma

Los doce frames principales y la arquitectura aprobada se conservan. Se modifican únicamente las especificaciones aceptadas de contacto, detalle abierto y vacío/fallo; se agrega un estado de contacto expandido. 41 vistas nativas, geometría sin incidencias, 50 componentes. Las capturas son evidencia, no sustituyen capas editables.

[Contacto S02](https://www.figma.com/design/PbI8RstoZhAILmhjxQ1BV3?node-id=122-13516) · [Contacto expandido](https://www.figma.com/design/PbI8RstoZhAILmhjxQ1BV3?node-id=287-2448) · [Vacío](https://www.figma.com/design/PbI8RstoZhAILmhjxQ1BV3?node-id=122-14950) · [Fallo](https://www.figma.com/design/PbI8RstoZhAILmhjxQ1BV3?node-id=234-2404) · [Detalle abierto](https://www.figma.com/design/PbI8RstoZhAILmhjxQ1BV3?node-id=185-2130).

Doce comparativas mantienen las referencias 1440/768/390; 320 es verificación adicional en web. S03 compara el mismo viewport visible. Se aceptan diferencias menores de rasterización y geometría de controles nativos; no se declara igualdad de píxel. Figma utiliza fixtures de formulario; la web ejecuta entradas dinámicas. Se inspeccionan conexiones, sin afirmar Play manual de todas las transiciones Figma.

## Evidencia y pendientes

Capturas: outputs/qa/final contiene cuatro formatos de contacto, vacío, fallo, detalle y resumen; estados hover/focus/pressed. outputs/qa contiene las comparativas principales. Reportes reproducibles y manifest en work/final-qa y work/qa.

No quedan bloqueos funcionales confirmados en los escenarios ejecutados. Controles pendientes: build y smoke remotos después de autorizar publicación; Safari/Firefox, dispositivos físicos y lector de pantalla; validación con personas. No se declara conformidad WCAG completa ni efecto comercial. El catálogo y los límites siguen siendo demostrativos.

## Checklist y publicación

Correcciones, QA y preparación local completadas; autorización/publicación, comprobación de URL pública, ensayo oral y envío de enlaces pendientes. RELEASE.md describe el paquete, la configuración y la secuencia posterior a la aprobación. No se creó repositorio remoto ni despliegue. Esta versión no amplía las siete etapas comerciales del seguro.
