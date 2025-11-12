/**
 * HAC Wrapper Theme Configuration
 * 8 Beautiful Pastel Themes
 */

export interface ThemeColors {
  name: string;
  description: string;
  colors: {
    // Base colors
    background: string;        // Main app background
    surface: string;           // Card backgrounds, modals
    surfaceHover: string;      // Card hover state

    // Primary colors
    primary: string;           // Buttons, active states, accents
    primaryHover: string;      // Button hover
    primaryContent: string;    // Text on primary background

    // Text colors
    textPrimary: string;       // Main text
    textSecondary: string;     // Secondary text, descriptions
    textMuted: string;         // Subtle text, hints

    // Border colors
    border: string;            // Card borders, dividers
    borderHover: string;       // Hover borders

    // Grade colors
    gradeA: string;            // 90-100%
    gradeB: string;            // 80-89%
    gradeC: string;            // 70-79%
    gradeD: string;            // 60-69%
    gradeF: string;            // <60%

    // Status colors
    success: string;           // Positive indicators
    warning: string;           // Warning states
    error: string;             // Error states, alerts
    info: string;              // Info badges, notifications

    // Interactive states
    inputBg: string;           // Input field backgrounds
    inputBorder: string;       // Input borders
    inputFocus: string;        // Input focus ring

    // Special elements
    tabInactive: string;       // Inactive quarter tabs
    tabActive: string;         // Active quarter tab
    progressBar: string;       // Progress bar track
    modalBackdrop: string;     // Modal overlay
  };
}

export const themes: ThemeColors[] = [
  {
    name: "Lavender Dreams",
    description: "Soft purples and pinks for a dreamy, calming experience",
    colors: {
      background: "#f5f3ff",
      surface: "#ffffff",
      surfaceHover: "#faf8ff",

      primary: "#a78bfa",
      primaryHover: "#9333ea",
      primaryContent: "#ffffff",

      textPrimary: "#4c1d95",
      textSecondary: "#6b21a8",
      textMuted: "#a78bfa",

      border: "#e9d5ff",
      borderHover: "#d8b4fe",

      gradeA: "#86efac",
      gradeB: "#7dd3fc",
      gradeC: "#fde047",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fde047",
      error: "#fca5a5",
      info: "#a5b4fc",

      inputBg: "#ffffff",
      inputBorder: "#e9d5ff",
      inputFocus: "#a78bfa",

      tabInactive: "#f3e8ff",
      tabActive: "#a78bfa",
      progressBar: "#e9d5ff",
      modalBackdrop: "rgba(167, 139, 250, 0.2)",
    }
  },

  {
    name: "Mint Breeze",
    description: "Fresh minty greens with turquoise accents for clarity",
    colors: {
      background: "#f0fdf4",
      surface: "#ffffff",
      surfaceHover: "#f7fef9",

      primary: "#6ee7b7",
      primaryHover: "#10b981",
      primaryContent: "#064e3b",

      textPrimary: "#064e3b",
      textSecondary: "#047857",
      textMuted: "#6ee7b7",

      border: "#d1fae5",
      borderHover: "#a7f3d0",

      gradeA: "#6ee7b7",
      gradeB: "#67e8f9",
      gradeC: "#fef08a",
      gradeD: "#fed7aa",
      gradeF: "#fecaca",

      success: "#6ee7b7",
      warning: "#fef08a",
      error: "#fecaca",
      info: "#67e8f9",

      inputBg: "#ffffff",
      inputBorder: "#d1fae5",
      inputFocus: "#6ee7b7",

      tabInactive: "#d1fae5",
      tabActive: "#6ee7b7",
      progressBar: "#d1fae5",
      modalBackdrop: "rgba(110, 231, 183, 0.2)",
    }
  },

  {
    name: "Peach Sunset",
    description: "Warm peachy tones with coral highlights for a cozy feel",
    colors: {
      background: "#fff7ed",
      surface: "#ffffff",
      surfaceHover: "#fffbf5",

      primary: "#fdba74",
      primaryHover: "#f97316",
      primaryContent: "#7c2d12",

      textPrimary: "#7c2d12",
      textSecondary: "#c2410c",
      textMuted: "#fdba74",

      border: "#fed7aa",
      borderHover: "#fdba74",

      gradeA: "#86efac",
      gradeB: "#93c5fd",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#fdba74",

      inputBg: "#ffffff",
      inputBorder: "#fed7aa",
      inputFocus: "#fdba74",

      tabInactive: "#ffedd5",
      tabActive: "#fdba74",
      progressBar: "#fed7aa",
      modalBackdrop: "rgba(253, 186, 116, 0.2)",
    }
  },

  {
    name: "Sky Blue",
    description: "Bright sky blues with cloud-white for an airy atmosphere",
    colors: {
      background: "#f0f9ff",
      surface: "#ffffff",
      surfaceHover: "#f7fcff",

      primary: "#7dd3fc",
      primaryHover: "#0ea5e9",
      primaryContent: "#0c4a6e",

      textPrimary: "#0c4a6e",
      textSecondary: "#0369a1",
      textMuted: "#7dd3fc",

      border: "#bae6fd",
      borderHover: "#7dd3fc",

      gradeA: "#6ee7b7",
      gradeB: "#7dd3fc",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#6ee7b7",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#7dd3fc",

      inputBg: "#ffffff",
      inputBorder: "#bae6fd",
      inputFocus: "#7dd3fc",

      tabInactive: "#e0f2fe",
      tabActive: "#7dd3fc",
      progressBar: "#bae6fd",
      modalBackdrop: "rgba(125, 211, 252, 0.2)",
    }
  },

  {
    name: "Rose Garden",
    description: "Delicate pink roses with soft blush tones",
    colors: {
      background: "#fdf2f8",
      surface: "#ffffff",
      surfaceHover: "#fef7fb",

      primary: "#f9a8d4",
      primaryHover: "#ec4899",
      primaryContent: "#831843",

      textPrimary: "#831843",
      textSecondary: "#be185d",
      textMuted: "#f9a8d4",

      border: "#fbcfe8",
      borderHover: "#f9a8d4",

      gradeA: "#86efac",
      gradeB: "#a5b4fc",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#f9a8d4",

      inputBg: "#ffffff",
      inputBorder: "#fbcfe8",
      inputFocus: "#f9a8d4",

      tabInactive: "#fce7f3",
      tabActive: "#f9a8d4",
      progressBar: "#fbcfe8",
      modalBackdrop: "rgba(249, 168, 212, 0.2)",
    }
  },

  {
    name: "Lemon Zest",
    description: "Bright lemon yellows with cream undertones for energy",
    colors: {
      background: "#fefce8",
      surface: "#ffffff",
      surfaceHover: "#fffef5",

      primary: "#fde047",
      primaryHover: "#eab308",
      primaryContent: "#713f12",

      textPrimary: "#713f12",
      textSecondary: "#a16207",
      textMuted: "#fde047",

      border: "#fef08a",
      borderHover: "#fde047",

      gradeA: "#86efac",
      gradeB: "#7dd3fc",
      gradeC: "#fde047",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fde047",
      error: "#fca5a5",
      info: "#7dd3fc",

      inputBg: "#ffffff",
      inputBorder: "#fef08a",
      inputFocus: "#fde047",

      tabInactive: "#fef9c3",
      tabActive: "#fde047",
      progressBar: "#fef08a",
      modalBackdrop: "rgba(253, 224, 71, 0.2)",
    }
  },

  {
    name: "Ocean Mist",
    description: "Teal and aqua waves with seafoam for tranquility",
    colors: {
      background: "#f0fdfa",
      surface: "#ffffff",
      surfaceHover: "#f7fefb",

      primary: "#5eead4",
      primaryHover: "#14b8a6",
      primaryContent: "#134e4a",

      textPrimary: "#134e4a",
      textSecondary: "#0f766e",
      textMuted: "#5eead4",

      border: "#99f6e4",
      borderHover: "#5eead4",

      gradeA: "#6ee7b7",
      gradeB: "#67e8f9",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#6ee7b7",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#67e8f9",

      inputBg: "#ffffff",
      inputBorder: "#99f6e4",
      inputFocus: "#5eead4",

      tabInactive: "#ccfbf1",
      tabActive: "#5eead4",
      progressBar: "#99f6e4",
      modalBackdrop: "rgba(94, 234, 212, 0.2)",
    }
  },

  {
    name: "Periwinkle Night",
    description: "Deep periwinkle blues with indigo shadows for focus",
    colors: {
      background: "#eef2ff",
      surface: "#ffffff",
      surfaceHover: "#f5f7ff",

      primary: "#a5b4fc",
      primaryHover: "#6366f1",
      primaryContent: "#312e81",

      textPrimary: "#312e81",
      textSecondary: "#4338ca",
      textMuted: "#a5b4fc",

      border: "#c7d2fe",
      borderHover: "#a5b4fc",

      gradeA: "#86efac",
      gradeB: "#7dd3fc",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#a5b4fc",

      inputBg: "#ffffff",
      inputBorder: "#c7d2fe",
      inputFocus: "#a5b4fc",

      tabInactive: "#e0e7ff",
      tabActive: "#a5b4fc",
      progressBar: "#c7d2fe",
      modalBackdrop: "rgba(165, 180, 252, 0.2)",
    }
  },
];

/**
 * Get theme by name
 */
export function getTheme(themeName: string): ThemeColors | undefined {
  return themes.find(t => t.name === themeName);
}

/**
 * Apply theme to CSS variables
 */
export function applyTheme(theme: ThemeColors): void {
  const root = document.documentElement;
  const colors = theme.colors;

  // Apply all color variables
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

/**
 * Get saved theme from localStorage
 */
export function getSavedTheme(): string {
  return localStorage.getItem('hac-theme') || 'Lavender Dreams';
}

/**
 * Save theme to localStorage
 */
export function saveTheme(themeName: string): void {
  localStorage.setItem('hac-theme', themeName);
}
