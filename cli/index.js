#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVAILABLE_SOUNDS = {
  success: 'sounds/success.wav',
  error: 'sounds/error.wav',
  notification: 'sounds/notification.wav',
  click: 'sounds/click.wav',
  tap: 'sounds/tap.wav',
  transition: 'sounds/transition.wav',
  swoosh: 'sounds/swoosh.wav',
  loading: 'sounds/loading.wav',
  complete: 'sounds/complete.wav',
  alert: 'sounds/alert.wav',
  warning: 'sounds/warning.wav',
  message: 'sounds/message.wav',
  mention: 'sounds/mention.wav',
  hover: 'sounds/hover.wav',
  select: 'sounds/select.wav',
  toggle: 'sounds/toggle.wav',
  startup: 'sounds/startup.wav',
  shutdown: 'sounds/shutdown.wav',
  unlock: 'sounds/unlock.wav'
};

const SOUND_CATEGORIES = {
  'UI Feedback': ['success', 'error', 'notification', 'click', 'tap'],
  Transitions: ['transition', 'swoosh'],
  Loading: ['loading', 'complete'],
  Alerts: ['alert', 'warning'],
  Messages: ['message', 'mention'],
  Interactive: ['hover', 'select', 'toggle'],
  System: ['startup', 'shutdown', 'unlock']
};

const HELP = `Peal — add UI sounds to your project

Usage:
  peal add [sounds...] [options]
  peal remove [sounds...] [options]
  peal list
  peal play <sound> [options]
  peal demo [options]

Add options:
  -d, --dir <directory>  Sound directory (default: ./peal)
  -t, --typescript       Generate peal.ts instead of peal.js
      --no-helper        Copy sounds without generating a helper

Remove options:
  -d, --dir <directory>  Sound directory (default: ./peal)
  -y, --yes              Skip the confirmation prompt

Other options:
  -h, --help             Show help
  -V, --version          Show version`;

async function getPackageVersion() {
  try {
    const pkg = JSON.parse(
      await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8')
    );
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function printCatalog() {
  console.log('\nAvailable Peal sounds:\n');
  for (const [category, sounds] of Object.entries(SOUND_CATEGORIES)) {
    console.log(`${category}: ${sounds.join(', ')}`);
  }
  console.log();
}

async function prompt(question) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Interactive input is unavailable. Pass sound names on the command line.');
  }

  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await readline.question(question)).trim();
  } finally {
    readline.close();
  }
}

function parseSoundNames(answer) {
  if (answer.toLowerCase() === 'all') return Object.keys(AVAILABLE_SOUNDS);
  return answer.split(/[\s,]+/).filter(Boolean);
}

async function chooseSounds(message) {
  printCatalog();
  return parseSoundNames(await prompt(`${message} (comma-separated, or "all"): `));
}

async function confirm(message, defaultValue = false) {
  const suffix = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = (await prompt(`${message} ${suffix} `)).toLowerCase();
  if (!answer) return defaultValue;
  return answer === 'y' || answer === 'yes';
}

async function copySoundFile(soundName, targetDir) {
  const sourcePath = path.join(__dirname, AVAILABLE_SOUNDS[soundName]);
  const wavTarget = path.join(targetDir, `${soundName}.wav`);

  try {
    await fs.copyFile(sourcePath, wavTarget);
    return { name: soundName, format: 'wav' };
  } catch {
    const mp3Source = sourcePath.replace(/\.wav$/, '.mp3');
    const mp3Target = path.join(targetDir, `${soundName}.mp3`);
    try {
      await fs.copyFile(mp3Source, mp3Target);
      return { name: soundName, format: 'mp3' };
    } catch {
      throw new Error(`Sound file not found for ${soundName}`);
    }
  }
}

function serializeSoundFiles(sounds) {
  return JSON.stringify(
    Object.fromEntries(sounds.map(({ name, format }) => [name, `${name}.${format}`])),
    null,
    2
  );
}

function createConvenienceMethods(sounds, typescript) {
  return sounds
    .map(({ name }) => {
      const options = typescript ? 'options?: PealPlayOptions' : 'options';
      return `  ${name}(${options}) { return this.play('${name}', options); }`;
    })
    .join('\n');
}

async function createHelper(targetDir, sounds, typescript) {
  const extension = typescript ? 'ts' : 'js';
  const template = await fs.readFile(
    path.join(__dirname, 'templates', `peal.${extension}.template`),
    'utf8'
  );
  const content = template
    .replace('{{SOUND_FILES}}', serializeSoundFiles(sounds))
    .replace('{{CONVENIENCE_METHODS}}', createConvenienceMethods(sounds, typescript));
  const targetPath = path.join(targetDir, `peal.${extension}`);
  await fs.writeFile(targetPath, content);
  return targetPath;
}

async function getExistingSounds(targetDir) {
  const files = await fs.readdir(targetDir);
  const sounds = new Map();

  for (const file of files) {
    const match = file.match(/^(.+)\.(wav|mp3)$/);
    if (!match) continue;
    const [, name, format] = match;
    if (!sounds.has(name) || format === 'wav') sounds.set(name, { name, format });
  }

  return [...sounds.values()];
}

async function addCommand(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      dir: { type: 'string', short: 'd', default: './peal' },
      typescript: { type: 'boolean', short: 't', default: false },
      'no-helper': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false }
    }
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const requested = positionals.length > 0
    ? positionals
    : await chooseSounds('Sounds to add');
  const valid = requested.filter((sound) => AVAILABLE_SOUNDS[sound]);
  const invalid = requested.filter((sound) => !AVAILABLE_SOUNDS[sound]);

  if (invalid.length > 0) console.warn(`Unknown sounds skipped: ${invalid.join(', ')}`);
  if (valid.length === 0) throw new Error('No valid sounds selected. Run `peal list` to see the catalog.');

  const targetDir = path.resolve(process.cwd(), values.dir);
  await fs.mkdir(targetDir, { recursive: true });

  const copied = [];
  for (const sound of valid) {
    try {
      copied.push(await copySoundFile(sound, targetDir));
    } catch (error) {
      console.warn(`Could not copy ${sound}: ${error.message}`);
    }
  }

  if (copied.length === 0) throw new Error('No sound files were copied.');
  console.log(`✓ Copied ${copied.length} sound file${copied.length === 1 ? '' : 's'} to ${values.dir}/`);

  if (!values['no-helper']) {
    const helperPath = await createHelper(process.cwd(), copied, values.typescript);
    console.log(`✓ Created ${path.basename(helperPath)} (no runtime dependencies)`);
    const importPath = values.typescript ? './peal' : `./${path.basename(helperPath)}`;
    console.log(`\nimport { peal } from '${importPath}';`);
    console.log(`peal.${copied[0].name}();`);
  }
}

async function removeCommand(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      dir: { type: 'string', short: 'd', default: './peal' },
      yes: { type: 'boolean', short: 'y', default: false },
      help: { type: 'boolean', short: 'h', default: false }
    }
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const targetDir = path.resolve(process.cwd(), values.dir);
  let existing;
  try {
    existing = await getExistingSounds(targetDir);
  } catch {
    throw new Error(`Sound directory not found: ${values.dir}`);
  }

  if (existing.length === 0) {
    console.log(`No sounds found in ${values.dir}`);
    return;
  }

  const requested = positionals.length > 0
    ? positionals
    : await chooseSounds('Sounds to remove');
  if (requested.length === 0) return;

  if (!values.yes && !(await confirm(`Remove ${requested.length} sound(s)?`))) {
    console.log('Removal cancelled.');
    return;
  }

  let removed = 0;
  for (const sound of requested) {
    let didRemove = false;
    for (const format of ['wav', 'mp3']) {
      try {
        await fs.unlink(path.join(targetDir, `${sound}.${format}`));
        didRemove = true;
      } catch {}
    }
    if (didRemove) removed += 1;
    else console.warn(`Could not remove: ${sound}`);
  }
  console.log(`✓ Removed ${removed} sound${removed === 1 ? '' : 's'}`);

  const remaining = await getExistingSounds(targetDir);
  const jsHelper = path.join(process.cwd(), 'peal.js');
  const tsHelper = path.join(process.cwd(), 'peal.ts');

  if (remaining.length === 0) {
    await Promise.all([fs.unlink(jsHelper).catch(() => {}), fs.unlink(tsHelper).catch(() => {})]);
    return;
  }

  try {
    await fs.access(tsHelper);
    await createHelper(process.cwd(), remaining, true);
    console.log('✓ Updated peal.ts');
  } catch {
    try {
      await fs.access(jsHelper);
      await createHelper(process.cwd(), remaining, false);
      console.log('✓ Updated peal.js');
    } catch {}
  }
}

function commandExists(command) {
  const lookup = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(lookup, [command], { stdio: 'ignore' }).status === 0;
}

function playSoundFile(soundPath, volume = 1, stdio = 'inherit') {
  let command;
  let args;

  if (process.platform === 'darwin') {
    command = 'afplay';
    args = ['-v', String(volume), soundPath];
  } else if (process.platform === 'win32') {
    command = 'powershell';
    const escapedPath = soundPath.replaceAll("'", "''");
    args = ['-NoProfile', '-Command', `(New-Object Media.SoundPlayer '${escapedPath}').PlaySync()`];
  } else if (commandExists('paplay')) {
    command = 'paplay';
    args = [`--volume=${Math.round(65536 * volume)}`, soundPath];
  } else if (commandExists('aplay')) {
    command = 'aplay';
    args = [soundPath];
  } else if (commandExists('play')) {
    command = 'play';
    args = ['-v', String(volume), soundPath];
  } else {
    throw new Error('No audio player found. Install paplay, aplay, or sox.');
  }

  const result = spawnSync(command, args, { stdio });
  if (result.error || result.status !== 0) {
    throw new Error(result.error?.message || `${command} exited with status ${result.status}`);
  }
}

async function playCommand(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      volume: { type: 'string', short: 'v', default: '1' },
      help: { type: 'boolean', short: 'h', default: false }
    }
  });

  if (values.help) {
    console.log('Usage: peal play <sound> [-v, --volume <0-1>]');
    return;
  }

  const [soundName] = positionals;
  if (!soundName) throw new Error('A sound name is required.');
  if (!AVAILABLE_SOUNDS[soundName]) throw new Error(`Sound "${soundName}" not found. Run \`peal list\`.`);

  const volume = Number(values.volume);
  if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
    throw new Error('Volume must be a number between 0 and 1.');
  }

  console.log(`▶ ${soundName}`);
  playSoundFile(path.join(__dirname, AVAILABLE_SOUNDS[soundName]), volume);
}

async function demoCommand(args) {
  const { values } = parseArgs({
    args,
    options: {
      delay: { type: 'string', short: 'd', default: '500' },
      help: { type: 'boolean', short: 'h', default: false }
    }
  });

  if (values.help) {
    console.log('Usage: peal demo [-d, --delay <milliseconds>]');
    return;
  }

  const delay = Number(values.delay);
  if (!Number.isFinite(delay) || delay < 0) throw new Error('Delay must be a positive number.');

  for (const [name, relativePath] of Object.entries(AVAILABLE_SOUNDS)) {
    console.log(`▶ ${name}`);
    try {
      playSoundFile(path.join(__dirname, relativePath), 1, 'ignore');
    } catch (error) {
      console.warn(`Could not play ${name}: ${error.message}`);
    }
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP);
    return;
  }

  if (command === '--version' || command === '-V') {
    console.log(await getPackageVersion());
    return;
  }

  if (command === 'add') await addCommand(args);
  else if (command === 'remove') await removeCommand(args);
  else if (command === 'list') printCatalog();
  else if (command === 'play') await playCommand(args);
  else if (command === 'demo') await demoCommand(args);
  else throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exitCode = 1;
});
