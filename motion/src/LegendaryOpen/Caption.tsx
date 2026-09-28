import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { legend } from '../theme';

interface CaptionProps {
  title: string;
}

export const Caption: React.FC<CaptionProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 150-180: Caption fades in and holds
  const captionOpacity = interpolate(frame, [150, 160], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeY = spring({
    frame: frame - 150,
    fps,
    from: 50,
    to: 0,
    config: { damping: 12 },
  });

  const labelY = spring({
    frame: frame - 155,
    fps,
    from: 30,
    to: 0,
    config: { damping: 12 },
  });

  const lineY = spring({
    frame: frame - 160,
    fps,
    from: 30,
    to: 0,
    config: { damping: 12 },
  });

  if (frame < 150) return null;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: captionOpacity,
      }}
    >
      {/* SSR Badge - top center */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: '50%',
          transform: `translate(-50%, ${badgeY}px)`,
          fontSize: 72,
          fontWeight: 900,
          color: legend.glow,
          textShadow: `0 0 20px ${legend.glow}, 0 0 40px ${legend.foil[1]}`,
          letterSpacing: 8,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {legend.badge}
      </div>

      {/* Label: 레전드 */}
      <div
        style={{
          position: 'absolute',
          bottom: 340,
          left: '50%',
          transform: `translate(-50%, ${labelY}px)`,
          fontSize: 56,
          fontWeight: 700,
          color: legend.foil[0],
          textShadow: `0 2px 8px rgba(0, 0, 0, 0.6)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {legend.label}
      </div>

      {/* Line: 소장하고 싶은 한 장 */}
      <div
        style={{
          position: 'absolute',
          bottom: 260,
          left: '50%',
          transform: `translate(-50%, ${lineY}px)`,
          fontSize: 36,
          fontWeight: 500,
          color: '#F4E7D8',
          textShadow: `0 1px 4px rgba(0, 0, 0, 0.5)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          opacity: 0.9,
        }}
      >
        {legend.line}
      </div>
    </AbsoluteFill>
  );
};
