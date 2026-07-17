#!/usr/bin/env node
/**
 * Patch untranslated strings in hi.json and bn.json
 * Covers: benefits UI + learn UI strings
 */
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'assets', 'translations');

const HI_PATCHES = {
  // Benefits untranslated strings
  'benefits.newServices': 'नई सेवाएँ',
  'benefits.housingSupport': 'आवास सहायता',
  'benefits.housingSupportDesc': 'आवास खोज, आश्रय और आवास कार्यक्रम',
  'benefits.financeHelp': 'वित्तीय सहायता',
  'benefits.financeHelpDesc': 'EBT, राज्य लाभ, कर और कर रिटर्न',
  // Learn UI untranslated strings
  'learn.category_health': 'स्वास्थ्य',
  'learn.category_finance': 'वित्त',
  'learn.category_education': 'शिक्षा',
  'learn.category_safety': 'सुरक्षा',
  'learn.category_community': 'समुदाय',
  'learn.category_work': 'कार्य',
  'learn.popular': 'लोकप्रिय',
  'learn.recent': 'हाल के',
  'learn.recommended': 'आपके लिए अनुशंसित',
  'learn.saved': 'आपके सहेजे गए लेख',
  'learn.noSaved': 'अभी तक कोई सहेजा गया लेख नहीं',
  'learn.sortBy': 'क्रमबद्ध करें',
  'learn.sortRecent': 'सबसे हाल का',
  'learn.sortPopular': 'सबसे लोकप्रिय',
  'learn.sortAZ': 'A-Z',
  'learn.sortReadTime': 'पढ़ने का समय',
  'learn.filters': 'फ़िल्टर',
  'learn.clearFilters': 'सभी साफ़ करें',
  'learn.applyFilters': 'फ़िल्टर लागू करें',
  'learn.difficulty': 'कठिनाई',
  'learn.beginner': 'शुरुआती',
  'learn.intermediate': 'मध्यम',
  'learn.advanced': 'उन्नत',
  'learn.readTime': 'पढ़ने का समय',
  'learn.under5': '5 मिनट से कम',
  'learn.fiveTo10': '5-10 मिनट',
  'learn.over10': '10+ मिनट',
  'learn.relatedArticles': 'संबंधित लेख',
  'learn.bookmarked': 'सहेजा गया',
  'learn.shareArticle': 'लेख शेयर करें',
  'learn.noResults': 'कोई लेख नहीं मिला',
  'learn.tryDifferent': 'अलग खोज शब्द या फ़िल्टर आज़माएँ',
  'learn.tryDifferentFilters': 'अलग खोज शब्द या फ़िल्टर आज़माएँ',
  'learn.min': 'मिनट'
};

const BN_PATCHES = {
  // Benefits untranslated strings
  'benefits.newServices': 'নতুন সেবা',
  'benefits.housingSupport': 'আবাসন সহায়তা',
  'benefits.housingSupportDesc': 'আবাসন অনুসন্ধান, আশ্রয় এবং আবাসন কার্যক্রম',
  'benefits.financeHelp': 'আর্থিক সহায়তা',
  'benefits.financeHelpDesc': 'EBT, রাজ্য সুবিধা, কর এবং কর রিটার্ন',
  // Learn UI untranslated strings
  'learn.category_health': 'স্বাস্থ্য',
  'learn.category_finance': 'অর্থ',
  'learn.category_education': 'শিক্ষা',
  'learn.category_safety': 'নিরাপত্তা',
  'learn.category_community': 'সম্প্রদায়',
  'learn.category_work': 'কাজ',
  'learn.popular': 'জনপ্রিয়',
  'learn.recent': 'সাম্প্রতিক',
  'learn.recommended': 'আপনার জন্য সুপারিশকৃত',
  'learn.saved': 'আপনার সংরক্ষিত নিবন্ধ',
  'learn.noSaved': 'এখনো কোনো সংরক্ষিত নিবন্ধ নেই',
  'learn.sortBy': 'সাজান',
  'learn.sortRecent': 'সবচেয়ে সাম্প্রতিক',
  'learn.sortPopular': 'সবচেয়ে জনপ্রিয়',
  'learn.sortAZ': 'A-Z',
  'learn.sortReadTime': 'পড়ার সময়',
  'learn.filters': 'ফিল্টার',
  'learn.clearFilters': 'সব মুছুন',
  'learn.applyFilters': 'ফিল্টার প্রয়োগ করুন',
  'learn.difficulty': 'কঠিনতা',
  'learn.beginner': 'শিক্ষানবিস',
  'learn.intermediate': 'মধ্যম',
  'learn.advanced': 'উন্নত',
  'learn.readTime': 'পড়ার সময়',
  'learn.under5': '৫ মিনিটের কম',
  'learn.fiveTo10': '৫-১০ মিনিট',
  'learn.over10': '১০+ মিনিট',
  'learn.relatedArticles': 'সম্পর্কিত নিবন্ধ',
  'learn.bookmarked': 'সংরক্ষিত',
  'learn.shareArticle': 'নিবন্ধ শেয়ার করুন',
  'learn.noResults': 'কোনো নিবন্ধ পাওয়া যায়নি',
  'learn.tryDifferent': 'ভিন্ন অনুসন্ধান শব্দ বা ফিল্টার চেষ্টা করুন',
  'learn.tryDifferentFilters': 'ভিন্ন অনুসন্ধান শব্দ বা ফিল্টার চেষ্টা করুন',
  'learn.min': 'মিনিট'
};

function setNested(obj, dotPath, value) {
  const keys = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in cur)) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function patchFile(filename, patches) {
  const filePath = path.join(TRANSLATIONS_DIR, filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let patched = 0;
  for (const [dotPath, value] of Object.entries(patches)) {
    setNested(data, dotPath, value);
    patched++;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Patched ${patched} strings in ${filename}`);
  return patched;
}

// Patch both files
patchFile('hi.json', HI_PATCHES);
patchFile('bn.json', BN_PATCHES);
console.log('Done! Benefits + Learn UI strings patched.');
