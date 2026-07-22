import { describe, it, expect } from 'vitest';
import { loadConfig } from './config.js';

const validEnv = {
  TELEGRAM_BOT_TOKEN: 'token',
  OPENROUTER_API_KEY: 'key',
  DATABASE_URL: 'file:./dev.db',
};

describe('loadConfig', () => {
  it('возвращает конфиг при валидном env', () => {
    const cfg = loadConfig(validEnv);
    expect(cfg.telegramBotToken).toBe('token');
    expect(cfg.openRouterApiKey).toBe('key');
    expect(cfg.databaseUrl).toBe('file:./dev.db');
  });

  it('подставляет модель по умолчанию', () => {
    const cfg = loadConfig(validEnv);
    expect(cfg.openRouterModel).toBe('anthropic/claude-3.5-haiku');
  });

  it('уважает OPENROUTER_MODEL из env', () => {
    const cfg = loadConfig({ ...validEnv, OPENROUTER_MODEL: 'openai/gpt-4o-mini' });
    expect(cfg.openRouterModel).toBe('openai/gpt-4o-mini');
  });

  it('бросает ошибку при отсутствии токена', () => {
    expect(() => loadConfig({ ...validEnv, TELEGRAM_BOT_TOKEN: undefined })).toThrow(
      /TELEGRAM_BOT_TOKEN/,
    );
  });
});
