import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pages, shell } from "../src/view.mjs";
import { logo } from "../src/icons.mjs";
import { readIssues, currentCatalog } from "../src/catalog.mjs";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
let items = JSON.parse(await readFile("data/resources.json", "utf8"));
if (process.argv.includes("--sync"))
  items = currentCatalog(
    items,
    await readIssues(fetch, process.env.GITHUB_TOKEN),
  );
await rm("dist", { recursive: true, force: true });
await cp("public", "dist", { recursive: true });
await cp("src", "dist/lib", { recursive: true });
await writeFile(
  "dist/assets/mark.svg",
  logo.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '),
);
await writeFile("dist/.nojekyll", "");
for (const page of Object.keys(pages)) {
  const dir = "dist/" + (page === "home" ? "" : page + "/");
  await mkdir(dir, { recursive: true });
  const json = JSON.stringify(items).replace(/</g, "\\u003c");
  const html = shell(page, page === "home" ? "./" : "../", items).replace(
    '<script type="module"',
    '<script type="application/json" id="catalog">' +
      json +
      '</script><script type="module"',
  );
  await writeFile(dir + "index.html", html);
}
console.log(
  "Built " +
    Object.keys(pages).length +
    " pages with " +
    items.length +
    " resources.",
);
