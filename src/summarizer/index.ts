import OpenAI from 'openai';
import { z } from 'zod';
import type { Config } from '../config.js';
import type { ExtractedContent } from '../extractors/types.js';
import { buildMessages } from './prompt.js';

export interface Konspekt {
  summary: string;
  keyPoints: string[];
  tags: string[];
}

const schema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  tags: z.array(z.string()),
});

function parseKonspekt(raw: string): Konspekt {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Ответ модели не содержит JSON-объекта');
  }
  return schema.parse(JSON.parse(raw.slice(start, end + 1)));
}

export function createSummarizer(
  config: Config,
): (content: ExtractedContent) => Promise<Konspekt> {
  const client = new OpenAI({
    apiKey: config.openRouterApiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  async function callOnce(content: ExtractedContent): Promise<Konspekt> {
    const completion = await client.chat.completions.create({
      model: config.openRouterModel,
      messages: buildMessages(content),
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content ?? '';
    return parseKonspekt(text);
  }

  return async function summarize(content: ExtractedContent): Promise<Konspekt> {
    try {
      return await callOnce(content);
    } catch {
      return await callOnce(content); // один ретрай
    }
  };
}
