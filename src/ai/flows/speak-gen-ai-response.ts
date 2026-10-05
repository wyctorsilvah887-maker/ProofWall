'use server';
/**
 * @fileOverview Placeholder for TTS.
 */
import { z } from 'genkit';

const InputSchema = z.object({ text: z.string() });
const OutputSchema = z.object({ audioDataUri: z.string() });

export async function speakGenAIResponse(input: z.infer<typeof InputSchema>) {
  return { audioDataUri: "" };
}
