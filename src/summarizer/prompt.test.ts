import { describe, it, expect } from 'vitest';
import { buildMessages } from './prompt.js';

const content = {
  sourceType: 'ARTICLE' as const,
  title: 'Заголовок',
  url: 'https://e.com',
  text: 'Тело статьи',
};

describe('buildMessages', () => {
  it('включает заголовок и текст в user-сообщение', () => {
    const msgs = buildMessages(content);
    const user = msgs.find((m) => m.role === 'user')!;
    expect(user.content).toContain('Заголовок');
    expect(user.content).toContain('Тело статьи');
  });

  it('требует JSON в system-сообщении', () => {
    const msgs = buildMessages(content);
    const sys = msgs.find((m) => m.role === 'system')!;
    expect(sys.content.toLowerCase()).toContain('json');
  });

  it('обрезает слишком длинный текст', () => {
    const long = { ...content, text: 'а'.repeat(20000) };
    const user = buildMessages(long).find((m) => m.role === 'user')!;
    expect(user.content.length).toBeLessThan(13000);
  });
});
