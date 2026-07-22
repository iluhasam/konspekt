import { extract as libExtract } from '@extractus/article-extractor';
import type { ExtractedContent } from './types.js';
import { ExtractionError } from './types.js';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function extractArticle(url: string): Promise<ExtractedContent> {
  let article: { title?: string; content?: string } | null;
  try {
    article = await libExtract(url);
  } catch (e) {
    throw new ExtractionError(`Не удалось загрузить статью: ${(e as Error).message}`);
  }
  const text = article?.content ? stripHtml(article.content) : '';
  if (!text) {
    throw new ExtractionError('Не удалось извлечь текст статьи');
  }
  return {
    sourceType: 'ARTICLE',
    title: article?.title?.trim() || 'Без заголовка',
    url,
    text,
  };
}
