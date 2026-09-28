import { CanvasImage, interpolate, staticFile } from "remotion";

import {
  bodyH,
  bodyLeft,
  bodyTop,
  closedH,
  packLeft,
  packTop,
  packW,
  peelH,
  peelLeft,
  peelTop,
  peelW,
} from "../layout";
import { clamp, tearPhases } from "../timeline";

type PackTearProps = {
  /**
   * 0 = sealed pack, 1 = flap removed.
   * Driven by the timeline today. A drag gesture can pass this later.
   */
  progress: number;
};

export const PackTear: React.FC<PackTearProps> = ({ progress }) => {
  const closedOpacity = interpolate(progress, [...tearPhases.closed], [1, 1, 0], clamp);
  const bodyOpacity = interpolate(progress, [...tearPhases.body], [0, 1], clamp);
  const peel2Opacity = interpolate(progress, [...tearPhases.peel2], [0, 1, 1, 0], clamp);
  const peel3Opacity = interpolate(progress, [...tearPhases.peel3], [0, 1, 1, 0], clamp);
  const peel4Opacity = interpolate(progress, [...tearPhases.peel4], [0, 1, 1, 0], clamp);
  const peel4Y = interpolate(progress, [...tearPhases.peel4Fall], [0, 18, 210], clamp);
  const peel4X = interpolate(progress, [...tearPhases.peel4Fall], [0, 10, 36], clamp);
  const peel4Rot = interpolate(
    progress,
    [...tearPhases.peel4Fall],
    ["-2deg", "10deg", "32deg"],
    clamp,
  );

  return (
    <>
      <CanvasImage
        name="Closed pack"
        src={staticFile("fx/pack_closed.png")}
        width={packW}
        height={closedH}
        fit="contain"
        style={{
          position: "absolute",
          left: packLeft,
          top: packTop,
          opacity: closedOpacity,
        }}
      />
      <CanvasImage
        name="Torn pack body"
        src={staticFile("fx/pack_body_torn.png")}
        width={packW}
        height={bodyH}
        fit="contain"
        style={{
          position: "absolute",
          left: bodyLeft,
          top: bodyTop,
          opacity: bodyOpacity,
        }}
      />
      <CanvasImage
        name="Tear step 2"
        src={staticFile("fx/pack_top_2.png")}
        width={peelW}
        height={peelH}
        fit="contain"
        style={{
          position: "absolute",
          left: peelLeft,
          top: peelTop,
          opacity: peel2Opacity,
        }}
      />
      <CanvasImage
        name="Tear step 3"
        src={staticFile("fx/pack_top_3.png")}
        width={peelW}
        height={peelH}
        fit="contain"
        style={{
          position: "absolute",
          left: peelLeft,
          top: peelTop,
          opacity: peel3Opacity,
        }}
      />
      <CanvasImage
        name="Tear step 4"
        src={staticFile("fx/pack_top_4.png")}
        width={peelW}
        height={peelH}
        fit="contain"
        style={{
          position: "absolute",
          left: peelLeft,
          top: peelTop,
          opacity: peel4Opacity,
          translate: `${peel4X}px ${peel4Y}px`,
          rotate: peel4Rot,
        }}
      />
    </>
  );
};
