import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";

import { beats, clamp } from "../timeline";

const ease = {
  ...clamp,
  easing: Easing.inOut(Easing.sin),
};

export const PackShake: React.FC<{ children: ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const start = beats.shake.start;
  const end = beats.shake.end;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        rotate: interpolate(
          frame,
          [start, start + 8, start + 16, start + 24, start + 32, end],
          ["0deg", "-6.5deg", "7deg", "-4deg", "2deg", "0deg"],
          ease,
        ),
        translate: interpolate(
          frame,
          [start, start + 8, start + 16, start + 24, start + 32, end],
          ["0px 0px", "7px 0px", "-8px 0px", "4px 0px", "-2px 0px", "0px 0px"],
          ease,
        ),
      }}
    >
      {children}
    </div>
  );
};
