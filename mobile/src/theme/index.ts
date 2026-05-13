import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#3B82F6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#22C55E',
  danger: '#EF4444',
  border: '#E2E8F0',
} as const;

export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
} as const;

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    outline: colors.border,
    error: colors.danger,
  },
};

export default theme;
