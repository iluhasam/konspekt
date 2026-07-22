import type { SourceType } from '../storage/itemRepository.js';

export interface ExtractedContent {
  sourceType: SourceType;
  title: string;
  url?: string;
  text: string;
}

export type BotInput =
  | { kind: 'url'; url: string }
  | { kind: 'file'; filename: string; buffer: Buffer };

export class UnsupportedInputError extends Error {}
export class ExtractionError extends Error {}
