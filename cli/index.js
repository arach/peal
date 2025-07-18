#!/usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Available sounds with their file paths
const AVAILABLE_SOUNDS = {
  // UI Feedback
  success: 'sounds/success.wav',
  error: 'sounds/error.wav',
  notification: 'sounds/notification.wav',
  click: 'sounds/click.wav',
  tap: 'sounds/tap.wav',
  
  // Transitions
  transition: 'sounds/transition.wav',
  swoosh: 'sounds/swoosh.wav',
  
  // Loading/Processing
  loading: 'sounds/loading.wav',
  complete: 'sounds/complete.wav',
  
  // Alerts
  alert: 'sounds/alert.wav',
  warning: 'sounds/warning.wav',
  
  // Messages
  message: 'sounds/message.wav',
  mention: 'sounds/mention.wav',
  
  // Interactive
  hover: 'sounds/hover.wav',
  select: 'sounds/select.wav',
  toggle: 'sounds/toggle.wav',
  
  // System
  startup: 'sounds/startup.wav',
  shutdown: 'sounds/shutdown.wav',
  unlock: 'sounds/unlock.wav'
};

// Sound categories for better organization
const SOUND_CATEGORIES = {
  'UI Feedback': ['success', 'error', 'notification', 'click', 'tap'],
  'Transitions': ['transition', 'swoosh'],
  'Loading': ['loading', 'complete'],
  'Alerts': ['alert', 'warning'],
  'Messages': ['message', 'mention'],
  'Interactive': ['hover', 'select', 'toggle'],
  'System': ['startup', 'shutdown', 'unlock']
};

async function checkHowlerInstalled() {
  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8'));
    return packageJson.dependencies?.howler || packageJson.devDependencies?.howler;
  } catch (error) {
    return false;
  }
}

async function installHowler() {
  const { shouldInstall } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldInstall',
      message: 'Howler.js is required but not installed. Would you like to install it now?',
      default: true
    }
  ]);

  if (shouldInstall) {
    const spinner = ora('Installing howler.js...').start();
    try {
      // Detect package manager
      let packageManager = 'npm';
      try {
        await fs.access(path.join(process.cwd(), 'pnpm-lock.yaml'));
        packageManager = 'pnpm';
      } catch {
        try {
          await fs.access(path.join(process.cwd(), 'yarn.lock'));
          packageManager = 'yarn';
        } catch {
          // Default to npm
        }
      }

      execSync(`${packageManager} ${packageManager === 'yarn' ? 'add' : 'install'} howler`, { stdio: 'pipe' });
      spinner.succeed('Howler.js installed successfully!');
      return true;
    } catch (error) {
      spinner.fail('Failed to install howler.js');
      console.error(chalk.red('Please install it manually with: npm install howler'));
      return false;
    }
  }
  return false;
}

async function ensureDirectory(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function copySoundFile(soundName, targetDir) {
  const sourcePath = path.join(__dirname, AVAILABLE_SOUNDS[soundName]);
  const targetPath = path.join(targetDir, `${soundName}.wav`);
  
  // Also support .mp3 format
  const mp3SourcePath = sourcePath.replace('.wav', '.mp3');
  const mp3TargetPath = targetPath.replace('.wav', '.mp3');
  
  try {
    // Try WAV first
    await fs.copyFile(sourcePath, targetPath);
    return { format: 'wav', path: targetPath };
  } catch (error) {
    try {
      // Try MP3 as fallback
      await fs.copyFile(mp3SourcePath, mp3TargetPath);
      return { format: 'mp3', path: mp3TargetPath };
    } catch (mp3Error) {
      throw new Error(`Sound file not found for ${soundName}`);
    }
  }
}

async function createPealHelper(targetDir, sounds) {
  const templatePath = path.join(__dirname, 'templates', 'peal.ts.template');
  const template = await fs.readFile(templatePath, 'utf-8');
  
  // Replace placeholders
  const soundList = JSON.stringify(sounds, null, 4).split('\n').map((line, i) => 
    i === 0 ? line : '    ' + line
  ).join('\n');
  
  const convenienceMethods = sounds.map(s => `  ${s}() { return this.play('${s}'); }`).join('\n');
  
  const helperContent = template
    .replace('{{SOUND_LIST}}', soundList)
    .replace('{{CONVENIENCE_METHODS}}', convenienceMethods);

  const targetPath = path.join(targetDir, 'peal.ts');
  await fs.writeFile(targetPath, helperContent);
  return targetPath;
}

async function createJavaScriptHelper(targetDir, sounds) {
  const templatePath = path.join(__dirname, 'templates', 'peal.js.template');
  const template = await fs.readFile(templatePath, 'utf-8');
  
  // Replace placeholders
  const soundList = JSON.stringify(sounds, null, 4).split('\n').map((line, i) => 
    i === 0 ? line : '    ' + line
  ).join('\n');
  
  const convenienceMethods = sounds.map(s => `  ${s}() { return this.play('${s}'); }`).join('\n');
  
  const helperContent = template
    .replace('{{SOUND_LIST}}', soundList)
    .replace('{{CONVENIENCE_METHODS}}', convenienceMethods);

  const targetPath = path.join(targetDir, 'peal.js');
  await fs.writeFile(targetPath, helperContent);
  return targetPath;
}

program
  .name('peal')
  .description('CLI for adding Peal sound effects to your project')
  .version('0.1.0');

program
  .command('add [sounds...]')
  .description('Add sound effects to your project')
  .option('-d, --dir <directory>', 'Target directory for sounds', './peal')
  .option('-t, --typescript', 'Generate TypeScript helper instead of JavaScript')
  .option('--no-helper', 'Skip generating the helper file')
  .action(async (requestedSounds, options) => {
    const spinner = ora();
    
    try {
      // Check if howler is installed
      const howlerInstalled = await checkHowlerInstalled();
      if (!howlerInstalled) {
        const installed = await installHowler();
        if (!installed) {
          console.error(chalk.red('Cannot proceed without howler.js'));
          process.exit(1);
        }
      }

      let soundsToAdd = requestedSounds;

      // If no sounds specified, show interactive selection
      if (!soundsToAdd || soundsToAdd.length === 0) {
        const categoryChoices = Object.entries(SOUND_CATEGORIES).map(([category, sounds]) => ({
          name: `${chalk.bold(category)} (${sounds.join(', ')})`,
          value: sounds
        }));

        const { selectedCategories } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedCategories',
            message: 'Select sound categories to add:',
            choices: [
              { name: chalk.green('All sounds'), value: 'all' },
              new inquirer.Separator(),
              ...categoryChoices
            ]
          }
        ]);

        if (selectedCategories.includes('all')) {
          soundsToAdd = Object.keys(AVAILABLE_SOUNDS);
        } else {
          soundsToAdd = selectedCategories.flat();
        }

        if (soundsToAdd.length === 0) {
          const { individualSounds } = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'individualSounds',
              message: 'Or select individual sounds:',
              choices: Object.keys(AVAILABLE_SOUNDS).map(sound => ({
                name: `${sound} - ${AVAILABLE_SOUNDS[sound].split('/')[1]}`,
                value: sound
              }))
            }
          ]);
          soundsToAdd = individualSounds;
        }
      }

      // Validate sounds
      const validSounds = soundsToAdd.filter(sound => AVAILABLE_SOUNDS[sound]);
      const invalidSounds = soundsToAdd.filter(sound => !AVAILABLE_SOUNDS[sound]);

      if (invalidSounds.length > 0) {
        console.warn(chalk.yellow(`Unknown sounds will be skipped: ${invalidSounds.join(', ')}`));
      }

      if (validSounds.length === 0) {
        console.error(chalk.red('No valid sounds selected'));
        process.exit(1);
      }

      // Create target directory
      const targetDir = path.join(process.cwd(), options.dir);
      await ensureDirectory(targetDir);

      // Copy sound files
      spinner.start('Copying sound files...');
      const copiedSounds = [];
      
      for (const sound of validSounds) {
        try {
          const result = await copySoundFile(sound, targetDir);
          copiedSounds.push(sound);
        } catch (error) {
          spinner.warn(`Failed to copy ${sound}: ${error.message}`);
        }
      }
      
      spinner.succeed(`Copied ${copiedSounds.length} sound files to ${options.dir}/`);

      // Create helper file
      if (options.helper !== false && copiedSounds.length > 0) {
        spinner.start('Creating helper file...');
        
        const helperPath = options.typescript
          ? await createPealHelper(process.cwd(), copiedSounds)
          : await createJavaScriptHelper(process.cwd(), copiedSounds);
          
        spinner.succeed(`Created helper file: ${path.basename(helperPath)}`);

        // Show usage instructions
        console.log('\n' + chalk.green('✨ Sounds added successfully!'));
        console.log('\n' + chalk.bold('Usage:'));
        console.log(chalk.gray('```' + (options.typescript ? 'typescript' : 'javascript')));
        console.log(`import { peal } from './peal';

// Play sounds
peal.play('success');
peal.play('error', { volume: 0.5 });

// Or use convenience methods
peal.success();
peal.notification();`);
        console.log(chalk.gray('```'));
      }

    } catch (error) {
      spinner.fail('Failed to add sounds');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available sounds')
  .action(() => {
    console.log(chalk.bold('\n🔊 Available Peal Sounds:\n'));
    
    Object.entries(SOUND_CATEGORIES).forEach(([category, sounds]) => {
      console.log(chalk.blue.bold(`${category}:`));
      sounds.forEach(sound => {
        console.log(`  • ${sound}`);
      });
      console.log();
    });
  });

// Remove command
program
  .command('remove [sounds...]')
  .description('Remove sound effects from your project')
  .option('-d, --dir <directory>', 'Directory where sounds are stored', './peal')
  .action(async (soundsToRemove, options) => {
    const targetDir = path.join(process.cwd(), options.dir);
    
    // Check if directory exists
    try {
      await fs.access(targetDir);
    } catch {
      console.error(chalk.red(`Sound directory not found: ${options.dir}`));
      console.log(chalk.yellow('Have you added sounds yet? Use: peal add'));
      process.exit(1);
    }
    
    // If no sounds specified, show interactive selection
    if (!soundsToRemove || soundsToRemove.length === 0) {
      // List existing sounds in the directory
      const files = await fs.readdir(targetDir);
      const existingSounds = files
        .filter(f => f.endsWith('.wav') || f.endsWith('.mp3'))
        .map(f => f.replace(/\.(wav|mp3)$/, ''));
      
      if (existingSounds.length === 0) {
        console.log(chalk.yellow('No sounds found in ' + options.dir));
        process.exit(0);
      }
      
      const { selectedSounds } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedSounds',
          message: 'Select sounds to remove:',
          choices: existingSounds
        }
      ]);
      
      soundsToRemove = selectedSounds;
    }
    
    if (soundsToRemove.length === 0) {
      console.log(chalk.yellow('No sounds selected for removal'));
      process.exit(0);
    }
    
    // Confirm removal
    const { confirmRemove } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmRemove',
        message: `Remove ${soundsToRemove.length} sound(s)?`,
        default: false
      }
    ]);
    
    if (!confirmRemove) {
      console.log(chalk.gray('Removal cancelled'));
      process.exit(0);
    }
    
    // Remove sound files
    const spinner = ora('Removing sounds...').start();
    let removedCount = 0;
    
    for (const sound of soundsToRemove) {
      const wavPath = path.join(targetDir, `${sound}.wav`);
      const mp3Path = path.join(targetDir, `${sound}.mp3`);
      
      try {
        try {
          await fs.unlink(wavPath);
          removedCount++;
        } catch {
          // Try MP3
          await fs.unlink(mp3Path);
          removedCount++;
        }
      } catch {
        spinner.warn(`Could not remove: ${sound}`);
      }
    }
    
    spinner.succeed(`Removed ${removedCount} sound(s)`);
    
    // Update helper file if it exists
    const helperPath = path.join(process.cwd(), 'peal.js');
    const tsHelperPath = path.join(process.cwd(), 'peal.ts');
    
    try {
      // Get remaining sounds
      const files = await fs.readdir(targetDir);
      const remainingSounds = files
        .filter(f => f.endsWith('.wav') || f.endsWith('.mp3'))
        .map(f => f.replace(/\.(wav|mp3)$/, ''));
      
      if (remainingSounds.length > 0) {
        // Update helper with remaining sounds
        try {
          await fs.access(tsHelperPath);
          await createPealHelper(process.cwd(), remainingSounds);
          console.log(chalk.green('✓ Updated peal.ts'));
        } catch {
          try {
            await fs.access(helperPath);
            await createJavaScriptHelper(process.cwd(), remainingSounds);
            console.log(chalk.green('✓ Updated peal.js'));
          } catch {
            // No helper file to update
          }
        }
      } else {
        // Remove helper if no sounds left
        try {
          await fs.unlink(helperPath);
          console.log(chalk.gray('Removed peal.js (no sounds left)'));
        } catch {}
        try {
          await fs.unlink(tsHelperPath);
          console.log(chalk.gray('Removed peal.ts (no sounds left)'));
        } catch {}
      }
    } catch {
      // Could not update helper
    }
  });

// Play command
program
  .command('play <sound>')
  .description('Play a sound effect')
  .option('-v, --volume <level>', 'Volume level (0-1)', '1')
  .action(async (soundName, options) => {
    if (!AVAILABLE_SOUNDS[soundName]) {
      console.error(chalk.red(`Sound "${soundName}" not found.`));
      console.log(chalk.yellow('\nAvailable sounds:'));
      console.log(Object.keys(AVAILABLE_SOUNDS).join(', '));
      process.exit(1);
    }

    const soundPath = path.join(__dirname, AVAILABLE_SOUNDS[soundName]);
    
    // Detect platform and use appropriate command
    const platform = process.platform;
    let command;
    
    if (platform === 'darwin') {
      // macOS
      command = `afplay "${soundPath}"`;
    } else if (platform === 'win32') {
      // Windows - use PowerShell
      command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
    } else {
      // Linux/Unix - try multiple commands
      const players = ['aplay', 'paplay', 'play'];
      let playerFound = false;
      
      for (const player of players) {
        try {
          execSync(`which ${player}`, { stdio: 'ignore' });
          command = `${player} "${soundPath}"`;
          playerFound = true;
          break;
        } catch {
          // Continue to next player
        }
      }
      
      if (!playerFound) {
        console.error(chalk.red('No audio player found. Please install aplay, paplay, or sox.'));
        process.exit(1);
      }
    }
    
    try {
      console.log(chalk.green(`🔊 Playing ${soundName}...`));
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(chalk.red(`Failed to play sound: ${error.message}`));
      process.exit(1);
    }
  });

// Play all command - demo all sounds
program
  .command('demo')
  .description('Play a demo of all available sounds')
  .option('-d, --delay <ms>', 'Delay between sounds in milliseconds', '1000')
  .action(async (options) => {
    console.log(chalk.green('🎵 Playing demo of all Peal sounds...\n'));
    
    const delay = parseInt(options.delay);
    const allSounds = Object.entries(AVAILABLE_SOUNDS);
    
    for (const [soundName, soundPath] of allSounds) {
      console.log(chalk.blue(`▶ ${soundName}`));
      
      const fullPath = path.join(__dirname, soundPath);
      const platform = process.platform;
      let command;
      
      if (platform === 'darwin') {
        command = `afplay "${fullPath}"`;
      } else if (platform === 'win32') {
        command = `powershell -c "(New-Object Media.SoundPlayer '${fullPath}').PlaySync()"`;
      } else {
        // Use the first available player on Linux
        const players = ['aplay', 'paplay', 'play'];
        for (const player of players) {
          try {
            execSync(`which ${player}`, { stdio: 'ignore' });
            command = `${player} "${fullPath}"`;
            break;
          } catch {
            // Continue
          }
        }
      }
      
      if (command) {
        try {
          execSync(command, { stdio: 'ignore' });
          // Wait before playing next sound
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch {
          console.log(chalk.yellow(`  ⚠ Could not play ${soundName}`));
        }
      }
    }
    
    console.log(chalk.green('\n✨ Demo complete!'));
  });

program.parse();