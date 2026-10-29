# Aurora Seguros · preparación de publicación

Estado: versión candidata local. Ivan creó el repositorio privado `IRushl/aurora-seguros-ux` y autorizó preparar Git y un commit local en la raíz existente. Primer push pendiente de autorización; Vercel sin publicar. La aplicación no amplía el alcance comercial del ejercicio. Estado operativo: [GITHUB.md](GITHUB.md).

## Paquete para revisión

Los paquetes `outputs/aurora-seguros-source.zip` y `outputs/aurora-release/` conservan la versión de entrega anterior a la preparación de Git. La raíz del proyecto contiene la documentación y el .gitignore vigentes para el primer commit. Se incluyen fuentes, lockfile, configuraciones, recursos vectoriales, pruebas y documentos técnicos seleccionados; se excluyen AGENTS.md, PDF original, diagnóstico interno, notas de coordinación, cachés, node_modules, outputs, work, archivos .env y credenciales. Ningún original interno se elimina.

El listado y los hashes se registran en `work/qa/source-manifest.json`. QA y capturas se entregan aparte. `dist/` se genera con el build, no se incorpora al repositorio. El prototipo mantiene datos en sessionStorage por pestaña, sin backend o analítica externa.

## Configuración preparada

| Campo | Valor |
| --- | --- |
| Repositorio autorizado | https://github.com/IRushl/aurora-seguros-ux.git |
| Visibilidad declarada por Ivan | Privado |
| Framework | Vite |
| Node.js | 24.x, fijado en package.json y .nvmrc |
| Instalación | npm ci |
| Build | npm run build |
| Directorio publicado | dist |
| Directorio raíz | . |
| Variables de entorno | Ninguna requerida |
| Navegación | Hash: inicio / asegurados / planes / resumen |

Node 24.x y su selección mediante engines están documentados por [Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). La plataforma dispone de [integración para Vite](https://vercel.com/docs/frameworks/frontend/vite). La configuración local no prueba un despliegue remoto; ese control se realizará después de la autorización.

## Sincronización y despliegue: autorizaciones separadas

1. Preparar Git en la raíz existente, revisar exclusiones, pruebas y archivos del primer commit local.
2. Comprobar de nuevo el remoto antes del push. Si aparecen commits, integrarlos sin forzar ni sobrescribir el historial. Subir únicamente tras la autorización expresa del primer push y verificar la referencia remota.
3. Solo con autorización independiente para Vercel: importar el repositorio y comprobar el build remoto con la configuración indicada.
4. Abrir la URL pública en una pestaña nueva y verificar recursos, responsive, recorrido, datos, reinicio y escenarios de evaluación.
5. Registrar commit, URL, revisión del despliegue y smoke test público antes de compartir enlaces finales.

No ejecutar esa secuencia sin autorización. Las capturas, fixtures y parámetros de revisión no son tarifas reales ni una oferta comercial. QA_FINAL.md registra los resultados locales y los controles pendientes.


## Comprobación del paquete

Instalación npm ci y build completados en una carpeta limpia con Node v24.14.0 sobre Windows. La descarga de dependencias se autorizó después de que la primera instalación offline encontrara Vite ausente en caché. Las fuentes ejecutables/configuración coinciden con la versión final. Cuatro smoke sobre ese dist (1440/768/390/320) conservan 55/33/20, Plus $285.000 COP, recarga y reinicio. No equivale al build Linux/remoto o a una URL pública; se comprobarán tras autorizar el despliegue.
