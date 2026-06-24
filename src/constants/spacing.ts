export const Spacing = {
  screenH: 28,
  cardPad: 20,
  cardGap: 12,
  sectionGap: 24,

  // Radii
  radiusBtn: 17,
  radiusCard: 20,
  radiusChip: 14,
  radiusPill: 13,
  radiusDaySquare: 14,

  // Heights
  btnHeight: 58,
  tabBarHeight: 78,
  statusBarHeight: 52,
  progressBarHeight: 5,
  sessionProgressHeight: 7,
} as const;

export const Shadows = {
  button: {
    shadowColor: '#2a6cbf',
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  card: {
    shadowColor: 'rgba(31,77,120,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;
