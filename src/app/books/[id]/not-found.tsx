import Link from "next/link";
export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h3 style={{ margin: "0 0 8px" }}>Buku tidak ditemukan</h3>
      <p style={{ color: "var(--text-muted)", margin: "0 0 16px" }}>Buku mungkin telah dihapus atau ID tidak valid.</p>
      <Link href="/books" className="btn btn-primary">Kembali ke Daftar Buku</Link>
    </div>
  );
}
