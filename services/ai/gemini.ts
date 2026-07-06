const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export async function sendMessage(messages: Message[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const contents = messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const systemInstruction =
    'És um assistente de suporte da Kizola Protect, uma plataforma de proteção e assistência para imigrantes em Portugal. ' +
    'Respondes de forma útil, empática e em português de Portugal. Ajudas com questões sobre planos, benefícios, documentos, ' +
    'imigração, questões legais, habitação, finanças e apoio de emergência. ' +
    'Se não souberes responder, pede desculpa e sugere contactar o suporte humano via WhatsApp (+1 929 609-7035). ' +
    'Respostas concisas e diretas, máximo 3 parágrafos.';

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpa, não consegui processar a tua pergunta.';
  } catch (error) {
    console.error('[Gemini]', error);
    throw error;
  }
}
