const amazonDomain =
  /^(?:www\.|smile\.|m\.)?amazon\.(?:com|ca|com\.mx|com\.br|co\.uk|de|fr|it|es|nl|se|pl|com\.be|ie|co\.jp|in|com\.au|sg|ae|sa|com\.tr|eg|co\.za)$/;

export function getAmazonProductUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!amazonDomain.test(url.hostname)) return null;
    const match = url.pathname.match(
      /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:\/|$)/i,
    );
    if (!match) return null;
    return `https://${url.hostname}/dp/${match[1]}`;
  } catch {
    return null;
  }
}
