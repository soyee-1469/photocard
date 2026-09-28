import React from 'react';
import { Composition } from 'remotion';
import { LegendaryOpen } from './LegendaryOpen/LegendaryOpen';

export interface LegendaryOpenProps {
  cardSrc: string;
  title: string;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LegendaryOpen"
        component={LegendaryOpen as React.FC<any>}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          cardSrc: '/cards/legend.jpg',
          title: '레전드 포토카드',
        }}
      />
    </>
  );
};
