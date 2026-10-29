# Catálogo ilustrativo · Seguro Salud Flex

Versión `illustrative-2026-10-v2`. Creado por Codex por solicitud expresa de Ivan para explorar una decisión de producto. **Ningún nombre de plan, importe, prestación, límite o exclusión de este catálogo procede de una tarifa oficial.**

## Procedencia del contenido

| Nivel | Contenido | Fuente / alcance |
| --- | --- | --- |
| Confirmado en el ejercicio | Aurora ficticia, Seguro Salud Flex; cantidad y edades; tres planes con precio mensual; detalles posteriores con coberturas, exclusiones y copagos | PDF pp. 1–2. No especifica catálogo, importes ni elegibilidad |
| Evidencia de comprensión | Menciones sobre cobertura, comparación y precio; necesidad de entender antes de introducir datos | Anexo C, pp. 6–7; ver E06 y DATA_AUDIT. No son resultados del nuevo diseño |
| Contenido educativo | Comparar antes de elegir; significado de medicina general, especialistas y límites por persona; explicar lo que seguiría después | Redacción del proyecto. No asesoramiento ni promesa comercial |
| Simulación autorizada | Esencial/Plus/Premium, precios, prestaciones, límites, condiciones y exclusiones indicados abajo | Decisión de diseño para el prototipo; pendiente de catálogo real para un producto comercial |

## Tres alternativas

Todos los importes están expresados en COP por persona al mes.

| ID estable | Nombre | Enfoque | Base mensual | Consultas generales | Especialistas | Hospitalización |
| --- | --- | --- | ---: | --- | --- | --- |
| A | Esencial | Medicina general | $55.000 | 2 por persona / mes | No incluidos | No incluida |
| B | Plus | Más consultas y especialidades | $95.000 | 4 por persona / mes | 2 por persona / mes | No incluida |
| C | Premium | Más consultas y estancia limitada | $145.000 | 6 por persona / mes | 4 por persona / mes | Hasta 3 días por persona / año |

No se presenta una opción como recomendada ni se atribuyen preferencias a perfiles de usuario sin validar. La persona decide según las diferencias visibles.

## Regla de precio

`total mensual del grupo = base mensual del plan × cantidad de personas confirmada`

Determinista, sin recargos, descuentos, impuestos añadidos o factores por edad. **No es una prima actuarial ni una cotización vinculante.** Las edades describen la configuración y permiten comprobar su conservación; no cambian el importe ni determinan elegibilidad.

Ejemplo verificable: 3 personas de 55, 33 y 20 años → Esencial $165.000, Plus $285.000 y Premium $435.000 COP/mes. Con 2 personas → $110.000, $190.000 y $290.000, respectivamente. Elegir otro plan recalcula desde el estado confirmado; no se almacena un precio obsoleto.

## Alcance del detalle

Medicina general representa orientación inicial sobre síntomas y seguimiento. Especialistas representa una consulta de una especialidad médica. La estancia de Premium representa habitación compartida y excluye procedimientos y medicamentos. Son descripciones ilustrativas.

Ninguna alternativa incluye urgencias, cirugías, medicamentos o exámenes diagnósticos en este catálogo. Esencial tampoco incluye especialistas ni hospitalización; Plus no incluye hospitalización. Estos ejemplos describen la simulación; no son exclusiones oficiales de Salud Flex.

Los límites son individuales, no compartibles ni acumulables. Mes y año se entienden como calendario. No se simulan red médica, copagos, carencias o autorizaciones; tampoco se supone que su ausencia en el prototipo signifique gratuidad o ausencia de condiciones en un seguro real.

Una sola aclaración contextual en S03 identifica catálogo y precios ficticios. D01 aclara que no hubo compra ni emisión. El detalle amplía información en S03, sin crear la pantalla comercial S04.

## Implementación y consistencia

Fuente ejecutable: `src/domain.ts` (`PLANS`, `monthlyTotal`, `planFeatures`, `formatCOP`). Precio y prestaciones de S03/D01 se derivan del mismo catálogo y configuración. `catalogRevision` invalida resultados de una versión anterior conservando contacto y edades, y exige consultar/seleccionar de nuevo.

S03 usa `details/summary` nativos: abre y cierra por clic, Enter o Espacio; no cambia selección ni navegación. Tres columnas en desktop; tabla compartida y tarjetas verticales compactas en tablet; tarjetas completas en mobile. La acción fija «Ver resumen de mi elección» conserva selección y grupo.

Figma conserva los doce IDs principales; componentes nativos de detalles/FAQ y tres estados expandidos. Las referencias visuales de Figma usan un fixture explícito de 2 personas de 34/58 años. Su prototipo actualiza plan, precio y prestaciones mediante variables; no ejecuta formularios dinámicos. La aplicación sí calcula con la sesión real, incluido 55/33/20. No se declara equivalencia funcional total entre Figma y React.

## Criterios de aceptación complementarios

| ID | Resultado verificado | Evidencia |
| --- | --- | --- |
| CA17 | S01 explica producto, recorrido y uso local de datos; hero compacto; FAQ debajo del CTA | Capturas 1440/768/390 y QA responsive |
| CA18 | Agregar/eliminar conserva edades restantes, contacto y orden; edición invalida selección | Prueba de eliminación de la persona intermedia y pruebas de lógica |
| CA19 | Tres nombres, importes, límites e inclusiones/exclusiones coherentes; advertencia única | PLANS, capturas y tests de fórmula |
| CA20 | Abrir/cerrar detalle conserva selección y permite continuar; contenido específico y teclado | Tres E2E de detalle y axe expandido |
| CA21 | S02, S03 y D01 conservan 55/33/20; precio Plus de 3 personas = $285.000 COP | Seis regresiones E2E + capturas de recorrido real en tres formatos |
| CA22 | Una revisión anterior del catálogo no restaura selección obsoleta | Test de restauración/migración |

CA01–CA16 y sus guardas, validaciones, carga, recuperación y reinicio se conservan. Los resultados de QA son técnicos; no prueban comprensión con personas ni mejora de conversión.
