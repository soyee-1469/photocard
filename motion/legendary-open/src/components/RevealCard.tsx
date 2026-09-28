import { CanvasImage, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

import type { RarityTheme } from "../cards";
import { cardH, cardLandTop, cardLeft, cardW } from "../layout";
import { beats, cardMotion, clamp } from "../timeline";

const riseEase = {
  ...clamp,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

type RevealCardProps = {
  frontSrc: string;
  backSrc: string;
  theme: RarityTheme;
};

export const RevealCard: React.FC<RevealCardProps> = ({
  frontSrc,
  backSrc,
  theme,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [cardMotion.rise.start, cardMotion.rise.start + 8],
    [0, 1],
    clamp,
  );
  const rise = interpolate(
    frame,
    [cardMotion.rise.start, cardMotion.rise.end],
    [240, 0],
    riseEase,
  );
  const scale = interpolate(
    frame,
    [cardMotion.rise.start, cardMotion.rise.end],
    [0.9, 1],
    { ...riseEase, output: "perceptual-scale" },
  );
  const glow = interpolate(
    frame,
    [cardMotion.flip.end, beats.burst.start + 12, beats.result.start],
    [0.25, 0.95, 0.55],
    clamp,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: cardLeft,
        top: cardLandTop,
        width: cardW,
        height: cardH,
        opacity,
        translate: `0px ${rise}px`,
        scale,
        perspective: 900,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -28,
          borderRadius: 28,
          background: `radial-gradient(circle, ${theme.glow}88 0%, transparent 68%)`,
          opacity: glow,
          filter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          rotate: interpolate(
            frame,
            [cardMotion.flip.start, cardMotion.flip.end],
            ["y 0deg", "y 180deg"],
            {
              ...clamp,
              easing: Easing.inOut(Easing.cubic),
            },
          ),
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
          }}
        >
          <CanvasImage
            name="Card back"
            src={staticFile(backSrc)}
            width={cardW}
            height={cardH}
            fit="contain"
            style={{ width: cardW, height: cardH }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            rotate: "y 180deg",
          }}
        >
          <CanvasImage
            name="Card front"
            src={staticFile(frontSrc)}
            width={cardW}
            height={cardH}
            fit="contain"
            style={{ width: cardW, height: cardH }}
          />
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: 12,
              backgroundImage: `linear-gradient(105deg, transparent 28%, ${theme.foil[0]}99 44%, rgba(255,255,255,0.82) 50%, rgba(120,220,255,0.55) 56%, transparent 72%)`,
              backgroundSize: "220% 100%",
              backgroundPosition: interpolate(
                frame,
                [cardMotion.holo.start, cardMotion.holo.end],
                ["130% 0%", "-30% 0%"],
                clamp,
              ),
              mixBlendMode: "screen",
              opacity: interpolate(
                frame,
                [cardMotion.holo.start, cardMotion.holo.start + 8, cardMotion.holo.end],
                [0, 0.9, 0.45],
                clamp,
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};
