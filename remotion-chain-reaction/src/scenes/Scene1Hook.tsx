import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BLACK, BLUE, BLUE_HOT, WHITE, FONT, SceneWrap, Caption, Glyph } from "./common";

// Scene 1 — The hook. A phone face-up in the dark lights up with a 2:14 AM message.
export const Scene1Hook: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lightOn = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const push = interpolate(frame, [0, durationInFrames], [1, 1.12]);
  const notif = spring({ frame: frame - 24, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 24 });

  return (
    <SceneWrap durationInFrames={durationInFrames} bg={BLACK}>
      {/* ambient glow on the "table" */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(50% 34% at 50% 46%, rgba(49,120,180,${0.4 * lightOn}), rgba(5,7,13,0) 70%)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${push})` }}>
        {/* phone body */}
        <div
          style={{
            width: 460,
            height: 940,
            borderRadius: 62,
            background: "linear-gradient(160deg,#12151c,#080a10)",
            border: "2px solid #20242e",
            boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 ${80 * lightOn}px rgba(49,120,180,${0.5 * lightOn})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* screen */}
          <div
            style={{
              position: "absolute",
              inset: 16,
              borderRadius: 48,
              background: `linear-gradient(180deg, rgba(20,40,64,${lightOn}), rgba(8,14,22,${lightOn}))`,
            }}
          />
          {/* clock */}
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              right: 0,
              textAlign: "center",
              color: WHITE,
              fontFamily: FONT,
              fontWeight: 300,
              fontSize: 120,
              opacity: lightOn,
              letterSpacing: 2,
            }}
          >
            2:14
          </div>
          {/* notification card */}
          <div
            style={{
              position: "absolute",
              top: 360,
              left: 34,
              right: 34,
              borderRadius: 28,
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(111,180,232,0.35)",
              padding: "24px 26px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: notif,
              transform: `translateY(${interpolate(notif, [0, 1], [30, 0])}px)`,
              boxShadow: "0 0 40px rgba(49,120,180,0.4)",
            }}
          >
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 18,
                background: BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Glyph kind="chat" size={40} color={WHITE} sw={6} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 30 }}>New message</div>
              <div style={{ color: "#B9D6EE", fontFamily: FONT, fontWeight: 400, fontSize: 26, marginTop: 4 }}>
                Hi, are you available…
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Caption frame={frame} start={40} bottom={300} size={54}>
        A new customer messages at <span style={{ color: BLUE_HOT }}>2:14&nbsp;AM.</span>
      </Caption>
    </SceneWrap>
  );
};
