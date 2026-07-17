#!/usr/bin/env node
/**
 * Script to add terms and privacy sections to remaining translation files
 * Run: node scripts/add-terms-privacy.js
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'translations');

// Terms structure from en.json - we use the same keys, different values
const TERMS_KEYS = [
  "title", "lastUpdated", "welcome",
  "section1Title", "section1Body",
  "section2Title", "section2Body",
  "section3Title", "section3Body",
  "section4Title", "section4Body",
  "section5Title", "section5Intro",
  "section5Bullet1", "section5Bullet2", "section5Bullet3",
  "section5Bullet4", "section5Bullet5", "section5Bullet6", "section5Bullet7",
  "section6Title", "section6Body",
  "section7Title", "section7Body",
  "section8Title", "section8Body",
  "section9Title", "section9Body",
  "section10Title", "section10Body",
  "section11Title", "section11Intro",
  "section11Email", "section11Address", "section11Phone"
];

const PRIVACY_KEYS = [
  "title", "lastUpdated", "welcome",
  "section1Title", "section1Intro",
  "section1Bullet1", "section1Bullet2", "section1Bullet3",
  "section1Bullet4", "section1Bullet5", "section1Bullet6",
  "section2Title", "section2Intro",
  "section2Bullet1", "section2Bullet2", "section2Bullet3",
  "section2Bullet4", "section2Bullet5", "section2Bullet6",
  "section2Bullet7", "section2Bullet8",
  "section3Title", "section3Intro",
  "section3Bullet1", "section3Bullet2", "section3Bullet3", "section3Bullet4",
  "section4Title", "section4Body",
  "section5Title", "section5Intro",
  "section5Bullet1", "section5Bullet2", "section5Bullet3",
  "section5Bullet4", "section5Bullet5", "section5Bullet6",
  "section6Title", "section6Body",
  "section7Title", "section7Body",
  "section8Title", "section8Body",
  "section9Title", "section9Body",
  "section10Title", "section10Intro",
  "section10Email", "section10Address", "section10Phone"
];

// Load translations from separate files
const translationsDir = path.join(__dirname, 'terms-translations');
const files = ['ln', 'hi', 'bn', 'zh', 'ja', 'ko', 'vi', 'tl'];

for (const lang of files) {
  const termsFile = path.join(translationsDir, `${lang}-terms.json`);
  const privacyFile = path.join(translationsDir, `${lang}-privacy.json`);
  
  if (!fs.existsSync(termsFile) || !fs.existsSync(privacyFile)) {
    console.log(`Skipping ${lang} - translation files not found`);
    continue;
  }
  
  const targetFile = path.join(DIR, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  
  const termsValues = JSON.parse(fs.readFileSync(termsFile, 'utf8'));
  const privacyValues = JSON.parse(fs.readFileSync(privacyFile, 'utf8'));
  
  // Build terms object
  const terms = {};
  TERMS_KEYS.forEach((key, i) => {
    terms[key] = termsValues[i] || '';
  });
  
  // Build privacy object
  const privacy = {};
  PRIVACY_KEYS.forEach((key, i) => {
    privacy[key] = privacyValues[i] || '';
  });
  
  data.terms = terms;
  data.privacy = privacy;
  
  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${lang}.json`);
}

console.log('Done!');
