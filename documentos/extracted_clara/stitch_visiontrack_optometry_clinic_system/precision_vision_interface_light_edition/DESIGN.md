---
name: Precision Vision Interface - Light Edition
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#904900'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
This design system focuses on clinical clarity and high-stakes precision for medical and diagnostic environments. The brand personality is authoritative yet approachable, prioritizing information density without cognitive load. 

The style is **Corporate / Modern** with a lean towards **Minimalism**. It utilizes a "White Room" aesthetic—pure white surfaces and subtle grayscale transitions—to ensure that medical data, high-resolution imagery, and status indicators remain the focal point. The interface evokes a sense of reliability, sterility, and modern technological sophistication.

## Colors
The palette is optimized for high-contrast readability in well-lit clinical settings. 

- **Primary (Indigo #6366f1):** Used for primary actions, active states, and navigational highlights.
- **Secondary (Emerald #10b981):** Reserved for "Success" states, "Stable" vitals, and confirmed diagnostic results.
- **Background (#ffffff):** The base layer for all views to maximize screen brightness and contrast.
- **Surface (#f8fafc):** A cool-toned light gray used for containers, sidebars, and card backgrounds to create subtle grouping.
- **Text Selection:** Use a 10% opacity Indigo for text highlights to maintain legibility.

## Typography
**Inter** is utilized across all levels to provide a systematic and utilitarian feel. 

For medical data tables and laboratory results, use `body-sm` for maximum density. Titles should use `title-md` with semi-bold weights to establish hierarchy without over-powering the content. `label-md` is specifically designed for table headers and small captions, utilizing an uppercase style to differentiate data from descriptors.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop, centered within a 1440px max-width container to prevent line lengths from becoming unreadable on ultra-wide medical monitors.

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Rhythm:** A strict 4px baseline grid governs all vertical spacing.
- **Density:** High-density spacing (`sm` and `md`) is preferred for data-heavy dashboards, while `lg` and `xl` are used for patient profiles and landing views.

## Elevation & Depth
In this light-mode interface, depth is achieved through **Low-contrast outlines** and **Tonal layers** rather than heavy shadows.

- **Level 0 (Background):** Pure #ffffff.
- **Level 1 (Containers/Cards):** Surface color #f8fafc with a 1px border of #e2e8f0.
- **Level 2 (Popovers/Modals):** Pure #ffffff with a soft, neutral-tinted shadow (0 10px 15px -3px rgba(0, 0, 0, 0.05)) to separate the element from the primary UI.
- **Interactive States:** Hovering over a card should change the border color to Indigo at 30% opacity, rather than increasing shadow depth.

## Shapes
The shape language is **Soft**. This choice provides a modern, friendly feel while maintaining the structural rigor required for professional software.

- **Small Components:** Checkboxes and small tags use `0.25rem` (4px).
- **Standard Components:** Buttons and Input fields use `0.5rem` (8px).
- **Large Components:** Cards and Modals use `0.75rem` (12px).

## Components
- **Buttons:** Primary buttons use a solid Indigo background with White text. Secondary buttons use a White background with an Indigo border and text. All buttons have a fixed height of 40px for consistency.
- **Inputs:** Fields use a White background and #e2e8f0 border. On focus, the border transitions to Indigo with a 2px outer glow (Indigo at 10% opacity).
- **Chips/Status:** For "Success," use Emerald backgrounds at 10% opacity with solid Emerald text. For "Warning," use Amber at 10% opacity.
- **Data Tables:** Alternate row colors are not used; instead, use thin 1px horizontal dividers (#e2e8f0).
- **Vitals Monitor:** Real-time sparklines and graphs should use a 2px stroke width in Indigo or Emerald, appearing against the white background for maximum visual clarity.