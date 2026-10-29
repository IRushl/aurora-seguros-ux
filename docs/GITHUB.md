# GitHub | preparación del primer push

Destino autorizado: [IRushl/aurora-seguros-ux](https://github.com/IRushl/aurora-seguros-ux). Repositorio privado según Ivan. No se cambia de repositorio y no se crea otro.

## Estado de esta preparación

- Git inicializado en la raíz de la aplicación existente; rama local `main`.
- `origin` apunta a `https://github.com/IRushl/aurora-seguros-ux.git`.
- La consulta inicial `git ls-remote --symref` respondió correctamente y no devolvió referencias: sin commits o ramas publicados en ese momento. Debe repetirse justo antes del push.
- La consulta Git funcionó mediante el gestor de credenciales configurado, sin solicitar ni mostrar contraseñas o tokens.
- Autor del commit configurado únicamente en este repositorio: `IRushl`, con dirección noreply asociada al ID público de GitHub. No se cambia la identidad global de Git.
- Comprobación ejecutada sobre la aplicación existente: `npm run test:all`; 17 pruebas de lógica y 61 de navegador aprobadas, con compilación TypeScript/Vite correcta.
- Primer commit local preparado; autorización del primer push y verificación remota pendientes. Este documento describe la preparación, no una sincronización completada.

## Contenido previsto

Fuentes React/TypeScript y CSS/tokens; SVG y licencia tipográfica; configuraciones Vite, TypeScript, Node 24 y Vercel; package.json y lockfile; pruebas unitarias/E2E, scripts de captura y documentación técnica seleccionada.

`.gitignore` excluye dependencias, dist, reportes/trazas, .env, credenciales, claves privadas, configuración local de autenticación, temporales, work, outputs y documentos internos. La documentación interna de investigación, coordinación y evidencia se conserva localmente; no se elimina. Las fuentes del prototipo y las pruebas solo usan fixtures identificados como datos de ejemplo.

Revisión del contenido versionable: sin coincidencias confirmadas con patrones de tokens conocidos, claves privadas, secretos asignados o credenciales embebidas en URLs. Los correos completos de las pruebas pertenecen a example.com. No se incluyen volcados de sessionStorage, trazas, capturas ni formularios introducidos durante revisión. Es una revisión de archivos y patrones, no una certificación externa de secretos. `.gitattributes` normaliza el índice a LF sin cambiar el comportamiento ni reconstruir fuentes.

## Después de aprobar el push

1. Reconsultar HEAD y ramas remotas. Si ya existen commits, hacer fetch y revisar el historial antes de sincronizar, sin force push.
2. Subir la rama principal acordada al mismo origin.
3. Comparar el hash local con la referencia remota y comprobar que GitHub permite recuperar los archivos del commit. Registrar resultado en el seguimiento local; un comando push sin verificación no cierra la tarea.

## Autenticación si la sesión caduca

Usar Git Credential Manager ya configurado: el flujo oficial de inicio de sesión se abre en el navegador del equipo. Ivan completa personalmente el acceso y cualquier segundo factor. No pegar contraseñas, códigos o tokens en el chat ni incorporarlos a la URL del remoto. La preparación no necesita un archivo .env.

## Vercel

Preparado localmente: framework Vite, Node 24.x, instalación `npm ci`, build `npm run build`, salida `dist`, raíz `.`, sin variables de entorno requeridas. El despliegue y el smoke remoto siguen pendientes y requieren autorización independiente. Ver [RELEASE.md](RELEASE.md).
