import { config } from 'dotenv';
config();

import '@/ai/flows/process-spoken-query.ts';
import '@/ai/flows/speak-gen-ai-response.ts';