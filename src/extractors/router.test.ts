import { describe, it, expect } from 'vitest';
import { isUrl, detectUrlSource, detectFileSource } from './router.js';

describe('isUrl', () => {
  it('распознаёт http/https ссылки', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://a.b/c')).toBe(true);
  });
  it('отклоняет не-ссылки', () => {
    expect(isUrl('просто текст')).toBe(false);
    expect(isUrl('')).toBe(false);
  });
});

describe('detectUrlSource', () => {
  it('распознаёт youtube.com', () => {
    expect(detectUrlSource('https://www.youtube.com/watch?v=abc')).toBe('YOUTUBE');
  });
  it('распознаёт youtu.be', () => {
    expect(detectUrlSource('https://youtu.be/abc')).toBe('YOUTUBE');
  });
  it('остальное — статья', () => {
    expect(detectUrlSource('https://example.com/post')).toBe('ARTICLE');
  });
});

describe('detectFileSource', () => {
  it('распознаёт pdf и docx без учёта регистра', () => {
    expect(detectFileSource('file.PDF')).toBe('PDF');
    expect(detectFileSource('doc.docx')).toBe('DOCX');
  });
  it('возвращает null для неподдерживаемого', () => {
    expect(detectFileSource('image.png')).toBeNull();
  });
});
