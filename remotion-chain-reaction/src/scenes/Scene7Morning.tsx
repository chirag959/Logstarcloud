import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WHITE, FONT, SceneWrap, Glyph, SMOOTH } from "./common";

// Scene 7 — Morning payoff. The phone fills with completed-automation notifications,
// each popping in with a green tick, one after another.
const STEPS = [
  { label: "Replied to Client", time: "2:14 AM" },
  { label: "Sent a quote", time: "2:15 AM" },
  { label: "Invoice Generated", time: "3:02 AM" },
  { label: "Updated on Tally", time: "5:41 AM" },
  { label: "Assigned to the team", time: "6:58 AM" },
];

const GREEN = "#22C55E";

export const Scene7Morning: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1.06, 1], { easing: SMOOTH });

  const ROW_START = 168;
  const ROW_H = 150;

  return (
    <SceneWrap durationInFrames={durationInFrames} bg="#0d0a06">
      {/* warm sunrise wash */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#3a2a14 0%,#140d06 55%,#0d0a06 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(40% 26% at 74% 18%, rgba(255,196,110,0.5), rgba(13,10,6,0) 60%)" }} />
      <AbsoluteFill style={{ opacity: 0.22 }}>
        <svg width={1080} height={1920}>
          {Array.from({ length: 7 }).map((_, i) => (
            <polygon key={i} points={`760,300 ${400 + i * 120},1920 ${520 + i * 120},1920`} fill="rgba(255,210,140,0.15)" />
          ))}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${push})` }}>
        <div
          style={{
            width: 500,
            height: 1020,
            borderRadius: 62,
            background: "linear-gradient(160deg,#15130f,#0a0806)",
            border: "2px solid #2c2418",
            boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(255,190,100,0.22)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 16, borderRadius: 48, background: "linear-gradient(180deg,#f7f3ec,#eee7db)" }} />

          {/* header */}
          <div style={{ position: "absolute", top: 66, left: 40, right: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#2b2418", fontFamily: FONT, fontWeight: 800, fontSize: 40 }}>Automations</span>
            <span style={{ color: GREEN, fontFamily: FONT, fontWeight: 800, fontSize: 26, background: "rgba(34,197,94,0.14)", padding: "8px 18px", borderRadius: 999 }}>
              All done
            </span>
          </div>

          {STEPS.map((s, i) => {
            const startF = 16 + i * 16;
            const pop = spring({ frame: frame - startF, fps, config: { damping: 15, stiffness: 130 }, durationInFrames: 22 });
            const tick = spring({ frame: frame - (startF + 6), fps, config: { damping: 12, stiffness: 170 }, durationInFrames: 18 });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: ROW_START + i * ROW_H,
                  left: 42,
                  right: 42,
                  height: 128,
                  borderRadius: 24,
                  background: "#ffffff",
                  border: "1px solid #e6e0d4",
                  boxShadow: "0 12px 30px rgba(120,90,40,0.14)",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 26px",
                  opacity: pop,
                  transform: `translateX(${interpolate(pop, [0, 1], [40, 0])}px) scale(${0.96 + 0.04 * pop})`,
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: "50%",
                    background: GREEN,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transform: `scale(${tick})`,
                    boxShadow: `0 0 24px rgba(34,197,94,${0.5 * tick})`,
                  }}
                >
                  <Glyph kind="check" size={44} color={WHITE} sw={9} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#18202b", fontFamily: FONT, fontWeight: 800, fontSize: 28, whiteSpace: "nowrap" }}>{s.label}</div>
                  <div style={{ color: "#8b93a0", fontFamily: FONT, fontWeight: 500, fontSize: 24, marginTop: 3 }}>
                    Completed · {s.time}
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
