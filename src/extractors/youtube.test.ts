import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: { fetchTranscript: vi.fn() },
}));

import { YoutubeTranscript } from 'youtube-transcript';
import { extractYoutube } from './youtube.js';
import { ExtractionError } from './types.js';

const mocked = vi.mocked(YoutubeTranscript.fetchTranscript);

beforeEach(() => mocked.mockReset());

describe('extractYoutube', () => {
  it('склеивает транскрипт в текст', async () => {
    mocked.mockResolvedValue([
      { text: 'Привет', duration: 1, offset: 0 },
      { text: 'мир', duration: 1, offset: 1 },
    ] as any);
    const res = await extractYoutube('https://youtu.be/abc');
    expect(res.sourceType).toBe('YOUTUBE');
    expect(res.text).toBe('Привет мир');
    expect(res.url).toBe('https://youtu.be/abc');
  });

  it('бросает ExtractionError при отсутствии субтитров', async () => {
    mocked.mockRejectedValueOnce(new Error('Transcript is disabled'));
    await expect(extractYoutube('https://youtu.be/abc')).rejects.toBeInstanceOf(
      ExtractionError,
    );
  });

  it('бросает ExtractionError при пустом транскрипте', async () => {
    mocked.mockResolvedValue([] as any);
    await expect(extractYoutube('https://youtu.be/abc')).rejects.toBeInstanceOf(
      ExtractionError,
    );
  });
});
