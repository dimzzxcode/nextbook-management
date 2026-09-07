import * as argon2 from "argon2";
import { sql } from "drizzle-orm";

import { db } from "./connection";
import { permissions, rolePermissions, roles, users } from "./schema";
import { ALL_PERMISSIONS, PERMISSIONS } from "@/shared/constants/permissions";
import { ROLES } from "@/shared/constants/roles";

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || "admin@pustaka.id",
  password: process.env.ADMIN_PASSWORD || "Admin123!",
  name: process.env.ADMIN_NAME || "Administrator",
};

async function seedRoles() {
  console.log("Seeding roles...");
  const values = [
    { name: ROLES.ADMIN, description: "Administrator — akses penuh sistem" },
    { name: ROLES.STAFF, description: "Staff — pengelolaan buku, author, kategori" },
    { name: ROLES.USER, description: "User — akses baca buku" },
  ];

  for (const v of values) {
    await db
      .insert(roles)
      .values(v)
      .onConflictDoUpdate({
        target: roles.name,
        set: { description: v.description },
      });
  }

  const all = await db.select().from(roles);
  console.log(`  roles: ${all.map((r) => r.name).join(", ")}`);
  return all;
}

async function seedPermissions() {
  console.log("Seeding permissions...");
  const permissionValues = ALL_PERMISSIONS.map((name) => ({
    name,
    description: `Permission ${name}`,
  }));

  for (const v of permissionValues) {
    await db
      .insert(permissions)
      .values(v)
      .onConflictDoUpdate({
        target: permissions.name,
        set: { description: v.description },
      });
  }

  const all = await db.select().from(permissions);
  console.log(`  permissions: ${all.length} seeded`);
  return all;
}

async function assignPermissionsToRoles() {
  console.log("Assigning permissions to roles...");

  const allRoles = await db.select().from(roles);
  const allPerms = await db.select().from(permissions);

  const roleByName = Object.fromEntries(allRoles.map((r) => [r.name, r]));
  const permByName = Object.fromEntries(allPerms.map((p) => [p.name, p]));

  // Definisi sesuai TASK 3.3
  const STAFF_PERMS: string[] = [
    PERMISSIONS.BOOK_CREATE,
    PERMISSIONS.BOOK_READ,
    PERMISSIONS.BOOK_UPDATE,
    PERMISSIONS.BOOK_DELETE,
    PERMISSIONS.AUTHOR_CREATE,
    PERMISSIONS.AUTHOR_READ,
    PERMISSIONS.AUTHOR_UPDATE,
    PERMISSIONS.AUTHOR_DELETE,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
  ];

  const USER_PERMS: string[] = [PERMISSIONS.BOOK_READ];

  const assignments: Record<string, string[]> = {
    [ROLES.ADMIN]: ALL_PERMISSIONS,
    [ROLES.STAFF]: STAFF_PERMS,
    [ROLES.USER]: USER_PERMS,
  };

  for (const [roleName, permNames] of Object.entries(assignments)) {
    const role = roleByName[roleName];
    if (!role) {
      console.warn(`  role ${roleName} not found, skip`);
      continue;
    }

    // Hapus assignment lama agar idempotent (hindari duplikat)
    await db.delete(rolePermissions).where(sql`${rolePermissions.roleId} = ${role.id}`);

    const rows = permNames
      .map((n) => permByName[n])
      .filter(Boolean)
      .map((p) => ({ roleId: role.id, permissionId: p.id }));

    if (rows.length > 0) {
      await db.insert(rolePermissions).values(rows);
    }

    console.log(`  ${roleName}: ${permNames.length} permissions`);
  }
}

async function seedAdmin() {
  console.log("Seeding default admin...");

  const adminRole = await db
    .select()
    .from(roles)
    .where(sql`${roles.name} = ${ROLES.ADMIN}`)
    .limit(1)
    .then((r) => r[0]);

  if (!adminRole) throw new Error("Role ADMIN belum tersedia");

  const existing = await db
    .select()
    .from(users)
    .where(sql`${users.email} = ${DEFAULT_ADMIN.email}`)
    .limit(1)
    .then((r) => r[0]);

  const passwordHash = await argon2.hash(DEFAULT_ADMIN.password, {
    type: argon2.argon2id,
  });

  if (existing) {
    // Update hash & role jika sudah ada — pastikan kredensial sesuai env
    await db
      .update(users)
      .set({
        passwordHash,
        roleId: adminRole.id,
        name: DEFAULT_ADMIN.name,
      })
      .where(sql`${users.id} = ${existing.id}`);
    console.log(`  admin updated: ${DEFAULT_ADMIN.email} (id=${existing.id})`);
    return;
  }

  const [created] = await db
    .insert(users)
    .values({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash,
      roleId: adminRole.id,
    })
    .returning({ id: users.id });

  console.log(`  admin created: ${DEFAULT_ADMIN.email} (id=${created.id})`);
}

async function main() {
  console.log("=== Database Seed Start ===");
  console.log(`ADMIN from env: ${DEFAULT_ADMIN.email}`);

  await seedRoles();
  await seedPermissions();
  await assignPermissionsToRoles();
  await seedAdmin();

  console.log("=== Seed Completed ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
