import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WHITE, FONT, SceneWrap, Caption, Glyph, SMOOTH } from "./common";

// Scene 7 — Morning payoff. Warm light, a phone stacked with "Booking confirmed".
const CONFIRMS = ["Booking confirmed", "Booking confirmed", "Booking confirmed", "Booking confirmed"];

export const Scene7Morning: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1.08, 1], { easing: SMOOTH });

  return (
    <SceneWrap durationInFrames={durationInFrames} bg="#0d0a06">
      {/* warm sunrise wash */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#3a2a14 0%,#140d06 55%,#0d0a06 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(40% 26% at 74% 20%, rgba(255,196,110,0.5), rgba(13,10,6,0) 60%)" }} />
      {/* light rays */}
      <AbsoluteFill style={{ opacity: 0.25 }}>
        <svg width={1080} height={1920}>
          {Array.from({ length: 7 }).map((_, i) => (
            <polygon key={i} points={`760,300 ${400 + i * 120},1920 ${520 + i * 120},1920`} fill="rgba(255,210,140,0.15)" />
          ))}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${push})` }}>
        <div
          style={{
            width: 470,
            height: 960,
            borderRadius: 62,
            background: "linear-gradient(160deg,#15130f,#0a0806)",
            border: "2px solid #2c2418",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(255,190,100,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 16, borderRadius: 48, background: "linear-gradient(180deg,#f7f3ec,#e9e2d6)" }} />
          <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", color: "#2b2418", fontFamily: FONT, fontWeight: 800, fontSize: 40 }}>
            This morning
          </div>
          {CONFIRMS.map((c, i) => {
            const pop = spring({ frame: frame - (18 + i * 12), fps, config: { damping: 14, stiffness: 130 }, durationInFrames: 20 });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 150 + i * 150,
                  left: 44,
                  right: 44,
                  height: 122,
                  borderRadius: 24,
                  background: "#ffffff",
                  border: "1px solid #e2dccf",
                  boxShadow: "0 10px 30px rgba(120,90,40,0.14)",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 26px",
                  opacity: pop,
                  transform: `translateY(${interpolate(pop, [0, 1], [26, 0])}px)`,
                }}
              >
                <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#3178B4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Glyph kind="check" size={42} color={WHITE} sw={8} />
                </div>
                <div>
                  <div style={{ color: "#1d2733", fontFamily: FONT, fontWeight: 800, fontSize: 30 }}>{c}</div>
                  <div style={{ color: "#7d8794", fontFamily: FONT, fontWeight: 400, fontSize: 24, marginTop: 2 }}>
                    {["2:14 AM", "3:02 AM", "5:41 AM", "6:58 AM"][i]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
