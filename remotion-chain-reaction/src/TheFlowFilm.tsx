import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Connection } from "./scenes/Scene3Connection";
import { Scene4Flow } from "./scenes/Scene4Flow";
import { Scene5Machine } from "./scenes/Scene5Machine";
import { Scene6Human } from "./scenes/Scene6Human";
import { Scene7Morning } from "./scenes/Scene7Morning";
import { Scene8Logo } from "./scenes/Scene8Logo";

// Scene durations @ 30fps. TransitionSeries overlaps each crossfade, so the
// film total = sum(durations) - sum(transitions).
export const SCENES = [
  { c: Scene1Hook, d: 90 },
  { c: Scene2Problem, d: 120 },
  { c: Scene3Connection, d: 120 },
  { c: Scene4Flow, d: 150 },
  { c: Scene5Machine, d: 120 },
  { c: Scene6Human, d: 90 },
  { c: Scene7Morning, d: 120 },
  { c: Scene8Logo, d: 180 },
];

const XF = 16; // crossfade length in frames
export const FILM_DURATION =
  SCENES.reduce((a, s) => a + s.d, 0) - (SCENES.length - 1) * XF;

export const TheFlowFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070D" }}>
      <TransitionSeries>
        {SCENES.map((s, i) => {
          const Comp = s.c;
          return (
            <React.Fragment key={i}>
              <TransitionSeries.Sequence durationInFrames={s.d}>
                <Comp durationInFrames={s.d} />
              </TransitionSeries.Sequence>
              {i < SCENES.length - 1 && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: XF, easing: Easing.inOut(Easing.ease) })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
