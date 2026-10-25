<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use a single root AccountProvider to validate user identity and subscribe to auth transitions; keep public browsing independent of login.
- Keep profile, preferences, and signed-in likes in owner-scoped profiles rows, while guest likes remain browser-local, to avoid mixing identities.
- Organize the public library into compact curated game shelves and an exhaustive searchable grid; do not imply measured popularity without analytics.
