import { NewsFilter } from "@/components/news-filter";
import { topPosts } from "@/lib/hn";

export default async function Home() {
  let posts;
  try {
    posts = await topPosts();
  } catch (error) {
    console.error("Could not load Hacker News", error);
    posts = null;
  }

  return (
    <>
      {posts ? (
        <NewsFilter posts={posts} />
      ) : (
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-24 sm:px-8">
          <h1 className="text-2xl font-semibold">Hacker News did not answer</h1>
          <p className="mt-3 text-muted">The front page could not be loaded. Check your connection, then reload the page.</p>
        </main>
      )}
      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-[13px] text-muted sm:px-8">
        <p>Posts come from the Hacker News front page. Jev, the TypeSafe System One model, reads your rule.</p>
      </footer>
    </>
  );
}
