import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Brand palette
export const BLACK = "#05070D";
export const BLUE = "#3178B4";
export const BLUE_HOT = "#6FB4E8";
export const BLUE_DIM = "#1b3a58";
export const WHITE = "#FCFCFC";

export const FONT = "Arial, Helvetica, sans-serif";

// Smooth fade in/out over black at scene edges for clean cuts.
export const SceneWrap: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  bg?: string;
}> = ({ children, durationInFrames, fadeIn = 12, fadeOut = 12, bg = BLACK }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Caption block, positioned lower-third by default.
export const Caption: React.FC<{
  children: React.ReactNode;
  frame: number;
  start: number;
  bottom?: number;
  size?: number;
  color?: string;
  weight?: number;
  maxWidth?: number;
}> = ({
  children,
  frame,
  start,
  bottom = 320,
  size = 52,
  color = WHITE,
  weight = 700,
  maxWidth = 900,
}) => {
  const appear = interpolate(frame, [start, start + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(appear, [0, 1], [26, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        justifyContent: "center",
        padding: "0 90px",
      }}
    >
      <div
        style={{
          maxWidth,
          textAlign: "center",
          color,
          fontFamily: FONT,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.25,
          letterSpacing: 0.3,
          opacity: appear,
          transform: `translateY(${y}px)`,
          textShadow: "0 4px 30px rgba(0,0,0,0.6)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// --- Simple line-art glyphs for the four systems ---
export const Glyph: React.FC<{ kind: string; size?: number; color?: string; sw?: number }> = ({
  kind,
  size = 90,
  color = WHITE,
  sw = 5,
}) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {kind === "chat" && (
        <>
          <path {...common} d="M20 25 h60 a6 6 0 0 1 6 6 v30 a6 6 0 0 1 -6 6 H45 l-14 14 v-14 H20 a6 6 0 0 1 -6 -6 V31 a6 6 0 0 1 6 -6 Z" />
          <circle cx="35" cy="46" r="3.5" fill={color} stroke="none" />
          <circle cx="50" cy="46" r="3.5" fill={color} stroke="none" />
          <circle cx="65" cy="46" r="3.5" fill={color} stroke="none" />
        </>
      )}
      {kind === "sheet" && (
        <>
          <rect {...common} x="20" y="18" width="60" height="64" rx="6" />
          <line {...common} x1="20" y1="38" x2="80" y2="38" />
          <line {...common} x1="20" y1="56" x2="80" y2="56" />
          <line {...common} x1="42" y1="18" x2="42" y2="82" />
          <line {...common} x1="62" y1="18" x2="62" y2="82" />
        </>
      )}
      {kind === "calendar" && (
        <>
          <rect {...common} x="18" y="24" width="64" height="58" rx="8" />
          <line {...common} x1="18" y1="40" x2="82" y2="40" />
          <line {...common} x1="34" y1="16" x2="34" y2="30" />
          <line {...common} x1="66" y1="16" x2="66" y2="30" />
          <circle cx="38" cy="56" r="4" fill={color} stroke="none" />
          <circle cx="54" cy="56" r="4" fill={color} stroke="none" />
          <circle cx="54" cy="70" r="4" fill={color} stroke="none" />
        </>
      )}
      {kind === "invoice" && (
        <>
          <path {...common} d="M28 14 h34 l14 14 v58 H28 Z" />
          <path {...common} d="M62 14 v14 h14" />
          <line {...common} x1="38" y1="46" x2="66" y2="46" />
          <line {...common} x1="38" y1="58" x2="66" y2="58" />
          <line {...common} x1="38" y1="70" x2="54" y2="70" />
        </>
      )}
      {kind === "check" && (
        <path {...common} d="M22 52 l18 18 l38 -40" />
      )}
    </svg>
  );
};
