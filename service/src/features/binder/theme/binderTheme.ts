import { colors } from '../../../theme/tokens';

export const binderTheme = {
  cover: {
    background: ['#2A1F19', '#120D0B'] as const,
    border: colors.gold,
    emblemBg: 'rgba(12, 9, 8, 0.6)',
  },
  ring: {
    gradient: ['#EDE7DC', '#9C9385'] as const,
  },
  paper: {
    background: '#F4EBDC',
    edge: 'rgba(28, 20, 16, 0.08)',
    guideline: 'rgba(28, 20, 16, 0.06)',
  },
  pocket: {
    overlay: 'rgba(255, 255, 255, 0.22)',
    border: 'rgba(28, 20, 16, 0.15)',
    innerTop: 'rgba(255, 255, 255, 0.4)',
    shadow: '0px 2px 5px rgba(28, 20, 16, 0.22)',
    hoverShadow: '0px 4px 12px rgba(28, 20, 16, 0.32)',
  },
  vinyl: {
    highlight: 'rgba(255, 255, 255, 0.65)',
  },
  badge: {
    background: 'rgba(12, 9, 8, 0.75)',
    text: colors.gold,
  },
  supplyTag: {
    background: 'rgba(136, 136, 136, 0.9)',
    text: colors.paper,
  },
} as const;
