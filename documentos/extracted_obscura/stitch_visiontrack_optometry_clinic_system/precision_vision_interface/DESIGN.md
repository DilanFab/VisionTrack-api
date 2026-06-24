---
name: Precision Vision Interface
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#a078ff'
  on-tertiary-container: '#340080'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
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
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
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
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-desktop: 24px
  margin-desktop: 40px
  gutter-mobile: 16px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

This design system is engineered for a high-fidelity healthcare environment, balancing clinical rigor with patient-centric warmth. The brand personality is **authoritative, precise, and transparent**. It targets two distinct user groups: medical administrators who require high data density and efficiency, and patients who seek clarity and reassurance.

The design style is **Corporate Modern with Glassmorphism accents**. 
- The **Admin Portal** utilizes a structured, "Solid State" approach with clear containment, optimized for rapid data entry and diagnostic review. 
- The **Patient PWA** introduces soft background blurs, frosted glass cards, and organic depth to make the healthcare experience feel approachable and high-tech. 
The overall aesthetic leverages deep indigo and emerald tones to evoke a sense of trust and "clinical neon" precision.

## Colors

The palette is optimized for long-duration usage in a clinical dark-mode environment, reducing eye strain for practitioners.

- **Primary (Indigo #6366f1):** Used for primary actions, active navigation states, and brand-critical identifiers.
- **Secondary (Emerald #10b981):** Represents health, successful diagnostic results, and "confirmed" appointment states.
- **Surface & Background:** The background uses a deep Navy-Black (#0f172a) to provide maximum contrast for medical imagery. UI containers utilize a slightly lighter Slate (#1e293b) to establish hierarchy.
- **Functional Accents:** Use Tertiary Violet (#8b5cf6) for secondary data visualizations or non-critical interactive elements.

## Typography

The system utilizes **Inter** as the primary typeface for its exceptional legibility in digital interfaces and neutral, professional tone. 

- **Clinical Precision:** For technical data, patient IDs, and numerical results (e.g., Diopter values, axis measurements), use **JetBrains Mono**. This monospaced font ensures that data points align perfectly and are easily scannable by clinicians.
- **Hierarchy:** Use tight letter-spacing on display headings to maintain a modern, "tight" aesthetic. 
- **Readability:** Maintain high contrast between `body-md` (Primary Text) and `body-sm` (Secondary/Meta Text).

## Layout & Spacing

The design system follows a **12-column fluid grid** for the Admin Portal and a **single-column adaptive layout** for the Patient PWA.

- **Admin Portal (Desktop):** Prioritizes information density. Sidebars should be fixed (280px). Content areas use a 24px gutter to allow for complex data tables and multi-pane diagnostic views.
- **Patient Portal (Mobile):** Transition to a "Stack" layout with 16px margins.
- **Spacing Rhythm:** All margins and paddings must be multiples of the 4px base unit. Component-internal spacing (e.g., button padding) should be 8px/16px, while section spacing should be 32px/48px.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Glassmorphism**.

1.  **Level 0 (Background):** #0f172a.
2.  **Level 1 (Cards/Containers):** #1e293b. Borders should be 1px solid #334155.
3.  **Level 2 (Popovers/Modals):** Use a semi-transparent Indigo-tinted background with a 12px Backdrop Blur (e.g., `rgba(30, 41, 59, 0.7)`).
4.  **Shadows:** Shadows are rarely used. Instead, use "Glow" effects for active elements: a subtle, 8px Indigo outer glow (`rgba(99, 102, 241, 0.2)`) to indicate focus or primary importance.

## Shapes

The shape language is **Structured Rounded**. 

- **Standard Elements:** Buttons, input fields, and cards use a 0.5rem (8px) radius to maintain a modern but professional feel.
- **Containers:** Large dashboard widgets and diagnostic panels use `rounded-lg` (1rem / 16px) to create distinct visual separation.
- **Medical Icons:** Should be enclosed in a "Squircle" or 8px rounded box to match the component language.

## Components

Components are built on the **React-Bootstrap** framework, customized with the following specifications:

- **Buttons:** 
  - `Primary`: Indigo background, white text, no border.
  - `Success`: Emerald background, white text.
  - `Outline`: 1px border (#334155), no background, transition to Indigo on hover.
- **Input Fields:** Dark background (#0f172a), 1px border (#334155). On focus, the border changes to Indigo with a 2px outer glow.
- **Patient Cards (PWA):** Must use the Glassmorphic style: `backdrop-filter: blur(12px); background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.1);`.
- **Data Tables:** High density. Row height: 40px. Header background: #1e293b. Use JetBrains Mono for numerical cell data.
- **Status Chips:** Use subtle, low-opacity backgrounds (e.g., Emerald at 10% opacity) with high-contrast text for "Confirmed," "Pending," or "Critical" statuses.
- **Visual Acuity Charts:** Custom component using high-contrast white text on #0f172a for digital screening previews.