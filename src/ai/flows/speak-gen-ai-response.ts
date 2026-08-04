'use server';
/**
 * @fileOverview A Genkit flow for converting a text response into spoken audio using a male voice.
 *
 * - speakGenAIResponse - A function that handles the text-to-speech process.
 * - SpeakGenAIResponseInput - The input type for the speakGenAIResponse function.
 * - SpeakGenAIResponseOutput - The return type for the speakGenAIResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const SpeakGenAIResponseInputSchema = z.object({
  text: z.string().describe('The textual response from the AI to be spoken aloud.'),
});
export type SpeakGenAIResponseInput = z.infer<typeof SpeakGenAIResponseInputSchema>;

const SpeakGenAIResponseOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated speech as a WAV audio data URI, that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type SpeakGenAIResponseOutput = z.infer<typeof SpeakGenAIResponseOutputSchema>;

export async function speakGenAIResponse(
  input: SpeakGenAIResponseInput
): Promise<SpeakGenAIResponseOutput> {
  return speakGenAIResponseFlow(input);
}

const speakGenAIResponseFlow = ai.defineFlow(
  {
    name: 'speakGenAIResponseFlow',
    inputSchema: SpeakGenAIResponseInputSchema,
    outputSchema: SpeakGenAIResponseOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: input.text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Male voice for Jarvis
          },
        },
      },
    });

    if (!media) {
      throw new Error('No audio media returned from TTS model.');
    }

    // The media.url from TTS is 'data:audio/pcm;base64,...'
    const base64Audio = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(base64Audio, 'base64');

    // Convert PCM to WAV and base64 encode it
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

// Helper function to convert PCM audio buffer to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
