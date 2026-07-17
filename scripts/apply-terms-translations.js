#!/usr/bin/env node
/**
 * Applies terms & privacy translations from scripts/terms-translations/
 * into the main translation JSON files (assets/translations/*.json).
 *
 * Also fixes 5 benefit keys that were left in English.
 *
 * Usage: node scripts/apply-terms-translations.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const translationsDir = path.join(__dirname, '..', 'assets', 'translations');
const termsDir = path.join(__dirname, 'terms-translations');

// ─── Array → Key mapping ──────────────────────────────────────────────────────
// Both terms and privacy arrays map to the same key structure used by terms.tsx

const TERMS_KEYS = [
  'title',                          // [0]
  'lastUpdated',                    // [1]
  'welcome',                        // [2]
  'section1Title',                  // [3]
  'section1Body',                   // [4]
  'section2Title',                  // [5]
  'section2Body',                   // [6]
  'section3Title',                  // [7]
  'section3Body',                   // [8]
  'section4Title',                  // [9]
  'section4Body',                   // [10]
  'section5Title',                  // [11]
  'section5Intro',                  // [12]
  'section5Bullet1',                // [13]
  'section5Bullet2',                // [14]
  'section5Bullet3',                // [15]
  'section5Bullet4',                // [16]
  'section5Bullet5',                // [17]
  'section5Bullet6',                // [18]
  'section5Bullet7',                // [19]
  'section6Title',                  // [20]
  'section6Body',                   // [21]
  'section7Title',                  // [22]
  'section7Body',                   // [23]
  'section8Title',                  // [24]
  'section8Body',                   // [25]
  'section9Title',                  // [26]
  'section9Body',                   // [27]
  'section10Title',                 // [28]
  'section10Body',                  // [29]
  'section11Title',                 // [30]
  'section11Intro',                 // [31]
  'section11Email',                 // [32]
  'section11Address',               // [33]
  'section11Phone',                 // [34]
];

const PRIVACY_KEYS = [
  'title',                          // [0]
  'lastUpdated',                    // [1]
  'welcome',                        // [2]
  'section1Title',                  // [3]
  'section1Intro',                  // [4]
  'section1Bullet1',                // [5]
  'section1Bullet2',                // [6]
  'section1Bullet3',                // [7]
  'section1Bullet4',                // [8]
  'section1Bullet5',                // [9]
  'section1Bullet6',                // [10]
  'section2Title',                  // [11]
  'section2Intro',                  // [12]
  'section2Bullet1',                // [13]
  'section2Bullet2',                // [14]
  'section2Bullet3',                // [15]
  'section2Bullet4',                // [16]
  'section2Bullet5',                // [17]
  'section2Bullet6',                // [18]
  'section2Bullet7',                // [19]
  'section2Bullet8',                // [20]
  'section3Title',                  // [21]
  'section3Intro',                  // [22]
  'section3Bullet1',                // [23]
  'section3Bullet2',                // [24]
  'section3Bullet3',                // [25]
  'section3Bullet4',                // [26]
  'section4Title',                  // [27]
  'section4Body',                   // [28]
  'section5Title',                  // [29]
  'section5Intro',                  // [30]
  'section5Bullet1',                // [31]
  'section5Bullet2',                // [32]
  'section5Bullet3',                // [33]
  'section5Bullet4',                // [34]
  'section5Bullet5',                // [35]
  'section5Bullet6',                // [36]
  'section6Title',                  // [37]
  'section6Body',                   // [38]
  'section7Title',                  // [39]
  'section7Body',                   // [40]
  'section8Title',                  // [41]
  'section8Body',                   // [42]
  'section9Title',                  // [43]
  'section9Body',                   // [44]
  'section10Title',                 // [45]
  'section10Intro',                 // [46]
  'section10Email',                 // [47]
  'section10Address',               // [48]
  'section10Phone',                 // [49]
];

// ─── Benefits fixes: 5 keys left in English ────────────────────────────────────
// These must be manually translated per language since the original merge missed them

const BENEFITS_FIXES = {
  'fr': {
    'benefits.newServices': 'Nouveaux Services',
    'benefits.financeHelp': 'Aide Financière',
    'benefits.housingSupport': 'Soutien au Logement',
    'benefits.housingSupportDesc': "Obtenez de l'aide pour trouver un logement stable, comprendre les droits des locataires et accéder aux ressources d'hébergement d'urgence.",
    'benefits.financeHelpDesc': "Accédez à une assistance financière pour les paiements de factures, le soutien budgétaire et l'aide économique d'urgence.",
  },
  'es': {
    'benefits.newServices': 'Nuevos Servicios',
    'benefits.financeHelp': 'Ayuda Financiera',
    'benefits.housingSupport': 'Apoyo de Vivienda',
    'benefits.housingSupportDesc': 'Obtenga ayuda para encontrar vivienda estable, comprender los derechos de los inquilinos y acceder a recursos de refugio de emergencia.',
    'benefits.financeHelpDesc': 'Acceda a asistencia financiera para pagos de facturas, apoyo presupuestario y ayuda económica de emergencia.',
  },
  'es-US': {
    'benefits.newServices': 'Nuevos Servicios',
    'benefits.financeHelp': 'Ayuda Financiera',
    'benefits.housingSupport': 'Apoyo de Vivienda',
    'benefits.housingSupportDesc': 'Obtenga ayuda para encontrar vivienda estable, comprender los derechos de los inquilinos y acceder a recursos de refugio de emergencia.',
    'benefits.financeHelpDesc': 'Acceda a asistencia financiera para pagos de facturas, apoyo presupuestario y ayuda económica de emergencia.',
  },
  'ja': {
    'benefits.newServices': '新しいサービス',
    'benefits.financeHelp': '財務サポート',
    'benefits.housingSupport': '住宅サポート',
    'benefits.housingSupportDesc': '安定した住宅の見つけ方、テナントの権利の理解、緊急シェルターリソースへのアクセスをお手伝いします。',
    'benefits.financeHelpDesc': '請求書支払い、予算サポート、緊急経済支援のための財務援助にアクセスできます。',
  },
  'ko': {
    'benefits.newServices': '새로운 서비스',
    'benefits.financeHelp': '금융 지원',
    'benefits.housingSupport': '주택 지원',
    'benefits.housingSupportDesc': '안정적인 주거를 찾고, 세입자 권리를 이해하며, 긴급 주거 지원 자원에 접근하는 데 도움을 받으세요.',
    'benefits.financeHelpDesc': '청구서 결제, 예산 지원 및 긴급 경제 지원을 위한 재정 지원에 접근하세요.',
  },
  'zh': {
    'benefits.newServices': '新服务',
    'benefits.financeHelp': '财务帮助',
    'benefits.housingSupport': '住房支持',
    'benefits.housingSupportDesc': '获取寻找稳定住房、了解租户权利和获取紧急庇护资源的帮助。',
    'benefits.financeHelpDesc': '获取账单支付、预算支持和紧急经济援助的财务帮助。',
  },
  'vi': {
    'benefits.newServices': 'Dịch Vụ Mới',
    'benefits.financeHelp': 'Hỗ Trợ Tài Chính',
    'benefits.housingSupport': 'Hỗ Trợ Nhà Ở',
    'benefits.housingSupportDesc': 'Nhận trợ giúp tìm nhà ở ổn định, hiểu quyền lợi người thuê nhà và tiếp cận tài nguyên nhà ở khẩn cấp.',
    'benefits.financeHelpDesc': 'Tiếp cận hỗ trợ tài chính cho thanh toán hóa đơn, hỗ trợ ngân sách và cứu trợ kinh tế khẩn cấp.',
  },
  'tl': {
    'benefits.newServices': 'Mga Bagong Serbisyo',
    'benefits.financeHelp': 'Tulong Pananalapi',
    'benefits.housingSupport': 'Suporta sa Pabahay',
    'benefits.housingSupportDesc': 'Makakuha ng tulong sa paghahanap ng matatag na pabahay, pag-unawa sa mga karapatan ng nangungupahan, at pag-access sa mga mapagkukunan ng emergency shelter.',
    'benefits.financeHelpDesc': 'Mag-access sa tulong pananalapi para sa pagbabayad ng bills, suporta sa pagbabudget, at emergency economic aid.',
  },
  'ar': {
    'benefits.newServices': 'خدمات جديدة',
    'benefits.financeHelp': 'مساعدة مالية',
    'benefits.housingSupport': 'دعم السكن',
    'benefits.housingSupportDesc': 'احصل على مساعدة في العثور على سكن مستقر، وفهم حقوق المستأجر، والوصول إلى موارد الإيواء الطارئ.',
    'benefits.financeHelpDesc': 'الحصول على المساعدة المالية لدفع الفواتير، والدعم الميزانيوي، والمساعدة الاقتصادية الطارئة.',
  },
  'ru': {
    'benefits.newServices': 'Новые услуги',
    'benefits.financeHelp': 'Финансовая помощь',
    'benefits.housingSupport': 'Поддержка жилья',
    'benefits.housingSupportDesc': 'Получите помощь в поиске стабильного жилья, понимании прав арендатора и доступе к ресурсам экстренного жилья.',
    'benefits.financeHelpDesc': 'Получите финансовую помощь для оплаты счетов, поддержки бюджета и экстренной экономической помощи.',
  },
  'hi': {
    'benefits.newServices': 'नई सेवाएँ',
    'benefits.financeHelp': 'वित्तीय सहायता',
    'benefits.housingSupport': 'आवास सहायता',
    'benefits.housingSupportDesc': 'स्थिर आवास खोजने, किरायेदार अधिकारों को समझने और आपातकालीन आश्रय संसाधनों तक पहुँचने में सहायता प्राप्त करें।',
    'benefits.financeHelpDesc': 'बिल भुगतान, बजट सहायता और आपातकालीन आर्थिक सहायता के लिए वित्तीय सहायता प्राप्त करें।',
  },
  'bn': {
    'benefits.newServices': 'নতুন সেবাসমূহ',
    'benefits.financeHelp': 'আর্থিক সহায়তা',
    'benefits.housingSupport': 'আবাসন সহায়তা',
    'benefits.housingSupportDesc': 'স্থিতিশীল আবাসন খুঁজে পেতে, হুকুমদার অধিকার বুঝতে এবং জরুরি আশ্রয় সম্পদে প্রবেশ করতে সহায়তা পান।',
    'benefits.financeHelpDesc': 'বিল পরিশোধ, বাজেট সহায়তা এবং জরুরি অর্থনৈতিক সহায়তার জন্য আর্থিক সহায়তা পান।',
  },
  'ln': {
    'benefits.newServices': 'Sevisi Eswa',
    'benefits.financeHelp': 'Likolasi ya Moni',
    'benefits.housingSupport': 'Likolasi ya Ndako',
    'benefits.housingSupportDesc': 'Kolaka likolasi na kolaka ndako, kolaka misango ya moni, na kolaka ndako ya ndako.',
    'benefits.financeHelpDesc': 'Kolaka likolasi ya moni na kolaka ndako, kolaka ndako na kolaka ndako ya ndako.',
  },
};

// ─── Languages to process ──────────────────────────────────────────────────────
const LANGUAGES = ['fr', 'es', 'es-US', 'zh', 'ja', 'ko', 'vi', 'tl', 'ar', 'ru', 'hi', 'bn', 'ln'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function arrayToObj(keys, arr) {
  const obj = {};
  for (let i = 0; i < keys.length; i++) {
    if (arr[i] !== undefined) {
      obj[keys[i]] = arr[i];
    }
  }
  return obj;
}

function deepSet(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in cur) || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

let totalUpdated = 0;
let totalSkipped = 0;

for (const lang of LANGUAGES) {
  const mainPath = path.join(translationsDir, `${lang}.json`);
  const termsPath = path.join(termsDir, `${lang}-terms.json`);
  const privacyPath = path.join(termsDir, `${lang}-privacy.json`);

  if (!fs.existsSync(mainPath)) {
    console.log(`⚠️  [${lang}] Main file not found, skipping`);
    totalSkipped++;
    continue;
  }

  const mainData = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
  let changed = false;

  // ── Terms ──────────────────────────────────────────────────────────────────
  if (fs.existsSync(termsPath)) {
    const termsArr = JSON.parse(fs.readFileSync(termsPath, 'utf8'));
    if (Array.isArray(termsArr) && termsArr.length >= TERMS_KEYS.length) {
      const termsObj = arrayToObj(TERMS_KEYS, termsArr);
      mainData.terms = termsObj;
      changed = true;
      console.log(`✅ [${lang}] terms: ${TERMS_KEYS.length} keys applied`);
    } else {
      console.log(`⚠️  [${lang}] terms array length mismatch (${termsArr.length} vs ${TERMS_KEYS.length}), skipping`);
    }
  } else {
    console.log(`⚠️  [${lang}] ${lang}-terms.json not found`);
  }

  // ── Privacy ────────────────────────────────────────────────────────────────
  if (fs.existsSync(privacyPath)) {
    const privacyArr = JSON.parse(fs.readFileSync(privacyPath, 'utf8'));
    if (Array.isArray(privacyArr) && privacyArr.length >= PRIVACY_KEYS.length) {
      const privacyObj = arrayToObj(PRIVACY_KEYS, privacyArr);
      mainData.privacy = privacyObj;
      changed = true;
      console.log(`✅ [${lang}] privacy: ${PRIVACY_KEYS.length} keys applied`);
    } else {
      console.log(`⚠️  [${lang}] privacy array length mismatch (${privacyArr.length} vs ${PRIVACY_KEYS.length}), skipping`);
    }
  } else {
    console.log(`⚠️  [${lang}] ${lang}-privacy.json not found`);
  }

  // ── Benefits fixes ─────────────────────────────────────────────────────────
  const fixes = BENEFITS_FIXES[lang];
  if (fixes) {
    for (const [key, value] of Object.entries(fixes)) {
      deepSet(mainData, key, value);
    }
    changed = true;
    console.log(`✅ [${lang}] benefits: ${Object.keys(fixes).length} keys fixed`);
  }

  // ── Write back ─────────────────────────────────────────────────────────────
  if (changed) {
    if (!DRY_RUN) {
      fs.writeFileSync(mainPath, JSON.stringify(mainData, null, 2) + '\n', 'utf8');
    }
    totalUpdated++;
    console.log(`   → ${lang}.json ${DRY_RUN ? '(dry-run, not written)' : 'updated'}`);
  }
}

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`Total languages updated: ${totalUpdated}`);
console.log(`Total skipped: ${totalSkipped}`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no files written)' : 'APPLIED'}`);
