# 📝 Конспект

Телеграм-бот, который делает **конспект** из статьи, YouTube-видео или документа
и присылает его сообщениями прямо в чат. Личный инструмент против «цифрового
хлама» — сохранёнок, которые никогда не открываются: контент не копится, а сразу
превращается в короткую читаемую выжимку.

## Как работает

```
Кидаешь боту:  ссылку / YouTube / файл (PDF, DOCX)
        ▼
Бот извлекает текст → OpenRouter делает конспект (суть + тезисы + теги)
        ▼
Присылает конспект сообщениями:
  📖 Подробнее   ✅ Готово   🗑 Удалить
```

## Что понимает

- **Статьи** — ссылка на веб-страницу.
- **YouTube** — ссылка на видео (по транскрипту).
- **Документы** — присланный файл PDF или DOCX.

## Стек

TypeScript · [grammY](https://grammy.dev) (long-polling) · Prisma + SQLite ·
[OpenRouter](https://openrouter.ai) (LLM) ·
`@extractus/article-extractor` · `youtube-transcript` · `pdf-parse` · `mammoth`.

## Установка

> Требуется Node.js 20+.

```bash
git clone https://github.com/iluhasam/konspekt.git
cd konspekt
npm install
cp .env.example .env   # заполни токен и ключ
npx prisma migrate dev
npm run dev
```

## Конфигурация

Скопируй `.env.example` в `.env` и заполни:

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от [@BotFather](https://t.me/BotFather) |
| `OPENROUTER_API_KEY` | Ключ [OpenRouter](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | Модель, напр. `anthropic/claude-3.5-haiku` |
| `DATABASE_URL` | Строка Prisma, по умолчанию SQLite-файл |

`.env` в `.gitignore` — секреты в репозиторий не попадают.

## Статус

🚧 В разработке. Дизайн зафиксирован в
[`docs/superpowers/specs/2026-07-22-konspekt-design.md`](docs/superpowers/specs/2026-07-22-konspekt-design.md).

## Лицензия

MIT
