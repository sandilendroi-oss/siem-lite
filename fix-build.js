import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Change build script to use vite build directly
packageJson.scripts.build = "vite build";

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf8');

console.log('\n SUCCESS! Fixed build script in package.json.\n');