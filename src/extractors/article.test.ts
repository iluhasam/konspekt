import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@extractus/article-extractor', () => ({
  extract: vi.fn(),
}));

import { extract as libExtract } from '@extractus/article-extractor';
import { extractArticle } from './article.js';
import { ExtractionError } from './types.js';

const mocked = vi.mocked(libExtract);

beforeEach(() => mocked.mockReset());

describe('extractArticle', () => {
  it('маппит результат в ExtractedContent и чистит html', async () => {
    mocked.mockResolvedValue({
      title: 'Заголовок',
      content: '<p>Абзац <b>текст</b></p>',
    } as any);
    const res = await extractArticle('https://example.com/a');
    expect(res.sourceType).toBe('ARTICLE');
    expect(res.title).toBe('Заголовок');
    expect(res.url).toBe('https://example.com/a');
    expect(res.text).toContain('Абзац');
    expect(res.text).not.toContain('<p>');
  });

  it('бросает ExtractionError, если библиотека вернула null', async () => {
    mocked.mockResolvedValue(null as any);
    await expect(extractArticle('https://example.com/a')).rejects.toBeInstanceOf(
      ExtractionError,
    );
  });

  it('бросает ExtractionError, если нет текста', async () => {
    mocked.mockResolvedValue({ title: 'T', content: '' } as any);
    await expect(extractArticle('https://example.com/a')).rejects.toBeInstanceOf(
      ExtractionError,
    );
  });
});
