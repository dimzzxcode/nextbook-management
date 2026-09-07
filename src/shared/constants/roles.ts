export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  USER: "USER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_IDS = {
  ADMIN: 1,
  STAFF: 2,
  USER: 3,
} as const;
