const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'assets', 'translations');
const langs = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.replace('.json', ''));
const translations = {
  'en': { noNotifications: 'No notifications', allCaughtUp: "You're all caught up!" },
  'pt': { noNotifications: 'Sem notificações', allCaughtUp: 'Está tudo em dia!' },
  'es': { noNotifications: 'Sin notificaciones', allCaughtUp: '¡Estás al día!' },
  'es-US': { noNotifications: 'Sin notificaciones', allCaughtUp: '¡Estás al día!' },
  'fr': { noNotifications: 'Aucune notification', allCaughtUp: "Tout est à jour !" },
  'ar': { noNotifications: 'لا توجد إشعارات', allCaughtUp: 'كل شيء محدّث!' },
  'ru': { noNotifications: 'Нет уведомлений', allCaughtUp: 'Всё актуально!' },
  'ln': { noNotifications: 'Mpesi ya ndenge', allCaughtUp: 'Ndenge ya malamu!' },
  'hi': { noNotifications: 'कोई सूचना नहीं', allCaughtUp: 'सब कुछ अद्यतन है!' },
  'bn': { noNotifications: 'কোনো বিজ্ঞপ্তি নেই', allCaughtUp: 'সব কিছু আপডেট আছে!' },
  'zh': { noNotifications: '没有通知', allCaughtUp: '一切都已处理！' },
  'ja': { noNotifications: '通知はありません', allCaughtUp: 'すべて確認済みです！' },
  'ko': { noNotifications: '알림이 없습니다', allCaughtUp: '모두 확인했습니다!' },
  'vi': { noNotifications: 'Không có thông báo', allCaughtUp: 'Bạn đã xem hết rồi!' },
  'tl': { noNotifications: 'Walang abiso', allCaughtUp: 'Naka-update na lahat!' },
};
for (const lang of langs) {
  const file = path.join(DIR, `${lang}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  if (data.notifications && typeof data.notifications === 'string') {
    console.log(`Skipping ${lang} - notifications is a flat string, need different approach`);
    continue;
  }
  if (data.notifications?.noNotifications) {
    console.log(`Skipping ${lang} - already has keys`);
    continue;
  }
  console.log(`Skipping ${lang} - notifications is object or missing`);
}
console.log('Checking structure...');
const en = JSON.parse(fs.readFileSync(path.join(DIR, 'en.json'), 'utf8'));
console.log('en.notifications type:', typeof en.notifications);
console.log('en.noNotifications:', en.noNotifications);
