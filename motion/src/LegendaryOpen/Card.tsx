import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion';
import { CARD_RATIO } from '../theme';

interface CardProps {
  cardSrc: string;
}

export const Card: React.FC<CardProps> = ({ cardSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 78-108: Card back slides out from pack
  const cardY = interpolate(frame, [78, 98], [200, -50], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flutter effect (subtle side-to-side)
  const flutter = frame >= 78 && frame < 108
    ? Math.sin((frame - 78) * 0.4) * 8
    : 0;

  // 108-138: Y-axis 3D spin (back -> front)
  // Rotate to 180deg to show front, using interpolate for precise control
  const rotateY = interpolate(
    frame,
    [108, 138],
    [0, 180],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => {
        // Ease out cubic for smooth deceleration
        return 1 - Math.pow(1 - t, 3);
      },
    }
  );

  // Determine which side to show
  // 0-90deg: back, 90-270deg: front
  const showFront = rotateY >= 90;

  // 138+: Card settles in center
  const finalY = interpolate(frame, [138, 150], [cardY, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const finalX = interpolate(frame, [138, 150], [flutter, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Card opacity
  const cardOpacity = interpolate(frame, [78, 88, 180], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 78) return null;

  const cardWidth = 640;
  const cardHeight = cardWidth / CARD_RATIO;

  // 150-170: Foil sheen passes across (more visible)
  const sheenProgress = interpolate(frame, [150, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sheenX = interpolate(sheenProgress, [0, 1], [-50, 150]);
  const sheenOpacity = interpolate(sheenProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: cardOpacity,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: cardWidth,
          height: cardHeight,
          transform: `
            translateX(${frame < 138 ? flutter : finalX}px)
            translateY(${frame < 138 ? cardY : finalY}px)
            rotateY(${frame >= 108 ? rotateY : 0}deg)
          `,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card back */}
        {!showFront && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <Img
              src={staticFile('fx/card_back.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Card front */}
        {showFront && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(255, 217, 120, 0.5)',
            }}
          >
            <Img
              src={staticFile(cardSrc)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Foil sheen effect */}
            {frame >= 150 && frame <= 170 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${sheenX}%`,
                  width: '40%',
                  height: '100%',
                  background: `linear-gradient(90deg, 
                    transparent, 
                    rgba(255, 231, 163, ${sheenOpacity * 0.7}), 
                    rgba(196, 132, 26, ${sheenOpacity * 0.9}),
                    rgba(255, 231, 163, ${sheenOpacity * 0.7}),
                    transparent)`,
                  pointerEvents: 'none',
                  filter: 'blur(1px)',
                }}
              />
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
