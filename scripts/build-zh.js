const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'assets', 'translations');
const zhPath = path.join(baseDir, 'zh.json');
const zh = JSON.parse(fs.readFileSync(zhPath, 'utf8'));

const categories = ['tax', 'immigration', 'housing', 'legal', 'career', 'health', 'finance', 'education', 'safety', 'community', 'work'];
const articles = {};

categories.forEach(cat => {
  const catFile = path.join(baseDir, `zh-cat-${cat}.json`);
  if (fs.existsSync(catFile)) {
    articles[cat] = JSON.parse(fs.readFileSync(catFile, 'utf8'));
    fs.unlinkSync(catFile);
    console.log(`Loaded ${cat}`);
  } else {
    console.error(`Missing: ${catFile}`);
  }
});

zh.learn.articles = articles;
fs.writeFileSync(zhPath, JSON.stringify(zh, null, 2), 'utf8');
console.log('zh.json updated!');

let missing = 0;
categories.forEach(c => {
  for (let i = 1; i <= 5; i++) {
    ['title', 'description', 'content'].forEach(k => {
      if (!articles[c]?.[i]?.[k]) missing++;
    });
  }
});
console.log(`Missing keys: ${missing}`);
