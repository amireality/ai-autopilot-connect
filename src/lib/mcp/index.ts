import { auth, defineMcp } from "@lovable.dev/mcp-js";
import publishToSocial from "./tools/publish-to-social";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged, and Vite inlines it at build time.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "setupr-automate",
  title: "setupr automate",
  version: "0.1.0",
  instructions:
    "Automation pipes for setupr automate. Call `publish_to_social` to queue any finished post to the user's X or LinkedIn.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [publishToSocial] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
