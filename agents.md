# Repository Guidelines

## Project Structure & Module Organization
- **Extension host**: `src/extension.ts` manages VS Code activation and webview creation.
- **Webview code**: `media/` with `style.css`, `main.js` (module entry), and `scripts/` split into shared helpers plus `games/` modules.
- **Build output**: `out/` (TypeScript compile target). `.vscodeignore` keeps non-runtime files out of the VSIX.
- **Docs**: `README.md` (user guide), `LICENSE` (MIT), `agents.md` (history), this `AGENTS.md` (local-only guide).

## Build, Test, and Development Commands
- `make install` → install dependencies via `npm install`.
- `make compile` → TypeScript build (`npm run compile`).
- `make package` → create VSIX (`npm run package`).
- `make publish` → `vsce publish` (requires prior `vsce login`).
- `make clean-publish-minor` → install → compile → `npm version minor` → `vsce publish` (remember `git push --follow-tags`).
- Only compile locally; testing is manual by the user after your change.

## Coding Style & Naming Conventions
- JavaScript/TypeScript: 2-space indentation, `camelCase` for functions/variables, `PascalCase` for classes.
- Centralize strings/duration/defaults in `media/scripts/constants.js`; avoid inline literals.
- For DOM elements, use the `h()` helper (`media/scripts/dom.js`) and shared builders in `ui/components.js`.

## Testing Guidelines
- No automated suite. After each change, run `make compile`; ask the user to perform manual tests (pointer lock, hotkeys, menu flow).

## Commit & Pull Request Guidelines
- Follow existing commit style (`chore: ...`, `docs: ...`, etc.).
- Branching: open a new branch per issue; do not push until the user explicitly approves. Local commits are fine for checkpoints, but keep them unpublished until approval.
- Link GitHub issue numbers in commit/PR descriptions when the user asks for publish-ready work. Use project Issues for task tracking.
- After user validation, push the branch and open a PR with summary, linked issue, and screenshots/GIFs if UI changes are visible.

## Project Management Notes
- GitHub Issues are the source of truth. Before starting, confirm the relevant issue and branch name (e.g., `feature/debug-overlay`).
- When instructions change mid-task, update the branch plan in your notes but still avoid pushing until the user says "push".

