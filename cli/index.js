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

program.parse();