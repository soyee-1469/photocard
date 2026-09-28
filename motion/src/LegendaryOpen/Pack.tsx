import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion';

export const Pack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0-30: Pack rises and wobbles
  const packY = interpolate(frame, [0, 30], [200, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const packWobble = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, mass: 0.5 },
  }) * Math.sin(frame * 0.3) * 3;

  // 30-54: Pack stable, gold border glowing
  const borderGlow = interpolate(frame, [30, 54], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 54-78: Tear sequence - pack_top changes: closed -> top_2 -> top_3 -> top_4
  // More distinct timing for each tear stage
  // Fade out the entire pack as card emerges
  const packOpacity = interpolate(frame, [78, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let topImage = 'fx/pack_closed.png';
  if (frame >= 54 && frame < 60) {
    topImage = 'fx/pack_closed.png';
  } else if (frame >= 60 && frame < 68) {
    topImage = 'fx/pack_top_2.png';
  } else if (frame >= 68 && frame < 76) {
    topImage = 'fx/pack_top_3.png';
  } else if (frame >= 76) {
    topImage = 'fx/pack_top_4.png';
  }

  // Tear shake effect - more pronounced
  const tearShake = frame >= 54 && frame < 78 
    ? Math.sin(frame * 1.5) * 6 
    : 0;

  if (frame >= 90) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: packOpacity,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 600,
          height: 800,
          transform: `translateY(${packY}px) rotate(${packWobble + tearShake}deg)`,
        }}
      >
        {/* Pack body */}
        <Img
          src={staticFile('fx/pack_body_torn.png')}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Pack top (animated tear) */}
        <Img
          src={staticFile(topImage)}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Gold border glow during tease */}
        {frame >= 30 && frame < 78 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `4px solid #FFD978`,
              borderRadius: 20,
              opacity: borderGlow * 0.7,
              boxShadow: `0 0 ${30 * borderGlow}px #FFD978`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
