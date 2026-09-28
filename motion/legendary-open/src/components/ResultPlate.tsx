import { Easing, interpolate, useCurrentFrame } from "remotion";

import type { RarityTheme } from "../cards";
import { beats, clamp, HEIGHT } from "../timeline";

type ResultPlateProps = {
  theme: RarityTheme;
};

export const ResultPlate: React.FC<ResultPlateProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [beats.result.start, beats.result.start + 16],
    [0, 1],
    {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  const rise = interpolate(frame, [beats.result.start, beats.result.start + 16], [18, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: HEIGHT - 168,
        opacity,
        translate: `0px ${rise}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 72,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${theme.foil[0]}, transparent)`,
        }}
      />
      <div
        style={{
          color: theme.foil[0],
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 13,
          letterSpacing: 6,
          lineHeight: 1,
        }}
      >
        {theme.badge}
      </div>
      <div
        style={{
          color: "#F8F1DE",
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 28,
          letterSpacing: 3,
          lineHeight: 1,
        }}
      >
        {theme.label}
      </div>
      <div
        style={{
          color: "rgba(248, 241, 222, 0.72)",
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 13,
          letterSpacing: 1,
        }}
      >
        {theme.line}
      </div>
    </div>
  );
};
