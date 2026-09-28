import { AbsoluteFill, Composition, interpolate, useCurrentFrame } from "remotion";

import { rarityThemes, type RarityId } from "./cards";
import { GoldBurst } from "./components/GoldBurst";
import { PackShake } from "./components/PackShake";
import { PackTear } from "./components/PackTear";
import { ResultPlate } from "./components/ResultPlate";
import { RevealCard } from "./components/RevealCard";
import {
  beats,
  cardMotion,
  clamp,
  DURATION_FRAMES,
  FPS,
  HEIGHT,
  tearProgressAt,
  WIDTH,
} from "./timeline";

export type LegendaryOpenProps = {
  rarity: RarityId;
  frontSrc: string;
  backSrc: string;
  /**
   * Null plays the 0.6s–1.5s tear from the timeline.
   * A number from 0 to 1 replaces that window so a drag can drive the tear later.
   */
  tearProgress: number | null;
};

export const LegendaryOpen: React.FC<LegendaryOpenProps> = ({
  rarity,
  frontSrc,
  backSrc,
  tearProgress,
}) => {
  const frame = useCurrentFrame();
  const theme = rarityThemes[rarity];
  const progress = tearProgress === null ? tearProgressAt(frame) : tearProgress;
  const packOpacity = interpolate(
    frame,
    [cardMotion.rise.end, beats.burst.start],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#070605" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 42%, rgba(201, 160, 80, 0.16), transparent 46%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, opacity: packOpacity }}>
        <PackShake>
          <PackTear progress={progress} />
        </PackShake>
      </div>
      <RevealCard frontSrc={frontSrc} backSrc={backSrc} theme={theme} />
      <GoldBurst />
      <ResultPlate theme={theme} />
    </AbsoluteFill>
  );
};

export const LegendaryOpenComposition = () => {
  return (
    <Composition
      id="LegendaryOpen"
      component={LegendaryOpen}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        rarity: "legendary",
        frontSrc: "fx/card_front.png",
        backSrc: "fx/card_back.png",
        tearProgress: null,
      }}
    />
  );
};
