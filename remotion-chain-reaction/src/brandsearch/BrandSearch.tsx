import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { CameraMotionBlur } from "@remotion/motion-blur";

const FONT = "Arial, Helvetica, sans-serif";
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const QUERY = "building a brand?";

// ---------------------------------------------------------------------------
// Google wordmark
// ---------------------------------------------------------------------------
const GoogleLogo: React.FC<{ size?: number }> = ({ size = 96 }) => {
  const cols = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
  return (
    <div style={{ fontFamily: "'Product Sans', Arial, sans-serif", fontSize: size, fontWeight: 700, letterSpacing: -2, display: "flex" }}>
      {"Google".split("").map((ch, i) => (
        <span key={i} style={{ color: cols[i] }}>{ch}</span>
      ))}
    </div>
  );
};

// A mobile search pill
const SearchPill: React.FC<{ text: string; caret?: boolean; small?: boolean }> = ({ text, caret, small }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 22,
      width: small ? 880 : 900,
      height: small ? 96 : 120,
      padding: small ? "0 30px" : "0 38px",
      borderRadius: 999,
      background: "#fff",
      boxShadow: "0 6px 26px rgba(0,0,0,0.16)",
      border: "1px solid #e4e6ea",
    }}
  >
    {/* magnifier */}
    <svg width={small ? 36 : 44} height={small ? 36 : 44} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#9aa0a6" strokeWidth="2.4" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#9aa0a6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
    <div style={{ flex: 1, fontFamily: FONT, fontSize: small ? 40 : 48, color: "#202124", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden" }}>
      {text}
      {caret && <span style={{ color: "#4285F4", fontWeight: 300 }}>|</span>}
    </div>
    {/* mic */}
    <svg width={small ? 34 : 42} height={small ? 34 : 42} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#4285F4" />
      <path d="M5 11a7 7 0 0 0 14 0" stroke="#EA4335" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="21" stroke="#34A853" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </div>
);

// ===========================================================================
// A) Type the query on a clean canvas
// ===========================================================================
const TypeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoPop = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 22 });
  const barPop = spring({ frame: frame - 14, fps, config: { damping: 15, stiffness: 120 }, durationInFrames: 22 });

  const typeStart = 34;
  const cps = 1.7; // chars per frame-ish (fast)
  const n = Math.max(0, Math.min(QUERY.length, Math.floor((frame - typeStart) * cps / 1)));
  const shown = QUERY.slice(0, n);
  const done = n >= QUERY.length;
  const caret = !done || Math.floor(frame / 8) % 2 === 0;

  // enter press flash
  const enterF = typeStart + Math.ceil(QUERY.length / cps) + 8;
  const flash = interpolate(frame, [enterF, enterF + 6, enterF + 16], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#0b0d12" }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 40%, rgba(66,133,244,0.18), rgba(11,13,18,0) 70%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 70 }}>
        <div style={{ opacity: logoPop, transform: `translateY(${interpolate(logoPop, [0, 1], [24, 0])}px) scale(${0.9 + 0.1 * logoPop})` }}>
          <GoogleLogo size={120} />
        </div>
        <div style={{ opacity: barPop, transform: `translateY(${interpolate(barPop, [0, 1], [30, 0])}px) scale(${0.94 + 0.06 * barPop})` }}>
          <SearchPill text={shown} caret={caret} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// B) Results page snapping in + fast scroll
// ===========================================================================
const RESULTS = [
  { t: "How to build a brand from scratch — 12 steps", u: "brandstrategy.com › guide", s: "Define your positioning, voice, and visual identity before you design a single logo…" },
  { t: "Branding vs Marketing: what actually matters", u: "medium.com › growth", s: "A brand is a promise. Marketing is how you keep repeating it until people believe…" },
  { t: "The psychology of memorable brands", u: "hbr.org › insight", s: "Distinctive assets — colour, shape, sound — are what the brain stores and recalls…" },
  { t: "Small business branding checklist (free)", u: "hypemarketer.in › resources", s: "Name, story, palette, typography, tone, launch plan — everything in one place…" },
];

const TabsRow: React.FC<{ active?: number }> = ({ active = 0 }) => (
  <div style={{ display: "flex", gap: 44, padding: "0 40px", borderBottom: "1px solid #ececec" }}>
    {["All", "Images", "News", "Videos", "Maps"].map((t, i) => (
      <div key={t} style={{ padding: "22px 0", fontFamily: FONT, fontSize: 34, color: i === active ? "#1a73e8" : "#5f6368", borderBottom: i === active ? "3px solid #1a73e8" : "3px solid transparent", fontWeight: i === active ? 700 : 500 }}>
        {t}
      </div>
    ))}
  </div>
);

const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  // fast auto-scroll
  const scroll = interpolate(frame, [12, 72], [0, -300], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
  const HEADER_H = 300;
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      {/* scrolling results, clipped below the header */}
      <div style={{ position: "absolute", top: HEADER_H, left: 0, right: 0, transform: `translateY(${scroll}px)` }}>
        {RESULTS.map((r, i) => {
          const appear = interpolate(frame, [8 + i * 6, 20 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
          return (
            <div key={i} style={{ padding: "26px 44px", opacity: appear, transform: `translateX(${interpolate(appear, [0, 1], [30, 0])}px)` }}>
              <div style={{ fontFamily: FONT, fontSize: 28, color: "#3c4043" }}>{r.u}</div>
              <div style={{ fontFamily: FONT, fontSize: 42, color: "#1a0dab", fontWeight: 500, marginTop: 6, lineHeight: 1.2 }}>{r.t}</div>
              <div style={{ fontFamily: FONT, fontSize: 30, color: "#4d5156", marginTop: 8, lineHeight: 1.35 }}>{r.s}</div>
            </div>
          );
        })}
      </div>

      {/* opaque header on top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "56px 40px 26px" }}>
          <SearchPill text={QUERY} small />
        </div>
        <TabsRow active={0} />
      </div>
    </AbsoluteFill>
  );
};

// ===========================================================================
// C) Images tab — grid of brand tiles snapping in
// ===========================================================================
const TILES = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#7c4dff", "#00bcd4", "#ff7043", "#26a69a", "#5c6bc0"];
const ImagesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 40], [1.15, 1], { easing: EXPO });
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ padding: "56px 40px 20px" }}>
        <SearchPill text={QUERY} small />
      </div>
      <TabsRow active={1} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, padding: 26, transform: `scale(${zoom})`, transformOrigin: "50% 30%" }}>
        {TILES.map((c, i) => {
          const pop = spring({ frame: frame - i * 3, fps, config: { damping: 13, stiffness: 160 }, durationInFrames: 16 });
          return (
            <div key={i} style={{ height: 300, borderRadius: 18, background: `linear-gradient(150deg, ${c}, ${c}aa)`, opacity: pop, transform: `scale(${pop})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 90, height: 90, borderRadius: 14, background: "rgba(255,255,255,0.85)" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ===========================================================================
// D) Rapid keyword flashes (montage core)
// ===========================================================================
const WORDS = ["POSITIONING", "IDENTITY", "STORY", "VOICE", "AUDIENCE", "LOGO", "PALETTE", "GROWTH"];
const KeywordFlash: React.FC<{ word: string; color: string }> = ({ word, color }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 6], [1.3, 1], { extrapolateRight: "clamp", easing: EXPO });
  const o = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0b0d12", justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(50% 40% at 50% 50%, ${color}33, rgba(11,13,18,0) 70%)` }} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 130, color: "#fff", letterSpacing: 2, opacity: o, transform: `scale(${s})`, textAlign: "center" }}>
        {word}
      </div>
      <div style={{ position: "absolute", bottom: 720, width: 220, height: 8, borderRadius: 8, background: color }} />
    </AbsoluteFill>
  );
};

// ===========================================================================
// E) End card
// ===========================================================================
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 110 }, durationInFrames: 26 });
  const line2 = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO });
  return (
    <AbsoluteFill style={{ background: "#0b0d12", justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 42%, rgba(66,133,244,0.2), rgba(11,13,18,0) 70%)" }} />
      <div style={{ textAlign: "center", padding: "0 90px" }}>
        <div style={{ opacity: pop, transform: `translateY(${interpolate(pop, [0, 1], [26, 0])}px) scale(${0.9 + 0.1 * pop})`, fontFamily: FONT, fontWeight: 800, fontSize: 78, color: "#fff", lineHeight: 1.1 }}>
          Don&rsquo;t just <span style={{ color: "#4285F4" }}>search</span> it.
        </div>
        <div style={{ marginTop: 22, opacity: line2, transform: `translateY(${interpolate(line2, [0, 1], [22, 0])}px)`, fontFamily: FONT, fontWeight: 800, fontSize: 78, color: "#fff", lineHeight: 1.1 }}>
          Build the brand.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===========================================================================
// Master montage
// ===========================================================================
export const BRANDSEARCH_DURATION = (() => {
  // computed from the series below (durations minus overlaps)
  const durs = [120, 80, 52, 22, 22, 22, 22, 90];
  const XF = 8;
  return durs.reduce((a, b) => a + b, 0) - (durs.length - 1) * XF;
})();

export const BrandSearch: React.FC = () => {
  const words = WORDS.slice(0, 4);
  const wordCols = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
  return (
    <AbsoluteFill style={{ background: "#0b0d12" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <TypeScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />

        <TransitionSeries.Sequence durationInFrames={80}>
          <CameraMotionBlur shutterAngle={160} samples={6}>
            <ResultsScene />
          </CameraMotionBlur>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 8 })} />

        <TransitionSeries.Sequence durationInFrames={52}>
          <ImagesScene />
        </TransitionSeries.Sequence>

        {/* rapid keyword montage */}
        {words.map((w, i) => (
          <React.Fragment key={w}>
            <TransitionSeries.Transition
              presentation={slide({ direction: i % 2 === 0 ? "from-bottom" : "from-right" })}
              timing={linearTiming({ durationInFrames: 8 })}
            />
            <TransitionSeries.Sequence durationInFrames={22}>
              <KeywordFlash word={w} color={wordCols[i % wordCols.length]} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />

        <TransitionSeries.Sequence durationInFrames={90}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
