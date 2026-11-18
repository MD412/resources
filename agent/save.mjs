import { pathToFileURL } from "node:url";
import {
  OWNER_ID,
  PREFIX,
  REPO,
  resource,
  fromIssue,
  tweetId,
} from "../src/catalog.mjs";

export async function submit(
  input,
  token = process.env.AI_REPO_GITHUB_TOKEN,
  request = fetch,
) {
  if (!token)
    throw Error(
      "Set AI_REPO_GITHUB_TOKEN to a repository-scoped token with Issues read and write.",
    );
  const entry = resource(input);
  const headers = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
  };
  async function api(path, options = {}) {
    const r = await request("https://api.github.com" + path, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok)
      throw Error("GitHub returned " + r.status + " for " + path.split("?")[0]);
    return r.json();
  }
  const me = await api("/user");
  if (me.id !== OWNER_ID)
    throw Error("Use the curator’s GitHub account for this archive.");
  for (let page = 1; ; page++) {
    const existing = await api(
      "/repos/" +
        REPO +
        "/issues?state=open&creator=" +
        encodeURIComponent(me.login) +
        "&per_page=100&page=" +
        page,
    );
    const match = existing.find((i) => fromIssue(i)?.url === entry.url);
    if (match) return { url: match.html_url, existing: true };
    if (existing.length < 100) break;
  }
  if (tweetId(entry.url) && !entry.description) {
    try {
      const r = await request(
        "https://publish.twitter.com/oembed?omit_script=true&url=" +
          encodeURIComponent(entry.url),
        { signal: AbortSignal.timeout(4500) },
      );
      if (r.ok) {
        const post = await r.json();
        const paragraph = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(
          post.html || "",
        )?.[1];
        if (paragraph)
          entry.description = paragraph
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .slice(0, 1400);
        entry.author = post.author_name || entry.author;
      }
    } catch {
      /* The source link and on-demand embed also work without oEmbed. */
    }
  }
  const created = await api("/repos/" + REPO + "/issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: PREFIX + entry.title,
      body: JSON.stringify(entry, null, 2),
    }),
  });
  return { url: created.html_url, existing: false };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const [url, title, category, description] = process.argv.slice(2);
    if (!url)
      throw Error(
        "Usage: npm run save -- URL [title] [agents|models|reading|x] [description]",
      );
    console.log(await submit({ url, title, category, description }));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
