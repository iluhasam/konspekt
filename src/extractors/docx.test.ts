import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mammoth', () => ({ default: { extractRawText: vi.fn() } }));

import mammoth from 'mammoth';
import { extractDocx } from './docx.js';
import { ExtractionError } from './types.js';

const mocked = vi.mocked(mammoth.extractRawText);
beforeEach(() => mocked.mockReset());

describe('extractDocx', () => {
  it('извлекает текст и берёт заголовок из имени файла', async () => {
    mocked.mockResolvedValue({ value: 'Текст docx', messages: [] } as any);
    const res = await extractDocx(Buffer.from('x'), 'записка.docx');
    expect(res.sourceType).toBe('DOCX');
    expect(res.title).toBe('записка.docx');
    expect(res.text).toBe('Текст docx');
  });

  it('бросает ExtractionError при пустом тексте', async () => {
    mocked.mockResolvedValue({ value: '', messages: [] } as any);
    await expect(extractDocx(Buffer.from('x'), 'f.docx')).rejects.toBeInstanceOf(
      ExtractionError,
    );
  });
});
