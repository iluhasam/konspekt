import type { BotInput, ExtractedContent } from '../extractors/types.js';
import { UnsupportedInputError, ExtractionError } from '../extractors/types.js';
import type { Konspekt } from '../summarizer/index.js';
import type { ItemRepository, ItemView } from '../storage/itemRepository.js';

export type ProcessResult =
  | { kind: 'card'; item: ItemView }
  | { kind: 'duplicate'; item: ItemView }
  | { kind: 'error'; message: string };

export interface ProcessDeps {
  extract: (input: BotInput) => Promise<ExtractedContent>;
  summarize: (c: ExtractedContent) => Promise<Konspekt>;
  repo: ItemRepository;
}

export async function processInput(
  input: BotInput,
  ctx: { userId: string; chatId: string },
  deps: ProcessDeps,
): Promise<ProcessResult> {
  let content: ExtractedContent;
  try {
    content = await deps.extract(input);
  } catch (e) {
    if (e instanceof UnsupportedInputError || e instanceof ExtractionError) {
      return { kind: 'error', message: e.message };
    }
    return { kind: 'error', message: 'Не удалось обработать вход.' };
  }

  if (content.url) {
    const existing = await deps.repo.findActiveByUrl(ctx.userId, content.url);
    if (existing) return { kind: 'duplicate', item: existing };
  }

  let konspekt: Konspekt;
  try {
    konspekt = await deps.summarize(content);
  } catch {
    return { kind: 'error', message: 'Не удалось сделать конспект — попробуй ещё раз.' };
  }

  let item;
  try {
    item = await deps.repo.createItem({
      sourceType: content.sourceType,
      url: content.url,
      title: content.title,
      summary: konspekt.summary,
      keyPoints: konspekt.keyPoints,
      tags: konspekt.tags,
      rawText: content.text,
      telegramUserId: ctx.userId,
      telegramChatId: ctx.chatId,
    });
  } catch {
    return { kind: 'error', message: 'Не удалось сохранить конспект.' };
  }
  return { kind: 'card', item };
}
