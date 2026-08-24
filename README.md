# AI Social Automate

Product Requirements Document (PRD): Agentic News MCP
Instructions for Lovable: Please read this entire PRD carefully. You are acting as the foundational architect for a "Bring Your Own AI" SaaS platform. Build the initial scaffolding, UI, and database schema based strictly on this document.
1. Executive Summary
Product Name: setupr automate MCP Concept: A zero-UI automation hub powered by the Model Context Protocol (MCP). The product bridges a central, daily-updated knowledge source (a newspaper stored in OneDrive) with the end-user's personal AI client (like Claude Desktop). The USP: The user's AI handles all interaction, reasoning, and content generation. Our platform simply handles authentication and provides the execution pipes (reading the file, posting to social media). We do not pay for AI API costs; the user's AI client does the heavy lifting.
2. Technical Architecture & Tech Stack
Frontend / Landing: React/Vite/Next.js with Tailwind CSS (Minimalist, dark-mode SaaS aesthetic).
Authentication: Supabase (Handles user sign-ups and stores OAuth tokens for social media).
Backend / MCP Server: Node.js / Edge functions to handle the standard MCP protocol handshake and expose tools.
Execution Engine: n8n (External). The MCP tools act strictly as pass-through webhooks to our n8n server, which handles the actual posting to Twitter/LinkedIn.
3. The User Journey & Screen Flow
We are NOT building a dashboard, a feed, or a content editor. The web app is strictly for authentication and setup.
Screen 1: The Landing Page
A highly polished, text-focused hero section explaining the value: "Connect your AI to the daily news and automate your social presence."
Displays the Universal MCP Link (e.g., mcp.ourdomain.com).
Provides simple instructions on how to paste this link into Claude Desktop.
Crucial: There is NO manual "Sign Up" button here. Auth is triggered via the AI.
Screen 2: The MCP Auth Redirect (Login)
When the user adds the MCP link to their AI, the MCP protocol requires authentication. The user is redirected to this Supabase-powered login/signup screen.
Screen 3: The Setup Wizard (Post-Auth)
After logging in, the user sees a minimal setup screen.
Goal: Connect social media accounts.
UI: Large, clear buttons to "Connect LinkedIn" and "Connect X (Twitter)".
Note: Do NOT ask for the user's "Niche" or preferences. The user's personal AI already knows their context. We only need their social OAuth tokens to post on their behalf.
Screen 4: Success State
"You're all set. Return to your AI to begin."
4. MCP Server Specifications (The Boilerplate)
Lovable must generate the backend boilerplate to serve as an MCP Server. The server must expose the following two tools to the AI client:
Tool 1: get_daily_paper_content
Purpose: Passes the content of today's newspaper directly to the user's AI client.
Logic: Pings an n8n webhook to fetch the PDF/text from our master OneDrive, and returns the raw content to the AI.
Cost Saving Note: By returning the raw content, the user's AI (Claude) does the reading, curating, and writing. We spend $0 on AI API costs.
Tool 2: publish_to_social
Arguments: platform (string), post_content (string)
Purpose: Publishes the AI's finalized draft to the user's social media.
Logic: The AI does NOT manage or see any OAuth tokens. When the AI calls this tool, the MCP server simply saves the post_content and platform into a dedicated table in our Supabase database (e.g., publishing_queue).
The n8n Handoff: Our n8n server constantly watches this Supabase table. As soon as a new post lands in the queue, n8n automatically picks it up, uses its own native social connections to publish it, and marks the row as 'published'. Classic automation flow.
5. Design Guidelines for Lovable
Strip away anything that looks like a traditional SaaS dashboard.
The UI should feel like a secure, developer-focused tool (think Stripe or Vercel login flows).
Ensure the Supabase schema is set up to store multiple OAuth connection tokens (X, LinkedIn) mapped to a single user_id.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ai-autopilot-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f33542f1-678b-4f31-b580-2065ca969f4e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
