import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE_HOT, SceneWrap, SMOOTH } from "./common";
import { Character } from "./Character";

// Scene 6 — The human, untouched. Maya calm in the dark; the phone glows with activity.
export const Scene6Human: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, durationInFrames], [1.02, 1.1], { easing: SMOOTH });
  const breathe = 0.5 + 0.5 * Math.sin(frame / 22);

  return (
    <SceneWrap durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#080b13,#05070d)" }} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Character grade="cool" start={2} width={900} cx={0.5} cy={720} />
      </AbsoluteFill>

      {/* soft phone bokeh glow, lower right */}
      <AbsoluteFill style={{ background: `radial-gradient(20% 12% at 74% 74%, rgba(49,120,180,${0.35 + 0.15 * breathe}), rgba(5,7,13,0) 60%)` }} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: "0 180px 360px 0" }}>
        <div
          style={{
            width: 120,
            height: 240,
            borderRadius: 22,
            background: "linear-gradient(160deg,#12151c,#080a10)",
            border: "1.5px solid #20242e",
            boxShadow: `0 0 ${60 + 26 * breathe}px rgba(49,120,180,${0.5 + 0.2 * breathe})`,
            filter: "blur(1.4px)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 7, borderRadius: 16, background: `rgba(30,64,100,${0.7 + 0.2 * breathe})` }} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 24 + i * 28,
                top: 110,
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: BLUE_HOT,
                opacity: 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame / 8 - i)),
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
