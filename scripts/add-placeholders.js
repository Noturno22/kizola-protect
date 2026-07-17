const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'assets', 'translations');
const langs = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const placeholders = {
  'en': { namePlaceholder: 'Ex.: Maria da Silva', documentPlaceholder: 'Ex.: BI / NIF / RG / CPF' },
  'pt': { namePlaceholder: 'Ex.: Maria da Silva', documentPlaceholder: 'Ex.: BI / NIF / RG / CPF' },
  'es': { namePlaceholder: 'Ej.: María da Silva', documentPlaceholder: 'Ej.: BI / NIF / RG / CPF' },
  'es-US': { namePlaceholder: 'Ej.: María da Silva', documentPlaceholder: 'Ej.: BI / NIF / RG / CPF' },
  'fr': { namePlaceholder: 'Ex. : Maria da Silva', documentPlaceholder: 'Ex. : BI / NIF / RG / CPF' },
  'ar': { namePlaceholder: 'مثال: ماريا دا سيلفا', documentPlaceholder: 'مثال: BI / NIF / RG / CPF' },
  'ru': { namePlaceholder: 'Пример: Мария да Силва', documentPlaceholder: 'Пример: BI / NIF / RG / CPF' },
  'ln': { namePlaceholder: 'Ex.: Maria da Silva', documentPlaceholder: 'Ex.: BI / NIF / RG / CPF' },
  'hi': { namePlaceholder: 'उदा.: मारिया दा सिल्वा', documentPlaceholder: 'उदा.: BI / NIF / RG / CPF' },
  'bn': { namePlaceholder: 'উদাঃ মারিয়া দা সিলভা', documentPlaceholder: 'উদাঃ BI / NIF / RG / CPF' },
  'zh': { namePlaceholder: '例如：Maria da Silva', documentPlaceholder: '例如：BI / NIF / RG / CPF' },
  'ja': { namePlaceholder: '例：マリア・ダ・シルヴァ', documentPlaceholder: '例：BI / NIF / RG / CPF' },
  'ko': { namePlaceholder: '예: 마리아 다 시우바', documentPlaceholder: '예: BI / NIF / RG / CPF' },
  'vi': { namePlaceholder: 'VD: Maria da Silva', documentPlaceholder: 'VD: BI / NIF / RG / CPF' },
  'tl': { namePlaceholder: 'Hal: Maria da Silva', documentPlaceholder: 'Hal: BI / NIF / RG / CPF' },
};
for (const lang of langs) {
  const file = path.join(DIR, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.profile) { console.log(`Skipping ${lang} - no profile section`); continue; }
  if (data.profile.namePlaceholder) { console.log(`Skipping ${lang} - already has placeholders`); continue; }
  const p = placeholders[lang] || placeholders['en'];
  const insertAfter = data.profile.document ? 'document' : 'beneficiaryType';
  const newProfile = {};
  for (const [k, v] of Object.entries(data.profile)) {
    newProfile[k] = v;
    if (k === insertAfter) {
      newProfile['namePlaceholder'] = p.namePlaceholder;
      newProfile['documentPlaceholder'] = p.documentPlaceholder;
    }
  }
  if (!newProfile.namePlaceholder) {
    newProfile['namePlaceholder'] = p.namePlaceholder;
    newProfile['documentPlaceholder'] = p.documentPlaceholder;
  }
  data.profile = newProfile;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${lang}.json`);
}
console.log('Done!');
