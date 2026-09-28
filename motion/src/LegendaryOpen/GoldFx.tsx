import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { legend } from '../theme';

export const GoldFx: React.FC = () => {
  const frame = useCurrentFrame();

  // 30-54: Gold light leaking from pack seam
  const leakOpacity = interpolate(frame, [30, 42, 54], [0, 0.8, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 54-78: Sparks during tear
  const sparkOpacity = interpolate(frame, [54, 66, 78], [0, 1, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 138-150: Burst explosion
  const burstOpacity = interpolate(frame, [138, 142, 150], [0, 1, 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const burstScale = interpolate(frame, [138, 150], [0.5, 2.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flash at reveal moment
  const flashOpacity = interpolate(frame, [138, 142, 145], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Ring shockwave
  const ringScale = interpolate(frame, [138, 155], [0.3, 2.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ringOpacity = interpolate(frame, [138, 145, 155], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Generate particles with fixed seed
  const particleCount = 28;
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    angle: (i / particleCount) * Math.PI * 2,
    distance: 150 + random(`particle-${i}`) * 200,
    size: 20 + random(`size-${i}`) * 40,
    delay: random(`delay-${i}`) * 6,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Gold leak from pack seam (30-54) */}
      {frame >= 30 && frame < 78 && (
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            height: 200,
            opacity: leakOpacity,
          }}
        >
          <img
            src="/fx/inner_glow.png"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: `hue-rotate(30deg) brightness(1.5)`,
            }}
          />
        </div>
      )}

      {/* Sparks during tear (54-78) */}
      {frame >= 54 && frame < 90 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '30%',
              width: 150,
              height: 150,
              opacity: sparkOpacity,
            }}
          >
            <img src="/fx/sparkles.png" style={{ width: '100%', height: '100%' }} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: '40%',
              right: '30%',
              width: 150,
              height: 150,
              opacity: sparkOpacity,
            }}
          >
            <img src="/fx/sparkles.png" style={{ width: '100%', height: '100%' }} />
          </div>
        </>
      )}

      {/* Screen flash at burst (138-145) */}
      {frame >= 138 && frame < 145 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle, ${legend.glow}, transparent 70%)`,
            opacity: flashOpacity,
          }}
        />
      )}

      {/* Ring shockwave (138-155) */}
      {frame >= 138 && frame < 156 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            width: 600,
            height: 600,
            opacity: ringOpacity,
          }}
        >
          <img
            src="/fx/ring_effect.png"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Gold particles burst (138-165) */}
      {frame >= 138 && frame < 165 && particles.map((p, i) => {
        const particleFrame = frame - 138 - p.delay;
        if (particleFrame < 0) return null;

        const particleOpacity = interpolate(
          particleFrame,
          [0, 5, 20],
          [0, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const particleDistance = interpolate(
          particleFrame,
          [0, 20],
          [0, p.distance],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const x = Math.cos(p.angle) * particleDistance;
        const y = Math.sin(p.angle) * particleDistance;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: p.size,
              height: p.size,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: particleOpacity * burstOpacity,
            }}
          >
            <img
              src="/fx/particles.png"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        );
      })}

      {/* Ember burst at center (138-150) */}
      {frame >= 138 && frame < 156 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${burstScale})`,
            width: 800,
            height: 800,
            opacity: burstOpacity,
          }}
        >
          <img
            src="/fx/ember_burst.png"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
