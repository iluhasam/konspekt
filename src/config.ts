import { z } from 'zod';

const schema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN обязателен'),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY обязателен'),
  OPENROUTER_MODEL: z.string().min(1).default('anthropic/claude-3.5-haiku'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL обязателен'),
});

export interface Config {
  telegramBotToken: string;
  openRouterApiKey: string;
  openRouterModel: string;
  databaseUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')} — ${i.message}`).join('; ');
    throw new Error(`Ошибка конфигурации: ${msg}`);
  }
  return {
    telegramBotToken: parsed.data.TELEGRAM_BOT_TOKEN,
    openRouterApiKey: parsed.data.OPENROUTER_API_KEY,
    openRouterModel: parsed.data.OPENROUTER_MODEL,
    databaseUrl: parsed.data.DATABASE_URL,
  };
}
