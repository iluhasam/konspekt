import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { loadConfig } from './config.js';
import { ItemRepository } from './storage/itemRepository.js';
import { extract } from './extractors/index.js';
import { createSummarizer } from './summarizer/index.js';
import { createBot } from './bot/bot.js';

async function main() {
  const config = loadConfig(process.env);
  const prisma = new PrismaClient();
  const repo = new ItemRepository(prisma);
  const summarize = createSummarizer(config);

  const bot = createBot({ token: config.telegramBotToken, extract, summarize, repo });

  bot.catch((err) => console.error('Ошибка бота:', err));
  console.log('Конспект запущен. Ожидаю сообщения…');
  await bot.start();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
