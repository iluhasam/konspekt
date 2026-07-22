import { Bot } from 'grammy';
import type { BotInput } from '../extractors/types.js';
import { isUrl } from '../extractors/router.js';
import type { ItemRepository } from '../storage/itemRepository.js';
import { processInput, type ProcessDeps } from '../core/processInput.js';
import { formatCard, formatDetailed, splitMessage } from '../format/message.js';
import { triageKeyboard, parseCallback } from './keyboard.js';

export interface BotDeps extends ProcessDeps {
  token: string;
  repo: ItemRepository;
}

export function createBot(deps: BotDeps): Bot {
  const bot = new Bot(deps.token);

  bot.command('start', (ctx) =>
    ctx.reply(
      'Привет! Пришли ссылку на статью или YouTube, либо файл PDF/DOCX — сделаю конспект.',
    ),
  );

  // Текстовые сообщения (ссылки)
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();
    if (ctx.message.text.startsWith('/')) return;
    if (!isUrl(text)) {
      await ctx.reply('Пришли ссылку (http/https) или файл PDF/DOCX.');
      return;
    }
    await handle(ctx, { kind: 'url', url: text });
  });

  // Документы
  bot.on('message:document', async (ctx) => {
    const doc = ctx.message.document;
    const filename = doc.file_name ?? 'file';
    let buffer: Buffer;
    try {
      const file = await ctx.getFile();
      const url = `https://api.telegram.org/file/bot${deps.token}/${file.file_path}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      buffer = Buffer.from(await response.arrayBuffer());
    } catch {
      await ctx.reply('⚠️ Не удалось скачать файл (возможно, он больше лимита Telegram ~20 МБ). Пришли файл поменьше или ссылку.');
      return;
    }
    await handle(ctx, { kind: 'file', filename, buffer });
  });

  // Триаж
  bot.on('callback_query:data', async (ctx) => {
    const parsed = parseCallback(ctx.callbackQuery.data);
    if (!parsed) {
      await ctx.answerCallbackQuery();
      return;
    }
    if (parsed.action === 'detail') {
      await ctx.answerCallbackQuery();
      let item: Awaited<ReturnType<typeof deps.repo.getById>>;
      try {
        item = await deps.repo.getById(parsed.id);
      } catch {
        await ctx.reply('⚠️ Не удалось получить конспект.');
        return;
      }
      if (!item) {
        await ctx.reply('Элемент не найден — возможно, уже удалён.');
        return;
      }
      for (const part of formatDetailed(item)) await ctx.reply(part);
      return;
    }
    if (parsed.action === 'done') {
      try {
        await deps.repo.updateStatus(parsed.id, 'done');
      } catch {
        await ctx.answerCallbackQuery({ text: '⚠️ Не удалось обновить' });
        return;
      }
      await ctx.answerCallbackQuery({ text: '✅ Разобрано' });
      await ctx.editMessageReplyMarkup();
      return;
    }
    if (parsed.action === 'delete') {
      try {
        await deps.repo.updateStatus(parsed.id, 'deleted');
      } catch {
        await ctx.answerCallbackQuery({ text: '⚠️ Не удалось обновить' });
        return;
      }
      await ctx.answerCallbackQuery({ text: '🗑 Удалено' });
      await ctx.deleteMessage().catch(() => {});
    }
  });

  async function handle(ctx: any, input: BotInput) {
    const note = await ctx.reply('⏳ Делаю конспект…');
    const result = await processInput(
      input,
      { userId: String(ctx.from.id), chatId: String(ctx.chat.id) },
      deps,
    );
    await ctx.api.deleteMessage(ctx.chat.id, note.message_id).catch(() => {});

    if (result.kind === 'error') {
      await ctx.reply(`⚠️ ${result.message}`);
      return;
    }
    if (result.kind === 'duplicate') {
      await ctx.reply('Такое уже присылал — вот прошлый конспект:');
    }
    const card = formatCard(result.item);
    for (const part of splitMessage(card)) {
      await ctx.reply(part, {
        parse_mode: 'HTML',
        reply_markup: triageKeyboard(result.item.id),
      });
    }
  }

  return bot;
}
