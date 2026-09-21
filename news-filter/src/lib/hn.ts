import "server-only";
import { toPost, type HnItem, type Post } from "./post";

const API = "https://hacker-news.firebaseio.com/v0";

// The front page changes slowly, and caching keeps the page fast and polite to HN.
const REVALIDATE_SECONDS = 300;

export const POST_COUNT = 30;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) throw new Error(`Hacker News answered ${response.status} for ${path}`);
  return (await response.json()) as T;
}

/* The top stories from Hacker News's public API. No key or account is needed. */
export async function topPosts(): Promise<Post[]> {
  const ids = await getJson<number[]>("/topstories.json");
  const items = await Promise.all(ids.slice(0, POST_COUNT).map((id) => getJson<HnItem | null>(`/item/${id}.json`)));
  return items.flatMap((item) => {
    const post = toPost(item);
    return post ? [post] : [];
  });
}
