import React from "react";

/**
 * BootLoader — matches the inline #root loader in index.html so route
 * transitions feel continuous from cold boot to first render.
 */
export const BootLoader: React.FC<{ subtitle?: string }> = ({
  subtitle = "Powering up your session…",
}) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 20% 10%,#1a1a3a 0%,#0a0a1f 60%,#050510 100%)",
      overflow: "hidden",
      fontFamily: "system-ui,-apple-system,sans-serif",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 280,
        height: 280,
        borderRadius: "50%",
        filter: "blur(60px)",
        opacity: 0.6,
        background: "radial-gradient(circle,#8b5cf6,transparent)",
        top: "10%",
        left: "-10%",
        animation: "ff-float 6s ease-in-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 340,
        height: 340,
        borderRadius: "50%",
        filter: "blur(60px)",
        opacity: 0.6,
        background: "radial-gradient(circle,#ec4899,transparent)",
        bottom: "5%",
        right: "-15%",
        animation: "ff-float 6s ease-in-out infinite -3s",
      }}
    />
    <div
      style={{
        position: "relative",
        width: 120,
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "#8b5cf6",
          borderRightColor: "#ec4899",
          animation: "ff-spin 1.4s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "#3b82f6",
          borderBottomColor: "#10b981",
          animation: "ff-spin 2s linear infinite reverse",
        }}
      />
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: "linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 12px 40px rgba(139,92,246,.5),inset 0 1px 0 rgba(255,255,255,.3)",
          animation: "ff-pulse 2s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 48 48"
          width="44"
          height="44"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 24h6l4-12 8 24 4-12h14" />
        </svg>
      </div>
    </div>
    <p
      style={{
        margin: "24px 0 4px",
        fontSize: 22,
        fontWeight: 700,
        background: "linear-gradient(135deg,#fff,#c4b5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        letterSpacing: ".5px",
      }}
    >
      FitFusion
    </p>
    <p style={{ margin: 0, color: "rgba(255,255,255,.5)", fontSize: 13 }}>
      {subtitle}
    </p>
    <div
      style={{
        marginTop: 18,
        width: 180,
        height: 3,
        borderRadius: 3,
        background: "rgba(255,255,255,.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "100%",
          borderRadius: 3,
          background: "linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)",
          animation: "ff-slide 1.6s ease-in-out infinite",
        }}
      />
    </div>
    <style>{`
      @keyframes ff-spin{to{transform:rotate(360deg)}}
      @keyframes ff-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      @keyframes ff-float{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}
      @keyframes ff-slide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
    `}</style>
  </div>
);

export default BootLoader;
