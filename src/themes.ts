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
    description: "Rich mauve and lavender with warm undertones",
    colors: {
      background: "#1e1e2e",
      surface: "#2a2a3e",
      surfaceHover: "#313147",

      primary: "#cba6f7",
      primaryHover: "#b185f5",
      primaryContent: "#1e1e2e",

      textPrimary: "#cdd6f4",
      textSecondary: "#bac2de",
      textMuted: "#9399b2",

      border: "#45475a",
      borderHover: "#585b70",

      gradeA: "#a6e3a1",
      gradeB: "#89dceb",
      gradeC: "#f9e2af",
      gradeD: "#fab387",
      gradeF: "#f38ba8",

      success: "#a6e3a1",
      warning: "#f9e2af",
      error: "#f38ba8",
      info: "#89b4fa",

      inputBg: "#313147",
      inputBorder: "#585b70",
      inputFocus: "#cba6f7",

      tabInactive: "#313147",
      tabActive: "#cba6f7",
      progressBar: "#45475a",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Mint Breeze",
    description: "Cool jade and seafoam with crisp accents",
    colors: {
      background: "#1a1f1e",
      surface: "#232b2a",
      surfaceHover: "#2a3331",

      primary: "#94e2d5",
      primaryHover: "#74d9c6",
      primaryContent: "#11181c",

      textPrimary: "#c9ddd9",
      textSecondary: "#a3c9c1",
      textMuted: "#7da8a0",

      border: "#3a4644",
      borderHover: "#4a5654",

      gradeA: "#94e2d5",
      gradeB: "#89dceb",
      gradeC: "#f9e2af",
      gradeD: "#fab387",
      gradeF: "#f38ba8",

      success: "#94e2d5",
      warning: "#f9e2af",
      error: "#f38ba8",
      info: "#89dceb",

      inputBg: "#2a3331",
      inputBorder: "#4a5654",
      inputFocus: "#94e2d5",

      tabInactive: "#2a3331",
      tabActive: "#94e2d5",
      progressBar: "#3a4644",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Peach Sunset",
    description: "Warm rosewater and peach with golden highlights",
    colors: {
      background: "#1f1d1e",
      surface: "#2d2728",
      surfaceHover: "#352f30",

      primary: "#f5c2e7",
      primaryHover: "#f2a6d9",
      primaryContent: "#1f1d1e",

      textPrimary: "#f5e0dc",
      textSecondary: "#f2cdcd",
      textMuted: "#ddb6b4",

      border: "#474044",
      borderHover: "#5a4f53",

      gradeA: "#a6e3a1",
      gradeB: "#89dceb",
      gradeC: "#f9e2af",
      gradeD: "#fab387",
      gradeF: "#eba0ac",

      success: "#a6e3a1",
      warning: "#f9e2af",
      error: "#eba0ac",
      info: "#f5c2e7",

      inputBg: "#352f30",
      inputBorder: "#5a4f53",
      inputFocus: "#f5c2e7",

      tabInactive: "#352f30",
      tabActive: "#f5c2e7",
      progressBar: "#474044",
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
    description: "Bright amber and honey with warm golden tones",
    colors: {
      background: "#1e1d1a",
      surface: "#2a2721",
      surfaceHover: "#33302a",

      primary: "#f9e2af",
      primaryHover: "#f5d88a",
      primaryContent: "#1e1d1a",

      textPrimary: "#e8ddc3",
      textSecondary: "#d9c9a6",
      textMuted: "#b8a686",

      border: "#494539",
      borderHover: "#5c5847",

      gradeA: "#a6e3a1",
      gradeB: "#89dceb",
      gradeC: "#f9e2af",
      gradeD: "#fab387",
      gradeF: "#f38ba8",

      success: "#a6e3a1",
      warning: "#f9e2af",
      error: "#f38ba8",
      info: "#89dceb",

      inputBg: "#33302a",
      inputBorder: "#5c5847",
      inputFocus: "#f9e2af",

      tabInactive: "#33302a",
      tabActive: "#f9e2af",
      progressBar: "#494539",
      modalBackdrop: "rgba(0, 0, 0, 0.7)",
    }
  },

  {
    name: "Ocean Mist",
    description: "Deep sapphire and aqua with crystalline accents",
    colors: {
      background: "#181b21",
      surface: "#232831",
      surfaceHover: "#2b3139",

      primary: "#89dceb",
      primaryHover: "#6bc9e3",
      primaryContent: "#11141a",

      textPrimary: "#c9dde8",
      textSecondary: "#a3c9dc",
      textMuted: "#7da8c0",

      border: "#3e4451",
      borderHover: "#4d5562",

      gradeA: "#a6e3a1",
      gradeB: "#89dceb",
      gradeC: "#f9e2af",
      gradeD: "#fab387",
      gradeF: "#f38ba8",

      success: "#a6e3a1",
      warning: "#f9e2af",
      error: "#f38ba8",
      info: "#89dceb",

      inputBg: "#2b3139",
      inputBorder: "#4d5562",
      inputFocus: "#89dceb",

      tabInactive: "#2b3139",
      tabActive: "#89dceb",
      progressBar: "#3e4451",
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
