const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load .env
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      val = val.replace(/\\"/g, '"');
      process.env[key] = val;
    }
  }
}

// Run the script passed in args
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node run-with-env.js <script.js> [args...]');
  process.exit(1);
}

const child = spawn('node', args, { stdio: 'inherit' });
child.on('close', (code) => {
  process.exit(code);
});
