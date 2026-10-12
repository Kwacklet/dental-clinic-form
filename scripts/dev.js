import { spawn, spawnSync } from 'node:child_process';

const apps = [
  { name: 'server', color: '\x1b[36m' },
  { name: 'client', color: '\x1b[35m' }
];
const reset = '\x1b[0m';
const children = [];
let stopping = false;

function stopAll(exitCode) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGINT');
  }
  process.exit(exitCode);
}

for (const { name, color } of apps) {
  const child = spawn('npm run dev', { cwd: name, shell: true, env: { ...process.env, FORCE_COLOR: '1' } });
  const label = `${color}[${name}]${reset} `;
  const print = (stream) => (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line.trim()) stream.write(label + line + '\n');
  };
  child.stdout.on('data', print(process.stdout));
  child.stderr.on('data', print(process.stderr));
  child.on('exit', (code) => {
    if (stopping) return;
    console.log(`${label}stopped (exit code ${code}). Stopping the other one too.`);
    stopAll(code ?? 1);
  });
  children.push(child);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
