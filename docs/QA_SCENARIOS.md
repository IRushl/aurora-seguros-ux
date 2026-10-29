# Escenarios reproducibles · Aurora v3

Usar datos de ejemplo, por ejemplo Valeria / valeria@example.com / 3000000000. La aplicación es local, sin envío a una aseguradora. Reiniciar el recorrido limpia la pestaña y los intentos de los escenarios; la URL de revisión permanece para poder repetirlos.

| Estado | Cómo reproducir | Resultado esperado |
| --- | --- | --- |
| 1. Inicial | Abrir Inicio en una pestaña nueva o Comenzar de nuevo | Campos vacíos, sin errores prematuros |
| 2. Vacío | Pulsar Cotizar sin datos | Resumen de errores con foco; enlaces a los campos |
| 3. Incorrecto | Escribir 123 / correo@ / 12; salir del campo o enviar | Error específico y valor conservado |
| 4. Corrección | Corregir los tres campos después de un intento inválido | Desaparecen errores; mensaje Datos corregidos; Cotizar permite continuar |
| 5. Procesamiento | Abrir ?scenario=slow-contact o ?scenario=slow-catalog; completar y enviar la etapa correspondiente | Carga visible durante 2,2 s y prevención de duplicados |
| 6. Fallo recuperable | ?scenario=contact-failure o ?scenario=catalog-failure; completar el intento | Primer intento falla; Reintentar conserva valores y recupera |
| 7. Éxito y avance | Completar datos válidos y avanzar | S02 o S03 con contexto aceptado; cierre con confirmación local, no comercial |
| 8. Regreso conservado | Volver a Inicio desde S02 o Cambiar asegurados desde S03 | Recupera contacto y edades; editar invalida la selección dependiente |
| 9. Sin resultados | ?scenario=catalog-empty; completar contacto y personas | No encontramos planes para mostrar; Reintentar recupera el catálogo |
| 10. Selección / cambio | Elegir Plus y después Premium | Texto, borde, superficie y precio actualizados; Ver resumen de mi elección visible |
| 11. Resumen | Configurar 55, 33 y 20 años, elegir Plus y ver resumen | Tres edades completas y $285.000 COP/mes; regresar conserva elección |
| 12. Reinicio | En D01, Comenzar de nuevo; recargar o usar Atrás | Inicio vacío; no reaparece selección ni información anterior |

Ejemplos locales: http://127.0.0.1:4173/?scenario=slow-contact y http://127.0.0.1:4173/?scenario=slow-catalog. Fallos/vacío son exclusivos de revisión, no elegibilidad. En esos escenarios, las otras respuestas usan 350 ms; en el flujo normal no existe temporizador artificial. Elegir, abrir detalles, regresar y reiniciar son acciones inmediatas.

No se añadió un panel QA al recorrido: los parámetros existentes permiten evaluar estados sin introducir controles técnicos a la experiencia principal.

## Teclado, responsive y movimiento

Completar con Tab/Shift+Tab/Enter; activar enlaces de error y el salto al contenido. Abrir/cerrar FAQ y planes con Enter/Espacio; invertir el movimiento rápidamente; comprobar foco y selección. Activar movimiento reducido, incluso durante una apertura: estado correcto sin desplazamientos o giro.

Referencias 1440, 768 y 390 px; regresión también en 320, 640, 1024, 1199, 1200 y 1920. En 390 × 844 el CTA inicial completo permanece visible. Revisar texto al 200% y que la barra fija no cubra controles. Edades 55/33/20 comprobadas mediante pegado y escritura rápida, recarga, S03 y D01.

Suite: npm test; npm run build; npm run test:e2e. Capturas: scripts/capture-qa.mjs, scripts/capture-evolution.mjs y scripts/capture-interactions.mjs con preview local y Chromium instalados. Resultados y límites: QA_WEB.md.

## Acciones de la versión candidata

Estado vacío: No hay planes disponibles para mostrar; Revisar personas vuelve a S02 y Actualizar opciones vuelve a consultar. Fallo: No pudimos cargar los planes; Reintentar carga recupera y Revisar personas vuelve a S02. El contacto se revisa desde Revisar o editar mis datos, sin exponer valores completos inicialmente. En S03, summary alterna Ver/Ocultar detalles del plan y aria-expanded false/true; conserva selección.

Regresión final adicional: 20 personas con edades completas → Premium $2.900.000 COP; quitar una intermedia, reducir a tres y comprobar 55/33/20 + Plus $285.000. Una persona de 0 o 130 años conserva $145.000 en Premium. 131 años o cantidad inválida no avanzan. Estos límites son de demostración.
