import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
const env = { ...process.env };
const localBrowserCache = path.resolve('work/pw-browsers');
if (existsSync(localBrowserCache)) env.PLAYWRIGHT_BROWSERS_PATH = localBrowserCache;
const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], { stdio: 'inherit', env });
child.on('exit', code => process.exit(code ?? 1));
