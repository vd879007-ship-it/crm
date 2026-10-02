// Detect exported functions (named) across module pages and report duplicates
const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve('f:/New folder/site/frontend/src/pages');

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

const files = collectFiles(srcRoot);
const exportMap = new Map(); // name -> [{file}]
const exportRegex = /export\s+(?:const|function)\s+(\w+)\s*=/g; // matches export const foo = or export function foo =
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    const name = match[1];
    if (!exportMap.has(name)) exportMap.set(name, []);
    exportMap.get(name).push({ file });
  }
});

const duplicates = [];
for (const [name, arr] of exportMap.entries()) {
  if (arr.length > 1) {
    const modules = new Set(arr.map(o => o.file.split(path.sep)[5])); // assume module folder is after src/pages
    if (modules.size > 1) {
      duplicates.push({ name, locations: arr });
    }
  }
}

console.log(JSON.stringify(duplicates, null, 2));
