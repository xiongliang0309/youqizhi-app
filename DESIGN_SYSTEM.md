# YouQiZhi Kids - Design System

## 1. Design Philosophy
**Style:** Claymorphism (Soft 3D, Playful, Tactile)
**Core Concept:** "Digital Toy Box" - The interface should feel like a collection of safe, fun, and interactive toys.
**Target Audience:** Preschool to early elementary children (ages 3-8).

## 2. Color Palette
High contrast, vibrant but not neon. Tested for accessibility.

| Role | Color | Hex | Tailwind Class | Usage |
|------|-------|-----|----------------|-------|
| **Primary** | Indigo | `#4F46E5` | `bg-indigo-600` | Main actions, header backgrounds |
| **Secondary** | Soft Blue | `#818CF8` | `bg-indigo-400` | Secondary buttons, active states |
| **Accent 1** | Mint Green | `#34D399` | `bg-emerald-400` | Success, "Go", positive feedback |
| **Accent 2** | Coral Pink | `#FB7185` | `bg-rose-400` | Attention, "Stop", heart/likes |
| **Accent 3** | Sunny Yellow| `#FBBF24` | `bg-amber-400` | Stars, rewards, highlights |
| **Background**| Cloud White | `#EEF2FF` | `bg-indigo-50` | Page background |
| **Surface** | Pure White | `#FFFFFF` | `bg-white` | Card backgrounds |
| **Text Main** | Deep Navy | `#312E81` | `text-indigo-900` | Headings, primary text |
| **Text Body** | Slate Blue | `#4B5563` | `text-gray-600` | Descriptions |

## 3. Typography
**Font Family:** 'Baloo 2' (Headings), 'Comic Neue' or 'Nunito' (Body)
**Characteristics:** Rounded, friendly, legible.

*   **H1 (Hero):** `text-4xl md:text-6xl font-extrabold tracking-tight`
*   **H2 (Section):** `text-3xl font-bold text-indigo-900`
*   **H3 (Card Title):** `text-xl font-bold text-indigo-800`
*   **Body:** `text-lg font-medium text-indigo-900/80` (Larger base size for kids)

## 4. UI Components (Claymorphism Style)

### Cards & Containers
*   **Shape:** Large rounded corners (`rounded-3xl` or `rounded-[2rem]`).
*   **Effect:** Soft inner shadow + Drop shadow to create volume.
*   **CSS Class:**
    ```css
    .clay-card {
      background: white;
      border-radius: 24px;
      box-shadow: 
        8px 8px 16px #d1d9e6, 
        -8px -8px 16px #ffffff;
    }
    ```
*   **Tailwind:** `bg-white rounded-3xl shadow-[8px_8px_16px_rgba(79,70,229,0.15),-8px_-8px_16px_rgba(255,255,255,1)]`

### Buttons (The "Candy" Button)
*   **Shape:** Pill-shaped or highly rounded (`rounded-full` or `rounded-2xl`).
*   **Interaction:** "Press" effect that shrinks scale slightly.
*   **Primary Button:**
    ```html
    <button class="bg-indigo-500 text-white font-bold py-4 px-8 rounded-full 
    shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.2),inset_4px_4px_8px_rgba(255,255,255,0.2),8px_8px_16px_rgba(79,70,229,0.3)] 
    hover:scale-105 active:scale-95 transition-all duration-200">
      Start Learning 🚀
    </button>
    ```

### Navigation
*   **Style:** Floating dock or island.
*   **Location:** Bottom fixed on mobile, Top sticky on desktop.
*   **Icons:** Large, filled SVG icons (Heroicons/Lucide) with distinct colors.

## 5. Layout & Spacing
*   **Grid:** Simple 1-column (mobile) to 3-column (desktop) grids.
*   **Spacing:** Generous whitespace (`gap-6`, `p-6` minimum).
*   **Container:** `max-w-5xl mx-auto`.

## 6. Imagery & Icons
*   **Icons:** Use `Lucide-React` with `stroke-width={2.5}` or `3` for a bolder look.
*   **Images:** Rounded corners (`rounded-2xl`), potentially with a "sticker" white border effect.

## 7. Animation (Micro-interactions)
*   **Hover:** `hover:scale-105 hover:-rotate-2` (Playful tilt).
*   **Tap:** `active:scale-95`.
*   **Entrance:** Fade in up with bounce.

## 8. Anti-Patterns (Avoid)
*   ❌ Sharp corners (0px border-radius).
*   ❌ Thin, elegant fonts (Serifs).
*   ❌ Dark mode by default (Kids apps shine in light/bright modes).
*   ❌ Complex nested menus.
*   ❌ Small clickable areas (Minimum target: 48x48px).
