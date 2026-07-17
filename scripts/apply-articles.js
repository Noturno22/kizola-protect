const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
if (!lang) { console.error('Usage: node apply-articles.js <lang>'); process.exit(1); }

const baseDir = path.join(__dirname, '..', 'assets', 'translations');
const dataPath = path.join(baseDir, `${lang}.json`);
const articlesPath = path.join(baseDir, `${lang}-articles.json`);

if (!fs.existsSync(articlesPath)) { console.error(`Articles file not found: ${articlesPath}`); process.exit(1); }

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

data.learn.articles = articles;

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`${lang}.json updated with ${Object.keys(articles).length} categories`);

// Validate
const cats = ['tax','immigration','housing','legal','career','health','finance','education','safety','community','work'];
let missing = 0;
cats.forEach(c => { for(let i=1; i<=5; i++) { ['title','description','content'].forEach(k => { if(!articles[c]?.[i]?.[k]) missing++; }); }});
console.log(`Article keys missing: ${missing}`);

// Cleanup temp file
fs.unlinkSync(articlesPath);
console.log('Temp file removed');
