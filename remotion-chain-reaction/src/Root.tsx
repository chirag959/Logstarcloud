import { Composition } from "remotion";
import { ChainReaction } from "./ChainReaction";

export const FPS = 30;
export const DURATION = 420; // 14 seconds

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ChainReaction"
      component={ChainReaction}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
