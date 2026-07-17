const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'assets', 'translations');
const en = JSON.parse(fs.readFileSync(path.join(BASE, '_en_source.json'), 'utf8'));
const ln = JSON.parse(fs.readFileSync(path.join(BASE, 'ln.json'), 'utf8'));
const tl = JSON.parse(fs.readFileSync(path.join(BASE, 'tl.json'), 'utf8'));

function findEnglish(obj, enObj, prefix, results) {
  for (const [key, val] of Object.entries(enObj)) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof val === 'string') {
      let tgt = obj;
      const parts = fullKey.split('.');
      for (const p of parts) { tgt = tgt && tgt[p]; }
      if (typeof tgt === 'string' && tgt === val) {
        const display = val.length > 80 ? val.substring(0, 80) + '...' : val;
        results.push({ key: fullKey, enVal: display });
      }
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      findEnglish(obj, val, fullKey, results);
    }
  }
}

const lnR = [];
const tlR = [];
findEnglish(ln, en, '', lnR);
findEnglish(tl, en, '', tlR);

console.log('=== Lingala remaining (' + lnR.length + ') ===');
lnR.forEach(r => console.log('  ' + r.key + ' = "' + r.enVal + '"'));
console.log('');
console.log('=== Tagalog remaining (' + tlR.length + ') ===');
tlR.forEach(r => console.log('  ' + r.key + ' = "' + r.enVal + '"'));
