import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { CameraMotionBlur } from "@remotion/motion-blur";

// ---------------------------------------------------------------------------
// Palette — warm cinematic film look (no blue)
// ---------------------------------------------------------------------------
const BG = "#0C0A08";
const CREAM = "#F4ECDC";
const MUTED = "#8C8272";
const AMBER = "#FFB454";
const AMBER_D = "#E0842B";
const CARD = "#17130E";
const LINE = "#2A2118";
const FONT = "Georgia, 'Times New Roman', serif"; // editorial, premium
const SANS = "Arial, Helvetica, sans-serif";

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const SMOOTH = Easing.bezier(0.65, 0, 0.2, 1);

const QUERY = "building a brand?";
const CHARS = QUERY.split("");
const CELL = 200; // fixed advance per character (predictable camera geometry)
const FSIZE = 300;

// timing
const TYPE_START = 16;
const CHAR_DELAY = 5.2; // frames per character (smooth, unhurried)
const TYPE_END = TYPE_START + CHARS.length * CHAR_DELAY;
const ZOOM_OUT = 46;

const PHRASE_W = CHARS.length * CELL;
const S_IN = 2.15; // close — flying through the letters
const S_FIT = Math.min(0.32, 980 / PHRASE_W); // pulls back to read the whole line

// ===========================================================================
// Scene A — camera flies along the letters as they type themselves
// ===========================================================================
const FlyThroughType: React.FC = () => {
  const frame = useCurrentFrame();

  const typedF = Math.max(0, Math.min(CHARS.length, (frame - TYPE_START) / CHAR_DELAY));
  const zoom = interpolate(frame, [TYPE_END, TYPE_END + ZOOM_OUT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO,
  });

  const S = interpolate(zoom, [0, 1], [S_IN, S_FIT]);
  // camera x: follow the writing cursor, then recenter on the whole phrase
  const cursorX = typedF * CELL;
  const camX = interpolate(zoom, [0, 1], [cursorX, PHRASE_W / 2]);
  const tx = 540 - camX * S;
  const ty = 960; // vertical anchor line

  const drift = (1 - zoom) * Math.sin(frame / 26) * 10;

  // caret
  const caretVisible = zoom < 0.02 ? true : Math.floor(frame / 9) % 2 === 0;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* warm ambient + soft vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(60% 42% at 50% 46%, rgba(255,180,84,0.10), rgba(12,10,8,0) 70%)" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 400px 120px rgba(0,0,0,0.75)" }} />

      <CameraMotionBlur shutterAngle={200} samples={12}>
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: ty + drift,
              transform: `translateX(${tx}px) scale(${S})`,
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            <div style={{ display: "flex", transform: "translateY(-50%)", alignItems: "center" }}>
              {CHARS.map((ch, i) => {
                const appear = frame - (TYPE_START + i * CHAR_DELAY);
                const o = interpolate(appear, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const blur = interpolate(appear, [0, 9], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const yy = interpolate(appear, [0, 8], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
                const isLast = ch === "?";
                return (
                  <div
                    key={i}
                    style={{
                      width: CELL,
                      textAlign: "center",
                      flexShrink: 0,
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: FSIZE,
                      lineHeight: 1,
                      color: isLast ? AMBER : CREAM,
                      opacity: o,
                      filter: `blur(${blur}px)`,
                      transform: `translateY(${yy}px)`,
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </div>
                );
              })}
              {/* caret */}
              <div
                style={{
                  width: 12,
                  height: FSIZE * 0.82,
                  marginLeft: -CELL * 0.36,
                  background: AMBER,
                  opacity: caretVisible ? 0.9 : 0,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        </AbsoluteFill>
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};

// ===========================================================================
// Scene B — smooth "enter" load into results
// ===========================================================================
const RESULTS = [
  { k: "the answer", t: "A brand is what people feel before they read a word." },
  { k: "step one", t: "Positioning — own one idea in one sentence." },
  { k: "step two", t: "Identity — a voice, a palette, a story that repeats." },
];

const Load: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // the query pill drops in from the fly-through
  const pill = spring({ frame: frame - 2, fps, config: { damping: 18, stiffness: 90 }, durationInFrames: 34 });
  const pillY = interpolate(pill, [0, 1], [-40, 0]);

  // skeleton -> content crossfade
  const load = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: SMOOTH });
  const shimmer = (frame % 40) / 40;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 46% at 50% 30%, rgba(255,180,84,0.10), rgba(12,10,8,0) 70%)" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 400px 120px rgba(0,0,0,0.7)" }} />

      <AbsoluteFill style={{ padding: "150px 80px", flexDirection: "column" }}>
        {/* search pill with the typed query */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            height: 130,
            padding: "0 40px",
            borderRadius: 999,
            background: CARD,
            border: `1.5px solid ${LINE}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            opacity: pill,
            transform: `translateY(${pillY}px)`,
          }}
        >
          <svg width={46} height={46} viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke={AMBER} strokeWidth="2.4" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={AMBER} strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 52, color: CREAM, fontWeight: 700 }}>{QUERY}</span>
        </div>

        {/* results */}
        <div style={{ marginTop: 80, position: "relative" }}>
          {RESULTS.map((r, i) => {
            const rowY = i * 250;
            const cRise = interpolate(frame, [24 + i * 12, 44 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
            return (
              <div key={i} style={{ position: "absolute", top: rowY, left: 0, right: 0, height: 210 }}>
                {/* skeleton */}
                <div style={{ opacity: (1 - load) * (i === 0 ? 1 : 1) }}>
                  <div style={{ width: 260, height: 30, borderRadius: 8, background: `rgba(255,255,255,${0.06 + 0.05 * shimmer})` }} />
                  <div style={{ width: "92%", height: 44, borderRadius: 10, background: `rgba(255,255,255,${0.05 + 0.05 * (1 - shimmer)})`, marginTop: 18 }} />
                  <div style={{ width: "70%", height: 44, borderRadius: 10, background: `rgba(255,255,255,${0.05 + 0.05 * shimmer})`, marginTop: 14 }} />
                </div>
                {/* content */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: load * cRise, transform: `translateY(${interpolate(cRise, [0, 1], [22, 0])}px)`, filter: `blur(${interpolate(cRise, [0, 1], [8, 0])}px)` }}>
                  <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: AMBER, fontWeight: 800 }}>{r.k}</div>
                  <div style={{ fontFamily: FONT, fontSize: i === 0 ? 62 : 50, color: CREAM, fontWeight: 700, marginTop: 14, lineHeight: 1.2 }}>{r.t}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===========================================================================
// Scene C — closing line
// ===========================================================================
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [6, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
  const b = interpolate(frame, [26, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 44%, rgba(255,180,84,0.14), rgba(12,10,8,0) 70%)" }} />
      <div style={{ textAlign: "center", padding: "0 100px" }}>
        <div style={{ opacity: a, transform: `translateY(${interpolate(a, [0, 1], [30, 0])}px)`, filter: `blur(${interpolate(a, [0, 1], [8, 0])}px)`, fontFamily: FONT, fontStyle: "italic", fontSize: 60, color: MUTED, fontWeight: 400 }}>
          Don&rsquo;t just search it.
        </div>
        <div style={{ marginTop: 26, opacity: b, transform: `translateY(${interpolate(b, [0, 1], [30, 0])}px)`, filter: `blur(${interpolate(b, [0, 1], [10, 0])}px)`, fontFamily: FONT, fontWeight: 700, fontSize: 96, color: CREAM, lineHeight: 1.05 }}>
          Build the <span style={{ color: AMBER }}>brand.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===========================================================================
export const BRANDSEARCH_DURATION = (() => {
  const durs = [Math.round(TYPE_END + ZOOM_OUT + 26), 150, 84];
  const XF = 20;
  return durs.reduce((a, b) => a + b, 0) - (durs.length - 1) * XF;
})();

export const BrandSearch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={Math.round(TYPE_END + ZOOM_OUT + 26)}>
          <FlyThroughType />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20, easing: SMOOTH })} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Load />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20, easing: SMOOTH })} />

        <TransitionSeries.Sequence durationInFrames={84}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
