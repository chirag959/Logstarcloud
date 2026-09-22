import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SMOOTH, EXPO_OUT } from "./common";

type Grade = "cool" | "warm" | "neutral";

const GRADES: Record<Grade, { filter: string; overlay: string }> = {
  cool: {
    filter: "brightness(0.72) contrast(1.05) saturate(0.85)",
    overlay: "linear-gradient(180deg, rgba(20,50,90,0.45), rgba(10,26,48,0.6))",
  },
  warm: {
    filter: "brightness(1.05) contrast(1.02) saturate(1.08)",
    overlay: "linear-gradient(180deg, rgba(255,180,90,0.22), rgba(120,70,20,0.28))",
  },
  neutral: {
    filter: "brightness(0.9) contrast(1.03)",
    overlay: "linear-gradient(180deg, rgba(10,20,36,0.25), rgba(6,12,22,0.35))",
  },
};

// A feathered, colour-graded, gently moving portrait cutout of the character.
export const Character: React.FC<{
  src?: string;
  grade?: Grade;
  start?: number;
  width?: number;
  cx?: number; // horizontal centre 0..1
  cy?: number; // vertical centre in px from top
  drift?: number;
}> = ({ src = "maya_closeup.png", grade = "neutral", start = 0, width = 720, cx = 0.5, cy = 760, drift = 1 }) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const appear = interpolate(f, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO_OUT });
  const scale = interpolate(f, [0, 200], [1.06, 1.16], { easing: SMOOTH });
  const yDrift = Math.sin(f / 40) * 10 * drift;
  const g = GRADES[grade];
  const h = width * (720 / 510);

  return (
    <AbsoluteFill style={{ opacity: appear }}>
      <div
        style={{
          position: "absolute",
          left: `calc(${cx * 100}% - ${width / 2}px)`,
          top: cy - h / 2 + yDrift,
          width,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "50% 45%",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 64% at 50% 42%, #000 52%, rgba(0,0,0,0) 80%)",
          maskImage:
            "radial-gradient(ellipse 60% 64% at 50% 42%, #000 52%, rgba(0,0,0,0) 80%)",
        }}
      >
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: g.filter, display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: g.overlay, mixBlendMode: "multiply" }} />
      </div>
    </AbsoluteFill>
  );
};
