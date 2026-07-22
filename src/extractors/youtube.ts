import { YoutubeTranscript } from 'youtube-transcript';
import type { ExtractedContent } from './types.js';
import { ExtractionError } from './types.js';

export async function extractYoutube(url: string): Promise<ExtractedContent> {
  let segments: Array<{ text: string }>;
  try {
    segments = await YoutubeTranscript.fetchTranscript(url);
  } catch {
    throw new ExtractionError('У видео нет субтитров — конспект невозможен');
  }
  const text = segments
    .map((s) => s.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) {
    throw new ExtractionError('Транскрипт видео пуст');
  }
  return { sourceType: 'YOUTUBE', title: 'Видео YouTube', url, text };
}
