import { describe, expect, it } from "vitest";
import { siteOf, toPost } from "./post";

describe("toPost", () => {
  it("keeps live stories", () => {
    expect(
      toPost({ id: 1, type: "story", title: "Show HN: A thing", url: "https://www.example.com/a", score: 42, descendants: 7 }),
    ).toEqual({ id: 1, title: "Show HN: A thing", url: "https://www.example.com/a", site: "example.com", points: 42, comments: 7 });
  });

  it("keeps text posts without a link", () => {
    expect(toPost({ id: 2, type: "story", title: "Ask HN: Anyone?" })).toMatchObject({ url: null, site: null, points: 0 });
  });

  it("drops jobs, dead and deleted items", () => {
    expect(toPost({ id: 3, type: "job", title: "We are hiring" })).toBeNull();
    expect(toPost({ id: 4, type: "story", title: "Gone", dead: true })).toBeNull();
    expect(toPost({ id: 5, type: "story", deleted: true })).toBeNull();
    expect(toPost(null)).toBeNull();
  });
});

describe("siteOf", () => {
  it("returns null for a bad or missing url", () => {
    expect(siteOf(undefined)).toBeNull();
    expect(siteOf("not a url")).toBeNull();
  });
});
