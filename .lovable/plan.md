# setupr automate MCP — foundation build

A zero-dashboard product: a polished landing page, a login screen, a two-step connect wizard, and an MCP server that exposes two tools to the user's own AI client. No AI costs on our side.

## What gets built

### 1. Landing page (`/`)
Dark, developer-tool aesthetic (Vercel/Stripe login energy — not a SaaS dashboard). Text-led hero: "Connect your AI to the daily news and automate your social presence."
- The universal MCP URL shown in a copy-to-clipboard block, derived at runtime from the live domain (`<origin>/mcp`) so it is always correct.
- Short "Add to Claude Desktop" / "Add to ChatGPT" / Claude Code one-line command instructions.
- No sign-up button. Auth happens only when the AI client connects.

### 2. Auth screen (`/login`)
Email + password sign-in/sign-up powered by Lovable Cloud. Purpose-built for the OAuth handoff: it preserves the return destination so the AI client lands back where it started.

### 3. OAuth consent screen
When the AI client connects, it is sent to a consent page: "Connect Claude to your account — Approve / Deny." Approving issues the token the MCP server verifies.

### 4. Setup wizard (`/setup`, signed-in only)
Two large buttons: **Connect LinkedIn** and **Connect X (Twitter)**. No niche, no preferences.
- Per your answer, the buttons record a pending connection against the user now; the real OAuth handshake drops in later once the X/LinkedIn app credentials exist. Each card shows Not connected / Pending / Connected.

### 5. Success screen (`/setup/done`)
"You're all set. Return to your AI to begin." Plus a link back to the MCP URL instructions.

## The MCP server (two tools)

**`get_daily_paper_content`** — calls the n8n webhook, returns today's raw paper text straight to the caller's AI. Nothing is summarised or interpreted on our side. Until you supply the webhook URL it reads a server secret placeholder and returns a clear "paper source not configured yet" error instead of failing silently.

**`publish_to_social`** — arguments `platform` and `post_content`. Writes one row into `publishing_queue` owned by the signed-in user and returns the queued row id. It never touches tokens and never posts directly; n8n watches the table and publishes.

Both tools run as the signed-in user, so one user can never read or queue posts for another.

## Data model

- `social_connections` — one row per user per platform (`x`, `linkedin`), with status and a place for the encrypted token payload plus account handle. Unique per user+platform, so re-connecting updates rather than duplicates.
- `publishing_queue` — user, platform, post content, status (`queued` / `publishing` / `published` / `failed`), external post id, error text, timestamps.

Row-level security on both: a user only ever sees their own rows. n8n reads and updates the queue with its service credential, which bypasses those rules by design.

## Technical notes

- Lovable Cloud is enabled for auth + database; its OAuth 2.1 server secures the MCP endpoint so Claude/ChatGPT can self-register as clients.
- MCP is built with `@lovable.dev/mcp-js`, mounted at `/mcp`; tool files live in `src/lib/mcp/tools/`.
- n8n webhook URL and shared secret are stored as server-side secrets, read only inside tool handlers.
- Migration includes explicit grants and RLS policies for both tables.

## Out of scope for this pass

Real X/LinkedIn OAuth exchange, the n8n workflows themselves, any feed/editor/analytics UI.
