import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pdf-parse', () => ({ default: vi.fn() }));

import pdfParse from 'pdf-parse';
import { extractPdf } from './pdf.js';
import { ExtractionError } from './types.js';

const mocked = vi.mocked(pdfParse);
beforeEach(() => mocked.mockReset());

describe('extractPdf', () => {
  it('извлекает текст и берёт заголовок из имени файла', async () => {
    mocked.mockResolvedValue({ text: 'Текст документа' } as any);
    const res = await extractPdf(Buffer.from('x'), 'отчёт.pdf');
    expect(res.sourceType).toBe('PDF');
    expect(res.title).toBe('отчёт.pdf');
    expect(res.text).toBe('Текст документа');
    expect(res.url).toBeUndefined();
  });

  it('бросает ExtractionError при пустом тексте', async () => {
    mocked.mockResolvedValue({ text: '   ' } as any);
    await expect(extractPdf(Buffer.from('x'), 'f.pdf')).rejects.toBeInstanceOf(
      ExtractionError,
    );
  });
});
