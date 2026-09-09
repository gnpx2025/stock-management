#!/usr/bin/env node
/**
 * Fails if competing UI libraries appear in frontend/package.json.
 * Allowed: @angular/material, @angular/cdk.
 * Forbidden: PrimeNG ecosystem, NG-ZORRO, Bootstrap UI, Tailwind, etc.
 */
const fs = require('node:fs');
const path = require('node:path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const allDeps = {
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
  ...(pkg.optionalDependencies ?? {}),
  ...(pkg.peerDependencies ?? {}),
};

const forbiddenPatterns = [
  /^primeng(\/|$)/,
  /^primeicons(\/|$)/,
  /^@primeng\//,
  /^@primeicons\//,
  /^@primeuix\//,
  /^ng-zorro-antd(\/|$)/,
  /^bootstrap(\/|$)/,
  /^@ng-bootstrap\//,
  /^ngx-bootstrap(\/|$)/,
  /^tailwindcss(\/|$)/,
  /^@tailwindcss\//,
];

const offenders = Object.keys(allDeps).filter((name) =>
  forbiddenPatterns.some((pattern) => pattern.test(name)),
);

if (offenders.length > 0) {
  console.error(
    'Competing UI libraries are not allowed (Angular Material foundation):\n' +
      offenders.map((name) => `  - ${name}`).join('\n'),
  );
  process.exit(1);
}

console.log('OK: no competing UI libraries found in package.json');
