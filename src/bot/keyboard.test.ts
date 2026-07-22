import { describe, it, expect } from 'vitest';
import { triageKeyboard, parseCallback } from './keyboard.js';

describe('triageKeyboard', () => {
  it('содержит три кнопки с id в callback-data', () => {
    const kb = triageKeyboard('abc');
    const flat = kb.inline_keyboard.flat();
    const datas = flat.map((b: any) => b.callback_data);
    expect(datas).toContain('detail:abc');
    expect(datas).toContain('done:abc');
    expect(datas).toContain('delete:abc');
  });
});

describe('parseCallback', () => {
  it('парсит валидные данные', () => {
    expect(parseCallback('done:xyz')).toEqual({ action: 'done', id: 'xyz' });
    expect(parseCallback('detail:xyz')).toEqual({ action: 'detail', id: 'xyz' });
  });
  it('возвращает null для мусора', () => {
    expect(parseCallback('foo:bar')).toBeNull();
    expect(parseCallback('done')).toBeNull();
  });
});
