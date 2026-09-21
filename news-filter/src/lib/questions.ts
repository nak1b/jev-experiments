import { noul } from "@typesafe-ai/sdk";

/*
 * Both modes send exactly these words, so batching is the only thing that differs between them.
 * The rule goes in the state, and each headline gets its own yes-or-no question.
 */

export function ruleState(rule: string): string {
  return `The reader's rule for which posts to show: "${rule}"`;
}

export function questionKey(postId: number): string {
  return `post_${postId}`;
}

export function postQuestion(title: string) {
  return noul(`Given the reader's rule, should this post be shown? Headline: "${title}"`, {
    true: "The rule asks for posts like this one, or only hides other kinds of posts.",
    false: "The rule hides posts like this one, or asks only for other kinds of posts.",
  });
}
