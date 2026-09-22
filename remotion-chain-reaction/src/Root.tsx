import { Composition } from "remotion";
import { ChainReaction } from "./ChainReaction";
import { ChainReactionSmooth } from "./ChainReactionSmooth";
import { TheFlowFilm, FILM_DURATION } from "./TheFlowFilm";

export const FPS = 30;
export const DURATION = 420; // 14 seconds

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TheFlowFilm"
        component={TheFlowFilm}
        durationInFrames={FILM_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="ChainReactionSmooth"
        component={ChainReactionSmooth}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="ChainReaction"
        component={ChainReaction}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
