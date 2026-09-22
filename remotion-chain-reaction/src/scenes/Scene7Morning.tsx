import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WHITE, SceneWrap, Glyph, SMOOTH } from "./common";
import { Character } from "./Character";

// Scene 7 — Morning payoff. Maya, warm light, phone filling with confirmations (no words).
export const Scene7Morning: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1.06, 1], { easing: SMOOTH });

  return (
    <SceneWrap durationInFrames={durationInFrames} bg="#0d0a06">
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#3a2a14 0%,#140d06 60%,#0d0a06 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(40% 26% at 74% 16%, rgba(255,196,110,0.5), rgba(13,10,6,0) 60%)" }} />

      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Character grade="warm" start={2} width={900} cx={0.42} cy={640} />
      </AbsoluteFill>

      {/* phone with confirmation rows sliding in, lower-right */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: "0 90px 210px 0" }}>
        <div
          style={{
            width: 330,
            height: 620,
            borderRadius: 44,
            background: "linear-gradient(160deg,#15130f,#0a0806)",
            border: "2px solid #2c2418",
            boxShadow: "0 30px 90px rgba(0,0,0,0.6), 0 0 70px rgba(255,190,100,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 12, borderRadius: 34, background: "linear-gradient(180deg,#f7f3ec,#e9e2d6)" }} />
          {[0, 1, 2, 3, 4].map((i) => {
            const pop = spring({ frame: frame - (16 + i * 11), fps, config: { damping: 14, stiffness: 130 }, durationInFrames: 20 });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 46 + i * 106,
                  left: 30,
                  right: 30,
                  height: 88,
                  borderRadius: 20,
                  background: "#ffffff",
                  border: "1px solid #e2dccf",
                  boxShadow: "0 8px 22px rgba(120,90,40,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 20px",
                  opacity: pop,
                  transform: `translateY(${interpolate(pop, [0, 1], [24, 0])}px)`,
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#3178B4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Glyph kind="check" size={32} color={WHITE} sw={9} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, width: "70%", borderRadius: 6, background: "#cdd4dc" }} />
                  <div style={{ height: 10, width: "44%", borderRadius: 5, background: "#e3e7ec", marginTop: 8 }} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
