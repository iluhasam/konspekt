import { InlineKeyboard } from 'grammy';

export function triageKeyboard(itemId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('📖 Подробнее', `detail:${itemId}`)
    .text('✅ Готово', `done:${itemId}`)
    .text('🗑 Удалить', `delete:${itemId}`);
}

const ACTIONS = ['detail', 'done', 'delete'] as const;
type Action = (typeof ACTIONS)[number];

export function parseCallback(
  data: string,
): { action: Action; id: string } | null {
  const idx = data.indexOf(':');
  if (idx === -1) return null;
  const action = data.slice(0, idx);
  const id = data.slice(idx + 1);
  if (!id || !ACTIONS.includes(action as Action)) return null;
  return { action: action as Action, id };
}
