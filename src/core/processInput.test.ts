import { describe, it, expect, vi } from 'vitest';
import { processInput } from './processInput.js';
import { UnsupportedInputError, ExtractionError } from '../extractors/types.js';

const ctx = { userId: 'u1', chatId: 'c1' };

function makeDeps(over: Partial<any> = {}) {
  const extracted = {
    sourceType: 'ARTICLE',
    title: 'T',
    url: 'https://e.com',
    text: 'body',
  };
  const item = {
    id: 'i1',
    sourceType: 'ARTICLE',
    url: 'https://e.com',
    title: 'T',
    summary: 'с',
    keyPoints: [],
    tags: [],
    rawText: 'body',
    status: 'inbox',
  };
  return {
    extract: vi.fn().mockResolvedValue(extracted),
    summarize: vi.fn().mockResolvedValue({ summary: 'с', keyPoints: [], tags: [] }),
    repo: {
      findActiveByUrl: vi.fn().mockResolvedValue(null),
      createItem: vi.fn().mockResolvedValue(item),
    },
    ...over,
  };
}

const urlInput = { kind: 'url' as const, url: 'https://e.com' };

describe('processInput', () => {
  it('успешный путь возвращает card', async () => {
    const deps = makeDeps();
    const res = await processInput(urlInput, ctx, deps as any);
    expect(res.kind).toBe('card');
    expect(deps.repo.createItem).toHaveBeenCalledOnce();
  });

  it('дубликат url возвращает duplicate без создания', async () => {
    const existing = { id: 'old' };
    const deps = makeDeps({
      repo: {
        findActiveByUrl: vi.fn().mockResolvedValue(existing),
        createItem: vi.fn(),
      },
    });
    const res = await processInput(urlInput, ctx, deps as any);
    expect(res.kind).toBe('duplicate');
    expect(deps.repo.createItem).not.toHaveBeenCalled();
  });

  it('UnsupportedInputError → error с текстом ошибки', async () => {
    const deps = makeDeps({
      extract: vi.fn().mockRejectedValue(new UnsupportedInputError('не тот файл')),
    });
    const res = await processInput(urlInput, ctx, deps as any);
    expect(res).toEqual({ kind: 'error', message: 'не тот файл' });
  });

  it('ExtractionError → error с текстом ошибки', async () => {
    const deps = makeDeps({
      extract: vi.fn().mockRejectedValue(new ExtractionError('нет субтитров')),
    });
    const res = await processInput(urlInput, ctx, deps as any);
    expect(res).toEqual({ kind: 'error', message: 'нет субтитров' });
  });

  it('сбой суммаризатора → error с общим текстом', async () => {
    const deps = makeDeps({
      summarize: vi.fn().mockRejectedValue(new Error('llm down')),
    });
    const res = await processInput(urlInput, ctx, deps as any);
    expect(res.kind).toBe('error');
  });
});
