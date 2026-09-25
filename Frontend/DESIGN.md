
---
---
---
name: traka-design
description: Use this skill when you need to design or develop components for Traka, a cash-friendly ledger for Nigerian market traders and small shops. This skill covers Traka's friendly, organic, and modern design system, including its color palette with primary green (#0e6b4a) and accent colors like lavender and mint, as well as its typography using DM Sans Variable for various display and body text sizes.
---
```yaml
brand: Traka
mood: A friendly, organic, and modern space that helps Nigerian traders write each market day down.
scheme: light
colors:
  primary: "#0e6b4a"
  primary-bright: "#14925f"
  primary-deep: "#0a4a33"
  on-primary: "#ffffff"
  ink: "#292a26"
  ink-soft: "#56584f"
  on-ink: "#f8f7f4"
  canvas: "#f8f7f4"
  paper: "#fffefa"
  cloud: "#eaece2"
  hairline: "#e5e4df"
  hairline-strong: "#d6d5cf"
  link: "#979e8b"
  link-pressed: "#7b8960"
  success: "#cceedd"
  warning: "#ffe9af"
  error: "#ffd9ca"
  accent-lavender: "#dcd8ff"
  accent-mint: "#cceedd"
  accent-peach: "#ffd9ca"
  accent-yellow: "#ffe9af"
  accent-moss: "#e0e6d3"
  on-accent-moss: "#4d5b37"
typography:
  display-xl:
    fontFamily: DM Sans Variable
    fontSize: 99px
    fontWeight: 800
    lineHeight: 1.1
  display-lg:
    fontFamily: DM Sans Variable
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.15
  display-md:
    fontFamily: DM Sans Variable
    fontSize: 44px
    fontWeight: 800
    lineHeight: 1.2
  body-lg:
    fontFamily: DM Sans Variable
    fontSize: 23px
    fontWeight: 400
    lineHeight: 1.4
  body-md:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  button-lg:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1
  button-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 650
    lineHeight: 1
  link-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.5
  caption-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  caption-sm:
    fontFamily: DM Sans Variable
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.4
  code-md:
    fontFamily: DM Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 13px
  lg: 22px
  xl: 36px
  pill: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px
shadows:
  none: none
  soft-lift: rgba(41, 42, 38, 0.16) 0px 5px 18px 0px
  card: rgba(48, 49, 39, 0.01) 0px 3px 1px 0px, rgba(36, 38, 19, 0.04) 0px 18px 60px 0px
  modal: rgba(0, 0, 0, 0.28) 0px 24px 70px 0px
motion:
  duration-fast: 150ms
  duration-base: 200ms
  ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
  transition-default: all {motion.duration-fast} {motion.ease-standard}
components:
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
    shadow: "{shadows.card}"
    border: 1px solid {colors.hairline}
  button-primary:
    backgroundColor: "{colors.primary}"
    color: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 14px 22px
    typography: "{typography.button-lg}"
    shadow: "{shadows.none}"
    cursor: pointer
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
    shadow: "{shadows.soft-lift}"
  button-secondary:
    backgroundColor: transparent
    color: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: 14px 22px
    typography: "{typography.button-lg}"
    border: 1px solid {colors.hairline}
    cursor: pointer
  button-secondary-hover:
    backgroundColor: "{colors.cloud}"
    borderColor: "{colors.hairline-strong}"
  button-tertiary:
    backgroundColor: "{colors.ink}"
    color: "{colors.on-ink}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.button-md}"
    cursor: pointer
  button-tertiary-hover:
    backgroundColor: "{colors.ink-soft}"
  link:
    color: "{colors.link}"
    typography: "{typography.link-md}"
    textDecoration: none
    cursor: pointer
  link-hover:
    color: "{colors.ink}"
  badge:
    backgroundColor: "{colors.ink}"
    color: "{colors.on-ink}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xxs} {spacing.xs}"
    typography: "{typography.caption-sm}"
```

## Visual Theme & Atmosphere
The Traka design system projects a feeling of warmth, creativity, and approachable friendliness. It's a digital space that feels handcrafted and human, encouraging genuine connection rather than sterile interaction. The atmosphere is light and airy, built on a foundation of warm off-whites like `{colors.canvas}`, but punctuated by a soft, pleasant green (`{colors.primary}`) that injects calm confidence. The overall mood is optimistic and welcoming, using soft, rounded shapes, gentle shadows, and a friendly, bold heading font to make users feel at home. It straddles the line between a playful, quirky startup and a clean, modern application, suggesting that powerful tools can also be joyful to use.

Key Characteristics:
*   **Warm & Airy Base:** The primary background is `{colors.canvas}`, a soft, warm white, creating a comfortable and inviting environment that avoids clinical starkness.
*   **Energetic Primary Color:** The brand's identity is carried by `{colors.primary}`, a vibrant green used sparingly for maximum impact on key calls to action.
*   **Friendly Typography:** Headings set in `{typography.display-xl}` are bold and heavy, but their rounded letterforms feel welcoming and informal, like a friendly greeting.
*   **Soft, Organic Shapes:** Elements feature subtle rounding, from `{rounded.xs}` on small buttons to `{rounded.lg}` on decorative blobs. This avoids sharp, corporate edges and contributes to the organic feel.
*   **Subtle Depth:** While mostly flat, the design uses `{shadows.card}` to gently lift important UI panels like the main application interface, creating a subtle, tangible sense of depth and focus.
*   **Playful Accents:** A palette of soft pastels like `{colors.accent-lavender}` and `{colors.accent-mint}` are used for illustrative elements, adding a touch of whimsy and personality.
*   **High-Contrast Readability:** Text is primarily set in `{colors.ink}`, a near-black, ensuring excellent readability against the light `{colors.canvas}` and `{colors.paper}` backgrounds.

## Color Usage Rules
The color palette is intentionally focused to create a consistent and harmonious user experience. An agent should primarily compose UIs using the core functional colors: `{colors.canvas}`, `{colors.paper}`, `{colors.cloud}`, `{colors.ink}`, and `{colors.primary}`. New colors should never be introduced; always find the best fit from the existing token set.

*   **Primary Action Color (`{colors.primary}`):** This vibrant green is the brand's signature. Use it exclusively for the most critical call-to-action on any given screen, such as a "Sign Up" or "Find Your People" button. It must not appear more than once or twice per viewport to maintain its high-impact status. The text on this color must be `{colors.on-primary}`.
*   **Primary Text (`{colors.ink}`):** This dark, earthy charcoal is the default color for all primary text, including headings and body copy. It provides excellent contrast on light surfaces. It is also used as a background for high-contrast inverted components, like the main navigation button, where text becomes `{colors.on-ink}`.
*   **Secondary Text (`{colors.ink-soft}`):** Use this lighter gray for secondary information, such as subheadings, descriptive text, or placeholder content in form fields. It reduces the emphasis of less critical text, creating a clear visual hierarchy.
*   **Main Background (`{colors.canvas}`):** This is the foundational color for all pages. It's a warm, comfortable off-white that serves as the base layer for all other content.
*   **Component Surface (`{colors.paper}`):** Use this slightly brighter, cleaner white for the background of contained components that sit on top of `{colors.canvas}`, such as cards, modals, or the main product UI frame. This creates a subtle layering effect.
*   **Tertiary Surface / Dividers (`{colors.cloud}`):** This light, earthy gray is used for large background areas that need to be distinct from the main canvas, such as the page footer. It's also an effective hover state background for secondary buttons.
*   **Borders (`{colors.hairline}`):** This very light gray should be used for subtle borders on components like secondary buttons or cards to provide definition without adding visual noise. Use `{colors.hairline-strong}` for emphasized borders, such as on hover states.
*   **Links (`{colors.link}`):** This muted, earthy green-gray is for all inline and footer text links. It is distinct from body text but not overly aggressive. It should change to `{colors.ink}` on hover.
*   **Accent Pastels (`{colors.accent-*}`):** The pastel family—`{colors.accent-lavender}`, `{colors.accent-mint}`, `{colors.accent-peach}`, and `{colors.accent-yellow}`—is reserved for decorative and illustrative purposes only. They are used in the floating blobs and avatars to add personality. They must not be used for functional UI elements like buttons or status tags.
*   **Mossy Green (`{colors.accent-moss}`):** This color, along with its text color `{colors.on-accent-moss}`, is used for secondary or contextual actions within the product UI, such as channel tags or status indicators.

## Typography Hierarchy
All typographic roles, from the largest headings to the smallest captions, are set in **DM Sans Variable**. This unified approach creates a cohesive and consistent voice. For any instance of code snippets or tabular data where alignment is key, **DM Mono** should be used. The hierarchy is defined by significant jumps in font size and weight, creating a clear rhythm and flow for the user to follow.

| Role           | Token                | Use                                                                 |
|----------------|----------------------|---------------------------------------------------------------------|
| Display XXL    | `{typography.display-xl}`  | Reserved for the main "hero" headline on landing pages.             |
| Display Large  | `{typography.display-lg}`  | For major section titles or secondary-level hero text.              |
| Display Medium | `{typography.display-md}`  | For sub-sections or prominent call-outs within a page.              |
| Body Large     | `{typography.body-lg}`     | For introductory paragraphs or standfirsts directly below a headline. |
| Body Medium    | `{typography.body-md}`     | The default style for all standard paragraph text.                  |
| Button Large   | `{typography.button-lg}`   | For primary and secondary call-to-action buttons.                   |
| Button Medium  | `{typography.button-md}`   | For smaller, tertiary buttons like those in a navigation bar.       |
| Link Medium    | `{typography.link-md}`     | For all standalone text links, such as in the footer.               |
| Caption Medium | `{typography.caption-md}`  | For metadata, UI labels, and other small informational text.        |
| Caption Small  | `{typography.caption-sm}`  | For the smallest text elements, like timestamps or notification badges. |
| Code Medium    | `{typography.code-md}`     | For displaying code snippets or pre-formatted text.                 |

### Typographic Principles
1.  **Unified Voice:** By using a single font family, `DM Sans Variable`, for all UI and marketing text, the brand maintains a strong, consistent personality that is both modern and friendly.
2.  **Clear Hierarchy through Scale:** Emphasis and structure are created primarily through dramatic changes in size and weight (e.g., `{typography.display-xl}` at 99px/800wt vs. `{typography.body-md}` at 16px/400wt), not through color or style.
3.  **Comfortable Readability:** All body copy (`{typography.body-lg}`, `{typography.body-md}`) maintains a generous `lineHeight` of 1.4 or 1.5 to ensure comfortable long-form reading.
4.  **High Contrast is Default:** All text, by default, uses `{colors.ink}` on a `{colors.canvas}` or `{colors.paper}` background, ensuring legibility is never compromised.
5.  **Expressive Headlines:** The heaviest weights of the font are reserved for headlines, giving them a bold, impactful presence that anchors the page layout.

## Component Patterns
Components are the reusable building blocks of the Traka interface. They are designed to be composed together to create clean, functional, and aesthetically pleasing layouts.

*   **Card:** The `{card}` component is a fundamental surface for containing a block of related content or a piece of UI. It is defined by its `{colors.paper}` background, `{rounded.sm}` corners, and `{shadows.card}`. This gentle shadow lifts it off the `{colors.canvas}` background, creating a clear focal point. Use it to display the main application view, feature summaries, or user-generated content blocks.

*   **Primary Button:** The `{button-primary}` is the most powerful action on the screen. It uses the brand's `{colors.primary}` background and `{colors.on-primary}` text for maximum visibility. It signals the single most important next step for the user. On hover, it transitions to `{colors.primary-bright}` and gains a `{shadows.soft-lift}` over `{motion.duration-fast}` to provide tactile feedback. All buttons must use `cursor: pointer`.

*   **Secondary Button:** For important but non-primary actions, like "Star on GitHub", use the `{button-secondary}`. It has a transparent background and a `{colors.hairline}` border, making it less visually demanding. Its text is `{colors.ink-soft}`. On hover, its background smoothly fades to `{colors.cloud}` over `{motion.duration-base}`, and its border darkens to `{colors.hairline-strong}`. All buttons must use `cursor: pointer`.

*   **Tertiary Button:** The `{button-tertiary}`, seen in the main navigation, is for persistent, secondary actions. It inverts the color scheme with a `{colors.ink}` background and `{colors.on-ink}` text, making it stand out without using the primary brand color. Its small `{rounded.xs}` radius and `{typography.button-md}` text give it a compact, utilitarian feel. It transitions to `{colors.ink-soft}` on hover. All buttons must use `cursor: pointer`.

*   **Link:** Standard text links use the `{link}` style. They should be colored with `{colors.link}` to distinguish them from surrounding `{colors.ink}` body text. They carry no underline by default. On hover, their color changes to `{colors.ink}` over `{motion.duration-fast}`. All links must use `cursor: pointer`.

*   **Badge:** The `{badge}` component is a small, `{rounded.pill}` element used to display short status information, most commonly a notification count. It uses an inverted color scheme of `{colors.ink}` background and `{colors.on-ink}` text for high visibility, and its typography is set in the compact `{typography.caption-sm}`.

## Layout & Spacing
The layout of Traka is built on a foundation of generous whitespace and a consistent, rhythmic spacing scale. This creates a calm, uncluttered experience that allows content and UI elements to breathe.

The core of the system is the spacing scale, which ranges from `{spacing.xxs}` (4px) for micro-adjustments within components to `{spacing.section}` (80px) for defining the large vertical gaps between major page sections. All padding, margins, and gaps between elements must use a value from this scale. Do not use arbitrary pixel values. For example, padding within a button might be `{spacing.sm}`, while the gap between a heading and its subsequent paragraph should be `{spacing.lg}`.

The page structure is predominantly a single-column, centered layout, especially for marketing and content pages. The maximum width of this content column is typically around 1280px. This ensures comfortable line lengths and focuses the user's attention.

Section breaks are significant and are a key part of the layout rhythm. A typical section ends, and a new one begins with a vertical space of `{spacing.section}`. Some sections are visually separated by changing the background color. For instance, the main content might live on `{colors.canvas}`, while a concluding footer section sits on a full-width band of `{colors.cloud}`.

Within components, spacing is just as deliberate. The `{card}` component uses `{spacing.lg}` for its internal padding, giving its content ample room. Grids of items, like the illustrative avatars, should use a consistent gap, such as `{spacing.md}` or `{spacing.lg}`, in both horizontal and vertical dimensions.

## Do's and Don'ts

### Do's
1.  **Do** compose all surfaces from `{colors.canvas}`, `{colors.paper}`, and `{colors.cloud}`; do not introduce new background hues.
2.  **Do** use the established spacing scale for all layout. Use `{spacing.*}` tokens for padding, gaps, and section rhythm—no arbitrary px values.
3.  **Do** use `DM Sans Variable` for all headings and body copy, and `DM Mono` for code.
4.  **Do** reserve `{colors.primary}` for the single, most important call-to-action per view to maximize its impact.
5.  **Do** apply `{shadows.card}` to primary UI containers to give them subtle depth and focus.
6.  **Do** ensure every interactive element, including links, buttons, and tabs, explicitly sets `cursor: pointer`.
7.  **Do** build a clear hierarchy using the defined typography scale, such as pairing a `{typography.display-md}` headline with `{typography.body-md}` text.
8.  **Do** use the `{colors.accent-*}` pastel palette for purely decorative illustrations to add personality without distracting from core functionality.

### Don'ts
1.  **Don't** ever add a box-shadow unless it maps to a real `{shadows.*}` token. If the design is flat, it must stay flat.
2.  **Don't** ever leave the browser-default arrow cursor on a link, button, or other clickable element.
3.  **Don't** invent new colors or spacing values. Always reuse tokens from the established system.
4.  **Don't** overuse `{colors.primary}`. It is for emphasis; using it on more than two elements in a viewport dilutes its power.
5.  **Don't** use pastels like `{colors.accent-lavender}` or `{colors.accent-mint}` for functional UI elements like text links or buttons.
6.  **Don't** use `{rounded.pill}` on anything larger than a small badge or tag.
7.  **Don't** forget to define hover and focus states for all interactive components, using `{motion.transition-default}` for smooth feedback.
8.  **Don't** make text smaller than specified in `{typography.caption-sm}` to ensure universal accessibility.

## Responsive Behavior
Traka employs a fluid responsive strategy, ensuring a seamless experience across all device sizes. The layout adapts gracefully from large desktops down to small mobile screens.

| Breakpoint      | Viewport Width | Strategy                                                                                                                                |
|-----------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Mobile          | < 480px        | Single-column layout. Nav collapses to a hamburger menu. Hero text `{typography.display-xl}` scales down significantly. Gaps use smaller `{spacing}` tokens. |
| Mobile-Large    | 480px–767px    | Primarily single-column. Increased font sizes and spacing. Two-column grids for simple cards might appear.                               |
| Tablet          | 768px–1023px   | Wider single-column for content. Sidebars or two-column layouts appear for application views. Nav may remain collapsed or expand.       |
| Desktop         | 1024px–1279px  | The standard desktop experience. Content is centered in a max-width container. Multi-column layouts are common. Full navigation is visible. |
| Desktop-Large   | ≥ 1280px       | Layout width is capped to preserve readability. Margins increase to center the content. Background graphics may have more space to breathe. |

**Touch Targets:** All interactive elements must have a minimum touch target size of 44x44px on mobile and tablet breakpoints to ensure accessibility and ease of use. Buttons like `{button-primary}` naturally meet this, but smaller elements like links or icon buttons may need additional invisible padding to meet the requirement.

**Component Behavior:**
*   **Navigation:** The main navigation bar collapses into a hamburger menu icon on Tablet and smaller breakpoints. The `{button-tertiary}` "Get started" CTA may remain visible or move into the menu.
*   **Hero Section:** The `{typography.display-xl}` headline will scale down aggressively on smaller screens. The surrounding illustrative "blobs" may be reduced in number or repositioned to avoid clutter.
*   **Grids:** Multi-column grids (like the collection of avatars) will wrap into fewer columns or a single column on smaller screens.
*   **Images & UI Mockups:** The product UI mockup image will scale down proportionally to fit the viewport width, maintaining its aspect ratio.

## Iteration Guide
When building a new page or feature in the Traka style, follow these steps to ensure consistency and quality.

1.  **Start with the Foundation:** Begin every layout with `{colors.canvas}` as the page background. Structure the main content areas with generous vertical rhythm using `{spacing.section}`.
2.  **Establish Hierarchy with Typography:** Build out the text content using the established typography scale. Use `{typography.display-lg}` or `{typography.display-md}` for section headings and `{typography.body-md}` for all paragraphs. Ensure the text color is `{colors.ink}` for maximum readability.
3.  **Use the Spacing Scale:** Apply tokens from the `{spacing}` scale for all margins, padding, and gaps. Resist the urge to use custom pixel values. Consistent spacing is key to the clean, rhythmic feel.
4.  **Place the Primary Action:** Identify the single most important action on the page and implement it using a `{button-primary}`. Ensure it is the only element using `{colors.primary}` in the main viewport. All secondary actions should use `{button-secondary}`.
5.  **Contain Content with Cards:** For complex UI sections or distinct content modules, use the `{card}` component. This will lift the content off the background using `{colors.paper}` and `{shadows.card}`, creating a clear focal point.
6.  **Implement Interactive States:** For every button, link, or interactive element, define its hover and focus state. Transitions should use `{motion.transition-default}`. All clickable elements must have `cursor: pointer`.
7.  **Add Personality Sparingly:** Once the core structure is in place, add decorative flair using the `{colors.accent-*}` palette. These should be used for background blobs, icons, or illustrations, not for functional UI.
8.  **Review for Consistency:** Check that all colors, fonts, spacing values, and shadows map directly to a token in the design system.
9.  **Test Responsiveness:** View the layout at each of the defined breakpoints (Mobile, Tablet, Desktop) and ensure it reflows gracefully, maintaining readability and usability. Check that touch targets are sufficiently large on smaller screens.
10. **Final Polish:** Read through all copy to ensure it matches the brand's friendly and welcoming tone. Check for visual alignment and rhythm across all elements.
name: traka-design
description: Use this skill when you need to design or develop components for Traka, a cash-friendly ledger for Nigerian market traders and small shops. This skill covers Traka's friendly, organic, and modern design system, including its color palette with primary green (#0e6b4a) and accent colors like lavender and mint, as well as its typography using DM Sans Variable for various display and body text sizes.
---
```yaml
brand: Traka
mood: A friendly, organic, and modern space that helps Nigerian traders write each market day down.
scheme: light
colors:
  primary: "#0e6b4a"
  primary-bright: "#14925f"
  primary-deep: "#0a4a33"
  on-primary: "#ffffff"
  ink: "#292a26"
  ink-soft: "#56584f"
  on-ink: "#f8f7f4"
  canvas: "#f8f7f4"
  paper: "#fffefa"
  cloud: "#eaece2"
  hairline: "#e5e4df"
  hairline-strong: "#d6d5cf"
  link: "#979e8b"
  link-pressed: "#7b8960"
  success: "#cceedd"
  warning: "#ffe9af"
  error: "#ffd9ca"
  accent-lavender: "#dcd8ff"
  accent-mint: "#cceedd"
  accent-peach: "#ffd9ca"
  accent-yellow: "#ffe9af"
  accent-moss: "#e0e6d3"
  on-accent-moss: "#4d5b37"
typography:
  display-xl:
    fontFamily: DM Sans Variable
    fontSize: 99px
    fontWeight: 800
    lineHeight: 1.1
  display-lg:
    fontFamily: DM Sans Variable
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.15
  display-md:
    fontFamily: DM Sans Variable
    fontSize: 44px
    fontWeight: 800
    lineHeight: 1.2
  body-lg:
    fontFamily: DM Sans Variable
    fontSize: 23px
    fontWeight: 400
    lineHeight: 1.4
  body-md:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  button-lg:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1
  button-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 650
    lineHeight: 1
  link-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.5
  caption-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  caption-sm:
    fontFamily: DM Sans Variable
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.4
  code-md:
    fontFamily: DM Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 13px
  lg: 22px
  xl: 36px
  pill: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px
shadows:
  none: none
  soft-lift: rgba(41, 42, 38, 0.16) 0px 5px 18px 0px
  card: rgba(48, 49, 39, 0.01) 0px 3px 1px 0px, rgba(36, 38, 19, 0.04) 0px 18px 60px 0px
  modal: rgba(0, 0, 0, 0.28) 0px 24px 70px 0px
motion:
  duration-fast: 150ms
  duration-base: 200ms
  ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
  transition-default: all {motion.duration-fast} {motion.ease-standard}
components:
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
    shadow: "{shadows.card}"
    border: 1px solid {colors.hairline}
  button-primary:
    backgroundColor: "{colors.primary}"
    color: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 14px 22px
    typography: "{typography.button-lg}"
    shadow: "{shadows.none}"
    cursor: pointer
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
    shadow: "{shadows.soft-lift}"
  button-secondary:
    backgroundColor: transparent
    color: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: 14px 22px
    typography: "{typography.button-lg}"
    border: 1px solid {colors.hairline}
    cursor: pointer
  button-secondary-hover:
    backgroundColor: "{colors.cloud}"
    borderColor: "{colors.hairline-strong}"
  button-tertiary:
    backgroundColor: "{colors.ink}"
    color: "{colors.on-ink}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.button-md}"
    cursor: pointer
  button-tertiary-hover:
    backgroundColor: "{colors.ink-soft}"
  link:
    color: "{colors.link}"
    typography: "{typography.link-md}"
    textDecoration: none
    cursor: pointer
  link-hover:
    color: "{colors.ink}"
  badge:
    backgroundColor: "{colors.ink}"
    color: "{colors.on-ink}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xxs} {spacing.xs}"
    typography: "{typography.caption-sm}"
```

## Visual Theme & Atmosphere
The Traka design system projects a feeling of warmth, creativity, and approachable friendliness. It's a digital space that feels handcrafted and human, encouraging genuine connection rather than sterile interaction. The atmosphere is light and airy, built on a foundation of warm off-whites like `{colors.canvas}`, but punctuated by a soft, pleasant green (`{colors.primary}`) that injects calm confidence. The overall mood is optimistic and welcoming, using soft, rounded shapes, gentle shadows, and a friendly, bold heading font to make users feel at home. It straddles the line between a playful, quirky startup and a clean, modern application, suggesting that powerful tools can also be joyful to use.

Key Characteristics:
*   **Warm & Airy Base:** The primary background is `{colors.canvas}`, a soft, warm white, creating a comfortable and inviting environment that avoids clinical starkness.
*   **Energetic Primary Color:** The brand's identity is carried by `{colors.primary}`, a vibrant green used sparingly for maximum impact on key calls to action.
*   **Friendly Typography:** Headings set in `{typography.display-xl}` are bold and heavy, but their rounded letterforms feel welcoming and informal, like a friendly greeting.
*   **Soft, Organic Shapes:** Elements feature subtle rounding, from `{rounded.xs}` on small buttons to `{rounded.lg}` on decorative blobs. This avoids sharp, corporate edges and contributes to the organic feel.
*   **Subtle Depth:** While mostly flat, the design uses `{shadows.card}` to gently lift important UI panels like the main application interface, creating a subtle, tangible sense of depth and focus.
*   **Playful Accents:** A palette of soft pastels like `{colors.accent-lavender}` and `{colors.accent-mint}` are used for illustrative elements, adding a touch of whimsy and personality.
*   **High-Contrast Readability:** Text is primarily set in `{colors.ink}`, a near-black, ensuring excellent readability against the light `{colors.canvas}` and `{colors.paper}` backgrounds.

## Color Usage Rules
The color palette is intentionally focused to create a consistent and harmonious user experience. An agent should primarily compose UIs using the core functional colors: `{colors.canvas}`, `{colors.paper}`, `{colors.cloud}`, `{colors.ink}`, and `{colors.primary}`. New colors should never be introduced; always find the best fit from the existing token set.

*   **Primary Action Color (`{colors.primary}`):** This vibrant green is the brand's signature. Use it exclusively for the most critical call-to-action on any given screen, such as a "Sign Up" or "Find Your People" button. It must not appear more than once or twice per viewport to maintain its high-impact status. The text on this color must be `{colors.on-primary}`.
*   **Primary Text (`{colors.ink}`):** This dark, earthy charcoal is the default color for all primary text, including headings and body copy. It provides excellent contrast on light surfaces. It is also used as a background for high-contrast inverted components, like the main navigation button, where text becomes `{colors.on-ink}`.
*   **Secondary Text (`{colors.ink-soft}`):** Use this lighter gray for secondary information, such as subheadings, descriptive text, or placeholder content in form fields. It reduces the emphasis of less critical text, creating a clear visual hierarchy.
*   **Main Background (`{colors.canvas}`):** This is the foundational color for all pages. It's a warm, comfortable off-white that serves as the base layer for all other content.
*   **Component Surface (`{colors.paper}`):** Use this slightly brighter, cleaner white for the background of contained components that sit on top of `{colors.canvas}`, such as cards, modals, or the main product UI frame. This creates a subtle layering effect.
*   **Tertiary Surface / Dividers (`{colors.cloud}`):** This light, earthy gray is used for large background areas that need to be distinct from the main canvas, such as the page footer. It's also an effective hover state background for secondary buttons.
*   **Borders (`{colors.hairline}`):** This very light gray should be used for subtle borders on components like secondary buttons or cards to provide definition without adding visual noise. Use `{colors.hairline-strong}` for emphasized borders, such as on hover states.
*   **Links (`{colors.link}`):** This muted, earthy green-gray is for all inline and footer text links. It is distinct from body text but not overly aggressive. It should change to `{colors.ink}` on hover.
*   **Accent Pastels (`{colors.accent-*}`):** The pastel family—`{colors.accent-lavender}`, `{colors.accent-mint}`, `{colors.accent-peach}`, and `{colors.accent-yellow}`—is reserved for decorative and illustrative purposes only. They are used in the floating blobs and avatars to add personality. They must not be used for functional UI elements like buttons or status tags.
*   **Mossy Green (`{colors.accent-moss}`):** This color, along with its text color `{colors.on-accent-moss}`, is used for secondary or contextual actions within the product UI, such as channel tags or status indicators.

## Typography Hierarchy
All typographic roles, from the largest headings to the smallest captions, are set in **DM Sans Variable**. This unified approach creates a cohesive and consistent voice. For any instance of code snippets or tabular data where alignment is key, **DM Mono** should be used. The hierarchy is defined by significant jumps in font size and weight, creating a clear rhythm and flow for the user to follow.

| Role           | Token                | Use                                                                 |
|----------------|----------------------|---------------------------------------------------------------------|
| Display XXL    | `{typography.display-xl}`  | Reserved for the main "hero" headline on landing pages.             |
| Display Large  | `{typography.display-lg}`  | For major section titles or secondary-level hero text.              |
| Display Medium | `{typography.display-md}`  | For sub-sections or prominent call-outs within a page.              |
| Body Large     | `{typography.body-lg}`     | For introductory paragraphs or standfirsts directly below a headline. |
| Body Medium    | `{typography.body-md}`     | The default style for all standard paragraph text.                  |
| Button Large   | `{typography.button-lg}`   | For primary and secondary call-to-action buttons.                   |
| Button Medium  | `{typography.button-md}`   | For smaller, tertiary buttons like those in a navigation bar.       |
| Link Medium    | `{typography.link-md}`     | For all standalone text links, such as in the footer.               |
| Caption Medium | `{typography.caption-md}`  | For metadata, UI labels, and other small informational text.        |
| Caption Small  | `{typography.caption-sm}`  | For the smallest text elements, like timestamps or notification badges. |
| Code Medium    | `{typography.code-md}`     | For displaying code snippets or pre-formatted text.                 |

### Typographic Principles
1.  **Unified Voice:** By using a single font family, `DM Sans Variable`, for all UI and marketing text, the brand maintains a strong, consistent personality that is both modern and friendly.
2.  **Clear Hierarchy through Scale:** Emphasis and structure are created primarily through dramatic changes in size and weight (e.g., `{typography.display-xl}` at 99px/800wt vs. `{typography.body-md}` at 16px/400wt), not through color or style.
3.  **Comfortable Readability:** All body copy (`{typography.body-lg}`, `{typography.body-md}`) maintains a generous `lineHeight` of 1.4 or 1.5 to ensure comfortable long-form reading.
4.  **High Contrast is Default:** All text, by default, uses `{colors.ink}` on a `{colors.canvas}` or `{colors.paper}` background, ensuring legibility is never compromised.
5.  **Expressive Headlines:** The heaviest weights of the font are reserved for headlines, giving them a bold, impactful presence that anchors the page layout.

## Component Patterns
Components are the reusable building blocks of the Traka interface. They are designed to be composed together to create clean, functional, and aesthetically pleasing layouts.

*   **Card:** The `{card}` component is a fundamental surface for containing a block of related content or a piece of UI. It is defined by its `{colors.paper}` background, `{rounded.sm}` corners, and `{shadows.card}`. This gentle shadow lifts it off the `{colors.canvas}` background, creating a clear focal point. Use it to display the main application view, feature summaries, or user-generated content blocks.

*   **Primary Button:** The `{button-primary}` is the most powerful action on the screen. It uses the brand's `{colors.primary}` background and `{colors.on-primary}` text for maximum visibility. It signals the single most important next step for the user. On hover, it transitions to `{colors.primary-bright}` and gains a `{shadows.soft-lift}` over `{motion.duration-fast}` to provide tactile feedback. All buttons must use `cursor: pointer`.

*   **Secondary Button:** For important but non-primary actions, like "Star on GitHub", use the `{button-secondary}`. It has a transparent background and a `{colors.hairline}` border, making it less visually demanding. Its text is `{colors.ink-soft}`. On hover, its background smoothly fades to `{colors.cloud}` over `{motion.duration-base}`, and its border darkens to `{colors.hairline-strong}`. All buttons must use `cursor: pointer`.

*   **Tertiary Button:** The `{button-tertiary}`, seen in the main navigation, is for persistent, secondary actions. It inverts the color scheme with a `{colors.ink}` background and `{colors.on-ink}` text, making it stand out without using the primary brand color. Its small `{rounded.xs}` radius and `{typography.button-md}` text give it a compact, utilitarian feel. It transitions to `{colors.ink-soft}` on hover. All buttons must use `cursor: pointer`.

*   **Link:** Standard text links use the `{link}` style. They should be colored with `{colors.link}` to distinguish them from surrounding `{colors.ink}` body text. They carry no underline by default. On hover, their color changes to `{colors.ink}` over `{motion.duration-fast}`. All links must use `cursor: pointer`.

*   **Badge:** The `{badge}` component is a small, `{rounded.pill}` element used to display short status information, most commonly a notification count. It uses an inverted color scheme of `{colors.ink}` background and `{colors.on-ink}` text for high visibility, and its typography is set in the compact `{typography.caption-sm}`.

## Layout & Spacing
The layout of Traka is built on a foundation of generous whitespace and a consistent, rhythmic spacing scale. This creates a calm, uncluttered experience that allows content and UI elements to breathe.

The core of the system is the spacing scale, which ranges from `{spacing.xxs}` (4px) for micro-adjustments within components to `{spacing.section}` (80px) for defining the large vertical gaps between major page sections. All padding, margins, and gaps between elements must use a value from this scale. Do not use arbitrary pixel values. For example, padding within a button might be `{spacing.sm}`, while the gap between a heading and its subsequent paragraph should be `{spacing.lg}`.

The page structure is predominantly a single-column, centered layout, especially for marketing and content pages. The maximum width of this content column is typically around 1280px. This ensures comfortable line lengths and focuses the user's attention.

Section breaks are significant and are a key part of the layout rhythm. A typical section ends, and a new one begins with a vertical space of `{spacing.section}`. Some sections are visually separated by changing the background color. For instance, the main content might live on `{colors.canvas}`, while a concluding footer section sits on a full-width band of `{colors.cloud}`.

Within components, spacing is just as deliberate. The `{card}` component uses `{spacing.lg}` for its internal padding, giving its content ample room. Grids of items, like the illustrative avatars, should use a consistent gap, such as `{spacing.md}` or `{spacing.lg}`, in both horizontal and vertical dimensions.

## Do's and Don'ts

### Do's
1.  **Do** compose all surfaces from `{colors.canvas}`, `{colors.paper}`, and `{colors.cloud}`; do not introduce new background hues.
2.  **Do** use the established spacing scale for all layout. Use `{spacing.*}` tokens for padding, gaps, and section rhythm—no arbitrary px values.
3.  **Do** use `DM Sans Variable` for all headings and body copy, and `DM Mono` for code.
4.  **Do** reserve `{colors.primary}` for the single, most important call-to-action per view to maximize its impact.
5.  **Do** apply `{shadows.card}` to primary UI containers to give them subtle depth and focus.
6.  **Do** ensure every interactive element, including links, buttons, and tabs, explicitly sets `cursor: pointer`.
7.  **Do** build a clear hierarchy using the defined typography scale, such as pairing a `{typography.display-md}` headline with `{typography.body-md}` text.
8.  **Do** use the `{colors.accent-*}` pastel palette for purely decorative illustrations to add personality without distracting from core functionality.

### Don'ts
1.  **Don't** ever add a box-shadow unless it maps to a real `{shadows.*}` token. If the design is flat, it must stay flat.
2.  **Don't** ever leave the browser-default arrow cursor on a link, button, or other clickable element.
3.  **Don't** invent new colors or spacing values. Always reuse tokens from the established system.
4.  **Don't** overuse `{colors.primary}`. It is for emphasis; using it on more than two elements in a viewport dilutes its power.
5.  **Don't** use pastels like `{colors.accent-lavender}` or `{colors.accent-mint}` for functional UI elements like text links or buttons.
6.  **Don't** use `{rounded.pill}` on anything larger than a small badge or tag.
7.  **Don't** forget to define hover and focus states for all interactive components, using `{motion.transition-default}` for smooth feedback.
8.  **Don't** make text smaller than specified in `{typography.caption-sm}` to ensure universal accessibility.

## Responsive Behavior
Traka employs a fluid responsive strategy, ensuring a seamless experience across all device sizes. The layout adapts gracefully from large desktops down to small mobile screens.

| Breakpoint      | Viewport Width | Strategy                                                                                                                                |
|-----------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Mobile          | < 480px        | Single-column layout. Nav collapses to a hamburger menu. Hero text `{typography.display-xl}` scales down significantly. Gaps use smaller `{spacing}` tokens. |
| Mobile-Large    | 480px–767px    | Primarily single-column. Increased font sizes and spacing. Two-column grids for simple cards might appear.                               |
| Tablet          | 768px–1023px   | Wider single-column for content. Sidebars or two-column layouts appear for application views. Nav may remain collapsed or expand.       |
| Desktop         | 1024px–1279px  | The standard desktop experience. Content is centered in a max-width container. Multi-column layouts are common. Full navigation is visible. |
| Desktop-Large   | ≥ 1280px       | Layout width is capped to preserve readability. Margins increase to center the content. Background graphics may have more space to breathe. |

**Touch Targets:** All interactive elements must have a minimum touch target size of 44x44px on mobile and tablet breakpoints to ensure accessibility and ease of use. Buttons like `{button-primary}` naturally meet this, but smaller elements like links or icon buttons may need additional invisible padding to meet the requirement.

**Component Behavior:**
*   **Navigation:** The main navigation bar collapses into a hamburger menu icon on Tablet and smaller breakpoints. The `{button-tertiary}` "Get started" CTA may remain visible or move into the menu.
*   **Hero Section:** The `{typography.display-xl}` headline will scale down aggressively on smaller screens. The surrounding illustrative "blobs" may be reduced in number or repositioned to avoid clutter.
*   **Grids:** Multi-column grids (like the collection of avatars) will wrap into fewer columns or a single column on smaller screens.
*   **Images & UI Mockups:** The product UI mockup image will scale down proportionally to fit the viewport width, maintaining its aspect ratio.

## Iteration Guide
When building a new page or feature in the Traka style, follow these steps to ensure consistency and quality.

1.  **Start with the Foundation:** Begin every layout with `{colors.canvas}` as the page background. Structure the main content areas with generous vertical rhythm using `{spacing.section}`.
2.  **Establish Hierarchy with Typography:** Build out the text content using the established typography scale. Use `{typography.display-lg}` or `{typography.display-md}` for section headings and `{typography.body-md}` for all paragraphs. Ensure the text color is `{colors.ink}` for maximum readability.
3.  **Use the Spacing Scale:** Apply tokens from the `{spacing}` scale for all margins, padding, and gaps. Resist the urge to use custom pixel values. Consistent spacing is key to the clean, rhythmic feel.
4.  **Place the Primary Action:** Identify the single most important action on the page and implement it using a `{button-primary}`. Ensure it is the only element using `{colors.primary}` in the main viewport. All secondary actions should use `{button-secondary}`.
5.  **Contain Content with Cards:** For complex UI sections or distinct content modules, use the `{card}` component. This will lift the content off the background using `{colors.paper}` and `{shadows.card}`, creating a clear focal point.
6.  **Implement Interactive States:** For every button, link, or interactive element, define its hover and focus state. Transitions should use `{motion.transition-default}`. All clickable elements must have `cursor: pointer`.
7.  **Add Personality Sparingly:** Once the core structure is in place, add decorative flair using the `{colors.accent-*}` palette. These should be used for background blobs, icons, or illustrations, not for functional UI.
8.  **Review for Consistency:** Check that all colors, fonts, spacing values, and shadows map directly to a token in the design system.
9.  **Test Responsiveness:** View the layout at each of the defined breakpoints (Mobile, Tablet, Desktop) and ensure it reflows gracefully, maintaining readability and usability. Check that touch targets are sufficiently large on smaller screens.
10. **Final Polish:** Read through all copy to ensure it matches the brand's friendly and welcoming tone. Check for visual alignment and rhythm across all elements.
name: traka-design
description: Use this skill when you need to design or develop components for Traka, a cash-friendly ledger for Nigerian market traders and small shops. This skill covers Traka's friendly, organic, and modern design system, including its color palette with primary green (#0e6b4a) and accent colors like lavender and mint, as well as its typography using DM Sans Variable for various display and body text sizes.
---
```yaml
brand: Traka
mood: A friendly, organic, and modern space that helps Nigerian traders write each market day down.
scheme: light
colors:
  primary: "#0e6b4a"
  primary-bright: "#14925f"
  primary-deep: "#0a4a33"
  on-primary: "#ffffff"
  ink: "#292a26"
  ink-soft: "#56584f"
  on-ink: "#f8f7f4"
  canvas: "#f8f7f4"
  paper: "#fffefa"
  cloud: "#eaece2"
  hairline: "#e5e4df"
  hairline-strong: "#d6d5cf"
  link: "#979e8b"
  link-pressed: "#7b8960"
  success: "#cceedd"
  warning: "#ffe9af"
  error: "#ffd9ca"
  accent-lavender: "#dcd8ff"
  accent-mint: "#cceedd"
  accent-peach: "#ffd9ca"
  accent-yellow: "#ffe9af"
  accent-moss: "#e0e6d3"
  on-accent-moss: "#4d5b37"
typography:
  display-xl:
    fontFamily: DM Sans Variable
    fontSize: 99px
    fontWeight: 800
    lineHeight: 1.1
  display-lg:
    fontFamily: DM Sans Variable
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.15
  display-md:
    fontFamily: DM Sans Variable
    fontSize: 44px
    fontWeight: 800
    lineHeight: 1.2
  body-lg:
    fontFamily: DM Sans Variable
    fontSize: 23px
    fontWeight: 400
    lineHeight: 1.4
  body-md:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  button-lg:
    fontFamily: DM Sans Variable
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1
  button-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 650
    lineHeight: 1
  link-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.5
  caption-md:
    fontFamily: DM Sans Variable
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  caption-sm:
    fontFamily: DM Sans Variable
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.4
  code-md:
    fontFamily: DM Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 13px
  lg: 22px
  xl: 36px
  pill: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px
shadows:
  none: none
  soft-lift: rgba(41, 42, 38, 0.16) 0px 5px 18px 0px
  card: rgba(48, 49, 39, 0.01) 0px 3px 1px 0px, rgba(36, 38, 19, 0.04) 0px 18px 60px 0px
  modal: rgba(0, 0, 0, 0.28) 0px 24px 70px 0px
motion:
  duration-fast: 150ms
  duration-base: 200ms
  ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
  transition-default: all {motion.duration-fast} {motion.ease-standard}
components:
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
    shadow: "{shadows.card}"
    border: 1px solid {colors.hairline}
  button-primary:
    backgroundColor: "{colors.primary}"
    color: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 14px 22px
    typography: "{typography.button-lg}"
    shadow: "{shadows.none}"
    cursor: pointer
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
    shadow: "{shadows.soft-lift}"
  button-secondary:
    backgroundColor: transparent
    color: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: 14px 22px
    typography: "{typography.button-lg}"
    border: 1px solid {colors.hairline}
    cursor: pointer
  button-secondary-hover:
    backgroundColor: "{colors.cloud}"
    borderColor: "{colors.hairline-strong}"
  button-tertiary:
    backgroundColor: "{colors.ink}"
    color: "{colors.on-ink}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.button-md}"
    cursor: pointer
  button-tertiary-hover:
    backgroundColor: "{colors.ink-soft}"
  link:
    color: "{colors.link}"
    typography: "{typography.link-md}"
    textDecoration: none
    cursor: pointer
  link-hover:
    color: "{colors.ink}"
  badge:
    backgroundColor: "{colors.ink}"
    color: "{colors.on-ink}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xxs} {spacing.xs}"
    typography: "{typography.caption-sm}"
```

## Visual Theme & Atmosphere
The Traka design system projects a feeling of warmth, creativity, and approachable friendliness. It's a digital space that feels handcrafted and human, encouraging genuine connection rather than sterile interaction. The atmosphere is light and airy, built on a foundation of warm off-whites like `{colors.canvas}`, but punctuated by a soft, pleasant green (`{colors.primary}`) that injects calm confidence. The overall mood is optimistic and welcoming, using soft, rounded shapes, gentle shadows, and a friendly, bold heading font to make users feel at home. It straddles the line between a playful, quirky startup and a clean, modern application, suggesting that powerful tools can also be joyful to use.

Key Characteristics:
*   **Warm & Airy Base:** The primary background is `{colors.canvas}`, a soft, warm white, creating a comfortable and inviting environment that avoids clinical starkness.
*   **Energetic Primary Color:** The brand's identity is carried by `{colors.primary}`, a vibrant green used sparingly for maximum impact on key calls to action.
*   **Friendly Typography:** Headings set in `{typography.display-xl}` are bold and heavy, but their rounded letterforms feel welcoming and informal, like a friendly greeting.
*   **Soft, Organic Shapes:** Elements feature subtle rounding, from `{rounded.xs}` on small buttons to `{rounded.lg}` on decorative blobs. This avoids sharp, corporate edges and contributes to the organic feel.
*   **Subtle Depth:** While mostly flat, the design uses `{shadows.card}` to gently lift important UI panels like the main application interface, creating a subtle, tangible sense of depth and focus.
*   **Playful Accents:** A palette of soft pastels like `{colors.accent-lavender}` and `{colors.accent-mint}` are used for illustrative elements, adding a touch of whimsy and personality.
*   **High-Contrast Readability:** Text is primarily set in `{colors.ink}`, a near-black, ensuring excellent readability against the light `{colors.canvas}` and `{colors.paper}` backgrounds.

## Color Usage Rules
The color palette is intentionally focused to create a consistent and harmonious user experience. An agent should primarily compose UIs using the core functional colors: `{colors.canvas}`, `{colors.paper}`, `{colors.cloud}`, `{colors.ink}`, and `{colors.primary}`. New colors should never be introduced; always find the best fit from the existing token set.

*   **Primary Action Color (`{colors.primary}`):** This vibrant green is the brand's signature. Use it exclusively for the most critical call-to-action on any given screen, such as a "Sign Up" or "Find Your People" button. It must not appear more than once or twice per viewport to maintain its high-impact status. The text on this color must be `{colors.on-primary}`.
*   **Primary Text (`{colors.ink}`):** This dark, earthy charcoal is the default color for all primary text, including headings and body copy. It provides excellent contrast on light surfaces. It is also used as a background for high-contrast inverted components, like the main navigation button, where text becomes `{colors.on-ink}`.
*   **Secondary Text (`{colors.ink-soft}`):** Use this lighter gray for secondary information, such as subheadings, descriptive text, or placeholder content in form fields. It reduces the emphasis of less critical text, creating a clear visual hierarchy.
*   **Main Background (`{colors.canvas}`):** This is the foundational color for all pages. It's a warm, comfortable off-white that serves as the base layer for all other content.
*   **Component Surface (`{colors.paper}`):** Use this slightly brighter, cleaner white for the background of contained components that sit on top of `{colors.canvas}`, such as cards, modals, or the main product UI frame. This creates a subtle layering effect.
*   **Tertiary Surface / Dividers (`{colors.cloud}`):** This light, earthy gray is used for large background areas that need to be distinct from the main canvas, such as the page footer. It's also an effective hover state background for secondary buttons.
*   **Borders (`{colors.hairline}`):** This very light gray should be used for subtle borders on components like secondary buttons or cards to provide definition without adding visual noise. Use `{colors.hairline-strong}` for emphasized borders, such as on hover states.
*   **Links (`{colors.link}`):** This muted, earthy green-gray is for all inline and footer text links. It is distinct from body text but not overly aggressive. It should change to `{colors.ink}` on hover.
*   **Accent Pastels (`{colors.accent-*}`):** The pastel family—`{colors.accent-lavender}`, `{colors.accent-mint}`, `{colors.accent-peach}`, and `{colors.accent-yellow}`—is reserved for decorative and illustrative purposes only. They are used in the floating blobs and avatars to add personality. They must not be used for functional UI elements like buttons or status tags.
*   **Mossy Green (`{colors.accent-moss}`):** This color, along with its text color `{colors.on-accent-moss}`, is used for secondary or contextual actions within the product UI, such as channel tags or status indicators.

## Typography Hierarchy
All typographic roles, from the largest headings to the smallest captions, are set in **DM Sans Variable**. This unified approach creates a cohesive and consistent voice. For any instance of code snippets or tabular data where alignment is key, **DM Mono** should be used. The hierarchy is defined by significant jumps in font size and weight, creating a clear rhythm and flow for the user to follow.

| Role           | Token                | Use                                                                 |
|----------------|----------------------|---------------------------------------------------------------------|
| Display XXL    | `{typography.display-xl}`  | Reserved for the main "hero" headline on landing pages.             |
| Display Large  | `{typography.display-lg}`  | For major section titles or secondary-level hero text.              |
| Display Medium | `{typography.display-md}`  | For sub-sections or prominent call-outs within a page.              |
| Body Large     | `{typography.body-lg}`     | For introductory paragraphs or standfirsts directly below a headline. |
| Body Medium    | `{typography.body-md}`     | The default style for all standard paragraph text.                  |
| Button Large   | `{typography.button-lg}`   | For primary and secondary call-to-action buttons.                   |
| Button Medium  | `{typography.button-md}`   | For smaller, tertiary buttons like those in a navigation bar.       |
| Link Medium    | `{typography.link-md}`     | For all standalone text links, such as in the footer.               |
| Caption Medium | `{typography.caption-md}`  | For metadata, UI labels, and other small informational text.        |
| Caption Small  | `{typography.caption-sm}`  | For the smallest text elements, like timestamps or notification badges. |
| Code Medium    | `{typography.code-md}`     | For displaying code snippets or pre-formatted text.                 |

### Typographic Principles
1.  **Unified Voice:** By using a single font family, `DM Sans Variable`, for all UI and marketing text, the brand maintains a strong, consistent personality that is both modern and friendly.
2.  **Clear Hierarchy through Scale:** Emphasis and structure are created primarily through dramatic changes in size and weight (e.g., `{typography.display-xl}` at 99px/800wt vs. `{typography.body-md}` at 16px/400wt), not through color or style.
3.  **Comfortable Readability:** All body copy (`{typography.body-lg}`, `{typography.body-md}`) maintains a generous `lineHeight` of 1.4 or 1.5 to ensure comfortable long-form reading.
4.  **High Contrast is Default:** All text, by default, uses `{colors.ink}` on a `{colors.canvas}` or `{colors.paper}` background, ensuring legibility is never compromised.
5.  **Expressive Headlines:** The heaviest weights of the font are reserved for headlines, giving them a bold, impactful presence that anchors the page layout.

## Component Patterns
Components are the reusable building blocks of the Traka interface. They are designed to be composed together to create clean, functional, and aesthetically pleasing layouts.

*   **Card:** The `{card}` component is a fundamental surface for containing a block of related content or a piece of UI. It is defined by its `{colors.paper}` background, `{rounded.sm}` corners, and `{shadows.card}`. This gentle shadow lifts it off the `{colors.canvas}` background, creating a clear focal point. Use it to display the main application view, feature summaries, or user-generated content blocks.

*   **Primary Button:** The `{button-primary}` is the most powerful action on the screen. It uses the brand's `{colors.primary}` background and `{colors.on-primary}` text for maximum visibility. It signals the single most important next step for the user. On hover, it transitions to `{colors.primary-bright}` and gains a `{shadows.soft-lift}` over `{motion.duration-fast}` to provide tactile feedback. All buttons must use `cursor: pointer`.

*   **Secondary Button:** For important but non-primary actions, like "Star on GitHub", use the `{button-secondary}`. It has a transparent background and a `{colors.hairline}` border, making it less visually demanding. Its text is `{colors.ink-soft}`. On hover, its background smoothly fades to `{colors.cloud}` over `{motion.duration-base}`, and its border darkens to `{colors.hairline-strong}`. All buttons must use `cursor: pointer`.

*   **Tertiary Button:** The `{button-tertiary}`, seen in the main navigation, is for persistent, secondary actions. It inverts the color scheme with a `{colors.ink}` background and `{colors.on-ink}` text, making it stand out without using the primary brand color. Its small `{rounded.xs}` radius and `{typography.button-md}` text give it a compact, utilitarian feel. It transitions to `{colors.ink-soft}` on hover. All buttons must use `cursor: pointer`.

*   **Link:** Standard text links use the `{link}` style. They should be colored with `{colors.link}` to distinguish them from surrounding `{colors.ink}` body text. They carry no underline by default. On hover, their color changes to `{colors.ink}` over `{motion.duration-fast}`. All links must use `cursor: pointer`.

*   **Badge:** The `{badge}` component is a small, `{rounded.pill}` element used to display short status information, most commonly a notification count. It uses an inverted color scheme of `{colors.ink}` background and `{colors.on-ink}` text for high visibility, and its typography is set in the compact `{typography.caption-sm}`.

## Layout & Spacing
The layout of Traka is built on a foundation of generous whitespace and a consistent, rhythmic spacing scale. This creates a calm, uncluttered experience that allows content and UI elements to breathe.

The core of the system is the spacing scale, which ranges from `{spacing.xxs}` (4px) for micro-adjustments within components to `{spacing.section}` (80px) for defining the large vertical gaps between major page sections. All padding, margins, and gaps between elements must use a value from this scale. Do not use arbitrary pixel values. For example, padding within a button might be `{spacing.sm}`, while the gap between a heading and its subsequent paragraph should be `{spacing.lg}`.

The page structure is predominantly a single-column, centered layout, especially for marketing and content pages. The maximum width of this content column is typically around 1280px. This ensures comfortable line lengths and focuses the user's attention.

Section breaks are significant and are a key part of the layout rhythm. A typical section ends, and a new one begins with a vertical space of `{spacing.section}`. Some sections are visually separated by changing the background color. For instance, the main content might live on `{colors.canvas}`, while a concluding footer section sits on a full-width band of `{colors.cloud}`.

Within components, spacing is just as deliberate. The `{card}` component uses `{spacing.lg}` for its internal padding, giving its content ample room. Grids of items, like the illustrative avatars, should use a consistent gap, such as `{spacing.md}` or `{spacing.lg}`, in both horizontal and vertical dimensions.

## Do's and Don'ts

### Do's
1.  **Do** compose all surfaces from `{colors.canvas}`, `{colors.paper}`, and `{colors.cloud}`; do not introduce new background hues.
2.  **Do** use the established spacing scale for all layout. Use `{spacing.*}` tokens for padding, gaps, and section rhythm—no arbitrary px values.
3.  **Do** use `DM Sans Variable` for all headings and body copy, and `DM Mono` for code.
4.  **Do** reserve `{colors.primary}` for the single, most important call-to-action per view to maximize its impact.
5.  **Do** apply `{shadows.card}` to primary UI containers to give them subtle depth and focus.
6.  **Do** ensure every interactive element, including links, buttons, and tabs, explicitly sets `cursor: pointer`.
7.  **Do** build a clear hierarchy using the defined typography scale, such as pairing a `{typography.display-md}` headline with `{typography.body-md}` text.
8.  **Do** use the `{colors.accent-*}` pastel palette for purely decorative illustrations to add personality without distracting from core functionality.

### Don'ts
1.  **Don't** ever add a box-shadow unless it maps to a real `{shadows.*}` token. If the design is flat, it must stay flat.
2.  **Don't** ever leave the browser-default arrow cursor on a link, button, or other clickable element.
3.  **Don't** invent new colors or spacing values. Always reuse tokens from the established system.
4.  **Don't** overuse `{colors.primary}`. It is for emphasis; using it on more than two elements in a viewport dilutes its power.
5.  **Don't** use pastels like `{colors.accent-lavender}` or `{colors.accent-mint}` for functional UI elements like text links or buttons.
6.  **Don't** use `{rounded.pill}` on anything larger than a small badge or tag.
7.  **Don't** forget to define hover and focus states for all interactive components, using `{motion.transition-default}` for smooth feedback.
8.  **Don't** make text smaller than specified in `{typography.caption-sm}` to ensure universal accessibility.

## Responsive Behavior
Traka employs a fluid responsive strategy, ensuring a seamless experience across all device sizes. The layout adapts gracefully from large desktops down to small mobile screens.

| Breakpoint      | Viewport Width | Strategy                                                                                                                                |
|-----------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Mobile          | < 480px        | Single-column layout. Nav collapses to a hamburger menu. Hero text `{typography.display-xl}` scales down significantly. Gaps use smaller `{spacing}` tokens. |
| Mobile-Large    | 480px–767px    | Primarily single-column. Increased font sizes and spacing. Two-column grids for simple cards might appear.                               |
| Tablet          | 768px–1023px   | Wider single-column for content. Sidebars or two-column layouts appear for application views. Nav may remain collapsed or expand.       |
| Desktop         | 1024px–1279px  | The standard desktop experience. Content is centered in a max-width container. Multi-column layouts are common. Full navigation is visible. |
| Desktop-Large   | ≥ 1280px       | Layout width is capped to preserve readability. Margins increase to center the content. Background graphics may have more space to breathe. |

**Touch Targets:** All interactive elements must have a minimum touch target size of 44x44px on mobile and tablet breakpoints to ensure accessibility and ease of use. Buttons like `{button-primary}` naturally meet this, but smaller elements like links or icon buttons may need additional invisible padding to meet the requirement.

**Component Behavior:**
*   **Navigation:** The main navigation bar collapses into a hamburger menu icon on Tablet and smaller breakpoints. The `{button-tertiary}` "Get started" CTA may remain visible or move into the menu.
*   **Hero Section:** The `{typography.display-xl}` headline will scale down aggressively on smaller screens. The surrounding illustrative "blobs" may be reduced in number or repositioned to avoid clutter.
*   **Grids:** Multi-column grids (like the collection of avatars) will wrap into fewer columns or a single column on smaller screens.
*   **Images & UI Mockups:** The product UI mockup image will scale down proportionally to fit the viewport width, maintaining its aspect ratio.

## Iteration Guide
When building a new page or feature in the Traka style, follow these steps to ensure consistency and quality.

1.  **Start with the Foundation:** Begin every layout with `{colors.canvas}` as the page background. Structure the main content areas with generous vertical rhythm using `{spacing.section}`.
2.  **Establish Hierarchy with Typography:** Build out the text content using the established typography scale. Use `{typography.display-lg}` or `{typography.display-md}` for section headings and `{typography.body-md}` for all paragraphs. Ensure the text color is `{colors.ink}` for maximum readability.
3.  **Use the Spacing Scale:** Apply tokens from the `{spacing}` scale for all margins, padding, and gaps. Resist the urge to use custom pixel values. Consistent spacing is key to the clean, rhythmic feel.
4.  **Place the Primary Action:** Identify the single most important action on the page and implement it using a `{button-primary}`. Ensure it is the only element using `{colors.primary}` in the main viewport. All secondary actions should use `{button-secondary}`.
5.  **Contain Content with Cards:** For complex UI sections or distinct content modules, use the `{card}` component. This will lift the content off the background using `{colors.paper}` and `{shadows.card}`, creating a clear focal point.
6.  **Implement Interactive States:** For every button, link, or interactive element, define its hover and focus state. Transitions should use `{motion.transition-default}`. All clickable elements must have `cursor: pointer`.
7.  **Add Personality Sparingly:** Once the core structure is in place, add decorative flair using the `{colors.accent-*}` palette. These should be used for background blobs, icons, or illustrations, not for functional UI.
8.  **Review for Consistency:** Check that all colors, fonts, spacing values, and shadows map directly to a token in the design system.
9.  **Test Responsiveness:** View the layout at each of the defined breakpoints (Mobile, Tablet, Desktop) and ensure it reflows gracefully, maintaining readability and usability. Check that touch targets are sufficiently large on smaller screens.
10. **Final Polish:** Read through all copy to ensure it matches the brand's friendly and welcoming tone. Check for visual alignment and rhythm across all elements.
