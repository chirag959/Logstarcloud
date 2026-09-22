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
// Scene geometry
// The "scene" is taller than the 1080x1920 viewport; a tracking camera pans
// down it following the pulse, so the whole chain never fits on screen at once.
// ---------------------------------------------------------------------------
const SCENE_W = 1080;
const SCENE_H = 3320;
const VIEW_H = 1920;

type Node = {
  key: string;
  label: string;
  x: number;
  y: number;
};

// Chat node is the origin. Five nodes ignite in a chain reaction after it.
const CHAT: Node = { key: "chat", label: "Chat", x: 540, y: 300 };
const NODES: Node[] = [
  { key: "reply", label: "Reply", x: 300, y: 820 },
  { key: "crm", label: "CRM", x: 780, y: 1300 },
  { key: "calendar", label: "Calendar", x: 320, y: 1800 },
  { key: "invoice", label: "Invoice", x: 760, y: 2300 },
  { key: "team", label: "Team", x: 420, y: 2820 },
];

const CHAIN: Node[] = [CHAT, ...NODES];

// Steps that appear in sync with the pulse, one per ignited node.
const STEPS = [
  "Auto-reply",
  "Lead saved",
  "Slot booked",
  "Invoice sent",
  "Team alerted",
];

const BLUE = "#2FA8FF";
const BLUE_HOT = "#7FD0FF";

// ---------------------------------------------------------------------------
// Timeline: intro, then one "segment" travelled per node ignition.
// ---------------------------------------------------------------------------
const INTRO = 34; // chat node powers up
const SEG = 68; // frames to travel each of the 5 segments
const SEGMENTS = NODES.length; // 5

// Absolute progress (0..SEGMENTS) of the pulse along the chain.
function chainProgress(frame: number): number {
  const t = frame - INTRO;
  if (t <= 0) return 0;
  const raw = t / SEG; // 0..5 linear
  return Math.min(raw, SEGMENTS);
}

// Interpolate the pulse's scene-space position for a given progress value.
function pulsePoint(progress: number): { x: number; y: number } {
  const clamped = Math.min(progress, SEGMENTS);
  const seg = Math.min(Math.floor(clamped), SEGMENTS - 1);
  const localRaw = clamped - seg;
  // ease each hop so it snaps into the node (the "click")
  const local = Easing.inOut(Easing.cubic)(Math.min(localRaw, 1));
  const a = CHAIN[seg];
  const b = CHAIN[seg + 1];
  return {
    x: a.x + (b.x - a.x) * local,
    y: a.y + (b.y - a.y) * local,
  };
}

// How "ignited" a node is (0..1). The chat node is lit from the start;
// each other node ignites as the pulse arrives (progress reaches its index).
function nodeIgnition(index: number, frame: number): number {
  if (index === 0) {
    // chat
    return interpolate(frame, [0, INTRO], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  const arrival = INTRO + index * SEG;
  return interpolate(frame, [arrival - 4, arrival + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ---------------------------------------------------------------------------
// SVG polyline path string through the whole chain.
// ---------------------------------------------------------------------------
const PATH_D = CHAIN.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(
  " "
);

// Per-segment lengths so we can convert chain-progress into a stroke length
// for the "energised" portion of the wire.
const SEG_LENGTHS = CHAIN.slice(1).map((n, i) => {
  const p = CHAIN[i];
  return Math.hypot(n.x - p.x, n.y - p.y);
});
const TOTAL_LEN = SEG_LENGTHS.reduce((a, b) => a + b, 0);

function progressToLength(progress: number): number {
  const full = Math.floor(progress);
  let len = 0;
  for (let i = 0; i < full && i < SEG_LENGTHS.length; i++) len += SEG_LENGTHS[i];
  const frac = progress - full;
  if (full < SEG_LENGTHS.length) {
    const local = Easing.inOut(Easing.cubic)(Math.min(frac, 1));
    len += SEG_LENGTHS[full] * local;
  }
  return len;
}

// ---------------------------------------------------------------------------
// Node component
// ---------------------------------------------------------------------------
const NodeDot: React.FC<{ node: Node; ignition: number }> = ({
  node,
  ignition,
}) => {
  const r = 30 + 14 * ignition;
  const flare = Math.max(0, ignition);
  return (
    <g transform={`translate(${node.x} ${node.y})`}>
      {/* outer glow */}
      <circle
        r={r + 60 * flare}
        fill={BLUE}
        opacity={0.18 * flare}
        style={{ filter: "blur(24px)" }}
      />
      {/* ring */}
      <circle
        r={r}
        fill="#05080F"
        stroke={ignition > 0.02 ? BLUE_HOT : "#1c2b3a"}
        strokeWidth={4}
        opacity={0.5 + 0.5 * ignition}
      />
      {/* hot core */}
      <circle r={r * 0.5} fill={BLUE_HOT} opacity={flare} />
      <circle r={r * 0.5} fill={BLUE} opacity={0.5 * flare} />
      {/* label */}
      <text
        x={0}
        y={r + 46}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight={700}
        fontSize={38}
        letterSpacing={2}
        fill="#ffffff"
        opacity={0.35 + 0.65 * ignition}
      >
        {node.label.toUpperCase()}
      </text>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
export const ChainReaction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = chainProgress(frame);
  const pulse = pulsePoint(progress);
  const energisedLen = progressToLength(progress);

  // --- Tracking camera: follow the pulse, keep it in the lower-middle third.
  const targetCamY = pulse.y - VIEW_H * 0.55;
  const camY = Math.max(0, Math.min(targetCamY, SCENE_H - VIEW_H));

  // subtle dynamic zoom that breathes on each ignition
  const nearestIgnite = Math.round(progress);
  const igniteFrame = INTRO + nearestIgnite * SEG;
  const zoomPulse = spring({
    frame: frame - igniteFrame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
    durationInFrames: 20,
  });
  const zoom = 1.06 + 0.04 * (1 - Math.min(Math.abs(frame - igniteFrame) / 12, 1));

  // final settle: everything holds lit at the end
  const finished = progress >= SEGMENTS;

  return (
    <AbsoluteFill style={{ backgroundColor: "#03060C" }}>
      {/* vignette / ambient */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 70% at 50% 40%, rgba(20,60,110,0.25), rgba(3,6,12,0) 60%)",
        }}
      />

      <AbsoluteFill
        style={{
          transformOrigin: `${540}px ${camY + VIEW_H * 0.55}px`,
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
            <linearGradient id="wireHot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE_HOT} />
              <stop offset="100%" stopColor={BLUE} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* dim base wire */}
          <path
            d={PATH_D}
            fill="none"
            stroke="#12324e"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
          />

          {/* energised portion of the wire, revealed as the pulse advances */}
          <path
            d={PATH_D}
            fill="none"
            stroke="url(#wireHot)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${energisedLen} ${TOTAL_LEN}`}
            filter="url(#glow)"
          />

          {/* nodes */}
          {CHAIN.map((n, i) => (
            <NodeDot key={n.key} node={n} ignition={nodeIgnition(i, frame)} />
          ))}

          {/* the travelling pulse */}
          {progress > 0 && progress < SEGMENTS + 0.001 && (
            <g transform={`translate(${pulse.x} ${pulse.y})`}>
              <circle r={70} fill={BLUE} opacity={0.28} style={{ filter: "blur(18px)" }} />
              <circle r={26} fill={BLUE_HOT} filter="url(#glow)" />
              <circle r={12} fill="#ffffff" />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {/* ---- Post overlay: step captions synced to each ignition ---- */}
      <StepOverlay frame={frame} progress={progress} />

      {/* Title lockup, fades in at start, out near end */}
      <TitleLockup frame={frame} durationInFrames={durationInFrames} finished={finished} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Step caption overlay (fixed to the viewport, "in post")
// ---------------------------------------------------------------------------
const StepOverlay: React.FC<{ frame: number; progress: number }> = ({
  frame,
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
        const appear = interpolate(frame, [arrival - 2, arrival + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(appear, [0, 1], [24, 0]);
        // only show the most recent 3 to keep it clean
        const active = progress * 1;
        const recency = active - (i + 1);
        const fade =
          recency > 2.4
            ? interpolate(recency, [2.4, 3.4], [1, 0.28], {
                extrapolateRight: "clamp",
              })
            : 1;
        return (
          <div
            key={step}
            style={{
              opacity: appear * fade,
              transform: `translateY(${y}px)`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              background: "rgba(8,20,34,0.72)",
              border: `1px solid rgba(47,168,255,${0.25 + 0.45 * appear})`,
              borderRadius: 999,
              padding: "18px 34px",
              boxShadow: `0 0 ${30 * appear}px rgba(47,168,255,0.35)`,
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

// ---------------------------------------------------------------------------
// Title lockup
// ---------------------------------------------------------------------------
const TitleLockup: React.FC<{
  frame: number;
  durationInFrames: number;
  finished: boolean;
}> = ({ frame, durationInFrames }) => {
  const inOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outStart = durationInFrames - 30;
  const outOpacity = interpolate(frame, [outStart, durationInFrames], [1, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 96,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: inOpacity * outOpacity,
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
