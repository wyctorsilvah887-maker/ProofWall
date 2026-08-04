import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Inicializa a instância global do Genkit.
 * O plugin googleAI busca automaticamente pela variável de ambiente GOOGLE_GENAI_API_KEY.
 * Se você estiver usando GEMINI_API_KEY, o Genkit também deve reconhecê-la por padrão.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
