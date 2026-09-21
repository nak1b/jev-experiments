export type Post = {
  id: number;
  title: string;
  url: string | null;
  site: string | null;
  points: number;
  comments: number;
};

/* The subset of a Hacker News item this app reads. */
export type HnItem = {
  id: number;
  type?: string;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  dead?: boolean;
  deleted?: boolean;
};

export function siteOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/* Returns null for items that are not live stories, such as jobs or deleted posts. */
export function toPost(item: HnItem | null): Post | null {
  if (!item || item.type !== "story" || !item.title || item.dead || item.deleted) return null;
  return {
    id: item.id,
    title: item.title,
    url: item.url ?? null,
    site: siteOf(item.url),
    points: item.score ?? 0,
    comments: item.descendants ?? 0,
  };
}

export function discussionUrl(id: number): string {
  return `https://news.ycombinator.com/item?id=${id}`;
}
