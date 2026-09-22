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
// "The Flow — Chain Reaction" (smooth cut)
// Same story, buttery motion: trailing motion-blur pulse, spring node pops,
// breathing glow, and an eased follow-camera with no clamp jerk.
// ---------------------------------------------------------------------------
const SCENE_W = 1080;
const SCENE_H = 3320;
const VIEW_H = 1920;

type Node = { key: string; label: string; x: number; y: number };

const CHAT: Node = { key: "chat", label: "Chat", x: 540, y: 300 };
const NODES: Node[] = [
  { key: "reply", label: "Reply", x: 300, y: 820 },
  { key: "crm", label: "CRM", x: 780, y: 1300 },
  { key: "calendar", label: "Calendar", x: 320, y: 1800 },
  { key: "invoice", label: "Invoice", x: 760, y: 2300 },
  { key: "team", label: "Team", x: 420, y: 2820 },
];
const CHAIN: Node[] = [CHAT, ...NODES];

const STEPS = ["Auto-reply", "Lead saved", "Slot booked", "Invoice sent", "Team alerted"];

const BLUE = "#2FA8FF";
const BLUE_HOT = "#7FD0FF";

const INTRO = 40;
const SEG = 66;
const SEGMENTS = NODES.length;

// Smooth per-hop travel with a gentle ease-in/out so the pulse decelerates
// INTO each node (the satisfying "arrival") then accelerates out again.
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
// Node — spring pop with a soft overshoot, plus a continuous glow breath.
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
  // gentle breathing once lit
  const breath = lit * (0.5 + 0.5 * Math.sin((frame - arrival) / 9));
  const r = 30 + 16 * pop;
  return (
    <g transform={`translate(${node.x} ${node.y})`}>
      <circle
        r={r + 55 + 18 * breath}
        fill={BLUE}
        opacity={0.16 * lit}
        style={{ filter: "blur(26px)" }}
      />
      <circle
        r={r}
        fill="#05080F"
        stroke={lit > 0.02 ? BLUE_HOT : "#1c2b3a"}
        strokeWidth={4}
        opacity={0.5 + 0.5 * lit}
      />
      <circle r={r * 0.5} fill={BLUE_HOT} opacity={lit} />
      <circle r={r * 0.5 * (0.8 + 0.2 * breath)} fill={BLUE} opacity={0.5 * lit} />
      <text
        x={0}
        y={r + 46}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight={700}
        fontSize={38}
        letterSpacing={2}
        fill="#ffffff"
        opacity={0.32 + 0.68 * lit}
      >
        {node.label.toUpperCase()}
      </text>
    </g>
  );
};

export const ChainReactionSmooth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = chainProgress(frame);
  const pulse = pulsePoint(progress);
  const energisedLen = progressToLength(progress);

  // ---- Eased follow-camera: sample progress a few frames back and lerp,
  // so the pan glides instead of snapping. Soft-clamp at the ends.
  const rawCamTarget = pulse.y - VIEW_H * 0.55;
  const softClamp = (v: number, lo: number, hi: number) => {
    if (v < lo) return lo - (lo - v) * 0.15;
    if (v > hi) return hi + (v - hi) * 0.15;
    return v;
  };
  // temporal smoothing: average of current + slightly-lagged target
  const lagProgress = chainProgress(frame - 6);
  const lagY = pulsePoint(lagProgress).y - VIEW_H * 0.55;
  const camY = softClamp((rawCamTarget + lagY) / 2, 0, SCENE_H - VIEW_H);

  // smooth breathing zoom (no hard spring spikes)
  const zoom = 1.05 + 0.015 * Math.sin(frame / 22);

  // ---- Motion-blur trail: several ghost pulses trailing the head.
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
            "radial-gradient(120% 70% at 50% 42%, rgba(20,60,110,0.28), rgba(3,6,12,0) 62%)",
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
              <stop offset="0%" stopColor={BLUE_HOT} />
              <stop offset="100%" stopColor={BLUE} />
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
            stroke="#12324e"
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

          {/* trailing ghosts (motion blur streak) */}
          {progress > 0 &&
            progress < SEGMENTS + 0.001 &&
            ghosts.map((g, i) => (
              <circle
                key={i}
                cx={g.p.x}
                cy={g.p.y}
                r={22 - i * 1.6}
                fill={BLUE_HOT}
                opacity={g.o}
                style={{ filter: "blur(4px)" }}
              />
            ))}

          {/* pulse head */}
          {progress > 0 && progress < SEGMENTS + 0.001 && (
            <g transform={`translate(${pulse.x} ${pulse.y})`}>
              <circle r={72} fill={BLUE} opacity={0.3} style={{ filter: "blur(18px)" }} />
              <circle r={26} fill={BLUE_HOT} filter="url(#glow2)" />
              <circle r={12} fill="#ffffff" />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      <StepOverlay frame={frame} fps={fps} progress={progress} />
      <TitleLockup frame={frame} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

const StepOverlay: React.FC<{ frame: number; fps: number; progress: number }> = ({
  frame,
  fps,
  progress,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 210,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        padding: "0 70px",
      }}
    >
      {STEPS.map((step, i) => {
        const arrival = INTRO + (i + 1) * SEG;
        const pop = spring({
          frame: frame - arrival,
          fps,
          config: { damping: 13, stiffness: 130, mass: 0.7 },
          durationInFrames: 24,
        });
        const appear = interpolate(frame, [arrival - 4, arrival + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(pop, [0, 1], [30, 0]);
        const recency = progress - (i + 1);
        const fade =
          recency > 2.2
            ? interpolate(recency, [2.2, 3.3], [1, 0.25], { extrapolateRight: "clamp" })
            : 1;
        return (
          <div
            key={step}
            style={{
              opacity: appear * fade,
              transform: `translateY(${y}px) scale(${0.94 + 0.06 * pop})`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: "rgba(8,20,34,0.72)",
              border: `1px solid rgba(47,168,255,${0.25 + 0.45 * appear})`,
              borderRadius: 999,
              padding: "18px 34px",
              boxShadow: `0 0 ${34 * appear}px rgba(47,168,255,0.35)`,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: BLUE_HOT,
                boxShadow: `0 0 16px ${BLUE_HOT}`,
              }}
            />
            <span
              style={{
                color: "#EAF6FF",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: 1,
              }}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
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
          color: BLUE_HOT,
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
