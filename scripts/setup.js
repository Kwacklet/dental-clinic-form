import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

function step(text) {
  console.log(`\n=== ${text}`);
}

function fail(text) {
  console.error(`\nSetup stopped: ${text}`);
  console.error('Fix the problem above, then run "npm run setup" again.');
  process.exit(1);
}

function run(command, folder) {
  const result = spawnSync(command, { cwd: folder, stdio: 'inherit', shell: true });
  return result.status === 0;
}

const [major, minor] = process.versions.node.split('.').map(Number);
const nodeOk = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 23;
if (!nodeOk) fail(`Node.js ${process.versions.node} is too old. Install Node.js 22 LTS from https://nodejs.org`);

step('1/4 Installing server packages');
if (!run('npm install', 'server')) fail('npm install failed in the server folder.');

step('2/4 Installing client packages');
if (!run('npm install', 'client')) fail('npm install failed in the client folder.');

step('3/4 Creating .env files');
if (existsSync('server/.env')) {
  console.log('server/.env already exists. Kept as it is.');
} else {
  const secret = randomBytes(48).toString('hex');
  const env = readFileSync('server/.env.example', 'utf8').replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);
  writeFileSync('server/.env', env);
  console.log('Created server/.env with a new random JWT_SECRET.');
}
if (existsSync('client/.env')) {
  console.log('client/.env already exists. Kept as it is.');
} else {
  copyFileSync('client/.env.example', 'client/.env');
  console.log('Created client/.env.');
}

step('4/4 Creating the database');
if (!run('npm run init-db --silent', 'server')) fail('the database could not be created.');

console.log(`
Setup complete. Next:
  1. Set a Dentist Panel password:  npm run set-password -- dentist@example.com
  2. Start the app:                 npm run dev
  3. Open http://localhost:5173 (patient form) or http://localhost:5173/dentist
`);
