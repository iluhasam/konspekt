import type { BotInput, ExtractedContent } from './types.js';
import { UnsupportedInputError } from './types.js';
import { detectUrlSource, detectFileSource } from './router.js';
import { extractArticle } from './article.js';
import { extractYoutube } from './youtube.js';
import { extractPdf } from './pdf.js';
import { extractDocx } from './docx.js';

export { extractArticle } from './article.js';
export { extractYoutube } from './youtube.js';
export { extractPdf } from './pdf.js';
export { extractDocx } from './docx.js';

export async function extract(input: BotInput): Promise<ExtractedContent> {
  if (input.kind === 'url') {
    const source = detectUrlSource(input.url);
    return source === 'YOUTUBE'
      ? extractYoutube(input.url)
      : extractArticle(input.url);
  }
  const fileSource = detectFileSource(input.filename);
  if (fileSource === 'PDF') return extractPdf(input.buffer, input.filename);
  if (fileSource === 'DOCX') return extractDocx(input.buffer, input.filename);
  throw new UnsupportedInputError(
    'Поддерживаются только PDF и DOCX. Пришли ссылку или такой файл.',
  );
}
