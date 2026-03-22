const fs = require('fs');
const path = require('path');

const root = '/Users/syedmustafamuzaffar39@gmail.com/Desktop/Kodnest/frontend and backend lms/frontend';

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        checkDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('@/')) {
          const absoluteImport = path.join(root, importPath.replace('@/', ''));
          const ext = ['.tsx', '.ts', '.js', '/index.tsx', '/index.ts', '/index.js', ''];
          let found = false;
          for (const e of ext) {
            const target = absoluteImport + e;
            if (fs.existsSync(target)) {
              const actualName = path.basename(fs.realpathSync(target));
              const expectedName = path.basename(target);
              if (actualName !== expectedName && expectedName !== '') {
                // Check if they differ by case
                if (actualName.toLowerCase() === expectedName.toLowerCase()) {
                  console.log(`CASE MISMATCH in ${fullPath}:`);
                  console.log(`  Import: ${importPath}`);
                  console.log(`  Expected File: ${expectedName}`);
                  console.log(`  Actual File: ${actualName}`);
                }
              }
              found = true;
              break;
            }
          }
        }
      }
    }
  }
}

checkDir(root);
console.log("Check complete.");
