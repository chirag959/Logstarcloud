import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { BLUE, BLUE_HOT, WHITE, FONT, SceneWrap, Caption } from "./common";

// Scene 4 — The flow. A pulse races the wire; nodes ignite in a chain reaction.
type N = { key: string; label: string; step: string; x: number; y: number };
const CHAT: N = { key: "chat", label: "Chat", step: "", x: 540, y: 360 };
const NODES: N[] = [
  { key: "reply", label: "Reply", step: "Auto-reply", x: 360, y: 650 },
  { key: "crm", label: "CRM", step: "Lead saved", x: 720, y: 900 },
  { key: "calendar", label: "Calendar", step: "Slot booked", x: 360, y: 1150 },
  { key: "invoice", label: "Invoice", step: "Invoice sent", x: 720, y: 1400 },
  { key: "team", label: "Team", step: "Team alerted", x: 430, y: 1620 },
];
const CHAIN = [CHAT, ...NODES];
const SEGMENTS = NODES.length;

export const Scene4Flow: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const INTRO = 16;
  const SEG = (durationInFrames - INTRO - 18) / SEGMENTS;
  const hopEase = Easing.bezier(0.5, 0, 0.2, 1);

  const progress = (() => {
    const t = frame - INTRO;
    if (t <= 0) return 0;
    const raw = Math.min(t / SEG, SEGMENTS);
    const seg = Math.min(Math.floor(raw), SEGMENTS - 1);
    return seg + hopEase(Math.min(raw - seg, 1));
  })();

  const pointAt = (p: number) => {
    const c = Math.min(p, SEGMENTS);
    const seg = Math.min(Math.floor(c), SEGMENTS - 1);
    const l = c - seg;
    const a = CHAIN[seg];
    const b = CHAIN[seg + 1];
    return { x: a.x + (b.x - a.x) * l, y: a.y + (b.y - a.y) * l };
  };
  const pulse = pointAt(progress);

  const D = CHAIN.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
  const segLen = CHAIN.slice(1).map((n, i) => Math.hypot(n.x - CHAIN[i].x, n.y - CHAIN[i].y));
  const TOTAL = segLen.reduce((a, b) => a + b, 0);
  const energised = (() => {
    const full = Math.floor(progress);
    let len = 0;
    for (let i = 0; i < full && i < segLen.length; i++) len += segLen[i];
    if (full < segLen.length) len += segLen[full] * (progress - full);
    return len;
  })();

  const ghosts = Array.from({ length: 6 }, (_, i) => {
    const gp = Math.max(0, progress - (i + 1) * 0.06);
    return { p: pointAt(gp), o: (1 - i / 6) * 0.45 };
  });

  return (
    <SceneWrap durationInFrames={durationInFrames}>
      <AbsoluteFill
        style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(49,120,180,0.18), rgba(5,7,13,0) 72%)" }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="s4wire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE_HOT} />
            <stop offset="100%" stopColor={BLUE} />
          </linearGradient>
          <filter id="s4glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={D} fill="none" stroke="#16324c" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
        <path
          d={D}
          fill="none"
          stroke="url(#s4wire)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${energised} ${TOTAL}`}
          filter="url(#s4glow)"
        />

        {CHAIN.map((n, i) => {
          const arrival = i === 0 ? 0 : INTRO + i * SEG;
          const pop = spring({ frame: frame - arrival, fps, config: { damping: 11, stiffness: 150 }, durationInFrames: 20 });
          const lit = interpolate(frame, [arrival - 4, arrival + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const r = 26 + 12 * pop;
          const onLeft = n.x < 540;
          const capX = onLeft ? n.x - (r + 22) : n.x + (r + 22);
          return (
            <g key={n.key}>
              <circle cx={n.x} cy={n.y} r={r + 40} fill={BLUE} opacity={0.14 * lit} style={{ filter: "blur(20px)" }} />
              <circle cx={n.x} cy={n.y} r={r} fill="#05080F" stroke={lit > 0.02 ? BLUE_HOT : "#1c2b3a"} strokeWidth={4} opacity={0.5 + 0.5 * lit} />
              <circle cx={n.x} cy={n.y} r={r * 0.5} fill={BLUE_HOT} opacity={lit} />
              <text x={n.x} y={n.y + r + 40} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} letterSpacing={2} fill={WHITE} opacity={0.3 + 0.6 * lit}>
                {n.label.toUpperCase()}
              </text>
              {n.step && (
                <text
                  x={capX}
                  y={n.y + 10}
                  textAnchor={onLeft ? "end" : "start"}
                  fontFamily={FONT}
                  fontWeight={800}
                  fontSize={40}
                  fill={BLUE_HOT}
                  opacity={lit}
                  style={{ filter: `drop-shadow(0 0 12px ${BLUE})` }}
                >
                  {n.step}
                </text>
              )}
            </g>
          );
        })}

        {progress > 0 &&
          progress < SEGMENTS + 0.001 &&
          ghosts.map((g, i) => (
            <circle key={i} cx={g.p.x} cy={g.p.y} r={18 - i * 1.6} fill={BLUE_HOT} opacity={g.o} style={{ filter: "blur(4px)" }} />
          ))}
        {progress > 0 && progress < SEGMENTS + 0.001 && (
          <g>
            <circle cx={pulse.x} cy={pulse.y} r={60} fill={BLUE} opacity={0.3} style={{ filter: "blur(16px)" }} />
            <circle cx={pulse.x} cy={pulse.y} r={22} fill={BLUE_HOT} filter="url(#s4glow)" />
            <circle cx={pulse.x} cy={pulse.y} r={10} fill="#ffffff" />
          </g>
        )}
      </svg>

      <Caption frame={frame} start={6} bottom={140} size={34} color="#9cc4e6" weight={700}>
        Auto-reply → Lead saved → Slot booked → Invoice sent → Team alerted
      </Caption>
    </SceneWrap>
  );
};
