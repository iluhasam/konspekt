import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ItemRepository } from './itemRepository.js';

const prisma = new PrismaClient();
const repo = new ItemRepository(prisma);

const base = {
  sourceType: 'ARTICLE' as const,
  url: 'https://example.com/a',
  title: 'Заголовок',
  summary: 'Суть',
  keyPoints: ['п1', 'п2'],
  tags: ['t1'],
  telegramUserId: 'u1',
  telegramChatId: 'c1',
};

beforeEach(async () => {
  await prisma.item.deleteMany();
});

describe('ItemRepository', () => {
  it('создаёт item и десериализует массивы', async () => {
    const item = await repo.createItem(base);
    expect(item.status).toBe('inbox');
    const found = await repo.getById(item.id);
    expect(found?.keyPoints).toEqual(['п1', 'п2']);
    expect(found?.tags).toEqual(['t1']);
  });

  it('findActiveByUrl находит по url в статусе inbox', async () => {
    await repo.createItem(base);
    const found = await repo.findActiveByUrl('u1', 'https://example.com/a');
    expect(found).not.toBeNull();
  });

  it('findActiveByUrl игнорирует удалённые', async () => {
    const item = await repo.createItem(base);
    await repo.updateStatus(item.id, 'deleted');
    const found = await repo.findActiveByUrl('u1', 'https://example.com/a');
    expect(found).toBeNull();
  });

  it('updateStatus меняет статус', async () => {
    const item = await repo.createItem(base);
    const updated = await repo.updateStatus(item.id, 'done');
    expect(updated.status).toBe('done');
  });
});
