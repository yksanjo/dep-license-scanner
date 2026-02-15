/**
 * License Scanner CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { scan } from './scanner.js';

const red = chalk.red;
const green = chalk.green;
const yellow = chalk.yellow;
const blue = chalk.blue;
const bold = chalk.bold;

const program = new Command();

program
  .name('dep-license-scanner')
  .description('Scan dependencies for license compliance')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for license compliance')
  .option('-p, --path <path>', 'Workspace path', process.cwd())
  .action(async (options) => {
    const spinner = ora('Scanning for license compliance...').start();
    
    try {
      const results = await scan({ workspacePath: options.path });
      spinner.succeed('Scan complete!');
      
      console.log('\n' + '='.repeat(60));
      console.log(bold('📜 LICENSE SCANNER SUMMARY'));
      console.log('='.repeat(60));
      console.log(`Total Dependencies: ${results.summary.totalScanned}`);
      console.log(`Permissive:        ${results.summary.permissive}`);
      console.log(`Copyleft:          ${results.summary.copyleft}`);
      console.log(`Unknown:           ${results.summary.unknown}`);
      console.log('='.repeat(60));
      
      if (results.copyleft.length > 0) {
        console.log(bold('\n⚠️  COPYLEFT LICENSES (may have restrictions):\n'));
        for (const l of results.copyleft.slice(0, 10)) {
          console.log(yellow(`🟡 ${l.package}: ${l.license}`));
        }
      }
      
      if (results.unknown.length > 0) {
        console.log(bold('\n⚠️  UNKNOWN LICENSES:\n'));
        for (const l of results.unknown.slice(0, 10)) {
          console.log(red(`🔴 ${l.package}: ${l.license}`));
        }
      }
      
    } catch (error) {
      spinner.fail('Scan failed!');
      console.error(red('Error:'), error.message);
    }
  });

program.parse();
