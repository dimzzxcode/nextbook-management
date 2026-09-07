"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBookAction } from "@/modules/books/actions/book.actions";
import SearchableSelect from "../components/searchable-select";

export default function CreateBookForm({
  authors,
  categories,
}: {
  authors: { id: number; name: string }[];
  categories: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Judul wajib diisi.";
    if (isbn && !/^[0-9-]+$/.test(isbn)) errors.isbn = "ISBN hanya boleh angka dan strip.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    start(async () => {
      const input: any = {
        title,
        isbn: isbn || undefined,
        description: description || undefined,
        publishedYear: publishedYear ? Number(publishedYear) : undefined,
        authorId: authorId ? Number(authorId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };
      const res = await createBookAction(input);
      if (res.success) {
        router.push("/books");
        router.refresh();
      } else {
        if (res.error.code === "VALIDATION_ERROR" && (res.error as any).details?.fieldErrors) {
          const fe: Record<string, string> = {};
          for (const [k, v] of Object.entries((res.error as any).details.fieldErrors as Record<string, string[]>)) {
            if (v && v[0]) fe[k] = v[0];
          }
          setFieldErrors(fe);
        } else {
          setServerError(res.error.message);
        }
      }
    });
  };

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: `1px solid ${hasErr ? "#d93636" : "var(--border)"}`,
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
  });

  const sectionStyle: React.CSSProperties = {
    background: "#fbfdff",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  };
  const sectionHeadStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };
  const dotStyle: React.CSSProperties = { width: 8, height: 8, borderRadius: 999, background: "var(--primary)" };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div style={{ background: "#fdeaea", color: "#d93636", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{serverError}</div>}

      <div style={sectionStyle}>
        <div style={sectionHeadStyle}><span style={dotStyle} /> Informasi Utama</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Judul <span style={{ color: "#d93636" }}>*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Laskar Pelangi" style={inputStyle(!!fieldErrors.title)} />
          {fieldErrors.title && <div style={{ fontSize: 12, color: "#d93636", marginTop: 4 }}>{fieldErrors.title}</div>}
          <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 4 }}>Judul akan tampil di daftar & pencarian.</div>
        </div>
        <div style={{ marginBottom: 0 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ISBN</label>
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="978-602-424-694-5" style={inputStyle(!!fieldErrors.isbn)} />
          {fieldErrors.isbn && <div style={{ fontSize: 12, color: "#d93636", marginTop: 4 }}>{fieldErrors.isbn}</div>}
          <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 4 }}>Opsional, harus unik jika diisi.</div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeadStyle}><span style={{ ...dotStyle, background: "#0f9d58" }} /> Detail Koleksi</div>
        <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tahun Terbit</label>
        <input type="number" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} placeholder="2024" style={inputStyle(false)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
        <SearchableSelect label="Kategori" options={categories} value={categoryId} onChange={setCategoryId} placeholder="Pilih kategori" />
        <SearchableSelect label="Penulis" options={authors} value={authorId} onChange={setAuthorId} placeholder="Pilih penulis" />
      </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeadStyle}><span style={{ ...dotStyle, background: "#b76e00" }} /> Deskripsi</div>
        <div style={{ marginBottom: 0 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ringkasan</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan sedikit tentang buku ini..." rows={3} style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "var(--white)" }} />
          <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 4 }}>{description.length}/2000 karakter</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <button type="button" className="btn btn-ghost" onClick={() => history.back()} style={{ flex: 1 }} disabled={pending}>Batal</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={pending}>{pending ? "Menyimpan..." : "Simpan Buku"}</button>
      </div>
    </form>
  );
}
