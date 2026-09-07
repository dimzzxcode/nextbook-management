import { cookies } from "next/headers";

import { COOKIE } from "@/shared/constants/app";

const ACCESS_COOKIE = COOKIE.AUTH_TOKEN;
const REFRESH_COOKIE = "refresh_token";

function isSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function setAuthCookies(params: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, params.accessToken, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15m
  });

  store.set(REFRESH_COOKIE, params.refreshToken, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7d
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}
