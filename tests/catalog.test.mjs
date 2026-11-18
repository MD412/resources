import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalUrl,
  fromIssue,
  currentCatalog,
  resource,
  OWNER_ID,
  PREFIX,
  readIssues,
} from "../src/catalog.mjs";
import { cards } from "../src/view.mjs";
import { submit } from "../agent/save.mjs";
const time = "2026-01-01T00:00:00Z";
const issue = {
  title: PREFIX + "Test",
  state: "open",
  user: { id: OWNER_ID },
  body: JSON.stringify({
    url: "https://x.com/curator/status/12345?s=2",
    title: "A saved post",
    description: "Exact excerpt",
  }),
  number: 5,
  created_at: time,
};
test("X aliases produce the same canonical post and accessible preview", () => {
  const entry = fromIssue(issue);
  assert.equal(
    entry.url,
    canonicalUrl("https://mobile.twitter.com/other/status/12345/photo/1"),
  );
  assert.equal(entry.category, "x");
  assert.match(cards([entry], "./"), /data-post="12345"/);
  assert.match(cards([entry], "./"), /Exact excerpt/);
  assert.equal(entry.author, "@curator");
});
test("only open curator submissions appear", () => {
  for (const changes of [
    { user: { id: 2 } },
    { state: "closed" },
    { pull_request: {} },
    { body: "oops" },
    { body: '{"url":"javascript:void(0)"}' },
  ])
    assert.equal(fromIssue({ ...issue, ...changes }), null);
});
test("closed entries disappear and retries produce one card", () => {
  const entry = fromIssue(issue);
  assert.deepEqual(currentCatalog([entry], []), []);
  assert.equal(currentCatalog([], [entry, entry]).length, 1);
});
test("links keep meaningful fragments and discard tracking", () => {
  assert.equal(
    canonicalUrl("https://example.org/?utm_source=x&v=1#part"),
    "https://example.org/?v=1#part",
  );
  assert.throws(() => resource({ url: "file:///foo" }));
  assert.doesNotMatch(
    cards([{ ...fromIssue(issue), title: "<img src=x>" }], "./"),
    /<img src=x>/,
  );
});
test("writer detects existing canonical entries with no write request", async () => {
  const req = async (url) =>
    Response.json(
      url.endsWith("/user")
        ? { id: OWNER_ID, login: "MD412" }
        : [
            {
              ...issue,
              html_url: "https://github.com/MD412/resources/issues/5",
            },
          ],
    );
  const r = await submit(
    { url: "https://twitter.com/curator/status/12345" },
    "test",
    req,
  );
  assert.equal(r.existing, true);
});
test("every page is collected even when early pages contain unrelated issues", async () => {
  let page = 0;
  const req = async () =>
    Response.json(
      ++page === 1 ? Array(100).fill({ ...issue, user: { id: 2 } }) : [issue],
    );
  assert.equal((await readIssues(req)).length, 1);
  assert.equal(page, 2);
});

test("source reading stays separate from the curator's Latest feed", async () => {
  const { content } = await import("../src/view.mjs");
  const latest = content("latest", "../", [fromIssue(issue)]);
  assert.doesNotMatch(latest, /tool call analysis/);
  assert.match(content("metaphor", "../", []), /tool call analysis/);
});
