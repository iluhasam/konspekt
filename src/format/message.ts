import type { ItemView, SourceType } from '../storage/itemRepository.js';

const LIMIT = 4096;

const ICONS: Record<SourceType, string> = {
  ARTICLE: '📄',
  YOUTUBE: '▶️',
  PDF: '📕',
  DOCX: '📘',
};

export function splitMessage(text: string, limit = LIMIT): string[] {
  if (text.length <= limit) return [text];
  const parts: string[] = [];
  let current = '';
  for (const line of text.split('\n')) {
    if (line.length > limit) {
      if (current) {
        parts.push(current);
        current = '';
      }
      for (let i = 0; i < line.length; i += limit) {
        parts.push(line.slice(i, i + limit));
      }
      continue;
    }
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > limit) {
      parts.push(current);
      current = line;
    } else {
      current = candidate;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function formatCard(item: ItemView): string {
  const icon = ICONS[item.sourceType];
  const points = item.keyPoints.map((p) => `• ${escapeHtml(p)}`).join('\n');
  const tags = item.tags.map((t) => `#${escapeHtml(t.replace(/\s+/g, '_'))}`).join(' ');
  const parts = [`${icon} <b>${escapeHtml(item.title)}</b>`, '', escapeHtml(item.summary)];
  if (points) parts.push('', points);
  if (tags) parts.push('', tags);
  return parts.join('\n');
}

export function formatDetailed(item: ItemView): string[] {
  const text = item.rawText?.trim();
  if (!text) return ['Полного текста нет — сохранён только конспект.'];
  return splitMessage(text);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
