const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export async function sendMessage(messages: Message[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const systemMessage = {
    role: 'system' as const,
    content:
      'És um assistente de suporte da Kizola Protect, uma plataforma de proteção e assistência para imigrantes em Portugal. ' +
      'Respondes de forma útil, empática e em português de Portugal. Ajudas com questões sobre planos, benefícios, documentos, ' +
      'imigração, questões legais, habitação, finanças e apoio de emergência. ' +
      'Se não souberes responder, pede desculpa e sugere contactar o suporte humano via WhatsApp (+1 929 609-7035). ' +
      'Respostas concisas e diretas, máximo 3 parágrafos.',
  };

  const formattedMessages = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.text,
  }));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [systemMessage, ...formattedMessages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Desculpa, não consegui processar a tua pergunta.';
  } catch (error) {
    console.error('[Groq]', error);
    throw error;
  }
}
