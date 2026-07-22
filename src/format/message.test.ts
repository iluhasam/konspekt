import { describe, it, expect } from 'vitest';
import { splitMessage, formatCard, formatDetailed } from './message.js';
import type { ItemView } from '../storage/itemRepository.js';

const item: ItemView = {
  id: 'x',
  sourceType: 'ARTICLE',
  url: 'https://e.com',
  title: 'Мой заголовок',
  summary: 'Это суть.',
  keyPoints: ['первый', 'второй'],
  tags: ['ии', 'продуктивность'],
  rawText: 'полный текст',
  status: 'inbox',
};

describe('splitMessage', () => {
  it('не режет короткий текст', () => {
    expect(splitMessage('привет', 4096)).toEqual(['привет']);
  });
  it('режет длинный текст на части в пределах лимита', () => {
    const parts = splitMessage('а\n'.repeat(3000), 100);
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(100);
  });
  it('разбивает даже абзац длиннее лимита', () => {
    const parts = splitMessage('я'.repeat(250), 100);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(100);
    expect(parts.join('')).toBe('я'.repeat(250));
  });
});

describe('formatCard', () => {
  it('содержит заголовок, суть, тезисы и теги', () => {
    const card = formatCard(item);
    expect(card).toContain('Мой заголовок');
    expect(card).toContain('Это суть.');
    expect(card).toContain('первый');
    expect(card).toContain('#ии');
  });
  it('экранирует HTML в заголовке', () => {
    const card = formatCard({ ...item, title: '<b>&x</b>' });
    expect(card).toContain('&lt;b&gt;&amp;x&lt;/b&gt;');
  });
});

describe('formatDetailed', () => {
  it('возвращает части с полным текстом', () => {
    const parts = formatDetailed(item);
    expect(parts.join(' ')).toContain('полный текст');
  });
  it('даёт заглушку, если rawText пуст', () => {
    const parts = formatDetailed({ ...item, rawText: null });
    expect(parts.join(' ').toLowerCase()).toContain('нет');
  });
});
