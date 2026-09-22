import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE, BLUE_HOT, WHITE, FONT, SceneWrap, Caption, SMOOTH } from "./common";

// Scene 6 — The human, untouched. Calm dark room, phone glowing softly with activity.
export const Scene6Human: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, durationInFrames], [1.04, 1.12], { easing: SMOOTH });
  const breathe = 0.5 + 0.5 * Math.sin(frame / 22);

  return (
    <SceneWrap durationInFrames={durationInFrames}>
      {/* soft night gradient */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#080b13,#05070d)" }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(30% 20% at 72% 64%, rgba(49,120,180,${0.28 + 0.12 * breathe}), rgba(5,7,13,0) 60%)`,
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* abstract sleeping figure — soft rounded silhouette (blanket + pillow) */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="blanket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141a25" />
              <stop offset="100%" stopColor="#0a0e16" />
            </linearGradient>
          </defs>
          {/* pillow */}
          <ellipse cx="330" cy="1080" rx="230" ry="120" fill="#171d29" />
          {/* head */}
          <circle cx="330" cy="1060" r="96" fill="#232b3a" />
          {/* blanket sweep */}
          <path d="M0 1240 Q 300 1150 620 1260 T 1080 1300 L 1080 1920 L 0 1920 Z" fill="url(#blanket)" />
          <path d="M0 1240 Q 300 1150 620 1260 T 1080 1300" fill="none" stroke="#2a3446" strokeWidth={3} opacity={0.6} />
        </svg>

        {/* phone on bedside table, background bokeh glow */}
        <div
          style={{
            position: "absolute",
            left: 720,
            top: 1120,
            width: 150,
            height: 300,
            borderRadius: 26,
            background: "linear-gradient(160deg,#12151c,#080a10)",
            border: "1.5px solid #20242e",
            boxShadow: `0 0 ${70 + 30 * breathe}px rgba(49,120,180,${0.5 + 0.2 * breathe})`,
            filter: "blur(1.2px)",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 8, borderRadius: 20, background: `rgba(30,64,100,${0.7 + 0.2 * breathe})` }} />
          {/* activity dots */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 30 + i * 34,
                top: 140,
                width: 16,
                height: 16,
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
