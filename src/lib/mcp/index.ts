import { auth, defineMcp } from "@lovable.dev/mcp-js";
import publishToSocial from "./tools/publish-to-social";
import checkQuota from "./tools/check-quota";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged, and Vite inlines it at build time.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "blew-by-setupr",
  title: "blew by setupr",
  version: "0.2.0",
  instructions:
    "Automation MCP server for blew by setupr. Call `publish_to_social` to queue finished posts to the user's connected X or LinkedIn accounts. Call `check_quota` to check remaining post balance and active tier.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [publishToSocial, checkQuota] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
