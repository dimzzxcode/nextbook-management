"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 32, maxWidth: 480, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Terjadi kesalahan</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
        Terjadi kesalahan pada server. Silakan coba lagi nanti.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #e3e8f0",
          background: "#fff",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Coba lagi
      </button>
    </div>
  );
}
