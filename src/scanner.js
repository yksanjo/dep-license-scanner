/**
 * License Scanner
 * Scans dependencies for license compliance and issues
 */

// License information database
const LICENSE_INFO = {
  'MIT': { category: 'permissive', risk: 'low', commercial: true },
  'ISC': { category: 'permissive', risk: 'low', commercial: true },
  'BSD-2-Clause': { category: 'permissive', risk: 'low', commercial: true },
  'BSD-3-Clause': { category: 'permissive', risk: 'low', commercial: true },
  'BSD-4-Clause': { category: 'permissive', risk: 'low', commercial: true },
  'Apache-2.0': { category: 'permissive', risk: 'low', commercial: true },
  'Apache': { category: 'permissive', risk: 'low', commercial: true },
  'GPL-2.0': { category: 'copyleft', risk: 'high', commercial: false },
  'GPL-3.0': { category: 'copyleft', risk: 'high', commercial: false },
  'LGPL-2.0': { category: 'copyleft', risk: 'medium', commercial: false },
  'LGPL-2.1': { category: 'copyleft', risk: 'medium', commercial: false },
  'LGPL-3.0': { category: 'copyleft', risk: 'medium', commercial: false },
  'AGPL-3.0': { category: 'copyleft', risk: 'high', commercial: false },
  'MPL-2.0': { category: 'copyleft', risk: 'medium', commercial: true },
  'CDDL-1.0': { category: 'copyleft', risk: 'medium', commercial: true },
  'EPL-2.0': { category: 'copyleft', risk: 'medium', commercial: true },
  '0BSD': { category: 'permissive', risk: 'low', commercial: true },
  'Unlicense': { category: 'permissive', risk: 'low', commercial: true },
  'CC0-1.0': { category: 'permissive', risk: 'low', commercial: true },
  'CC-BY-4.0': { category: 'permissive', risk: 'low', commercial: true },
  'CC-BY-SA-4.0': { category: 'copyleft', risk: 'medium', commercial: false },
  'Public Domain': { category: 'permissive', risk: 'low', commercial: true },
  'WTFPL': { category: 'permissive', risk: 'low', commercial: true },
  'Zlib': { category: 'permissive', risk: 'low', commercial: true },
  'BSL-1.0': { category: 'permissive', risk: 'low', commercial: true },
  'Python-2.0': { category: 'permissive', risk: 'low', commercial: true },
  'PHP': { category: 'permissive', risk: 'low', commercial: true },
  'Ruby': { category: 'permissive', risk: 'low', commercial: true },
  'NO-LICENSE': { category: 'unknown', risk: 'high', commercial: false }
};

// Known package licenses
const PACKAGE_LICENSES = {
  'react': 'MIT',
  'react-dom': 'MIT',
  'vue': 'MIT',
  'next': 'MIT',
  'express': 'MIT',
  'lodash': 'MIT',
  'axios': 'MIT',
  'webpack': 'MIT',
  'vite': 'MIT',
  'typescript': 'Apache-2.0',
  'tailwindcss': 'MIT',
  'jest': 'MIT',
  'mocha': 'MIT',
  'eslint': 'MIT',
  'prettier': 'MIT',
  'lodash': 'MIT',
  'moment': 'MIT',
  'jquery': 'MIT',
  'bootstrap': 'MIT',
  'd3': 'ISC',
  'chart.js': 'MIT',
  'socket.io': 'MIT',
  'ws': 'MIT',
  'pm2': 'MIT',
  'nodemon': 'MIT',
  'chalk': 'MIT',
  'commander': 'MIT',
  'ora': 'MIT',
  'axios': 'MIT',
  'express': 'MIT',
  'koa': 'MIT',
  'fastify': 'MIT',
  'prisma': 'Apache-2.0',
  'mongoose': 'Apache-2.0',
  'graphql': 'MIT',
  'apollo-server': 'MIT',
  'passport': 'MIT',
  'bcrypt': 'MIT',
  'jsonwebtoken': 'MIT',
  'cors': 'MIT',
  'helmet': 'MIT',
  'dotenv': 'MIT',
  'winston': 'MIT',
  'pino': 'MIT',
  'socket.io': 'MIT'
};

export class LicenseScanner {
  constructor(options = {}) {
    this.options = {
      workspacePath: options.workspacePath || process.cwd(),
      excludeDirs: options.excludeDirs || ['node_modules', '.git', 'dist'],
      ...options
    };
    
    this.results = {
      permissive: [],
      copyleft: [],
      unknown: [],
      proprietary: [],
      summary: {
        totalScanned: 0,
        permissive: 0,
        copyleft: 0,
        unknown: 0
      }
    };
  }

  async scan() {
    console.log('🔍 Scanning for license compliance...\n');
    
    const projects = this.findProjects();
    console.log(`📦 Found ${projects.length} projects\n`);
    
    for (const project of projects) {
      const dependencies = this.parseDependencies(project);
      
      for (const [pkg, version] of Object.entries(dependencies)) {
        this.results.summary.totalScanned++;
        
        const license = this.getLicense(pkg);
        const info = LICENSE_INFO[license] || { category: 'unknown', risk: 'high', commercial: false };
        
        const result = {
          package: pkg,
          version: version,
          license: license,
          ...info
        };
        
        if (info.category === 'permissive') {
          this.results.permissive.push(result);
          this.results.summary.permissive++;
        } else if (info.category === 'copyleft') {
          this.results.copyleft.push(result);
          this.results.summary.copyleft++;
        } else {
          this.results.unknown.push(result);
          this.results.summary.unknown++;
        }
      }
    }
    
    return this.results;
  }

  findProjects() {
    const { readFileSync, existsSync, readdirSync, statSync } = require('fs');
    const { join, resolve } = require('path');
    
    const projects = [];
    const workspacePath = resolve(this.options.workspacePath);
    
    try {
      const entries = readdirSync(workspacePath);
      
      for (const entry of entries) {
        const fullPath = join(workspacePath, entry);
        
        if (!statSync(fullPath).isDirectory()) continue;
        if (this.options.excludeDirs.includes(entry)) continue;
        if (entry.startsWith('.')) continue;
        
        if (existsSync(join(fullPath, 'package.json'))) {
          projects.push({ name: entry, path: fullPath });
        }
      }
    } catch (error) {
      console.error('Error finding projects:', error.message);
    }
    
    return projects;
  }

  parseDependencies(project) {
    const { readFileSync, existsSync } = require('fs');
    const { join } = require('path');
    
    const pkgPath = join(project.path, 'package.json');
    if (!existsSync(pkgPath)) return {};
    
    try {
      const content = readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      
      return {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };
    } catch {
      return {};
    }
  }

  getLicense(packageName) {
    return PACKAGE_LICENSES[packageName.toLowerCase()] || 'NO-LICENSE';
  }
}

export async function scan(options = {}) {
  const scanner = new LicenseScanner(options);
  return await scanner.scan();
}
