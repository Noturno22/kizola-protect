#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'assets', 'translations');

const NEW_KEYS = {
  en: { other: 'Other', adminPanel: 'Admin Panel', adminPanelSubtitle: 'Manage users and platform' },
  pt: { other: 'Outro', adminPanel: 'Painel Admin', adminPanelSubtitle: 'Gerir utilizadores e plataforma' },
  fr: { other: 'Autre', adminPanel: 'Panneau Admin', adminPanelSubtitle: "Gérer les utilisateurs et la plateforme" },
  es: { other: 'Otro', adminPanel: 'Panel Admin', adminPanelSubtitle: 'Administrar usuarios y plataforma' },
  'es-US': { other: 'Otro', adminPanel: 'Panel Admin', adminPanelSubtitle: 'Administrar usuarios y plataforma' },
  ar: { other: 'آخر', adminPanel: 'لوحة الإدارة', adminPanelSubtitle: 'إدارة المستخدمين والمنصة' },
  ru: { other: 'Другой', adminPanel: 'Админ-панель', adminPanelSubtitle: 'Управление пользователями и платформой' },
  zh: { other: '其他', adminPanel: '管理面板', adminPanelSubtitle: '管理用户和平台' },
  ja: { other: 'その他', adminPanel: '管理パネル', adminPanelSubtitle: 'ユーザーとプラットフォームの管理' },
  ko: { other: '기타', adminPanel: '관리 패널', adminPanelSubtitle: '사용자 및 플랫폼 관리' },
  vi: { other: 'Khác', adminPanel: 'Bảng Quản Trị', adminPanelSubtitle: 'Quản lý người dùng và nền tảng' },
  tl: { other: 'Iba pa', adminPanel: 'Admin Panel', adminPanelSubtitle: 'Pamahalaan ang mga user at platform' },
  hi: { other: 'अन्य', adminPanel: 'एडमिन पैनल', adminPanelSubtitle: 'उपयोगकर्ताओं और प्लेटफ़ॉर्म का प्रबंधन करें' },
  bn: { other: 'অন্যান্য', adminPanel: 'অ্যাডমিন প্যানেল', adminPanelSubtitle: 'ব্যবহারকারী এবং প্ল্যাটফর্ম পরিচালনা করুন' },
  ln: { other: 'Ya sikoyo', adminPanel: 'Panélli ya Admin', adminPanelSubtitle: 'Kotindaka ba users na plateforme' },
};

const langs = fs.readdirSync(TRANSLATIONS_DIR)
  .filter(f => f.endsWith('.json') && f !== 'en-articles-reference.json');

let totalAdded = 0;

for (const langFile of langs) {
  const lang = langFile.replace('.json', '');
  const filePath = path.join(TRANSLATIONS_DIR, langFile);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let added = 0;
    
    if (!data.profile) data.profile = {};
    
    const keys = NEW_KEYS[lang] || NEW_KEYS['en'];
    
    if (!data.profile.other) {
      data.profile.other = keys.other;
      added++;
    }
    
    if (!data.profile.adminPanel) {
      data.profile.adminPanel = keys.adminPanel;
      added++;
    }
    
    if (!data.profile.adminPanelSubtitle) {
      data.profile.adminPanelSubtitle = keys.adminPanelSubtitle;
      added++;
    }
    
    if (added > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✅ ${lang}: added ${added} profile keys`);
      totalAdded += added;
    } else {
      console.log(`⏭️  ${lang}: already has all profile keys`);
    }
  } catch (err) {
    console.error(`❌ ${lang}: ${err.message}`);
  }
}

console.log(`\n📊 Total: ${totalAdded} keys added across ${langs.length} languages`);
