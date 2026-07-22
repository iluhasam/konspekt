import type { PrismaClient, Item } from '@prisma/client';

export type SourceType = 'ARTICLE' | 'YOUTUBE' | 'PDF' | 'DOCX';
export type Status = 'inbox' | 'done' | 'deleted';

export interface CreateItemInput {
  sourceType: SourceType;
  url?: string;
  title: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  rawText?: string;
  telegramUserId: string;
  telegramChatId: string;
}

export interface ItemView {
  id: string;
  sourceType: SourceType;
  url: string | null;
  title: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  rawText: string | null;
  status: Status;
}

function toView(row: Item): ItemView {
  return {
    id: row.id,
    sourceType: row.sourceType as SourceType,
    url: row.url,
    title: row.title,
    summary: row.summary,
    keyPoints: JSON.parse(row.keyPoints) as string[],
    tags: JSON.parse(row.tags) as string[],
    rawText: row.rawText,
    status: row.status as Status,
  };
}

export class ItemRepository {
  constructor(private prisma: PrismaClient) {}

  async createItem(data: CreateItemInput): Promise<ItemView> {
    const row = await this.prisma.item.create({
      data: {
        sourceType: data.sourceType,
        url: data.url ?? null,
        title: data.title,
        summary: data.summary,
        keyPoints: JSON.stringify(data.keyPoints),
        tags: JSON.stringify(data.tags),
        rawText: data.rawText ?? null,
        telegramUserId: data.telegramUserId,
        telegramChatId: data.telegramChatId,
      },
    });
    return toView(row);
  }

  async findActiveByUrl(userId: string, url: string): Promise<ItemView | null> {
    const row = await this.prisma.item.findFirst({
      where: { telegramUserId: userId, url, status: { in: ['inbox', 'done'] } },
    });
    return row ? toView(row) : null;
  }

  async updateStatus(id: string, status: 'done' | 'deleted'): Promise<ItemView> {
    const row = await this.prisma.item.update({ where: { id }, data: { status } });
    return toView(row);
  }

  async getById(id: string): Promise<ItemView | null> {
    const row = await this.prisma.item.findUnique({ where: { id } });
    return row ? toView(row) : null;
  }
}
