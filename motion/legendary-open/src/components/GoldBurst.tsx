import { CanvasImage, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

import { cardH, cardLandTop, cardLeft, cardW } from "../layout";
import { beats, clamp } from "../timeline";

const sparks = Array.from({ length: 16 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 16 + 0.2;
  const distance = 78 + (index % 4) * 26;
  return {
    id: `spark-${index}`,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.78,
    size: 7 + (index % 3) * 3,
    delay: (index % 5) * 3,
    color: index % 3 === 0 ? "#FFF6D0" : index % 3 === 1 ? "#FFD978" : "#E8C56B",
  };
});

const popEase = {
  ...clamp,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

export const GoldBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const start = beats.burst.start;
  const end = beats.burst.end;
  const centerX = cardLeft + cardW / 2;
  const centerY = cardLandTop + cardH / 2;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <CanvasImage
        name="Gold flash"
        src={staticFile("fx/light_flash.png")}
        width={340}
        height={340}
        fit="contain"
        style={{
          position: "absolute",
          left: centerX - 170,
          top: centerY - 170,
          opacity: interpolate(frame, [start, start + 4, start + 16, start + 28], [0, 0.95, 0.35, 0], clamp),
          mixBlendMode: "screen",
        }}
      />
      <CanvasImage
        name="Ember burst"
        src={staticFile("fx/ember_burst.png")}
        width={460}
        height={345}
        fit="contain"
        style={{
          position: "absolute",
          left: centerX - 230,
          top: centerY - 170,
          opacity: interpolate(frame, [start, start + 8, start + 28, end], [0, 1, 0.45, 0], clamp),
          scale: interpolate(frame, [start, start + 18, end], [0.55, 1.05, 1.2], {
            ...popEase,
            output: "perceptual-scale",
          }),
          mixBlendMode: "screen",
        }}
      />
      <CanvasImage
        name="Gold ring"
        src={staticFile("fx/ring_effect.png")}
        width={420}
        height={315}
        fit="contain"
        style={{
          position: "absolute",
          left: centerX - 210,
          top: centerY - 150,
          opacity: interpolate(frame, [start + 2, start + 10, start + 36, end], [0, 0.9, 0.25, 0], clamp),
          scale: interpolate(frame, [start, start + 20, end], [0.62, 1.08, 1.28], {
            ...popEase,
            output: "perceptual-scale",
          }),
          mixBlendMode: "screen",
        }}
      />
      <CanvasImage
        name="Sparkle field"
        src={staticFile("fx/sparkles.png")}
        width={400}
        height={300}
        fit="contain"
        style={{
          position: "absolute",
          left: centerX - 200,
          top: centerY - 150,
          opacity: interpolate(frame, [start + 4, start + 14, end], [0, 0.8, 0], clamp),
          mixBlendMode: "screen",
        }}
      />
      {sparks.map((spark) => {
        const born = start + spark.delay;
        return (
          <div
            key={spark.id}
            style={{
              position: "absolute",
              left: centerX - spark.size / 2,
              top: centerY - spark.size / 2,
              width: spark.size,
              height: spark.size,
              borderRadius: spark.size,
              background: spark.color,
              boxShadow: `0 0 10px ${spark.color}`,
              opacity: interpolate(frame, [born, born + 6, born + 28], [0, 1, 0], clamp),
              translate: interpolate(
                frame,
                [born, born + 28],
                ["0px 0px", `${spark.x}px ${spark.y}px`],
                popEase,
              ),
            }}
          />
        );
      })}
    </div>
  );
};
