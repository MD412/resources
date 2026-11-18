# Saving to AI Repo

When the curator asks to save a link, use the GitHub Issues API or the save command in this repo. Only curator-owned open issues appear in the index. The owner is MD412 (GitHub ID 25497103).

1. Use the URL and notes the curator provided. Use verified metadata when available. Leave unknown descriptions empty. Keep quotes exact.
2. Prefer `npm run save -- URL "Title" agents "Description"` with `AI_REPO_GITHUB_TOKEN` supplied through the agent's secret store. Categories are `agents`, `models`, `reading`, and `x`.
3. With a GitHub connector, check open owner issues in MD412/resources for the same URL. For a new record, create an issue there with title `[AI Repo] Title`. The body must be a JSON object with a required `url` and optional `title`, `category`, `description`, and `author`. X status URLs are categorized automatically.
4. Return the issue URL after GitHub confirms the save. An existing matching record counts as saved.

Edit the issue body to revise a record. Close it to withdraw the submission. Reopen it to restore it. Keep credentials outside both source control and issue bodies.
