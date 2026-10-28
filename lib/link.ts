const linkProtocols = new Set(["http:", "https:", "ftp:", "file:"]);

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character] ?? character;
  });
}

export function createHtmlLink(title: string, url: string): string {
  const text = escapeHtml(title || url);
  try {
    if (!linkProtocols.has(new URL(url).protocol)) return text;
  } catch {
    return text;
  }
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}
