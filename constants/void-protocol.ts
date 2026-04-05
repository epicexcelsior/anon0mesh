/**
 * Void Protocol Design System
 * AnonMesh UI design tokens — single source of truth for all screens.
 *
 * Colors, typography, spacing, and radii derived from Stitch designs.
 * Import as: import { VP } from '@/constants/void-protocol';
 */

export const VP = {
  colors: {
    // Backgrounds
    void: '#050A0A',
    surface: '#0a1214',
    surfaceElevated: '#0f1a1e',
    ghostBorder: 'rgba(255,255,255,0.05)',

    // Text
    text: {
      primary: '#dee4e3',
      secondary: '#8a9a9a',
      disabled: '#4a5555',
      inverse: '#050A0A',
    },

    // Accent — cyan for interactive, purple for stealth/privacy ONLY
    accent: {
      cyan: '#22D3EE',
      cyanDark: '#0e7490',
      cyanMuted: 'rgba(34,211,238,0.15)',
      cyanGhost: 'rgba(34,211,238,0.05)',
      purple: '#8B5CF6',
      purpleMuted: 'rgba(139,92,246,0.15)',
    },

    // Status
    status: {
      success: '#22D3EE',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },

    // Specific UI elements
    nav: {
      active: '#22D3EE',
      inactive: '#4a5555',
      background: '#050A0A',
    },
  },

  typography: {
    // Display / Page titles
    pageTitle: {
      fontSize: 28,
      fontFamily: 'SpaceGrotesk-Bold',
      letterSpacing: -0.5,
    },
    // Section headers
    header: {
      fontSize: 20,
      fontFamily: 'SpaceGrotesk-SemiBold',
      letterSpacing: -0.3,
    },
    // Subheaders
    subheader: {
      fontSize: 16,
      fontFamily: 'SpaceGrotesk-Medium',
    },
    // Body text
    body: {
      fontSize: 14,
      fontFamily: 'SpaceGrotesk-Regular',
      lineHeight: 20,
    },
    // Small labels
    label: {
      fontSize: 12,
      fontFamily: 'SpaceGrotesk-Medium',
      letterSpacing: 0.5,
    },
    // Captions
    caption: {
      fontSize: 10,
      fontFamily: 'SpaceGrotesk-Regular',
    },
    // Monospace — for addresses, hashes, balances, technical data
    mono: {
      fontSize: 14,
      fontFamily: 'JetBrainsMono-Regular',
    },
    monoSmall: {
      fontSize: 12,
      fontFamily: 'JetBrainsMono-Regular',
    },
    monoBold: {
      fontSize: 14,
      fontFamily: 'JetBrainsMono-Medium',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Shadows for elevated elements (cyan glow)
  shadow: {
    sm: {
      shadowColor: '#22D3EE',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#22D3EE',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#22D3EE',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 8,
    },
  },
} as const;

// Type helpers
export type VPColors = typeof VP.colors;
export type VPTypography = typeof VP.typography;
