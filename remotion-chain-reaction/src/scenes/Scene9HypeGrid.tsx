import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BLUE, BLUE_HOT, WHITE, FONT, SceneWrap, EXPO_OUT } from "./common";

// Scene 9 — HypeGrid product reveal. A living grid ignites; the mark rises; copy resolves.
const COLS = 13;
const ROWS = 22;
const CELL_W = 1080 / (COLS - 1);
const CELL_H = 1920 / (ROWS - 1);
const CXn = (COLS - 1) / 2;
const CYn = (ROWS - 1) / 2;

export const Scene9HypeGrid: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // grid ignites outward in a wave from centre
  const wave = interpolate(frame, [0, 46], [0, 1], { extrapolateRight: "clamp", easing: EXPO_OUT });

  const logoPop = spring({ frame: frame - 26, fps, config: { damping: 13, stiffness: 110 }, durationInFrames: 30 });
  const logoFloat = Math.sin(frame / 26) * 8;

  const h1 = interpolate(frame, [58, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO_OUT });
  const sub = interpolate(frame, [84, 104], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO_OUT });
  const tag = interpolate(frame, [112, 134], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO_OUT });

  return (
    <SceneWrap durationInFrames={durationInFrames} fadeIn={10} fadeOut={20}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 44% at 50% 40%, rgba(49,120,180,0.24), rgba(3,5,10,0) 70%)" }} />

      {/* living grid */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="hgGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* grid lines */}
        {Array.from({ length: COLS }).map((_, c) => {
          const dx = Math.abs(c - CXn) / CXn;
          const on = interpolate(wave, [dx * 0.7, dx * 0.7 + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <line key={`v${c}`} x1={c * CELL_W} y1={0} x2={c * CELL_W} y2={1920} stroke={BLUE} strokeWidth={1} opacity={0.1 * on} />;
        })}
        {Array.from({ length: ROWS }).map((_, r) => {
          const dy = Math.abs(r - CYn) / CYn;
          const on = interpolate(wave, [dy * 0.7, dy * 0.7 + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <line key={`h${r}`} x1={0} y1={r * CELL_H} x2={1080} y2={r * CELL_H} stroke={BLUE} strokeWidth={1} opacity={0.1 * on} />;
        })}

        {/* grid nodes light up in a radial wave + gentle shimmer */}
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const dx = (c - CXn) / CXn;
            const dy = (r - CYn) / CYn;
            const dist = Math.sqrt(dx * dx + dy * dy) / Math.SQRT2;
            const on = interpolate(wave, [dist * 0.85, dist * 0.85 + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const shimmer = 0.5 + 0.5 * Math.sin(frame / 8 + (c + r) * 0.6);
            const rad = 2 + 2.2 * shimmer;
            return (
              <circle
                key={`n${r}-${c}`}
                cx={c * CELL_W}
                cy={r * CELL_H}
                r={rad}
                fill={BLUE_HOT}
                opacity={on * (0.25 + 0.55 * shimmer)}
                filter="url(#hgGlow)"
              />
            );
          })
        )}
      </svg>

      {/* logo mark */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
        <div
          style={{
            marginTop: 380 + logoFloat,
            width: 420,
            opacity: logoPop,
            transform: `scale(${0.7 + 0.3 * logoPop})`,
            filter: "drop-shadow(0 0 50px rgba(49,120,180,0.7))",
          }}
        >
          <Img src={staticFile("hypegrid.png")} style={{ width: "100%", display: "block" }} />
        </div>

        {/* headline */}
        <div
          style={{
            marginTop: 40,
            opacity: h1,
            transform: `translateY(${interpolate(h1, [0, 1], [26, 0])}px)`,
            filter: `blur(${interpolate(h1, [0, 1], [8, 0])}px)`,
            color: WHITE,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 74,
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          Meet the{" "}
          <span
            style={{
              background: `linear-gradient(180deg, ${BLUE_HOT}, ${BLUE})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            HypeGrid.
          </span>
        </div>

        {/* subhead */}
        <div
          style={{
            marginTop: 30,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [22, 0])}px)`,
            color: "#C4D9EC",
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.35,
            textAlign: "center",
            maxWidth: 860,
            padding: "0 80px",
          }}
        >
          The AI automation system that connects your entire business.
        </div>

        {/* tagline pill */}
        <div
          style={{
            marginTop: 60,
            opacity: tag,
            transform: `translateY(${interpolate(tag, [0, 1], [20, 0])}px)`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 42px",
            borderRadius: 999,
            border: `2px solid ${BLUE}`,
            background: "rgba(20,44,70,0.5)",
            boxShadow: "0 0 44px rgba(49,120,180,0.4)",
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: BLUE_HOT, boxShadow: `0 0 16px ${BLUE_HOT}` }} />
          <span style={{ color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 40 }}>
            Hype Grid — <span style={{ color: BLUE_HOT }}>let your business run itself.</span>
          </span>
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
