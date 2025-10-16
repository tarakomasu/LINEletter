# Animation Design Prompt: Classic Sealing Stamp (Version 3)

This document outlines the design and animation requirements for a new envelope sealing animation, based on user feedback. The goal is to create a "simple and classic" animation.

## 1. Summary of Design Choices

-   **Overall Theme:** Simple and Classic.

### 1.1. Envelope
-   **Color:** Clean white, with a thick, solid green border (`#22c55e`).
-   **Texture:** Flat, illustrative style. No realistic shadows or gradients on the envelope body.
-   **Shape & Structure (Based on `envelope.png` reference):**
    -   The overall shape should be based on the reference image `src/app/animation-test/envelope.png`.
    -   All external corners of the envelope body and the main top flap are to be **rounded**.
    -   The front "pocket" of the envelope must be constructed from **three separate, visible flaps**: two triangular side flaps and a larger bottom flap that overlaps them.

### 1.2. Sealing Wax & Stamp
-   **Wax Color:** Traditional deep red.
-   **Seal Imprint Design:** A generic but classic and elegant crest/monogram (a star).
-   **Stamper Tool Design:** A traditional stamper with a dark, polished wooden handle and a metallic (brass-colored) head.

## 2. Animation Sequence

The animation should proceed in the following order:

1.  **Open Flap:** The main top flap animates open with a 3D perspective (`rotateX`).
2.  **Insert Letter:** A letter object slides down *into* the envelope.
3.  **Close Flap:** The top flap animates closed.
4.  **Stamping Action:** A stamper tool animates down, presses onto the flap, and animates away.
5.  **Reveal Seal:** As the stamper lifts, the red seal appears with a pop.
6.  **Final Bounce:** The entire envelope gives a final, subtle bounce.

## 3. Implementation Notes for AI Agent

-   **Target File:** `/src/app/animation-test/page.tsx`
-   **Technology:** React with JSX. The envelope structure **must be built using SVG elements** (`<path>`, `<rect>`) to ensure accurate rendering of borders on diagonal lines. CSS `clip-path` proved unreliable for this and should be avoided for the envelope structure.
-   **Animation:** Animations should be applied to the `div` containers that wrap the SVG elements, using standard CSS keyframes.
-   **Layering:** Use CSS `z-index` on the containers for the SVG parts. Within the main envelope SVG, the render order of the `<path>` elements also determines layering (later elements render on top).
-   **Asset Generation:** The entire envelope, as well as the seal and stamper, should be created using inline SVG or styled `div`s. No external image assets are required.
