const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
if (!lang) { console.error('Usage: node build-lang.js <lang>'); process.exit(1); }

const baseDir = path.join(__dirname, '..', 'assets', 'translations');
const langPath = path.join(baseDir, `${lang}.json`);
const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

const categories = ['tax', 'immigration', 'housing', 'legal', 'career', 'health', 'finance', 'education', 'safety', 'community', 'work'];
const articles = {};

categories.forEach(cat => {
  const catFile = path.join(baseDir, `${lang}-cat-${cat}.json`);
  if (fs.existsSync(catFile)) {
    articles[cat] = JSON.parse(fs.readFileSync(catFile, 'utf8'));
    fs.unlinkSync(catFile);
    console.log(`Loaded ${cat}`);
  } else {
    console.error(`Missing: ${catFile}`);
  }
});

langData.learn.articles = articles;
fs.writeFileSync(langPath, JSON.stringify(langData, null, 2), 'utf8');
console.log(`${lang}.json updated!`);

let missing = 0;
categories.forEach(c => {
  for (let i = 1; i <= 5; i++) {
    ['title', 'description', 'content'].forEach(k => {
      if (!articles[c]?.[i]?.[k]) missing++;
    });
  }
});
console.log(`Missing keys: ${missing}`);
