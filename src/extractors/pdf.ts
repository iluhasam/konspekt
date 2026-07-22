import pdfParse from 'pdf-parse';
import type { ExtractedContent } from './types.js';
import { ExtractionError } from './types.js';

export async function extractPdf(
  buffer: Buffer,
  filename: string,
): Promise<ExtractedContent> {
  let text: string;
  try {
    const parsed = await pdfParse(buffer);
    text = parsed.text.replace(/\s+/g, ' ').trim();
  } catch (e) {
    throw new ExtractionError(`Не удалось прочитать PDF: ${(e as Error).message}`);
  }
  if (!text) throw new ExtractionError('PDF не содержит извлекаемого текста');
  return { sourceType: 'PDF', title: filename, text };
}
