export function isUrl(text: string): boolean {
  try {
    const u = new URL(text.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function detectUrlSource(url: string): 'ARTICLE' | 'YOUTUBE' {
  const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    return 'YOUTUBE';
  }
  return 'ARTICLE';
}

export function detectFileSource(filename: string): 'PDF' | 'DOCX' | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  return null;
}
