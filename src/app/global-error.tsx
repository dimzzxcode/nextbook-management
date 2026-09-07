"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ padding: 32, fontFamily: "system-ui" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Terjadi kesalahan sistem</h2>
        <p style={{ color: "#64748b" }}>Terjadi kesalahan pada server.</p>
        <button onClick={() => reset()} style={{ padding: "10px 16px", marginTop: 12 }}>
          Coba lagi
        </button>
      </body>
    </html>
  );
}
