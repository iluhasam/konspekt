import type { ExtractedContent } from '../extractors/types.js';

const MAX_TEXT = 12000;

const SYSTEM = `Ты делаешь краткие конспекты на русском языке.
Верни СТРОГО валидный JSON без markdown-обёртки, по схеме:
{"summary": "2-3 предложения сути", "keyPoints": ["тезис", "..."], "tags": ["тег", "..."]}
keyPoints — 3-6 ключевых пунктов. tags — 3-5 коротких тематических тегов в нижнем регистре.`;

export function buildMessages(
  content: ExtractedContent,
): Array<{ role: 'system' | 'user'; content: string }> {
  const text =
    content.text.length > MAX_TEXT ? content.text.slice(0, MAX_TEXT) : content.text;
  const user = `Заголовок: ${content.title}\n\nТекст:\n${text}`;
  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: user },
  ];
}
