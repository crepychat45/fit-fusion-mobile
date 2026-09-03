import React from "react";

/**
 * BootLoader — visually identical to the inline #root loader in index.html so
 * Suspense fallbacks feel continuous with the initial cold-boot paint.
 * Features: triple ring progress, heartbeat pulse core, orbiting sparks,
 * staggered "FitxFusion" wordmark, animated progress bar.
 */
export const BootLoader: React.FC<{ subtitle?: string }> = ({
  subtitle = "Igniting your workout engine…",
}) => {
  const letters = "FitxFusion".split("");
  return (
    <div className="ff-boot-r">
      <div className="ff-grid-r" aria-hidden />
      <div className="ff-orb-r ff-orb-r1" aria-hidden />
      <div className="ff-orb-r ff-orb-r2" aria-hidden />
      <div className="ff-orb-r ff-orb-r3" aria-hidden />

      <div className="ff-stage-r">
        <svg viewBox="0 0 140 140" width="150" height="150" className="ff-rings-r" aria-hidden>
          <defs>
            <linearGradient id="ffr-g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="ffr-g2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="ffr-g3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" />
          <circle cx="70" cy="70" r="45" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" />
          <circle cx="70" cy="70" r="32" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" />
          <circle className="ff-r-r ff-r-r1" cx="70" cy="70" r="58" fill="none" stroke="url(#ffr-g1)" strokeWidth="8" strokeLinecap="round" pathLength={100} strokeDasharray="100" transform="rotate(-90 70 70)" />
          <circle className="ff-r-r ff-r-r2" cx="70" cy="70" r="45" fill="none" stroke="url(#ffr-g2)" strokeWidth="8" strokeLinecap="round" pathLength={100} strokeDasharray="100" transform="rotate(-90 70 70)" />
          <circle className="ff-r-r ff-r-r3" cx="70" cy="70" r="32" fill="none" stroke="url(#ffr-g3)" strokeWidth="8" strokeLinecap="round" pathLength={100} strokeDasharray="100" transform="rotate(-90 70 70)" />
        </svg>
        <div className="ff-core-r">
          <svg viewBox="0 0 48 48" width="38" height="38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 24h6l4-14 8 28 6-20 4 10h12" />
          </svg>
        </div>
        <span className="ff-spark-r ff-sp1" aria-hidden />
        <span className="ff-spark-r ff-sp2" aria-hidden />
        <span className="ff-spark-r ff-sp3" aria-hidden />
      </div>

      <h1 className="ff-title-r" aria-label="FitxFusion">
        {letters.map((ch, i) => (
          <span key={i} className={ch === "x" ? "ff-x-r" : undefined} style={{ ["--i" as never]: i } as React.CSSProperties}>
            {ch}
          </span>
        ))}
      </h1>
      <p className="ff-sub-r">{subtitle}</p>
      <div className="ff-bar-r"><div className="ff-bar-fill-r" /></div>

      <style>{`
        .ff-boot-r{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:radial-gradient(ellipse at 20% 10%,#1a1a3a 0%,#0a0a1f 55%,#050510 100%);overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#fff}
        .ff-grid-r{position:absolute;inset:0;background-image:linear-gradient(rgba(139,92,246,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.06) 1px,transparent 1px);background-size:38px 38px;-webkit-mask-image:radial-gradient(circle at center,#000 30%,transparent 75%);mask-image:radial-gradient(circle at center,#000 30%,transparent 75%);animation:ff-drift-r 12s linear infinite;pointer-events:none}
        .ff-orb-r{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;animation:ff-float-r 7s ease-in-out infinite;pointer-events:none}
        .ff-orb-r1{width:300px;height:300px;background:radial-gradient(circle,#8b5cf6,transparent);top:6%;left:-12%}
        .ff-orb-r2{width:360px;height:360px;background:radial-gradient(circle,#ec4899,transparent);bottom:2%;right:-15%;animation-delay:-3s}
        .ff-orb-r3{width:220px;height:220px;background:radial-gradient(circle,#22d3ee,transparent);top:45%;left:60%;animation-delay:-1.5s;opacity:.35}
        .ff-stage-r{position:relative;width:150px;height:150px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 12px 40px rgba(139,92,246,.35))}
        .ff-rings-r{position:absolute;inset:0}
        .ff-r-r{stroke-dashoffset:100;animation:ff-fill-r 1.6s cubic-bezier(.4,0,.2,1) forwards infinite}
        .ff-r-r1{animation-delay:0s;--to:18}
        .ff-r-r2{animation-delay:.15s;--to:32}
        .ff-r-r3{animation-delay:.3s;--to:8}
        .ff-core-r{position:relative;width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#3b82f6,#8b5cf6 50%,#ec4899);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(139,92,246,.55),inset 0 1px 0 rgba(255,255,255,.35);animation:ff-heart-r 1.2s ease-in-out infinite}
        .ff-spark-r{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 12px #fff,0 0 24px #a78bfa;top:50%;left:50%;margin:-3px 0 0 -3px;animation:ff-orbit-r 3.6s linear infinite}
        .ff-sp2{animation-duration:2.8s;animation-delay:-.9s;background:#22d3ee;box-shadow:0 0 12px #22d3ee}
        .ff-sp3{animation-duration:4.4s;animation-delay:-1.8s;background:#ec4899;box-shadow:0 0 12px #ec4899}
        .ff-title-r{margin:26px 0 6px;font-size:26px;font-weight:800;letter-spacing:1.5px;display:flex;gap:1px}
        .ff-title-r span{display:inline-block;background:linear-gradient(135deg,#fff,#c4b5fd 60%,#f0abfc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:0;transform:translateY(8px);animation:ff-letter-r .5s cubic-bezier(.34,1.56,.64,1) forwards;animation-delay:calc(var(--i) * 60ms + 200ms)}
        .ff-title-r .ff-x-r{background:linear-gradient(135deg,#ec4899,#f97316);-webkit-background-clip:text;background-clip:text}
        .ff-sub-r{margin:2px 0 0;color:rgba(255,255,255,.55);font-size:12px;letter-spacing:.5px;animation:ff-fade-r 1.4s ease-out .8s both}
        .ff-bar-r{margin-top:20px;width:200px;height:4px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden;position:relative}
        .ff-bar-fill-r{position:absolute;inset:0;width:40%;border-radius:4px;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899,#f97316);background-size:200% 100%;animation:ff-slide-r 1.4s ease-in-out infinite,ff-shimmer-r 2s linear infinite}
        @keyframes ff-fill-r{0%{stroke-dashoffset:100}60%{stroke-dashoffset:var(--to,20)}100%{stroke-dashoffset:100}}
        @keyframes ff-heart-r{0%,100%{transform:scale(1)}20%{transform:scale(1.12)}40%{transform:scale(.96)}60%{transform:scale(1.08)}}
        @keyframes ff-orbit-r{from{transform:rotate(0deg) translateX(62px) rotate(0deg)}to{transform:rotate(360deg) translateX(62px) rotate(-360deg)}}
        @keyframes ff-float-r{0%,100%{transform:translate(0,0)}50%{transform:translate(24px,-22px)}}
        @keyframes ff-drift-r{from{background-position:0 0,0 0}to{background-position:38px 38px,38px 38px}}
        @keyframes ff-slide-r{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
        @keyframes ff-shimmer-r{to{background-position:200% 0}}
        @keyframes ff-letter-r{to{opacity:1;transform:translateY(0)}}
        @keyframes ff-fade-r{from{opacity:0}to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.ff-r-r,.ff-core-r,.ff-spark-r,.ff-orb-r,.ff-grid-r,.ff-bar-fill-r,.ff-title-r span{animation:none!important}.ff-title-r span{opacity:1;transform:none}}
        /* Light-mode variant — keeps route loaders continuous with the light boot splash */
        html:not(.dark) .ff-boot-r{background:radial-gradient(ellipse at 20% 10%,#eef2ff 0%,#f8fafc 55%,#f1f5f9 100%);color:#0f172a}
        html:not(.dark) .ff-sub-r{color:rgba(15,23,42,.55)}
        html:not(.dark) .ff-bar-r{background:rgba(15,23,42,.08)}
        html:not(.dark) .ff-title-r span{background:linear-gradient(135deg,#1e293b,#6d28d9 60%,#db2777);-webkit-background-clip:text;background-clip:text}
        html:not(.dark) .ff-title-r .ff-x-r{background:linear-gradient(135deg,#ec4899,#f97316);-webkit-background-clip:text;background-clip:text}
        html:not(.dark) .ff-orb-r{opacity:.32}
      `}</style>
    </div>
  );
};

export default BootLoader;
