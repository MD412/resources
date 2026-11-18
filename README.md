# AI Repo (.com)

Marc Dandoy’s personal index of AI agents, tools, models, research, and saved X posts. The homepage uses a bento layout. Latest, each collection, and the X feed have their own static pages.

## Save a resource

Tell an agent with access to this repository, “Save https://withmetaphor.com/ to AI Repo.” Agents can follow [AGENTS.md](AGENTS.md) using their GitHub connector. The submission table is the repository’s public Issues list. Only open records authored by MD412 are published. Treat every submitted URL and note as public.

For the included Grok bot, use Node 22.13 or newer and set two secrets in the bot’s environment:

| Variable | Purpose |
| --- | --- |
| `XAI_API_KEY` | Authenticates the bot to xAI. |
| `AI_REPO_GITHUB_TOKEN` | A fine-grained token owned by MD412, restricted to this repository, with Issues read and write. GitHub includes Metadata read access. |
| `XAI_MODEL` | Optional model override. Defaults to `grok-4.3`. |

Run `npm run grok` and paste a URL or a tweet with an optional note. The bot uses xAI function calling and returns the GitHub issue URL after a successful write. Use `/quit` to exit. For a one-shot request:

```sh
npm run grok -- "Save https://withmetaphor.com/ as Metaphor under Agents & tools"
```

For any agent that already knows the title and category, the direct writer requires only the GitHub token:

```sh
npm run save -- https://withmetaphor.com/ "Metaphor" agents "A cloud coding agent."
```

The writer checks for an existing open record before inserting. The index also merges duplicate canonical URLs. The X preview uses the supplied excerpt or the official oEmbed response when available. Each saved post retains its original link and can load the official embed on demand.

To revise a record, edit its issue body. Close the issue to withdraw it from the index. The static starter collection includes four clearly attributed references from Metaphor’s website alongside the first curator submission.

## Run the site

```sh
npm run dev
npm test
npm run build
```

There are no npm dependencies. The dev server prints its URL. The build writes the deployable HTML, CSS, JavaScript, and artwork to `dist/`. All links and assets support hosting at the domain root or a GitHub Pages repository subpath.

## Publish and refresh

The static pages include a catalog snapshot. A visitor’s browser refreshes it from the owner’s public GitHub issues on entry and while the page is visible. A short cache limits repeat API calls. If GitHub is unavailable or rate-limits a request, the most recent cached or bundled snapshot stays visible. A private repository would require a different public data source.

The Pages workflow builds a fresh snapshot when the curator changes a submission or the source changes. Set **Settings → Pages → Source → GitHub Actions** to enable GitHub Pages. Other static hosts can deploy the result of `node scripts/build.mjs --sync`. The build can use `GITHUB_TOKEN` for additional API capacity. Tokens belong in build or bot secrets only.

The generated glass cover and geometric thumbnails live in `public/assets/`. The bundled DM Sans typeface includes its OFL license.
