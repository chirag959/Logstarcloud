import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE, BLUE_HOT, WHITE, SceneWrap, Caption } from "./common";

// Scene 5 — The machine, alive. Pull back to reveal a vast pulsing web.
// Deterministic pseudo-random so it renders identically every frame.
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const CX = 540;
const CY = 960;

type P = { x: number; y: number; r: number; ph: number };
const NODES: P[] = (() => {
  const r = rng(42);
  const out: P[] = [];
  for (let i = 0; i < 140; i++) {
    const ang = r() * Math.PI * 2;
    const rad = 40 + Math.pow(r(), 0.85) * 1350;
    out.push({
      x: CX + Math.cos(ang) * rad,
      y: CY + Math.sin(ang) * rad * 0.92,
      r: 3 + r() * 7,
      ph: r() * Math.PI * 2,
    });
  }
  return out;
})();

// connect each node to a couple of near neighbours
const EDGES: [number, number][] = (() => {
  const e: [number, number][] = [];
  NODES.forEach((n, i) => {
    const dists = NODES.map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) })).filter((o) => o.j !== i);
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < 2; k++) if (dists[k]) e.push([i, dists[k].j]);
  });
  return e;
})();

export const Scene5Machine: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  // pull back: start zoomed in, scale down
  const scale = interpolate(frame, [0, durationInFrames], [2.1, 0.72], { extrapolateRight: "clamp" });
  const reveal = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneWrap durationInFrames={durationInFrames}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(49,120,180,0.18), rgba(5,7,13,0) 75%)" }} />
      <AbsoluteFill style={{ transformOrigin: `${CX}px ${CY}px`, transform: `scale(${scale})` }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {EDGES.map(([a, b], i) => {
            const na = NODES[a];
            const nb = NODES[b];
            const flow = 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(frame / 10 + i));
            return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={BLUE} strokeWidth={1.4} opacity={flow * reveal} />;
          })}
          {NODES.map((n, i) => {
            const pulse = 0.5 + 0.5 * Math.sin(frame / 9 + n.ph);
            return (
              <g key={i} opacity={reveal}>
                <circle cx={n.x} cy={n.y} r={n.r + 8 * pulse} fill={BLUE} opacity={0.18 * pulse} style={{ filter: "blur(6px)" }} />
                <circle cx={n.x} cy={n.y} r={n.r} fill={BLUE_HOT} opacity={0.6 + 0.4 * pulse} />
              </g>
            );
          })}
          {/* travelling pulses on edges */}
          {EDGES.filter((_, i) => i % 4 === 0).map(([a, b], i) => {
            const na = NODES[a];
            const nb = NODES[b];
            const t = ((frame / 26 + i * 0.3) % 1);
            return (
              <circle key={`p${i}`} cx={na.x + (nb.x - na.x) * t} cy={na.y + (nb.y - na.y) * t} r={2.6} fill={WHITE} opacity={reveal * 0.9} />
            );
          })}
        </svg>
      </AbsoluteFill>

      <Caption frame={frame} start={30} bottom={280} size={56} weight={800}>
        Your business — <span style={{ color: BLUE_HOT }}>running itself.</span>
      </Caption>
    </SceneWrap>
  );
};
