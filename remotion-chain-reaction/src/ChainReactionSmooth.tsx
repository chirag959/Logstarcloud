import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from "remotion";

// ---------------------------------------------------------------------------
// "The Flow — Chain Reaction" (smooth, multi-colour cut)
// Warm-gold pulse races the wire; each node ignites in its OWN colour and its
// step caption appears beside it, on that node's side (never centered).
// ---------------------------------------------------------------------------
const SCENE_W = 1080;
const SCENE_H = 3320;
const VIEW_H = 1920;

type Node = {
  key: string;
  label: string;
  step: string;
  x: number;
  y: number;
  color: string; // base
  hot: string; // bright core
};

const CHAT: Node = {
  key: "chat",
  label: "Chat",
  step: "",
  x: 540,
  y: 300,
  color: "#FFB43B",
  hot: "#FFE0A3",
};

// Each node reacts in a different colour.
const NODES: Node[] = [
  { key: "reply", label: "Reply", step: "Auto-reply", x: 370, y: 820, color: "#34E5A4", hot: "#B6FFE4" },
  { key: "crm", label: "CRM", step: "Lead saved", x: 710, y: 1300, color: "#FFC24B", hot: "#FFE9B8" },
  { key: "calendar", label: "Calendar", step: "Slot booked", x: 370, y: 1800, color: "#FF6FB5", hot: "#FFC3E2" },
  { key: "invoice", label: "Invoice", step: "Invoice sent", x: 700, y: 2300, color: "#B983FF", hot: "#E4CCFF" },
  { key: "team", label: "Team", step: "Team alerted", x: 420, y: 2820, color: "#FF7A45", hot: "#FFC5A8" },
];
const CHAIN: Node[] = [CHAT, ...NODES];

// warm-gold energy that runs through the wire / pulse
const GOLD = "#FF9E2C";
const GOLD_HOT = "#FFD98A";

const INTRO = 40;
const SEG = 66;
const SEGMENTS = NODES.length;

const hopEase = Easing.bezier(0.5, 0, 0.2, 1);

function chainProgress(frame: number): number {
  const t = frame - INTRO;
  if (t <= 0) return 0;
  const raw = Math.min(t / SEG, SEGMENTS);
  const seg = Math.min(Math.floor(raw), SEGMENTS - 1);
  const local = raw - seg;
  return seg + hopEase(Math.min(local, 1));
}

function pulsePoint(progress: number): { x: number; y: number } {
  const clamped = Math.min(progress, SEGMENTS);
  const seg = Math.min(Math.floor(clamped), SEGMENTS - 1);
  const local = clamped - seg;
  const a = CHAIN[seg];
  const b = CHAIN[seg + 1];
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
}

const PATH_D = CHAIN.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
const SEG_LENGTHS = CHAIN.slice(1).map((n, i) =>
  Math.hypot(n.x - CHAIN[i].x, n.y - CHAIN[i].y)
);
const TOTAL_LEN = SEG_LENGTHS.reduce((a, b) => a + b, 0);

function progressToLength(progress: number): number {
  const full = Math.floor(progress);
  let len = 0;
  for (let i = 0; i < full && i < SEG_LENGTHS.length; i++) len += SEG_LENGTHS[i];
  if (full < SEG_LENGTHS.length) len += SEG_LENGTHS[full] * (progress - full);
  return len;
}

// ---------------------------------------------------------------------------
// Node — spring pop with soft overshoot, breathing glow, its own colour, and
// its step caption anchored on the node's own side (left nodes -> left, right
// nodes -> right). Never centered.
// ---------------------------------------------------------------------------
const NodeDot: React.FC<{ node: Node; index: number; frame: number; fps: number }> = ({
  node,
  index,
  frame,
  fps,
}) => {
  const arrival = index === 0 ? INTRO : INTRO + index * SEG;
  const pop = spring({
    frame: frame - arrival,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.7 },
    durationInFrames: 26,
  });
  const lit = interpolate(frame, [arrival - 6, arrival + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breath = lit * (0.5 + 0.5 * Math.sin((frame - arrival) / 9));
  const r = 30 + 16 * pop;

  // Side caption geometry — the node's own side.
  const onLeft = node.x < 540;
  const gap = r + 26;
  const capX = onLeft ? node.x - gap : node.x + gap;
  const capAnchor = onLeft ? "end" : "start";
  const capSlide = interpolate(pop, [0, 1], [onLeft ? 26 : -26, 0]);
  const capOpacity = index === 0 ? 0 : lit;

  return (
    <g transform={`translate(${node.x} ${node.y})`}>
      <circle
        r={r + 55 + 18 * breath}
        fill={node.color}
        opacity={0.16 * lit}
        style={{ filter: "blur(26px)" }}
      />
      <circle
        r={r}
        fill="#05080F"
        stroke={lit > 0.02 ? node.hot : "#22242c"}
        strokeWidth={4}
        opacity={0.5 + 0.5 * lit}
      />
      <circle r={r * 0.5} fill={node.hot} opacity={lit} />
      <circle r={r * 0.5 * (0.8 + 0.2 * breath)} fill={node.color} opacity={0.5 * lit} />

      {/* node name, below */}
      <text
        x={0}
        y={r + 44}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight={700}
        fontSize={34}
        letterSpacing={2}
        fill="#ffffff"
        opacity={0.3 + 0.6 * lit}
      >
        {node.label.toUpperCase()}
      </text>

      {/* step caption, on the node's OWN side */}
      {node.step && (
        <text
          x={capX - node.x + (onLeft ? capSlide : capSlide)}
          y={12}
          textAnchor={capAnchor}
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={800}
          fontSize={42}
          letterSpacing={0.5}
          fill={node.hot}
          opacity={capOpacity}
          style={{
            filter: `drop-shadow(0 0 14px ${node.color})`,
          }}
        >
          {node.step}
        </text>
      )}
    </g>
  );
};

export const ChainReactionSmooth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = chainProgress(frame);
  const pulse = pulsePoint(progress);
  const energisedLen = progressToLength(progress);

  const rawCamTarget = pulse.y - VIEW_H * 0.55;
  const softClamp = (v: number, lo: number, hi: number) => {
    if (v < lo) return lo - (lo - v) * 0.15;
    if (v > hi) return hi + (v - hi) * 0.15;
    return v;
  };
  const lagY = pulsePoint(chainProgress(frame - 6)).y - VIEW_H * 0.55;
  const camY = softClamp((rawCamTarget + lagY) / 2, 0, SCENE_H - VIEW_H);
  const zoom = 1.05 + 0.015 * Math.sin(frame / 22);

  const TRAIL = 7;
  const ghosts = Array.from({ length: TRAIL }, (_, i) => {
    const gp = chainProgress(frame - (i + 1) * 1.6);
    return { p: pulsePoint(gp), o: (1 - i / TRAIL) * 0.5 };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#03060C" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 70% at 50% 42%, rgba(90,60,20,0.22), rgba(3,6,12,0) 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          transformOrigin: `540px ${camY + VIEW_H * 0.55}px`,
          transform: `scale(${zoom})`,
        }}
      >
        <svg
          width={SCENE_W}
          height={VIEW_H}
          viewBox={`0 ${camY} ${SCENE_W} ${VIEW_H}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="wireHot2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD_HOT} />
              <stop offset="100%" stopColor={GOLD} />
            </linearGradient>
            <filter id="glow2" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={PATH_D}
            fill="none"
            stroke="#3a2f1a"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
          <path
            d={PATH_D}
            fill="none"
            stroke="url(#wireHot2)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${energisedLen} ${TOTAL_LEN}`}
            filter="url(#glow2)"
          />

          {CHAIN.map((n, i) => (
            <NodeDot key={n.key} node={n} index={i} frame={frame} fps={fps} />
          ))}

          {progress > 0 &&
            progress < SEGMENTS + 0.001 &&
            ghosts.map((g, i) => (
              <circle
                key={i}
                cx={g.p.x}
                cy={g.p.y}
                r={22 - i * 1.6}
                fill={GOLD_HOT}
                opacity={g.o}
                style={{ filter: "blur(4px)" }}
              />
            ))}

          {progress > 0 && progress < SEGMENTS + 0.001 && (
            <g transform={`translate(${pulse.x} ${pulse.y})`}>
              <circle r={72} fill={GOLD} opacity={0.3} style={{ filter: "blur(18px)" }} />
              <circle r={26} fill={GOLD_HOT} filter="url(#glow2)" />
              <circle r={12} fill="#ffffff" />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      <TitleLockup frame={frame} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

const TitleLockup: React.FC<{ frame: number; durationInFrames: number }> = ({
  frame,
  durationInFrames,
}) => {
  const inOpacity = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [0, 26], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 96,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: inOpacity * outOpacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          color: GOLD_HOT,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}
      >
        The Flow
      </div>
      <div
        style={{
          marginTop: 10,
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 800,
          fontSize: 58,
          letterSpacing: 1,
        }}
      >
        Chain Reaction
      </div>
    </div>
  );
};
