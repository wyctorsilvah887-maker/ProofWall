'use server';
/**
 * @fileOverview Placeholder for query processing.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({ query: z.string() });
const OutputSchema = z.object({ response: z.string() });

export async function processSpokenQuery(input: z.infer<typeof InputSchema>) {
  return { response: "Reset completed." };
}
