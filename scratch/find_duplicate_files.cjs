// Node script (CommonJS) to find duplicate file contents across module directories
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Define module directories under src/pages (adjust as needed)
const modules = [
  'hr',
  'crm',
  'hem',
  'recruitment',
  'business', // assuming business os pages under 'business' or similar
  'role',
  'erp'
];

const srcRoot = path.resolve('f:/New folder/site/frontend/src/pages');

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function collectFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir);
  entries.forEach((e) => {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(collectFiles(full));
    } else if (full.match(/\.(ts|tsx|js)$/i)) {
      files.push(full);
    }
  });
  return files;
}

const hashMap = new Map(); // hash -> [{file, module}]
modules.forEach((mod) => {
  const modPath = path.join(srcRoot, mod);
  if (!fs.existsSync(modPath)) return; // skip missing modules
  const files = collectFiles(modPath);
  files.forEach((file) => {
    const h = hashFile(file);
    if (!hashMap.has(h)) hashMap.set(h, []);
    hashMap.get(h).push({ file, module: mod });
  });
});

const duplicates = [];
for (const [hash, arr] of hashMap.entries()) {
  const modulesSeen = new Set(arr.map(o => o.module));
  if (modulesSeen.size > 1) {
    duplicates.push({ hash, locations: arr });
  }
}

console.log(JSON.stringify(duplicates, null, 2));
