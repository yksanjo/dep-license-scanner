/**
 * License Scanner - Main Entry Point
 */

import { LicenseScanner } from './scanner.js';

export { LicenseScanner };

const isMain = process.argv[1]?.includes('index.js');
if (isMain) {
  console.log('License Scanner v1.0.0');
  console.log('Use: node src/cli.js <command>');
}
