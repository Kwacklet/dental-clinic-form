import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const MIN_LENGTH = 8;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (text) => {
      if (!muted || text.includes('\n')) rl.output.write(muted ? '\n' : text);
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  if (!email) throw new Error('Give the account email, e.g. npm run set-password -- meg@megsclinic.com');

  const [rows] = await pool.execute('SELECT id, first_name, last_name, role FROM user_profiles WHERE email = ?', [email]);
  if (rows.length === 0) throw new Error(`No account with the email ${email} in user_profiles.`);
  const user = rows[0];
  console.log(`Setting the password for ${user.first_name} ${user.last_name} (${user.role}).`);

  const password = await askHidden(`New password (at least ${MIN_LENGTH} characters): `);
  if (password.length < MIN_LENGTH) throw new Error(`The password must be at least ${MIN_LENGTH} characters.`);
  const repeated = await askHidden('Type it again: ');
  if (password !== repeated) throw new Error('The passwords do not match.');

  const hash = await bcrypt.hash(password, 12);
  await pool.execute('UPDATE user_profiles SET password_hash = ? WHERE id = ?', [hash, user.id]);
  console.log('Password saved. Logins made with the old password stay valid until they expire (12 hours).');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
