export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const SESSION = {
  DEFAULT_EXPIRES_DAYS: 7,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
} as const;

export const COOKIE = {
  AUTH_TOKEN: "auth_token",
} as const;
