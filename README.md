<p align="center">
  <a href="https://blew.setupr.com">
    <img src="https://blew.setupr.com/logo.png" alt="blew by setupr logo" width="72" height="72" />
  </a>
</p>

<h1 align="center">blew by setupr</h1>

<p align="center">
  <strong>The zero-dashboard social media autopilot for AI agents.</strong><br />
  Publish directly to X (Twitter) and LinkedIn straight from your regular ChatGPT, Claude, and Codex chats.
</p>

<p align="center">
  <a href="https://blew.setupr.com"><img src="https://img.shields.io/badge/Live%20Service-blew.setupr.com-FF6600?style=flat-square" alt="Live App" /></a>
  <a href="https://blew.setupr.com/.well-known/oauth-protected-resource"><img src="https://img.shields.io/badge/OAuth%202.0-Protected%20Resource-emerald?style=flat-square" alt="OAuth 2.0" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/Protocol-Model%20Context%20Protocol-5B5BD6?style=flat-square" alt="MCP Protocol" /></a>
  <a href="https://smithery.ai"><img src="https://img.shields.io/badge/Indexed%20on-Smithery-black?style=flat-square" alt="Smithery" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" /></a>
</p>

---

## ⚡ The Zero-Dashboard Philosophy

Traditional social media schedulers (Buffer, Hootsuite, Typefully) force you to work backwards: you brainstorm with an AI in one tab, copy-paste the text into an external dashboard, adjust formats, upload media, and switch back and forth.

Meanwhile, custom GPTs in app stores trap you inside a walled garden—you cannot access your usual workspace context, custom instructions, or conversational flow.

**Blew reimagines social media with a zero-dashboard architecture:**

1. **Bring Your Own AI:** Blew runs as a standard [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server inside your daily AI client—**ChatGPT**, **Claude Desktop**, **Claude Code**, **Cursor**, or **Windsurf**.
2. **Conversational Publishing:** As you chat, ideate, or write code, simply tell your AI:  
   > *"Draft a thread on our new feature launch and publish it to my X and LinkedIn with our diagram."*
3. **One-Click Approval:** The AI presents the formatted draft and requests confirmation. You say *"Looks good, post it"*, and Blew securely transmits the post to your verified accounts.
4. **No Dashboard to Check:** No extra tabs. No content editors. Your AI does the thinking, and Blew provides the authenticated execution pipe.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│     Your AI Client (ChatGPT / Claude / Codex / Cursor) │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ MCP JSON-RPC (HTTP SSE / Streamable)
                            ▼
┌────────────────────────────────────────────────────────┐
│               blew by setupr MCP Gateway               │
│                https://blew.setupr.com/mcp             │
├───────────────────────────┬────────────────────────────┤
│ • MCP Tool Handshake      │ • Quota Validation        │
│ • Bearer Token Auth       │ • Payload Sanitization     │
└─────────────┬─────────────┴──────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐┌───────────────────────────┐
│     Supabase Vault        ││   Cloud Dispatch Engine   │
│ • AES-256 Encrypted OAuth ││ • Media processing        │
│ • Post quota ledger       ││ • Rate limit compliance   │
└───────────────────────────┘└─────────────┬─────────────┘
                                           │
                                           ▼
                            ┌────────────────────────────┐
                            │   X (Twitter) & LinkedIn   │
                            │    Official REST APIs      │
                            └────────────────────────────┘
```

---

## 🚀 Quickstart & Supported Clients

You can connect Blew in less than 60 seconds through your preferred AI environment.

### 1. ChatGPT (Developer Connectors / Plugins)
1. Open **ChatGPT** and navigate to your **Account Settings** &rarr; **Connected Apps** (or developer connectors).
2. Add a new remote MCP connector:
   - **Server URL:** `https://blew.setupr.com/mcp`
   - **Discovery URL:** `https://blew.setupr.com`
3. Authorize via your Blew account. Your regular ChatGPT conversations now have access to `publish_to_social`.

---

### 2. Claude Desktop
Add `blew` to your `claude_desktop_config.json`:

* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "blew": {
      "type": "http",
      "url": "https://blew.setupr.com/mcp"
    }
  }
}
```

---

### 3. Claude Code (CLI)
Install with a single command:

```bash
claude mcp add --scope user --transport http blew https://blew.setupr.com/mcp
```

---

### 4. Smithery Index
Blew is pre-configured for automated 1-click installation via [Smithery.ai](https://smithery.ai):

```bash
npx -y @smithery/cli install blew --client claude
```

---

### 5. Cursor / Windsurf / Codex
Add an HTTP MCP server pointing to:
```
https://blew.setupr.com/mcp
```

---

## 🛠️ MCP Tools Exposed

Blew registers two core tools compliant with the Model Context Protocol specification:

### `publish_to_social`
Publishes drafted content to the user's connected social media platforms.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `platform` | `string` | **Yes** | Target social network: `'twitter'`, `'linkedin'`, or `'both'` |
| `post_content` | `string` | **Yes** | Plain text body of the update |
| `media_url` | `string` | No | Public URL of an image or graphic to attach |

```json
{
  "name": "publish_to_social",
  "arguments": {
    "platform": "both",
    "post_content": "Excited to unveil our new zero-dashboard social media autopilot powered by the Model Context Protocol!",
    "media_url": "https://blew.setupr.com/og-banner.png"
  }
}
```

### `check_quota`
Queries the authenticated user's remaining post balance and subscription tier.

```json
{
  "name": "check_quota",
  "arguments": {}
}
```

---

## 🔒 Security, Privacy & Standards

- **Zero Prompt Retention:** Blew does not read, log, or train on your conversation prompts, system instructions, or internal reasoning. Only the approved text payload sent to `publish_to_social` reaches our execution engine.
- **Encrypted OAuth 2.0 Vault:** Social media access and refresh tokens are encrypted at rest with **AES-256**. We never see, handle, or store your personal passwords.
- **Official API Compliance:** Uses X API v2 and LinkedIn Community/Consumer APIs with minimum necessary permissions.
- **One-Click Revocation:** Disconnect your social profiles anytime in 1 click at [blew.setupr.com/setup](https://blew.setupr.com/setup).
- **Public Policies:**
  - **Privacy Policy:** [https://blew.setupr.com/privacy](https://blew.setupr.com/privacy)
  - **Terms of Service:** [https://blew.setupr.com/terms](https://blew.setupr.com/terms)
  - **OAuth Protected Resource:** [https://blew.setupr.com/.well-known/oauth-protected-resource](https://blew.setupr.com/.well-known/oauth-protected-resource)

---

## 💳 Quotas & Pricing

- **Free Starter Plan:** 5 complimentary posts upon registration to test your setup.
- **Pay-as-you-grow Top-Ups:** Purchase additional posts (e.g., 100 posts for ₹499) at [blew.setupr.com/upgrade](https://blew.setupr.com/upgrade). Credits never expire.

---

## 👨‍💻 Local Development

```bash
# Clone repository
git clone https://github.com/amireality/blew-by-setupr.git
cd blew-by-setupr

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

<p align="center">
  Built with ❤️ by <a href="https://setupr.com">Setupr</a> • Designed for the Agentic Era
</p>
