import React, { useEffect, useState } from "react";
import { Heart, Droplets, Activity } from "lucide-react";
import { FONTS, sensorHub, type WatchFace, type SensorReading } from "@/lib/smartwatch";

// Analog hand renderer (used when face.style === "analog")
const AnalogFace: React.FC<{ hours: number; minutes: number; seconds: number; accent: string; size: number }> = ({
  hours,
  minutes,
  seconds,
  accent,
  size,
}) => {
  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;
  const r = size / 2 - 6;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full pointer-events-none">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = size / 2 + Math.sin(a) * (r - 3);
        const y1 = size / 2 - Math.cos(a) * (r - 3);
        const x2 = size / 2 + Math.sin(a) * r;
        const y2 = size / 2 - Math.cos(a) * r;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />;
      })}
      <g transform={`translate(${size / 2} ${size / 2})`}>
        <line x1="0" y1="4" x2="0" y2={-r * 0.55} stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${hourAngle})`} />
        <line x1="0" y1="5" x2="0" y2={-r * 0.75} stroke="#fff" strokeWidth="2" strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
        <line x1="0" y1="6" x2="0" y2={-r * 0.85} stroke={accent} strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${secondAngle})`} />
        <circle r="2.5" fill={accent} />
      </g>
    </svg>
  );
};

type Props = {
  face: WatchFace;
  fontId?: string;
  /** rendered pixel size (square) */
  size?: number;
  /** show HR / SpO2 / steps row */
  showStats?: boolean;
  /** show device side-crown */
  showCrown?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

/**
 * Unified Watch Face preview. Renders the SAME visual on the home widget
 * and inside settings so the user sees exactly what they selected.
 *
 * Draw order: background image → subtle readability gradient → time → date → stats.
 * Uploaded images render sharply (object-cover/contain) without blur filters.
 */
export const WatchFacePreview: React.FC<Props> = ({
  face,
  fontId = "system",
  size = 128,
  showStats = true,
  showCrown = true,
  onClick,
  className = "",
  ariaLabel,
}) => {
  const font = FONTS.find((f) => f.id === fontId) ?? FONTS[0];
  const [now, setNow] = useState(new Date());
  const [reading, setReading] = useState<SensorReading>(sensorHub.current);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    sensorHub.start();
    const unsub = sensorHub.subscribe(setReading);
    return () => {
      unsub();
    };
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

  const fit = face.imageFit ?? "cover";
  const Wrapper: React.ElementType = onClick ? "button" : "div";
  const timeSize = Math.round(size * 0.235);
  const dateSize = Math.max(9, Math.round(size * 0.07));
  const statSize = Math.max(9, Math.round(size * 0.065));

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative shrink-0 rounded-[1.75rem] overflow-hidden shadow-2xl group ${className}`}
      style={{ height: size, width: size, background: "#000" }}
    >
      {/* Background layer */}
      {face.image ? (
        <img
          src={face.image}
          alt={face.name}
          className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          style={{ objectPosition: "center", imageRendering: "auto" }}
          draggable={false}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${face.gradient}`} />
      )}

      {/* Readability gradient (kept subtle so image stays sharp — no blur) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none" />

      {/* Face content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
        {face.style === "analog" ? (
          <AnalogFace hours={hours} minutes={minutes} seconds={seconds} accent={face.accent} size={size} />
        ) : (
          <>
            <div
              className="font-bold tabular-nums leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: font.css, color: face.accent, fontSize: timeSize }}
            >
              {timeStr}
            </div>
            <div
              className="text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
              style={{ fontFamily: font.css, fontSize: dateSize }}
            >
              {dateStr}
            </div>
            {showStats && (face.style === "hybrid" || size >= 140) && (
              <div
                className="mt-1.5 flex items-center gap-1.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                style={{ fontSize: statSize }}
              >
                <Heart className="h-2.5 w-2.5" style={{ color: face.accent }} />
                {reading.hr}
                <Droplets className="h-2.5 w-2.5 ml-1" style={{ color: face.accent }} />
                {reading.spo2}%
                <Activity className="h-2.5 w-2.5 ml-1" style={{ color: face.accent }} />
                {(reading.steps / 1000).toFixed(1)}k
              </div>
            )}
          </>
        )}
      </div>

      {/* Optional highlight only when there's no photo (keeps photos crisp) */}
      {!face.image && (
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_50%)] pointer-events-none" />
      )}

      {showCrown && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-white/25" />
      )}
    </Wrapper>
  );
};

export default WatchFacePreview;
