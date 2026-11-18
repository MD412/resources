export const REPO = "MD412/resources";
export const OWNER = "MD412";
export const OWNER_ID = 25497103;
export const PREFIX = "[AI Repo] ";
export const categories = {
  agents: {
    name: "Agents & tools",
    singular: "Agent / tool",
    icon: "box",
    description: "Software and agents that put models to work.",
  },
  models: {
    name: "Models",
    singular: "Model reference",
    icon: "layers",
    description: "Models, providers, and references for choosing between them.",
  },
  reading: {
    name: "Reading room",
    singular: "Reading",
    icon: "book",
    description: "Research, guides, and notes worth a closer read.",
  },
  x: {
    name: "From X",
    singular: "X post",
    icon: "x",
    description: "Posts and threads saved with their original context.",
  },
};

export function canonicalUrl(value) {
  const u = new URL(value);
  if (!["http:", "https:"].includes(u.protocol) || u.username || u.password)
    throw Error("Use a public HTTP or HTTPS link.");
  const host = u.hostname.toLowerCase().replace(/^(www\.|mobile\.)/, "");
  if (host === "twitter.com" || host === "x.com") {
    const post = u.pathname.match(
      /^\/(?:[\w]+\/status(?:es)?|i\/web\/status)\/(\d+)(?:\/|$)/,
    );
    if (post) return "https://x.com/i/status/" + post[1];
  }
  for (const key of [...u.searchParams.keys()])
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) u.searchParams.delete(key);
  return u.href;
}

export function tweetId(url) {
  return /^https:\/\/x\.com\/i\/status\/(\d+)$/.exec(url)?.[1];
}

export function resource(input) {
  const url = canonicalUrl(input.url);
  const isPost = !!tweetId(url);
  const trim = (s, max) =>
    typeof s === "string" ? s.trim().slice(0, max) : "";
  const handle = /(?:x|twitter)\.com\/([a-z0-9_]{1,15})\/status/i.exec(
    input.url,
  )?.[1];
  const author =
    trim(input.author, 80) || (handle && handle !== "i" ? "@" + handle : "");
  return {
    url,
    title:
      trim(input.title, 160) ||
      (isPost
        ? author
          ? "Post from " + author
          : "Saved post on X"
        : new URL(url).hostname.replace(/^www\./, "")),
    description: trim(input.description, 1400),
    author,
    category: isPost
      ? "x"
      : ["agents", "reading", "models"].includes(input.category)
        ? input.category
        : "agents",
  };
}

export function fromIssue(issue) {
  if (
    issue.pull_request ||
    issue.user?.id !== OWNER_ID ||
    issue.state !== "open" ||
    !issue.title.startsWith(PREFIX)
  )
    return null;
  try {
    const data = JSON.parse(issue.body);
    if (typeof data.url !== "string") return null;
    return {
      ...resource(data),
      saved_at: issue.created_at,
      issue: issue.number,
    };
  } catch {
    return null;
  }
}

export function mergeCatalog(seed, issues) {
  const items = new Map(seed.map((item) => [item.url, item]));
  for (const item of [...issues].sort((a, b) =>
    a.saved_at.localeCompare(b.saved_at),
  )) {
    const current = items.get(item.url);
    items.set(item.url, { ...current, ...item });
  }
  return [...items.values()].sort(
    (a, b) =>
      b.saved_at.localeCompare(a.saved_at) || a.url.localeCompare(b.url),
  );
}

export async function readIssues(request = fetch, token) {
  const items = [];
  const headers = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = "Bearer " + token;
  for (let page = 1; ; page++) {
    const url =
      "https://api.github.com/repos/" +
      REPO +
      "/issues?state=open&creator=" +
      OWNER +
      "&per_page=100&page=" +
      page;
    const r = await request(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw Error("GitHub returned " + r.status);
    const batch = await r.json();
    items.push(...batch.map(fromIssue).filter(Boolean));
    if (batch.length < 100) return items;
  }
}

// The snapshot includes owner submissions for offline use. A fresh response is
// authoritative, including when a previously saved issue was closed or deleted.
export function currentCatalog(snapshot, issues) {
  const curated = issues.map((item) =>
    item.url === "https://withmetaphor.com/"
      ? { ...item, art: "metaphor" }
      : item,
  );
  return mergeCatalog(
    snapshot.filter((i) => !i.issue),
    curated,
  );
}
