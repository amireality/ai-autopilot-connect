import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = process.env["APP_URL"] || "https://blew.setupr.com";

function getSecretKey(): string {
  return process.env["SUPABASE_SERVICE_ROLE_KEY"] || "default-oauth-state-secret-2026";
}

// Signs payload to prevent CSRF / tampering
export function createOAuthState(payload: Record<string, unknown>): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 15 * 60 * 1000 }); // 15 min expiry
  const dataB64 = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(dataB64)
    .digest("base64url");
  return `${dataB64}.${signature}`;
}

export function verifyOAuthState<T = Record<string, unknown>>(stateStr: string): T {
  const [dataB64, signature] = stateStr.split(".");
  if (!dataB64 || !signature) throw new Error("Invalid OAuth state");

  const expectedSig = crypto
    .createHmac("sha256", getSecretKey())
    .update(dataB64)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    throw new Error("Tampered OAuth state");
  }

  const payload = JSON.parse(Buffer.from(dataB64, "base64url").toString("utf8"));
  if (Date.now() > payload.exp) {
    throw new Error("OAuth state expired. Please try connecting again.");
  }

  return payload as T;
}

// -------------------------------------------------------------
// Twitter (X) OAuth 2.0 PKCE
// -------------------------------------------------------------
export function getTwitterAuthUrl(userId: string): string {
  const clientId = process.env["TWITTER_CLIENT_ID"];
  if (!clientId) throw new Error("TWITTER_CLIENT_ID is not configured in environment variables.");

  // PKCE Code Verifier & Challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = createOAuthState({ userId, codeVerifier, platform: "x" });

  const redirectUri = `${BASE_URL}/api/auth/callback/x`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

export async function handleTwitterCallback(code: string, stateStr: string): Promise<string> {
  const { userId, codeVerifier } = verifyOAuthState<{ userId: string; codeVerifier: string }>(stateStr);

  const clientId = process.env["TWITTER_CLIENT_ID"];
  const clientSecret = process.env["TWITTER_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw new Error("Twitter credentials are not configured in environment variables.");
  }

  const redirectUri = `${BASE_URL}/api/auth/callback/x`;

  // 1. Exchange code for access & refresh tokens
  const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Twitter token exchange error:", errorText);
    throw new Error(`Failed to exchange Twitter code: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;
  const expiresIn = tokenData.expires_in || 7200;

  // 2. Fetch the user's handle from Twitter API
  let accountHandle = "@user";
  try {
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData?.data?.username) {
        accountHandle = `@${userData.data.username}`;
      }
    }
  } catch (err) {
    console.warn("Could not fetch Twitter username:", err);
  }

  // 3. Store tokens in Supabase social_connections table
  const tokenPayload = JSON.stringify({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const { error: dbError } = await supabaseAdmin.from("social_connections").upsert(
    {
      user_id: userId,
      platform: "x",
      status: "connected",
      account_handle: accountHandle,
      token_ciphertext: tokenPayload,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_error: null,
    },
    { onConflict: "user_id,platform" },
  );

  if (dbError) {
    console.error("Failed to save Twitter connection:", dbError);
    throw new Error(`Database error saving connection: ${dbError.message}`);
  }

  return accountHandle;
}

export async function refreshTwitterConnection(
  userId: string,
  currentRefreshToken: string,
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const clientId = process.env["TWITTER_CLIENT_ID"];
  const clientSecret = process.env["TWITTER_CLIENT_SECRET"];

  if (!clientId) {
    throw new Error("TWITTER_CLIENT_ID is not configured in environment variables.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const bodyParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
  });

  if (clientSecret) {
    // RFC 6749 Confidential Client:
    // Credentials MUST be passed in the Authorization header.
    // Twitter API v2 strictly rejects requests if client_id is in the body when Basic Auth is used!
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basicAuth}`;
  } else {
    // Public Client (PKCE without secret): client_id is passed in the body
    bodyParams.set("client_id", clientId);
  }

  const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers,
    body: bodyParams,
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Twitter token refresh error:", errorText);
    throw new Error(`Failed to refresh Twitter token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token || currentRefreshToken;
  const expiresIn = tokenData.expires_in || 7200;

  const tokenPayload = JSON.stringify({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const { error: dbError } = await supabaseAdmin
    .from("social_connections")
    .update({
      token_ciphertext: tokenPayload,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("user_id", userId)
    .eq("platform", "x");

  if (dbError) {
    console.error("Failed to update refreshed Twitter connection in DB:", dbError);
    throw new Error(`Database error saving refreshed connection: ${dbError.message}`);
  }

  return { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn };
}


// -------------------------------------------------------------
// LinkedIn OAuth 2.0
// -------------------------------------------------------------
export function getLinkedInAuthUrl(userId: string): string {
  const clientId = process.env["LINKEDIN_CLIENT_ID"];
  if (!clientId) throw new Error("LINKEDIN_CLIENT_ID is not configured in environment variables.");

  const state = createOAuthState({ userId, platform: "linkedin" });
  const redirectUri = `${BASE_URL}/api/auth/callback/linkedin`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "openid profile email w_member_social",
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export async function handleLinkedInCallback(code: string, stateStr: string): Promise<string> {
  const { userId } = verifyOAuthState<{ userId: string }>(stateStr);

  const clientId = process.env["LINKEDIN_CLIENT_ID"];
  const clientSecret = process.env["LINKEDIN_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn credentials are not configured in environment variables.");
  }

  const redirectUri = `${BASE_URL}/api/auth/callback/linkedin`;

  // 1. Exchange code for access token
  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("LinkedIn token exchange error:", errorText);
    throw new Error(`Failed to exchange LinkedIn code: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 5184000; // 60 days

  // 2. Fetch user profile / sub (person URN) from userinfo
  let accountHandle = "LinkedIn User";
  let personUrn = "";
  try {
    const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      accountHandle = userData.name || userData.email || "LinkedIn Member";
      personUrn = userData.sub ? `urn:li:person:${userData.sub}` : "";
    }
  } catch (err) {
    console.warn("Could not fetch LinkedIn userinfo:", err);
  }

  // 3. Store tokens in Supabase social_connections table
  const tokenPayload = JSON.stringify({
    access_token: accessToken,
    person_urn: personUrn,
  });

  const { error: dbError } = await supabaseAdmin.from("social_connections").upsert(
    {
      user_id: userId,
      platform: "linkedin",
      status: "connected",
      account_handle: accountHandle,
      token_ciphertext: tokenPayload,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_error: null,
    },
    { onConflict: "user_id,platform" },
  );

  if (dbError) {
    console.error("Failed to save LinkedIn connection:", dbError);
    throw new Error(`Database error saving connection: ${dbError.message}`);
  }

  return accountHandle;
}
