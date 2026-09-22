import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BLACK, BLUE, WHITE, FONT, SceneWrap, Glyph, SMOOTH } from "./common";
import { Character } from "./Character";

// Scene 1 — The hook. Maya at night; the phone lights up with a 2:14 AM message.
export const Scene1Hook: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lightOn = interpolate(frame, [22, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const push = interpolate(frame, [0, durationInFrames], [1, 1.08], { easing: SMOOTH });
  const notif = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 24 });

  return (
    <SceneWrap durationInFrames={durationInFrames} bg={BLACK}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Character grade="cool" start={4} width={860} cx={0.5} cy={620} />
      </AbsoluteFill>

      {/* phone glow rising from below */}
      <AbsoluteFill
        style={{ background: `radial-gradient(42% 26% at 50% 82%, rgba(49,120,180,${0.5 * lightOn}), rgba(5,7,13,0) 65%)` }}
      />

      {/* phone at the bottom, screen waking */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
        <div
          style={{
            width: 360,
            height: 560,
            borderRadius: 48,
            background: "linear-gradient(160deg,#12151c,#080a10)",
            border: "2px solid #20242e",
            boxShadow: `0 30px 90px rgba(0,0,0,0.7), 0 0 ${70 * lightOn}px rgba(49,120,180,${0.55 * lightOn})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 12, borderRadius: 38, background: `linear-gradient(180deg, rgba(20,40,64,${lightOn}), rgba(8,14,22,${lightOn}))` }} />
          <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", color: WHITE, fontFamily: FONT, fontWeight: 300, fontSize: 84, opacity: lightOn }}>
            2:14
          </div>
          <div
            style={{
              position: "absolute",
              top: 210,
              left: 24,
              right: 24,
              borderRadius: 22,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(111,180,232,0.35)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: notif,
              transform: `translateY(${interpolate(notif, [0, 1], [24, 0])}px)`,
              boxShadow: "0 0 34px rgba(49,120,180,0.4)",
            }}
          >
            <div style={{ width: 50, height: 50, borderRadius: 14, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Glyph kind="chat" size={30} color={WHITE} sw={6} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 24 }}>New message</div>
              <div style={{ color: "#B9D6EE", fontFamily: FONT, fontWeight: 400, fontSize: 20, marginTop: 2 }}>Hi, are you available…</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};
