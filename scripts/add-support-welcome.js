#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'assets', 'translations');

const WELCOME_MESSAGES = {
  en: "Hi! I'm Kizola's virtual assistant. How can I help you today?",
  pt: 'Olá! Sou o assistente virtual da Kizola. Como posso ajudar hoje?',
  fr: "Bonjour ! Je suis l'assistant virtuel de Kizola. Comment puis-je vous aider aujourd'hui ?",
  es: '¡Hola! Soy el asistente virtual de Kizola. ¿Cómo puedo ayudarte hoy?',
  'es-US': '¡Hola! Soy el asistente virtual de Kizola. ¿Cómo puedo ayudarte hoy?',
  ar: '!مرحبًا، أنا المساعد الافتراضي لشركة كيزولا. كيف يمكنني مساعدتك اليوم',
  ru: 'Привет! Я виртуальный помощник Kizola. Чем я могу помочь вам сегодня?',
  zh: '你好！我是 Kizola 的虚拟助手。今天我能帮你什么？',
  ja: 'こんにちは！Kizolaのバーチャルアシスタントです。今日はどのようにお手伝いできますか？',
  ko: '안녕하세요! Kizola의 가상 어시스턴트입니다. 오늘 무엇을 도와드릴까요?',
  vi: 'Xin chào! Tôi là trợ lý ảo của Kizola. Hôm nay tôi có thể giúp gì cho bạn?',
  tl: 'Kamusta! Ako ang virtual assistant ng Kizola. Paano kita matutulungan ngayon?',
  hi: 'नमस्ते! मैं Kizola का वर्चुअल असिस्टेंट हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
  bn: 'হ্যালো! আমি Kizola-এর ভার্চুয়াল সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
  ln: 'Mbote! Na assistante ya Kizola. Naka koyebaka na ngai na ngai?',
};

const ERROR_MESSAGES = {
  en: "Sorry, an error occurred contacting the assistant. Please try again or contact us via WhatsApp (+1 929 609-7035).",
  pt: 'Desculpa, ocorreu um erro ao contactar o assistente. Por favor, tenta novamente ou contacta-nos pelo WhatsApp (+1 929 609-7035).',
  fr: "Désolé, une erreur s'est produite lors de la connexion à l'assistant. Veuillez réessayer ou nous contacter via WhatsApp (+1 929 609-7035).",
  es: 'Lo siento, ocurrió un error al contactar al asistente. Por favor, inténtalo de nuevo o contáctanos vía WhatsApp (+1 929 609-7035).',
  'es-US': 'Lo siento, ocurrió un error al contactar al asistente. Por favor, inténtalo de nuevo o contáctanos vía WhatsApp (+1 929 609-7035).',
  ar: 'عذرًا، حدث خطأ في الاتصال بالمساعد. يرجى المحاولة مرة أخرى أو التواصل معنا عبر WhatsApp (+1 929 609-7035).',
  ru: 'Извините, произошла ошибка при связи с ассистентом. Пожалуйста, попробуйте снова или свяжитесь с нами через WhatsApp (+1 929 609-7035).',
  zh: '抱歉，联系助手时出错。请重试或通过 WhatsApp (+1 929 609-7035) 联系我们。',
  ja: '申し訳ありません、アシスタントへの接続中にエラーが発生しました。もう一度お試しいただくか、WhatsApp (+1 929 609-7035) でお問い合わせください。',
  ko: '죄송합니다. 어시스턴트 연결 중 오류가 발생했습니다. 다시 시도하거나 WhatsApp (+1 929 609-7035)으로 문의해 주세요.',
  vi: 'Xin lỗi, đã xảy ra lỗi khi liên hệ với trợ lý. Vui lòng thử lại hoặc liên hệ với chúng tôi qua WhatsApp (+1 929 609-7035).',
  tl: 'Paumanhin, nagkaroon ng error sa pakikipag-ugnayan sa assistant. Mangyaring subukan muli o makipag-ugnayan sa amin sa WhatsApp (+1 929 609-7035).',
  hi: 'क्षमा करें, सहायक से संपर्क करते समय त्रुटि हुई। कृपया पुनः प्रयास करें या WhatsApp (+1 929 609-7035) पर हमसे संपर्क करें।',
  bn: 'দুঃখিত, সহকারীর সাথে যোগাযোগ করতে ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন বা WhatsApp (+1 929 609-7035) এ আমাদের সাথে যোগাযোগ করুন।',
  ln: 'Soki moko, error ekoki na kosanga assistant. Svp koboya moko po, to contact na WhatsApp (+1 929 609-7035).',
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
    
    if (!data.support) data.support = {};
    
    if (!data.support.aiWelcome) {
      data.support.aiWelcome = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES['en'];
      added++;
    }
    
    if (!data.support.aiError) {
      data.support.aiError = ERROR_MESSAGES[lang] || ERROR_MESSAGES['en'];
      added++;
    }
    
    if (added > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✅ ${lang}: added ${added} support keys`);
      totalAdded += added;
    } else {
      console.log(`⏭️  ${lang}: already has aiWelcome and aiError`);
    }
  } catch (err) {
    console.error(`❌ ${lang}: ${err.message}`);
  }
}

console.log(`\n📊 Total: ${totalAdded} keys added across ${langs.length} languages`);
