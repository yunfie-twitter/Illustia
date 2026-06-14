import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";

const USER_AGENT = "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)";
const REDIRECT_URI = "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback";
const LOGIN_URL = "https://app-api.pixiv.net/web/v1/login";
const AUTH_TOKEN_URL = "https://oauth.secure.pixiv.net/auth/token";
const CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT";
const CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj";

export interface PixivLoginRequest {
  loginUrl: string;
  codeVerifier: string;
}

export interface PixivTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TokenPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
  errors?: {
    system?: {
      message?: string;
    };
  };
}

function toBase64Url(value: string) {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomUrlSafeToken(byteCount: number) {
  return toBase64Url(Buffer.from(Crypto.getRandomBytes(byteCount)).toString("base64"));
}

async function s256(data: string) {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data, {
    encoding: Crypto.CryptoEncoding.BASE64
  });
  return toBase64Url(digest);
}

function readTokenError(payload: TokenPayload) {
  return payload.errors?.system?.message ?? payload.error_description ?? payload.error ?? "pixiv 認証に失敗しました。";
}

export async function createPixivLoginRequest(): Promise<PixivLoginRequest> {
  const codeVerifier = randomUrlSafeToken(32);
  const codeChallenge = await s256(codeVerifier);
  const params = new URLSearchParams({
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    client: "pixiv-android"
  });

  return {
    codeVerifier,
    loginUrl: `${LOGIN_URL}?${params.toString()}`
  };
}

export function readPixivCallbackCode(url: string) {
  if (!url.startsWith(REDIRECT_URI)) return undefined;

  const parsed = new URL(url);
  const error = parsed.searchParams.get("error");
  const code = parsed.searchParams.get("code");

  if (error) {
    throw new Error(parsed.searchParams.get("error_description") ?? error);
  }

  return code ?? undefined;
}

export async function exchangePixivAuthCode(code: string, codeVerifier: string): Promise<PixivTokenResponse> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    include_policy: "true",
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch(AUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT
    },
    body: body.toString()
  });
  const payload = (await response.json()) as TokenPayload;

  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    throw new Error(readTokenError(payload));
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in ?? 0
  };
}
