export default function Loading() {
  return (
    <div
      style={{
        padding: 60,
        textAlign: "center",
        color: "var(--text-muted)",
        background: "var(--bg)",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 12px",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ margin: 0, fontSize: 14 }}>Memuat data...</p>
    </div>
  );
}
