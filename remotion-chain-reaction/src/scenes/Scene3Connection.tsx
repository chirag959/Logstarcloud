import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BLUE, BLUE_HOT, WHITE, FONT, SceneWrap, Caption, Glyph } from "./common";

// Scene 3 — Connection. A thread shoots out and wires the icons into a constellation.
const NODES = [
  { kind: "chat", label: "Chat", x: 300, y: 640 },
  { kind: "sheet", label: "Sheet", x: 800, y: 560 },
  { kind: "calendar", label: "Calendar", x: 830, y: 1120 },
  { kind: "invoice", label: "Invoice", x: 300, y: 1180 },
  { kind: "hub", label: "", x: 560, y: 880 },
];
// links drawn in order, each snapping in
const LINKS = [
  [0, 4],
  [4, 1],
  [4, 2],
  [4, 3],
  [0, 1],
  [3, 2],
];

export const Scene3Connection: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startAt = 18;
  const per = 12;

  return (
    <SceneWrap durationInFrames={durationInFrames}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(70% 55% at 50% 46%, rgba(49,120,180,0.22), rgba(5,7,13,0) 72%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="s3glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {LINKS.map(([ai, bi], i) => {
          const a = NODES[ai];
          const b = NODES[bi];
          const p = spring({
            frame: frame - (startAt + i * per),
            fps,
            config: { damping: 16, stiffness: 130 },
            durationInFrames: 16,
          });
          const x = a.x + (b.x - a.x) * p;
          const y = a.y + (b.y - a.y) * p;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={x}
              y2={y}
              stroke={BLUE_HOT}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.9}
              filter="url(#s3glow)"
            />
          );
        })}
      </svg>

      {NODES.map((n, i) => {
        if (n.kind === "hub") {
          const pop = spring({ frame: frame - startAt, fps, config: { damping: 12, stiffness: 140 }, durationInFrames: 20 });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: n.x - 26,
                top: n.y - 26,
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: WHITE,
                boxShadow: `0 0 40px ${BLUE_HOT}`,
                transform: `scale(${pop})`,
              }}
            />
          );
        }
        const lit = interpolate(frame, [startAt + i * per, startAt + i * per + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x - 82,
              top: n.y - 82,
              width: 164,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 34,
                border: `2px solid ${BLUE}`,
                background: "rgba(16,32,50,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${34 * lit}px rgba(49,120,180,${0.6 * lit})`,
              }}
            >
              <Glyph kind={n.kind} size={82} color={lit > 0.4 ? BLUE_HOT : "#5f7c93"} sw={5} />
            </div>
          </div>
        );
      })}
    </SceneWrap>
  );
};
