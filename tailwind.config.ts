import type { Config } from 'tailwindcss';
import { colors } from './lib/constants/colors';
import { typography } from './lib/constants/typography';
import {
  spacing,
  borderRadius,
  boxShadow,
  container,
  zIndex,
  transitionDuration,
  transitionTimingFunction,
  borderWidth,
} from './lib/constants/spacing';

const config: Config = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			pink: colors.pink,
  			business: colors.business,
  			influencer: colors.influencer,
  			customer: colors.customer,
  			success: colors.success,
  			warning: colors.warning,
  			error: colors.error,
  			info: colors.info,
  			gray: colors.gray,
  			blue: colors.blue,
  			amber: colors.amber,
  			green: colors.green,
  			red: colors.red,
  			background: 'hsl(var(--background))',
  			surface: colors.surface,
  			border: 'hsl(var(--border))',
  			text: colors.text,
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: typography.fontFamily.sans,
  			mono: typography.fontFamily.mono
  		},
  		fontSize: {
  			display: typography.fontSize.display,
  			h1: typography.fontSize.h1,
  			h2: typography.fontSize.h2,
  			h3: typography.fontSize.h3,
  			title: typography.fontSize.title,
  			body: typography.fontSize.body,
  			callout: typography.fontSize.callout,
  			subheadline: typography.fontSize.subheadline,
  			footnote: typography.fontSize.footnote,
  			caption: typography.fontSize.caption
  		},
  		fontWeight: typography.fontWeight,
  		lineHeight: typography.lineHeight,
  		letterSpacing: typography.letterSpacing,
  		spacing: spacing,
  		borderRadius: {
                ...borderRadius,
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: boxShadow,
  		container: {
  			center: true,
  			padding: {
  				DEFAULT: spacing.lg,
  				sm: spacing.xl,
  				lg: spacing['2xl'],
  				xl: spacing['3xl'],
  				'2xl': spacing['4xl']
  			},
  			screens: container
  		},
  		zIndex: zIndex,
  		transitionDuration: transitionDuration,
  		transitionTimingFunction: transitionTimingFunction,
  		borderWidth: borderWidth,
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			DEFAULT: '8px',
  			md: '12px',
  			lg: '16px',
  			xl: '24px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    // Custom plugin for additional utilities
    function ({ addUtilities, addComponents, theme }: any) {
      // Glassmorphism utility
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      });

      // Gradient utilities
      addUtilities({
        '.gradient-pink': {
          'background': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        },
        '.gradient-blue': {
          'background': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        },
        '.gradient-amber': {
          'background': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        },
        '.gradient-green': {
          'background': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        },
      });

      // iOS-style button components
      addComponents({
        '.btn-primary': {
          'padding': `${theme('spacing.md')} ${theme('spacing.xl')}`,
          'background-color': theme('colors.pink.500'),
          'color': '#FFFFFF',
          'font-weight': theme('fontWeight.semibold'),
          'font-size': theme('fontSize.body[0]'),
          'border-radius': theme('borderRadius.lg'),
          'transition': 'all 150ms ease-in-out',
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'border': 'none',
          'cursor': 'pointer',
          '&:hover': {
            'background-color': theme('colors.pink.600'),
            'transform': 'translateY(-1px)',
            'box-shadow': theme('boxShadow.md'),
          },
          '&:active': {
            'transform': 'translateY(0)',
            'box-shadow': theme('boxShadow.sm'),
          },
          '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
            'transform': 'none',
          },
        },
        '.btn-secondary': {
          'padding': `${theme('spacing.md')} ${theme('spacing.xl')}`,
          'background-color': theme('colors.surface'),
          'color': theme('colors.text.primary'),
          'font-weight': theme('fontWeight.semibold'),
          'font-size': theme('fontSize.body[0]'),
          'border-radius': theme('borderRadius.lg'),
          'border': `1px solid ${theme('colors.border')}`,
          'transition': 'all 150ms ease-in-out',
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'cursor': 'pointer',
          '&:hover': {
            'background-color': theme('colors.gray.100'),
            'border-color': theme('colors.gray.300'),
          },
          '&:active': {
            'background-color': theme('colors.gray.200'),
          },
          '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
          },
        },
        '.card': {
          'background-color': theme('colors.background'),
          'border-radius': theme('borderRadius.xl'),
          'padding': theme('spacing.xl'),
          'box-shadow': theme('boxShadow.sm'),
          'border': `1px solid ${theme('colors.border')}`,
          'transition': 'all 200ms ease-in-out',
          '&:hover': {
            'box-shadow': theme('boxShadow.md'),
          },
        },
        '.input-field': {
          'width': '100%',
          'padding': `${theme('spacing.md')} ${theme('spacing.lg')}`,
          'font-size': theme('fontSize.body[0]'),
          'border': `1px solid ${theme('colors.border')}`,
          'border-radius': theme('borderRadius.lg'),
          'background-color': theme('colors.background'),
          'color': theme('colors.text.primary'),
          'transition': 'all 150ms ease-in-out',
          '&:focus': {
            'outline': 'none',
            'border-color': theme('colors.pink.500'),
            'box-shadow': `0 0 0 3px ${theme('colors.pink.100')}`,
          },
          '&::placeholder': {
            'color': theme('colors.text.tertiary'),
          },
          '&:disabled': {
            'background-color': theme('colors.surface'),
            'cursor': 'not-allowed',
          },
        },
      });

      // Text truncation utilities
      addUtilities({
        '.truncate-2': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.truncate-3': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      });
    },
      require("tailwindcss-animate")
],
};

export default config;
