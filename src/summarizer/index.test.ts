import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: createMock } };
    constructor(_: unknown) {}
  },
}));

import { createSummarizer } from './index.js';

const config = {
  telegramBotToken: 't',
  openRouterApiKey: 'k',
  openRouterModel: 'test/model',
  databaseUrl: 'file:./dev.db',
};
const content = {
  sourceType: 'ARTICLE' as const,
  title: 'T',
  url: 'https://e.com',
  text: 'body',
};

function reply(json: string) {
  return { choices: [{ message: { content: json } }] };
}

beforeEach(() => createMock.mockReset());

describe('createSummarizer', () => {
  it('парсит валидный JSON-ответ', async () => {
    createMock.mockResolvedValue(
      reply('{"summary":"с","keyPoints":["a"],"tags":["t"]}'),
    );
    const summarize = createSummarizer(config);
    const res = await summarize(content);
    expect(res.summary).toBe('с');
    expect(res.keyPoints).toEqual(['a']);
    expect(res.tags).toEqual(['t']);
  });

  it('снимает markdown-обёртку ```json', async () => {
    createMock.mockResolvedValue(
      reply('```json\n{"summary":"с","keyPoints":[],"tags":[]}\n```'),
    );
    const res = await createSummarizer(config)(content);
    expect(res.summary).toBe('с');
  });

  it('делает один ретрай при ошибке сети', async () => {
    createMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(reply('{"summary":"с","keyPoints":[],"tags":[]}'));
    const res = await createSummarizer(config)(content);
    expect(res.summary).toBe('с');
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it('бросает ошибку после второй неудачи', async () => {
    createMock
      .mockRejectedValueOnce(new Error('network'))
      .mockRejectedValueOnce(new Error('network'));
    await expect(createSummarizer(config)(content)).rejects.toThrow();
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it('бросает ошибку при невалидном JSON', async () => {
    createMock.mockResolvedValue(reply('не json'));
    await expect(createSummarizer(config)(content)).rejects.toThrow();
  });
});
