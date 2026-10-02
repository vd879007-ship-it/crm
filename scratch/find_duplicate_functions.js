// Node script to find duplicate function definitions across modules
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Root src directory
const srcRoot = path.resolve('f:/New folder/site/frontend/src');

// Recursively collect .ts, .tsx, .js files
function collectFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(collectFiles(full));
    } else if (full.match(/\.(ts|tsx|js)$/i)) {
      results.push(full);
    }
  });
  return results;
}

// Simple regex to capture function definitions (both traditional and arrow functions)
const functionRegex = /(?:export\s+)?(?:async\s+)?(?:function\s+|const\s+)([A-Za-z0-9_]+)\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{)\s*([\s\S]*?)\n\}/g;

function extractFunctions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const functions = [];
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];
    // Normalise whitespace for hashing
    const norm = body.replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('sha256').update(norm).digest('hex');
    functions.push({ name, hash, file: filePath, snippet: body.trim().split('\n')[0] + '...' });
  }
  return functions;
}

const allFiles = collectFiles(srcRoot);
const funcMap = new Map(); // hash -> array of {name,file}
allFiles.forEach((file) => {
  const funcs = extractFunctions(file);
  funcs.forEach((fn) => {
    if (!funcMap.has(fn.hash)) funcMap.set(fn.hash, []);
    funcMap.get(fn.hash).push({ name: fn.name, file: fn.file, snippet: fn.snippet });
  });
});

// Find duplicates (hash appears >=2 times across different files)
const duplicates = [];
for (const [hash, entries] of funcMap.entries()) {
  if (entries.length > 1) {
    // Filter out same file multiple definitions (unlikely)
    const distinctFiles = new Set(entries.map(e => e.file));
    if (distinctFiles.size > 1) {
      duplicates.push({ hash, entries });
    }
  }
}

// Output report JSON for easy consumption
console.log(JSON.stringify(duplicates, null, 2));
