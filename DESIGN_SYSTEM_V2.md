# YouQiZhi Kids - Design System V2 (Dopamine Candy Style)

## 1. Design Philosophy
**Style:** **Dopamine Candy / Pop Memphis** (High Saturation, Playful, Energetic)
**Core Concept:** "糖果乐园" (Candy Land) - 每一个模块都是一颗诱人的糖果，充满多巴胺色彩。
**Visual Keywords:** Bright, Vivid, Bouncy, Rounded, Glossy, Confetti.

## 2. Color Palette (High Saturation & Warmth)
摒弃柔和的 Pastel 色调，改用高饱和度的“多巴胺”配色，更加吸引儿童注意力。

| Role | Color | Hex | Tailwind Class | Mood |
|------|-------|-----|----------------|------|
| **Primary** | Electric Purple | `#8B5CF6` | `bg-violet-500` | Magic, Creativity |
| **Secondary** | Hot Pink | `#F472B6` | `bg-pink-400` | Fun, Sweet |
| **Accent 1** | Lime Green | `#84CC16` | `bg-lime-500` | Energy, Growth |
| **Accent 2** | Tangerine | `#F97316` | `bg-orange-500` | Excitement, Play |
| **Accent 3** | Cyan Blue | `#06B6D4` | `bg-cyan-500` | Cool, Fresh |
| **Accent 4** | Sunshine Yellow| `#FACC15` | `bg-yellow-400` | Joy, Brightness |
| **Background**| Creamy White | `#FFFBEB` | `bg-amber-50` | Warm, Soft base |
| **Surface** | Pure White | `#FFFFFF` | `bg-white` | Clean canvas |
| **Text Main** | Grape | `#4C1D95` | `text-violet-900` | High contrast |

## 3. UI Components (Pop & Bouncy)

### Cards ("Jelly Cards")
*   **Shape:** `rounded-[2rem]` (More rounded).
*   **Border:** `border-4 border-white`.
*   **Shadow:** Colored shadows instead of gray/black.
    *   Example: `shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)]` (Orange shadow for orange card).
*   **Interaction:** `hover:scale-105 hover:-rotate-1` + `active:scale-95`.

### Buttons ("Gummy Buttons")
*   **Style:** 3D look with highlight and bottom shade.
*   **CSS:**
    ```css
    .btn-gummy {
      background: linear-gradient(to bottom, #F472B6, #DB2777);
      box-shadow: 0 6px 0 #9D174D, 0 10px 10px rgba(0,0,0,0.2);
      border-radius: 999px;
      transition: all 0.1s;
    }
    .btn-gummy:active {
      transform: translateY(6px);
      box-shadow: 0 0 0 #9D174D, inset 0 2px 5px rgba(0,0,0,0.2);
    }
    ```

### Navigation ("Floating Cloud")
*   **Style:** White pill shape with colorful icons.
*   **Effect:** `backdrop-blur-md bg-white/80 border-2 border-white`.

## 4. Typography
*   **Headings:** 'Baloo 2' (Keep, heavily weighted `font-extrabold`).
*   **Body:** 'Nunito' (`font-bold` for better readability).
*   **Colors:** Use colored text for headings (e.g., Purple Heading), not just black.

## 5. Background Patterns
*   **Memphis Elements:** Squiggles, dots, triangles floating in background.
*   **Gradient:** Warm gradient mesh (`from-amber-50 via-pink-50 to-cyan-50`).

## 6. Icons & Imagery
*   **Icons:** Filled icons with white strokes (`fill-current stroke-white stroke-2`).
*   **Containers:** Icons sit in "Squircle" or "Blob" shapes, not just circles.

## 7. Animation
*   **Idle:** Gentle floating (`animate-bounce-slow`).
*   **Entrance:** Pop-in effect (`scale-0` to `scale-100` with `type: spring`).
