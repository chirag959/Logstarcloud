import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BLUE, BLUE_HOT, WHITE, FONT, SceneWrap } from "./common";

// Scene 8 — Logo & CTA. The web collapses into a clean glowing mark, logo resolves.
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const CX = 540;
const CY = 760;
const PARTS = (() => {
  const r = rng(7);
  return Array.from({ length: 70 }, () => {
    const ang = r() * Math.PI * 2;
    const rad = 500 + r() * 700;
    return { x: CX + Math.cos(ang) * rad, y: CY + Math.sin(ang) * rad, s: 2 + r() * 5 };
  });
})();

export const Scene8Logo: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const collapse = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const core = spring({ frame: frame - 36, fps, config: { damping: 13, stiffness: 120 }, durationInFrames: 24 });
  const cardPop = spring({ frame: frame - 52, fps, config: { damping: 15, stiffness: 110 }, durationInFrames: 28 });
  const tagline = interpolate(frame, [74, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cta = interpolate(frame, [98, 116], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const coreFade = interpolate(frame, [52, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneWrap durationInFrames={durationInFrames} fadeOut={20}>
      <AbsoluteFill style={{ background: "radial-gradient(50% 40% at 50% 40%, rgba(49,120,180,0.2), rgba(5,7,13,0) 72%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {PARTS.map((p, i) => {
          const x = p.x + (CX - p.x) * collapse;
          const y = p.y + (CY - p.y) * collapse;
          return <circle key={i} cx={x} cy={y} r={p.s * (1 - collapse * 0.6)} fill={BLUE_HOT} opacity={(1 - collapse) * 0.8} />;
        })}
        {/* core flash */}
        <circle cx={CX} cy={CY} r={60 * core} fill={WHITE} opacity={coreFade} style={{ filter: "blur(6px)" }} />
        <circle cx={CX} cy={CY} r={120 * core} fill={BLUE} opacity={0.3 * coreFade} style={{ filter: "blur(30px)" }} />
      </svg>

      {/* logo card */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
        <div
          style={{
            marginTop: 560,
            width: 720,
            padding: "56px 60px",
            borderRadius: 40,
            background: WHITE,
            boxShadow: `0 0 90px rgba(49,120,180,0.55), 0 30px 80px rgba(0,0,0,0.5)`,
            opacity: cardPop,
            transform: `scale(${0.85 + 0.15 * cardPop})`,
          }}
        >
          <Img src={staticFile("logo.png")} style={{ width: "100%", display: "block" }} />
        </div>

        <div
          style={{
            marginTop: 60,
            color: BLUE,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 46,
            textAlign: "center",
            opacity: tagline,
            transform: `translateY(${interpolate(tagline, [0, 1], [18, 0])}px)`,
            padding: "0 80px",
          }}
        >
          AI automations that connect everything.
        </div>

        <div
          style={{
            marginTop: 40,
            opacity: cta,
            transform: `translateY(${interpolate(cta, [0, 1], [18, 0])}px)`,
            textAlign: "center",
          }}
        >
          <div style={{ color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 40 }}>@hypemarketer</div>
          <div
            style={{
              marginTop: 22,
              display: "inline-block",
              padding: "18px 40px",
              borderRadius: 999,
              border: `2px solid ${BLUE_HOT}`,
              color: WHITE,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 34,
              boxShadow: "0 0 40px rgba(49,120,180,0.5)",
            }}
          >
            DM <span style={{ color: BLUE_HOT }}>&ldquo;CONNECT&rdquo;</span> for a free automation map
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
