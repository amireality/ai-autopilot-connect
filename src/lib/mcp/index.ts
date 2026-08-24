import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getDailyPaperContent from "./tools/get-daily-paper-content";
import publishToSocial from "./tools/publish-to-social";


// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged, and Vite inlines it at build time.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "setupr-automate",
  title: "setupr automate",
  version: "0.1.0",
  instructions:
    "Automation pipes for setupr automate. Call `get_daily_paper_content` to read today's newspaper from the shared OneDrive archive, then write posts yourself about current events in the user's niche. Call `publish_to_social` to queue any finished post to the user's X or LinkedIn — it works standalone too, without reading the paper.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getDailyPaperContent, publishToSocial] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
