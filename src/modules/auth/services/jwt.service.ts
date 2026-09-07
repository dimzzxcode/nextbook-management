import { SignJWT, jwtVerify } from "jose";

export type AccessTokenPayload = {
  sub: string; // user id
  email: string;
  roleId: number;
  role: string;
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string; // session id or random
  iat?: number;
  exp?: number;
};

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function generateAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
  secret: string,
  expiresIn = "15m"
): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role, roleId: payload.roleId } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(secret));
}

export async function verifyAccessToken(
  token: string,
  secret: string
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(secret));
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as string,
    roleId: payload.roleId as number,
    iat: payload.iat,
    exp: payload.exp,
  };
}

export async function generateRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  secret: string,
  expiresIn = "7d"
): Promise<string> {
  return new SignJWT({ jti: payload.jti } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setJti(payload.jti)
    .sign(getSecret(secret));
}

export async function verifyRefreshToken(
  token: string,
  secret: string
): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(secret));
  return {
    sub: payload.sub as string,
    jti: payload.jti as string,
    iat: payload.iat,
    exp: payload.exp,
  };
}
