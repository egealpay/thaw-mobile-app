export const Fonts = {
  spaceGrotesk: 'SpaceGrotesk',
  outfit: 'Outfit',
} as const;

export const FontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const TextStyles = {
  h2: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: '#14222e',
  },
  eyebrow: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
    color: '#7aa6cf',
  },
  bigNumber: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 64,
    color: '#2a6cbf',
  },
  timerLarge: {
    fontFamily: 'SpaceGrotesk-Light',
    fontSize: 62,
    color: '#ffffff',
  },
  body: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16.5,
    lineHeight: 25,
    color: '#51687a',
  },
  bodySmall: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#6f8799',
  },
  btnLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  cardTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 17,
    color: '#14222e',
  },
  cardSubtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13.5,
    color: '#6f8799',
  },
  pill: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 13,
    color: '#2a6cbf',
  },
  sectionLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: '#8198a8',
  },
} as const;
