/**
 * HAC Wrapper Theme Configuration
 * 8 Beautiful Dark Pastel Themes
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
      background: "#1a1625",
      surface: "#251e35",
      surfaceHover: "#2d2540",

      primary: "#a78bfa",
      primaryHover: "#9333ea",
      primaryContent: "#ffffff",

      textPrimary: "#e9d5ff",
      textSecondary: "#c4b5fd",
      textMuted: "#a78bfa",

      border: "#3d2f52",
      borderHover: "#4c3968",

      gradeA: "#86efac",
      gradeB: "#7dd3fc",
      gradeC: "#fde047",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fde047",
      error: "#fca5a5",
      info: "#a5b4fc",

      inputBg: "#2d2540",
      inputBorder: "#4c3968",
      inputFocus: "#a78bfa",

      tabInactive: "#2d2540",
      tabActive: "#a78bfa",
      progressBar: "#3d2f52",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Mint Breeze",
    description: "Fresh minty greens with turquoise accents for clarity",
    colors: {
      background: "#0f1f17",
      surface: "#1a2e23",
      surfaceHover: "#1f3628",

      primary: "#6ee7b7",
      primaryHover: "#10b981",
      primaryContent: "#ffffff",

      textPrimary: "#d1fae5",
      textSecondary: "#a7f3d0",
      textMuted: "#6ee7b7",

      border: "#2d4436",
      borderHover: "#3d5846",

      gradeA: "#6ee7b7",
      gradeB: "#67e8f9",
      gradeC: "#fef08a",
      gradeD: "#fed7aa",
      gradeF: "#fecaca",

      success: "#6ee7b7",
      warning: "#fef08a",
      error: "#fecaca",
      info: "#67e8f9",

      inputBg: "#1f3628",
      inputBorder: "#3d5846",
      inputFocus: "#6ee7b7",

      tabInactive: "#1f3628",
      tabActive: "#6ee7b7",
      progressBar: "#2d4436",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Peach Sunset",
    description: "Warm peachy tones with coral highlights for a cozy feel",
    colors: {
      background: "#1f1410",
      surface: "#2d1f18",
      surfaceHover: "#3a2820",

      primary: "#fdba74",
      primaryHover: "#f97316",
      primaryContent: "#ffffff",

      textPrimary: "#fed7aa",
      textSecondary: "#fdba74",
      textMuted: "#fb923c",

      border: "#4a3426",
      borderHover: "#5c4230",

      gradeA: "#86efac",
      gradeB: "#93c5fd",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#fdba74",

      inputBg: "#3a2820",
      inputBorder: "#5c4230",
      inputFocus: "#fdba74",

      tabInactive: "#3a2820",
      tabActive: "#fdba74",
      progressBar: "#4a3426",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Sky Blue",
    description: "Bright sky blues with cloud-white for an airy atmosphere",
    colors: {
      background: "#0c1621",
      surface: "#16202d",
      surfaceHover: "#1d2a3a",

      primary: "#7dd3fc",
      primaryHover: "#0ea5e9",
      primaryContent: "#ffffff",

      textPrimary: "#bae6fd",
      textSecondary: "#7dd3fc",
      textMuted: "#38bdf8",

      border: "#243749",
      borderHover: "#2e4559",

      gradeA: "#6ee7b7",
      gradeB: "#7dd3fc",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#6ee7b7",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#7dd3fc",

      inputBg: "#1d2a3a",
      inputBorder: "#2e4559",
      inputFocus: "#7dd3fc",

      tabInactive: "#1d2a3a",
      tabActive: "#7dd3fc",
      progressBar: "#243749",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Rose Garden",
    description: "Delicate pink roses with soft blush tones",
    colors: {
      background: "#1f1019",
      surface: "#2d1826",
      surfaceHover: "#3a1f32",

      primary: "#f9a8d4",
      primaryHover: "#ec4899",
      primaryContent: "#ffffff",

      textPrimary: "#fbcfe8",
      textSecondary: "#f9a8d4",
      textMuted: "#f472b6",

      border: "#4a2d3f",
      borderHover: "#5c3850",

      gradeA: "#86efac",
      gradeB: "#a5b4fc",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#f9a8d4",

      inputBg: "#3a1f32",
      inputBorder: "#5c3850",
      inputFocus: "#f9a8d4",

      tabInactive: "#3a1f32",
      tabActive: "#f9a8d4",
      progressBar: "#4a2d3f",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Lemon Zest",
    description: "Bright lemon yellows with cream undertones for energy",
    colors: {
      background: "#1a1810",
      surface: "#2a2418",
      surfaceHover: "#352e20",

      primary: "#fde047",
      primaryHover: "#eab308",
      primaryContent: "#1a1810",

      textPrimary: "#fef08a",
      textSecondary: "#fde047",
      textMuted: "#facc15",

      border: "#443a26",
      borderHover: "#554830",

      gradeA: "#86efac",
      gradeB: "#7dd3fc",
      gradeC: "#fde047",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fde047",
      error: "#fca5a5",
      info: "#7dd3fc",

      inputBg: "#352e20",
      inputBorder: "#554830",
      inputFocus: "#fde047",

      tabInactive: "#352e20",
      tabActive: "#fde047",
      progressBar: "#443a26",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Ocean Mist",
    description: "Teal and aqua waves with seafoam for tranquility",
    colors: {
      background: "#0c1f1c",
      surface: "#16302a",
      surfaceHover: "#1d3d35",

      primary: "#5eead4",
      primaryHover: "#14b8a6",
      primaryContent: "#ffffff",

      textPrimary: "#99f6e4",
      textSecondary: "#5eead4",
      textMuted: "#2dd4bf",

      border: "#24453d",
      borderHover: "#2e564c",

      gradeA: "#6ee7b7",
      gradeB: "#67e8f9",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#6ee7b7",
      warning: "#fef08a",
      error: "#fecaca",
      info: "#67e8f9",

      inputBg: "#1d3d35",
      inputBorder: "#2e564c",
      inputFocus: "#5eead4",

      tabInactive: "#1d3d35",
      tabActive: "#5eead4",
      progressBar: "#24453d",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Periwinkle Night",
    description: "Deep periwinkle blues with indigo shadows for focus",
    colors: {
      background: "#141626",
      surface: "#1e2238",
      surfaceHover: "#252b45",

      primary: "#a5b4fc",
      primaryHover: "#6366f1",
      primaryContent: "#ffffff",

      textPrimary: "#c7d2fe",
      textSecondary: "#a5b4fc",
      textMuted: "#818cf8",

      border: "#2d3451",
      borderHover: "#3a4265",

      gradeA: "#86efac",
      gradeB: "#7dd3fc",
      gradeC: "#fef08a",
      gradeD: "#fdba74",
      gradeF: "#fca5a5",

      success: "#86efac",
      warning: "#fef08a",
      error: "#fca5a5",
      info: "#a5b4fc",

      inputBg: "#252b45",
      inputBorder: "#3a4265",
      inputFocus: "#a5b4fc",

      tabInactive: "#252b45",
      tabActive: "#a5b4fc",
      progressBar: "#2d3451",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
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
