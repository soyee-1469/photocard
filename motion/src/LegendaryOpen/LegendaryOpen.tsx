import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { legend } from '../theme';
import { Pack } from './Pack';
import { Card } from './Card';
import { GoldFx } from './GoldFx';
import { Caption } from './Caption';

interface LegendaryOpenProps {
  cardSrc: string;
  title: string;
}

export const LegendaryOpen: React.FC<LegendaryOpenProps> = ({ cardSrc, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline segments:
  // 0-30: Anticipation
  // 30-54: Legendary tease
  // 54-78: Tear
  // 78-108: Card appears (back)
  // 108-138: Spin reveal
  // 138-150: Burst
  // 150-180: Hold with caption

  // Background uses solid dark color with brightness overlay
  const baseColor = '#1C1410'; // ink color from theme
  const glowIntensity = interpolate(
    frame,
    [0, 30, 54, 138, 145, 180],
    [0, 0.05, 0.1, 0.3, 0.1, 0.05],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: baseColor,
      }}
    >
      {/* Gold glow overlay for brightness variation */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, rgba(255, 217, 120, ${glowIntensity}), transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Gold FX layer (glow, particles, ring, flash) */}
      <GoldFx />

      {/* Pack envelope */}
      <Pack />

      {/* Card with 3D spin */}
      <Card cardSrc={cardSrc} />

      {/* Caption: SSR badge + text */}
      <Caption title={title} />
    </AbsoluteFill>
  );
};
