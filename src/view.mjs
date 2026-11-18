import { categories, tweetId } from "./catalog.mjs";
import { icon, logo } from "./icons.mjs";
export const pages = {
  home: "Overview",
  latest: "Latest",
  collections: "Collections",
  ...Object.fromEntries(
    Object.entries(categories).map(([k, v]) => [k, v.name]),
  ),
};
export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const path = (root, p) => root + (p === "home" ? "" : p + "/");
const link = (root, p, text) =>
  '<a class="more" href="' +
  path(root, p) +
  '">' +
  text +
  icon("arrow", 15) +
  "</a>";
const desc = {
  home: "A personal collection of AI tools, models, and ideas worth keeping.",
  latest: "The newest additions to the index, in the order they were saved.",
  collections: "Browse the archive by category.",
};
export function cards(items, root) {
  return (
    '<div class="cards">' +
    items
      .map((item) => {
        const c = categories[item.category],
          host = esc(new URL(item.url).hostname.replace(/^www\./, "")),
          id = tweetId(item.url);
        const art = item.art
          ? '<img src="' +
            root +
            "assets/" +
            esc(item.art) +
            '.webp" alt="" loading="lazy">'
          : '<span class="tile-glyph">' + icon(c.icon, 54) + "</span>";
        const standard =
          '<div class="thumb ' +
          item.category +
          '">' +
          art +
          '<span class="media-arrow">' +
          icon("external", 15) +
          "</span></div>";
        const quote =
          '<div class="post-preview"><div>' +
          icon("x", 20) +
          " <b>" +
          esc(item.author || "X post") +
          "</b></div><p>" +
          esc(item.description || item.title) +
          "</p></div>";
        return (
          '<article class="card"><a href="' +
          esc(item.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          (id ? quote : standard) +
          '<div class="card-copy"><span class="eyebrow"><i class="dot ' +
          item.category +
          '"></i>' +
          esc(c.singular) +
          "</span><h3>" +
          esc(item.title) +
          "</h3>" +
          (!id && item.description
            ? "<p>" + esc(item.description) + "</p>"
            : "") +
          '<div class="card-source">' +
          icon("link", 13) +
          esc(item.source || host) +
          "</div></div></a>" +
          (id
            ? '<details class="embed"><summary>Preview original post</summary><div data-post="' +
              id +
              '"></div></details>'
            : "") +
          "</article>"
        );
      })
      .join("") +
    "</div>"
  );
}
function tiles(root, items) {
  return Object.entries(categories)
    .map(
      ([key, c]) =>
        '<a class="collection-row" href="' +
        path(root, key) +
        '"><span class="category-icon ' +
        key +
        '">' +
        icon(c.icon, 19) +
        "</span><span>" +
        c.name +
        "</span><small>" +
        String(items.filter((i) => i.category === key).length).padStart(
          2,
          "0",
        ) +
        "</small>" +
        icon("chevron", 13) +
        "</a>",
    )
    .join("");
}
function head(title, control = "") {
  return (
    '<div class="section-head"><h2>' + title + "</h2>" + control + "</div>"
  );
}
function emptyX(root, home) {
  return (
    '<div class="empty-x"><span class="empty-icon">' +
    icon("x", 28) +
    "</span><div><strong>The X collection starts here.</strong><p>Saved posts and threads will appear here with a preview.</p></div>" +
    (home ? link(root, "x", "Open feed") : "") +
    "</div>"
  );
}
export function content(page, root, items) {
  const top =
    '<div class="intro"><h1>' +
    (page === "home" ? "Resource index" : pages[page]) +
    "<span>.</span></h1><p>" +
    esc(desc[page] || categories[page]?.description) +
    "</p></div>";
  if (page === "collections")
    return (
      top + '<section class="directory">' + tiles(root, items) + "</section>"
    );
  if (page !== "home") {
    const subset =
      page === "latest" ? items : items.filter((x) => x.category === page);
    return (
      top +
      head(
        subset.length + " " + (subset.length === 1 ? "resource" : "resources"),
      ) +
      (subset.length
        ? cards(subset, root)
        : page === "x"
          ? emptyX(root, false)
          : '<p class="muted">No resources in this collection yet.</p>')
    );
  }
  const feature = items.find((i) => i.art === "metaphor");
  const latest = items.filter((i) => i !== feature).slice(0, 3);
  const posts = items.filter((i) => i.category === "x").slice(0, 3);
  const hero = feature
    ? '<a class="feature" href="' +
      esc(feature.url) +
      '" target="_blank" rel="noopener noreferrer"><span class="feature-tag">' +
      icon("spark", 13) +
      ' Featured find</span><div class="feature-body"><h2>Metaphor</h2><p>A cloud coding agent with its own workspace.</p><span class="feature-cta">Explore resource ' +
      icon("external", 14) +
      "</span></div></a>"
    : "";
  return (
    top +
    '<div class="bento' +
    (hero ? "" : " single") +
    '">' +
    hero +
    '<section class="collection-panel"><div class="panel-label">' +
    icon("folder", 17) +
    '<h2>Collections</h2></div><div class="collection-list">' +
    tiles(root, items) +
    "</div>" +
    link(root, "collections", "All collections") +
    "</section></div>" +
    '<section class="shelf">' +
    head("Latest", link(root, "latest", "Show more")) +
    (latest.length
      ? cards(latest, root)
      : '<p class="muted">New finds will appear here.</p>') +
    "</section>" +
    '<section class="shelf">' +
    head("From X", link(root, "x", "Show more")) +
    (posts.length ? cards(posts, root) : emptyX(root, false)) +
    "</section>"
  );
}
export function shell(page, root, items) {
  function nav(p, name, ico) {
    return (
      '<a class="nav-item" href="' +
      path(root, p) +
      '"' +
      (page === p ? ' aria-current="page"' : "") +
      ">" +
      icon(ico, 18) +
      name +
      "</a>"
    );
  }
  const brand =
    '<a class="brand" aria-label="AI Repo (.com) home" href="' +
    root +
    '">' +
    logo +
    "<span>AI Repo<em>.com</em></span></a>";
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f8f6"><title>' +
    pages[page] +
    ' · AI Repo (.com)</title><meta name="description" content="Marc Dandoy’s curated AI resource index."><link rel="icon" href="' +
    root +
    'assets/mark.svg"><link rel="stylesheet" href="' +
    root +
    'assets/site.css"></head><body data-page="' +
    page +
    '" data-root="' +
    root +
    '"><a class="skip" href="#main">Skip to content</a><aside id="sidebar">' +
    brand +
    '<nav aria-label="Main"><p class="nav-label">Browse</p>' +
    nav("home", "Overview", "home") +
    nav("latest", "Latest", "clock") +
    '<p class="nav-label">Collections</p>' +
    Object.entries(categories)
      .map(([p, c]) => nav(p, c.name, c.icon))
      .join("") +
    '</nav><div class="sidebar-end"><a href="https://dandoy.me/" class="curator" target="_blank" rel="noopener"><span class="avatar">md</span><span><small>Curated by</small><b>Marc Dandoy</b></span>' +
    icon("external", 13) +
    '</a></div></aside><button class="scrim" aria-label="Close navigation"></button><div class="workspace"><header class="bar"><button class="mobile-menu" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="false">' +
    icon("menu") +
    '</button><div class="crumb">' +
    icon("archive", 15) +
    '<a href="' +
    root +
    '">Directory</a><span>/</span><b>' +
    pages[page] +
    '</b></div><button class="find" aria-haspopup="dialog">' +
    icon("search", 16) +
    '<span>Search resources</span><kbd>/</kbd></button></header><main id="main">' +
    content(page, root, items) +
    '</main><footer><span>AI Repo<span class="muted">.com</span></span><a href="https://github.com/MD412/resources">' +
    icon("git", 15) +
    " GitHub " +
    icon("external", 12) +
    '</a></footer></div><dialog id="search"><form method="dialog"><label for="query">' +
    icon("search", 20) +
    '</label><input id="query" placeholder="Search resources…" type="search" autocomplete="off" aria-label="Search resources"><button aria-label="Close search">' +
    icon("close", 17) +
    '</button></form><div id="results" aria-live="polite"></div></dialog><script type="module" src="' +
    root +
    'app.mjs"></script></body></html>'
  );
}
