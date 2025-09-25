# Focus Playground — VS Code mini‑games for healthy waiting

**Why?** Modern AI dev flows mean lots of “run → think → wait”. Instead of doom‑scrolling, take a **30–60s brain break** _inside VS Code_.

## What it is
A lightweight extension that opens a polished webview with micro‑games designed for short, satisfying sessions:
- **Aim Dots** — click targets before they fade (reaction & motor control)
- **Sequence Memory** — repeat an expanding 3×3 pattern (working memory)

High scores are saved locally. Default session length is 30s (configurable).

## Install (local dev)
```bash
# in the folder where you unzipped this project
npm install
npm run compile
# then open the folder in VS Code and press F5 to run the extension
```

Or package & install:
```bash
npm run package          # produces focus-playground-*.vsix
# then in VS Code: Extensions → ... → Install from VSIX...
```

## Use
- Command Palette → **Focus Playground: Open**
- Default hotkey: **Ctrl/Cmd+Alt+F**
- Status bar → ▶ Focus Playground

## Idle nudge (optional)
By default, after ~25s of inactivity the extension shows a friendly “Play” prompt. Configure under **Settings → Focus Playground**:
- `focusPlayground.autoShowOnIdle` (true/false)
- `focusPlayground.idleSeconds` (5–180)
- `focusPlayground.defaultDuration` (10–180)
- `focusPlayground.sidebar` (open beside editor)

## Privacy
No telemetry. No network calls. Everything runs inside VS Code’s sandboxed webview.

## Roadmap ideas (PRs welcome)
- “Type Burst” micro typing test
- Breathing/box‑breathing card for quick resets
- Tiny chess tactics & code golf mini‑puzzles
- Audio cues & haptics (where supported)