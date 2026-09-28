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

  // Background darkness fades in anticipation, then lights up
  const bgBrightness = interpolate(
    frame,
    [0, 30, 54, 138, 150],
    [0.05, 0.08, 0.15, 0.4, 0.35],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(28, 20, 16, ${1 - bgBrightness})`,
      }}
    >
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
