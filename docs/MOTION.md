# Motion y microinteracciones · contrato v3

El movimiento comunica cambios de estado y conserva la posibilidad de actuar. No añade etapas, esperas al flujo normal, efectos continuos o dependencias de animación.

| ID | Interacción | Duración | Comportamiento |
| --- | --- | ---: | --- |
| M01 | Botón / campo | 150 ms | Transición de fondo, borde y color; pressed inmediato con escala 0,99, foco visible independiente |
| M02 | Tarjeta de plan | 200 ms | Hover de borde/sombra, superficie seleccionada y focus-within. El contenedor no añade un Tab stop |
| M03 | Acordeón | 200 ms | Altura reversible y chevron; solo el resumen activa el cambio; texto a contraste completo |
| M04 | Error / información / éxito | 180 ms | Desplazamiento de 4 px al aparecer; no se difumina el texto ni se espera para enfocar o corregir |
| M05 | Pantalla / elección | 180 / 200 ms | Entrada discreta del contenido; cambio del texto de selección. La región fija permanece anclada al viewport |

Curva web: cubic-bezier(0.2, 0, 0, 1). Tokens CSS: --aurora-motion-fast, --aurora-motion-feedback y --aurora-motion-state. Figma mantiene tres variables de duración, expresadas en milisegundos y documentadas para código; sus reacciones utilizan segundos. No se afirma que Figma vincule automáticamente esas variables a la duración de una transición.

## Implementación

`Disclosure.tsx` conserva `details/summary` nativos. Clic, Enter y Espacio abren/cierran. Web Animations API anima altura; una generación cancela la respuesta anterior al invertir rápidamente el movimiento. No retrasa selección o navegación. Al cerrar se retiran temporalmente interacciones del contenido con inert; foco permanece en el resumen. Al desmontar se cancela la animación. Sin soporte de animación, el cambio es inmediato.

Con `prefers-reduced-motion: reduce`: CSS elimina animaciones, transiciones, giro y escala; el disclosure se resuelve inmediatamente. Cambiar la preferencia durante una animación cancela el movimiento y conserva el estado solicitado.

No se transforma el ancestro de la barra fija: la entrada se aplica a los demás hijos de main para no cambiar el bloque de referencia de position:fixed. La altura de la barra sigue reservándose mediante ResizeObserver, incluso con texto ampliado.

## Contraste y QA

Una primera prueba detectó contraste insuficiente durante el fundido de errores. Se retiró la interpolación de opacidad del contenido esencial; el texto permanece a su contraste final durante toda la entrada. La ronda final pasa los análisis axe ejecutados.

Pruebas: apertura/cierre rápido en tres formatos, Enter/Espacio, foco retenido, selección y edades conservadas, preferencia reducida durante un movimiento, ausencia de animaciones en ese modo y región fija anclada durante la entrada. Video demostrativo y capturas de carga en outputs/qa/interactions. No se sustituyen con ello pruebas de comprensión o de lector de pantalla.

Figma: disclosures con Smart Animate de 200 ms y botones con estados hover/pressed; se inspeccionaron las reacciones. Las capturas muestran estados en reposo y no prueban la animación temporal de Figma. La web es la referencia funcional y aplica la preferencia de movimiento reducido.

## Estado accesible de la versión candidata

El disclosure mantiene aria-expanded explícito y aria-controls hacia un ID único. Durante la apertura muestra Ocultar detalles del plan; al cerrar vuelve a Ver detalles del plan. La preferencia reducida y la reversión rápida conservan texto y estado. El contacto de S02 usa el mismo control, con Ocultar datos de contacto cuando está abierto. La barra fija y la navegación no cambian.
