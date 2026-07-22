import mammoth from 'mammoth';
import type { ExtractedContent } from './types.js';
import { ExtractionError } from './types.js';

export async function extractDocx(
  buffer: Buffer,
  filename: string,
): Promise<ExtractedContent> {
  let text: string;
  try {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value.replace(/\s+/g, ' ').trim();
  } catch (e) {
    throw new ExtractionError(`Не удалось прочитать DOCX: ${(e as Error).message}`);
  }
  if (!text) throw new ExtractionError('DOCX не содержит текста');
  return { sourceType: 'DOCX', title: filename, text };
}
