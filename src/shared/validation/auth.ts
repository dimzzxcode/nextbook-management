import { z } from "zod";

import { PASSWORD } from "@/shared/constants/app";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi.")
      .max(100, "Nama maksimal 100 karakter."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Masukkan alamat email yang valid."),
    password: z
      .string()
      .min(
        PASSWORD.MIN_LENGTH,
        `Kata sandi minimal ${PASSWORD.MIN_LENGTH} karakter.`
      )
      .max(100, "Kata sandi maksimal 100 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Masukkan alamat email yang valid."),
  password: z.string().min(1, "Kata sandi wajib diisi.").max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(
        PASSWORD.MIN_LENGTH,
        `Kata sandi baru minimal ${PASSWORD.MIN_LENGTH} karakter.`
      )
      .max(100),
    confirmNewPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
