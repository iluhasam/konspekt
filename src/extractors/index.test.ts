import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./article.js', () => ({ extractArticle: vi.fn() }));
vi.mock('./youtube.js', () => ({ extractYoutube: vi.fn() }));
vi.mock('./pdf.js', () => ({ extractPdf: vi.fn() }));
vi.mock('./docx.js', () => ({ extractDocx: vi.fn() }));

import { extractArticle } from './article.js';
import { extractYoutube } from './youtube.js';
import { extractPdf } from './pdf.js';
import { extractDocx } from './docx.js';
import { extract } from './index.js';
import { UnsupportedInputError } from './types.js';

beforeEach(() => vi.resetAllMocks());

describe('extract dispatcher', () => {
  it('роутит youtube-ссылку в extractYoutube', async () => {
    vi.mocked(extractYoutube).mockResolvedValue({} as any);
    await extract({ kind: 'url', url: 'https://youtu.be/x' });
    expect(extractYoutube).toHaveBeenCalledOnce();
    expect(extractYoutube).toHaveBeenCalledWith('https://youtu.be/x');
    expect(extractArticle).not.toHaveBeenCalled();
  });

  it('роутит обычную ссылку в extractArticle', async () => {
    vi.mocked(extractArticle).mockResolvedValue({} as any);
    await extract({ kind: 'url', url: 'https://example.com/a' });
    expect(extractArticle).toHaveBeenCalledOnce();
    expect(extractArticle).toHaveBeenCalledWith('https://example.com/a');
  });

  it('роутит .pdf в extractPdf', async () => {
    vi.mocked(extractPdf).mockResolvedValue({} as any);
    await extract({ kind: 'file', filename: 'f.pdf', buffer: Buffer.from('x') });
    expect(extractPdf).toHaveBeenCalledOnce();
    expect(extractPdf).toHaveBeenCalledWith(expect.any(Buffer), 'f.pdf');
  });

  it('роутит .docx в extractDocx', async () => {
    vi.mocked(extractDocx).mockResolvedValue({} as any);
    await extract({ kind: 'file', filename: 'f.docx', buffer: Buffer.from('x') });
    expect(extractDocx).toHaveBeenCalledOnce();
    expect(extractDocx).toHaveBeenCalledWith(expect.any(Buffer), 'f.docx');
  });

  it('бросает UnsupportedInputError для неизвестного файла', async () => {
    await expect(
      extract({ kind: 'file', filename: 'img.png', buffer: Buffer.from('x') }),
    ).rejects.toBeInstanceOf(UnsupportedInputError);
  });
});
