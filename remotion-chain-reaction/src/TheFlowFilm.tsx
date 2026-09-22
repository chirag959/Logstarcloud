import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Connection } from "./scenes/Scene3Connection";
import { Scene4Flow } from "./scenes/Scene4Flow";
import { Scene5Machine } from "./scenes/Scene5Machine";
import { Scene6Human } from "./scenes/Scene6Human";
import { Scene7Morning } from "./scenes/Scene7Morning";
import { Scene8Logo } from "./scenes/Scene8Logo";

// Scene durations @ 30fps — total 990 frames = 33s (under 40s).
export const SCENES = [
  { c: Scene1Hook, d: 90 }, //  3.0s  hook
  { c: Scene2Problem, d: 120 }, // 4.0s  problem
  { c: Scene3Connection, d: 120 }, // 4.0s  connection
  { c: Scene4Flow, d: 150 }, // 5.0s  flow
  { c: Scene5Machine, d: 120 }, // 4.0s  machine
  { c: Scene6Human, d: 90 }, //  3.0s  human
  { c: Scene7Morning, d: 120 }, // 4.0s  morning
  { c: Scene8Logo, d: 180 }, //  6.0s  logo & CTA
];

export const FILM_DURATION = SCENES.reduce((a, s) => a + s.d, 0);

export const TheFlowFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070D" }}>
      <Series>
        {SCENES.map((s, i) => {
          const Comp = s.c;
          return (
            <Series.Sequence key={i} durationInFrames={s.d}>
              <Comp durationInFrames={s.d} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
