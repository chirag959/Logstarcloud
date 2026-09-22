import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE_DIM, WHITE, FONT, SceneWrap, Caption, Glyph } from "./common";

// Scene 2 — Disconnected. Four dim icons far apart; a spark tries to leap and dies.
const ITEMS = [
  { kind: "chat", label: "Chat", x: 260, y: 620 },
  { kind: "sheet", label: "Sheet", x: 820, y: 780 },
  { kind: "calendar", label: "Calendar", x: 300, y: 1180 },
  { kind: "invoice", label: "Invoice", x: 800, y: 1320 },
];

export const Scene2Problem: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 30) * 8;

  // spark tries to leap from chat -> sheet then fades and dies mid-gap
  const t = (frame % 70) / 70; // repeating attempt
  const sparkProg = interpolate(t, [0, 0.55], [0, 0.62], { extrapolateRight: "clamp" });
  const sparkFade = interpolate(t, [0, 0.35, 0.55], [0, 1, 0], { extrapolateRight: "clamp" });
  const a = ITEMS[0];
  const b = ITEMS[1];
  const sx = a.x + (b.x - a.x) * sparkProg;
  const sy = a.y + (b.y - a.y) * sparkProg;

  return (
    <SceneWrap durationInFrames={durationInFrames}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(80% 60% at 50% 45%, rgba(30,45,66,0.25), rgba(5,7,13,0) 70%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* dying spark */}
        <circle cx={sx} cy={sy + drift} r={10} fill="#8fb6d8" opacity={sparkFade * 0.9} style={{ filter: "blur(2px)" }} />
        <circle cx={sx} cy={sy + drift} r={26} fill="#5b86ad" opacity={sparkFade * 0.3} style={{ filter: "blur(10px)" }} />
      </svg>

      {ITEMS.map((it, i) => {
        const bob = Math.sin(frame / 26 + i) * 10;
        return (
          <div
            key={it.kind}
            style={{
              position: "absolute",
              left: it.x - 90,
              top: it.y - 90 + bob,
              width: 180,
              height: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 34,
                border: `2px solid ${BLUE_DIM}`,
                background: "rgba(20,30,44,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(20,40,64,0.5)",
              }}
            >
              <Glyph kind={it.kind} size={82} color="#5f7c93" sw={5} />
            </div>
            <div style={{ color: "#7f97ab", fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: 2 }}>
              {it.label.toUpperCase()}
            </div>
          </div>
        );
      })}

      <Caption frame={frame} start={30} bottom={250} size={48} color={WHITE}>
        Normally it sits till morning.
        <br />
        By then, they&rsquo;re gone.
      </Caption>
    </SceneWrap>
  );
};
