import { ITheme } from "xterm";

// Function to get HSL value from CSS variable
const getHSLFromCSSVar = (cssVar: string): string => {
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(cssVar).trim();
  // Convert from CSS variable format to HSL string
  return value.replace(/var\(--([^)]+)\)/, (_, name) => {
    const hslValue = getComputedStyle(root)
      .getPropertyValue(`--${name}`)
      .trim();
    return hslValue;
  });
};

// Function to create a theme that uses CSS variables
const createShadcnTheme = (isDark: boolean): ITheme => {
  const background = getHSLFromCSSVar("--background");
  const foreground = getHSLFromCSSVar("--foreground");
  const primary = getHSLFromCSSVar("--primary");
  const card = getHSLFromCSSVar("--card");
  const destructive = getHSLFromCSSVar("--destructive");
  const mutedForeground = getHSLFromCSSVar("--muted-foreground");
  const ring = getHSLFromCSSVar("--ring");
  const popover = getHSLFromCSSVar("--popover");
  const accent = getHSLFromCSSVar("--accent");

  // Extract HSL values from the CSS variables
  const extractHSL = (hslString: string) => {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return {
        h: parseInt(match[1]),
        s: parseInt(match[2]),
        l: parseInt(match[3]),
      };
    }
    return { h: 0, s: 0, l: 0 };
  };

  const accentHSL = extractHSL(accent);

  return {
    background,
    foreground,
    cursor: primary,
    cursorAccent: background,
    selectionBackground: isDark
      ? `hsla(${accentHSL.h}, ${accentHSL.s}%, ${accentHSL.l}%, 0.4)`
      : `hsla(${accentHSL.h}, ${accentHSL.s}%, ${accentHSL.l}%, 0.3)`,
    black: card,
    red: destructive,
    green: isDark ? "hsl(140, 70%, 40%)" : "hsl(140, 70%, 35%)",
    yellow: isDark ? "hsl(42, 87%, 60%)" : "hsl(42, 87%, 55%)",
    blue: primary,
    magenta: isDark ? "hsl(300, 60%, 60%)" : "hsl(300, 60%, 55%)",
    cyan: isDark ? "hsl(180, 70%, 50%)" : "hsl(180, 70%, 45%)",
    white: foreground,
    brightBlack: mutedForeground,
    brightRed: isDark ? "hsl(0, 80%, 60%)" : "hsl(0, 80%, 55%)",
    brightGreen: isDark ? "hsl(140, 70%, 50%)" : "hsl(140, 70%, 45%)",
    brightYellow: isDark ? "hsl(42, 87%, 70%)" : "hsl(42, 87%, 65%)",
    brightBlue: ring,
    brightMagenta: isDark ? "hsl(300, 60%, 70%)" : "hsl(300, 60%, 65%)",
    brightCyan: isDark ? "hsl(180, 70%, 60%)" : "hsl(180, 70%, 55%)",
    brightWhite: isDark ? foreground : popover,
  };
};

// Default Light Theme
export const defaultLightTheme: ITheme = {
  background: "hsl(240, 12%, 95%)", // --background
  foreground: "hsl(240, 10%, 5%)", // --foreground
  cursor: "hsl(260, 50%, 50%)", // --primary
  cursorAccent: "hsl(240, 12%, 95%)", // --background
  selectionBackground: "hsla(230, 30%, 85%, 0.3)", // --secondary with opacity
  black: "hsl(240, 8%, 93%)", // --card
  red: "hsl(0, 70%, 45%)", // --destructive
  green: "hsl(140, 70%, 35%)", // green - adapted from theme
  yellow: "hsl(42, 87%, 55%)", // yellow - adapted from chart colors
  blue: "hsl(260, 50%, 50%)", // --primary
  magenta: "hsl(300, 60%, 55%)", // magenta - adapted from chart colors
  cyan: "hsl(180, 70%, 45%)", // cyan - adapted from chart colors
  white: "hsl(240, 10%, 98%)", // light white
  brightBlack: "hsl(240, 10%, 40%)", // --muted-foreground
  brightRed: "hsl(0, 80%, 55%)", // brighter --destructive
  brightGreen: "hsl(140, 70%, 45%)", // brighter green
  brightYellow: "hsl(42, 87%, 65%)", // brighter yellow
  brightBlue: "hsl(260, 50%, 60%)", // --ring
  brightMagenta: "hsl(300, 60%, 65%)", // brighter magenta
  brightCyan: "hsl(180, 70%, 55%)", // brighter cyan
  brightWhite: "hsl(240, 12%, 97%)", // --popover
};

// Default Dark Theme
export const defaultDarkTheme: ITheme = {
  background: "hsl(240, 15%, 12%)", // --background
  foreground: "hsl(240, 10%, 98%)", // --foreground
  cursor: "hsl(260, 50%, 55%)", // --primary
  cursorAccent: "hsl(240, 15%, 12%)", // --background
  selectionBackground: "hsla(260, 25%, 25%, 0.4)", // --accent with opacity
  black: "hsl(240, 15%, 10%)", // --card
  red: "hsl(0, 70%, 50%)", // --destructive
  green: "hsl(140, 70%, 40%)", // green - adapted from theme
  yellow: "hsl(42, 87%, 60%)", // yellow - adapted from chart colors
  blue: "hsl(260, 50%, 55%)", // --primary
  magenta: "hsl(300, 60%, 60%)", // magenta - adapted from chart colors
  cyan: "hsl(180, 70%, 50%)", // cyan - adapted from chart colors
  white: "hsl(240, 10%, 98%)", // --foreground
  brightBlack: "hsl(240, 10%, 70%)", // --muted-foreground
  brightRed: "hsl(0, 80%, 60%)", // brighter --destructive
  brightGreen: "hsl(140, 70%, 50%)", // brighter green
  brightYellow: "hsl(42, 87%, 70%)", // brighter yellow
  brightBlue: "hsl(260, 50%, 65%)", // --ring
  brightMagenta: "hsl(300, 60%, 70%)", // brighter magenta
  brightCyan: "hsl(180, 70%, 60%)", // brighter cyan
  brightWhite: "hsl(240, 10%, 98%)", // --foreground
};

// Purple Light Theme
export const purpleLightTheme: ITheme = {
  background: "hsl(270, 30%, 97%)", // --background
  foreground: "hsl(270, 80%, 15%)", // --foreground
  cursor: "hsl(270, 100%, 60%)", // --primary
  cursorAccent: "hsl(270, 30%, 97%)", // --background
  selectionBackground: "hsla(290, 100%, 80%, 0.3)", // --secondary with opacity
  black: "hsl(270, 40%, 95%)", // --card
  red: "hsl(0, 100%, 60%)", // --destructive
  green: "hsl(150, 100%, 60%)", // green - adapted from chart colors
  yellow: "hsl(30, 100%, 65%)", // yellow - adapted from chart colors
  blue: "hsl(270, 100%, 60%)", // --primary
  magenta: "hsl(310, 100%, 65%)", // magenta - adapted from chart colors
  cyan: "hsl(190, 100%, 60%)", // cyan - adapted from chart colors
  white: "hsl(270, 80%, 95%)", // light white
  brightBlack: "hsl(270, 60%, 40%)", // --muted-foreground
  brightRed: "hsl(0, 100%, 70%)", // brighter --destructive
  brightGreen: "hsl(150, 100%, 70%)", // brighter green
  brightYellow: "hsl(30, 100%, 75%)", // brighter yellow
  brightBlue: "hsl(270, 100%, 70%)", // --ring
  brightMagenta: "hsl(310, 100%, 75%)", // brighter magenta
  brightCyan: "hsl(190, 100%, 70%)", // brighter cyan
  brightWhite: "hsl(270, 40%, 97%)", // --popover
};

// Purple Dark Theme
export const purpleDarkTheme: ITheme = {
  background: "hsl(270, 25%, 8%)", // --background
  foreground: "hsl(270, 100%, 95%)", // --foreground
  cursor: "hsl(280, 100%, 65%)", // --primary
  cursorAccent: "hsl(270, 25%, 8%)", // --background
  selectionBackground: "hsla(320, 100%, 40%, 0.4)", // --accent with opacity
  black: "hsl(270, 25%, 6%)", // --card
  red: "hsl(0, 100%, 60%)", // --destructive
  green: "hsl(160, 100%, 70%)", // green - adapted from chart colors
  yellow: "hsl(20, 100%, 60%)", // yellow - adapted from chart colors
  blue: "hsl(280, 100%, 65%)", // --primary
  magenta: "hsl(320, 100%, 60%)", // magenta - adapted from chart colors
  cyan: "hsl(200, 100%, 70%)", // cyan - adapted from chart colors
  white: "hsl(270, 100%, 95%)", // --foreground
  brightBlack: "hsl(270, 70%, 80%)", // --muted-foreground
  brightRed: "hsl(0, 100%, 70%)", // brighter --destructive
  brightGreen: "hsl(160, 100%, 80%)", // brighter green
  brightYellow: "hsl(20, 100%, 70%)", // brighter yellow
  brightBlue: "hsl(280, 100%, 75%)", // --ring
  brightMagenta: "hsl(320, 100%, 70%)", // brighter magenta
  brightCyan: "hsl(200, 100%, 80%)", // brighter cyan
  brightWhite: "hsl(270, 100%, 95%)", // --foreground
};

// Blue Light Theme
export const blueLightTheme: ITheme = {
  background: "hsl(200, 50%, 97%)", // --background
  foreground: "hsl(200, 90%, 10%)", // --foreground
  cursor: "hsl(200, 100%, 45%)", // --primary
  cursorAccent: "hsl(200, 50%, 97%)", // --background
  selectionBackground: "hsla(180, 70%, 75%, 0.3)", // --secondary with opacity
  black: "hsl(200, 50%, 95%)", // --card
  red: "hsl(0, 90%, 50%)", // --destructive
  green: "hsl(160, 90%, 40%)", // green - adapted from chart colors
  yellow: "hsl(40, 90%, 50%)", // yellow - adapted from chart colors
  blue: "hsl(200, 100%, 45%)", // --primary
  magenta: "hsl(280, 90%, 50%)", // magenta - adapted from chart colors
  cyan: "hsl(180, 90%, 40%)", // cyan - adapted from chart colors
  white: "hsl(200, 90%, 98%)", // light white
  brightBlack: "hsl(200, 60%, 35%)", // --muted-foreground
  brightRed: "hsl(0, 90%, 60%)", // brighter --destructive
  brightGreen: "hsl(160, 90%, 50%)", // brighter green
  brightYellow: "hsl(40, 90%, 60%)", // brighter yellow
  brightBlue: "hsl(200, 100%, 55%)", // --ring
  brightMagenta: "hsl(280, 90%, 60%)", // brighter magenta
  brightCyan: "hsl(180, 90%, 50%)", // brighter cyan
  brightWhite: "hsl(200, 50%, 97%)", // --popover
};

// Blue Dark Theme
export const blueDarkTheme: ITheme = {
  background: "hsl(210, 40%, 8%)", // --background
  foreground: "hsl(210, 40%, 98%)", // --foreground
  cursor: "hsl(200, 100%, 50%)", // --primary
  cursorAccent: "hsl(210, 40%, 8%)", // --background
  selectionBackground: "hsla(190, 90%, 30%, 0.4)", // --accent with opacity
  black: "hsl(210, 40%, 6%)", // --card
  red: "hsl(0, 90%, 50%)", // --destructive
  green: "hsl(160, 100%, 45%)", // green - adapted from chart colors
  yellow: "hsl(40, 100%, 55%)", // yellow - adapted from chart colors
  blue: "hsl(200, 100%, 50%)", // --primary
  magenta: "hsl(280, 100%, 55%)", // magenta - adapted from chart colors
  cyan: "hsl(180, 100%, 45%)", // cyan - adapted from chart colors
  white: "hsl(210, 40%, 98%)", // --foreground
  brightBlack: "hsl(210, 40%, 80%)", // --muted-foreground
  brightRed: "hsl(0, 90%, 60%)", // brighter --destructive
  brightGreen: "hsl(160, 100%, 55%)", // brighter green
  brightYellow: "hsl(40, 100%, 65%)", // brighter yellow
  brightBlue: "hsl(200, 100%, 60%)", // --ring
  brightMagenta: "hsl(280, 100%, 65%)", // brighter magenta
  brightCyan: "hsl(180, 100%, 55%)", // brighter cyan
  brightWhite: "hsl(210, 40%, 98%)", // --foreground
};

// Green Light Theme
export const greenLightTheme: ITheme = {
  background: "hsl(120, 30%, 97%)", // --background
  foreground: "hsl(120, 80%, 10%)", // --foreground
  cursor: "hsl(140, 70%, 35%)", // --primary
  cursorAccent: "hsl(120, 30%, 97%)", // --background
  selectionBackground: "hsla(80, 60%, 75%, 0.3)", // --secondary with opacity
  black: "hsl(120, 20%, 95%)", // --card
  red: "hsl(0, 80%, 45%)", // --destructive
  green: "hsl(140, 70%, 35%)", // --primary
  yellow: "hsl(60, 60%, 40%)", // yellow - adapted from chart colors
  blue: "hsl(180, 60%, 30%)", // blue - adapted from chart colors
  magenta: "hsl(280, 60%, 30%)", // magenta - adapted from chart colors
  cyan: "hsl(200, 60%, 30%)", // cyan - adapted from chart colors
  white: "hsl(120, 80%, 95%)", // light white
  brightBlack: "hsl(120, 40%, 35%)", // --muted-foreground
  brightRed: "hsl(0, 80%, 55%)", // brighter --destructive
  brightGreen: "hsl(140, 70%, 45%)", // brighter --primary
  brightYellow: "hsl(60, 60%, 50%)", // brighter yellow
  brightBlue: "hsl(180, 60%, 40%)", // brighter blue
  brightMagenta: "hsl(280, 60%, 40%)", // brighter magenta
  brightCyan: "hsl(200, 60%, 40%)", // brighter cyan
  brightWhite: "hsl(120, 30%, 97%)", // --popover
};

// Green Dark Theme
export const greenDarkTheme: ITheme = {
  background: "hsl(130, 30%, 8%)", // --background
  foreground: "hsl(130, 40%, 95%)", // --foreground
  cursor: "hsl(140, 70%, 40%)", // --primary
  cursorAccent: "hsl(130, 30%, 8%)", // --background
  selectionBackground: "hsla(100, 50%, 25%, 0.4)", // --accent with opacity
  black: "hsl(130, 30%, 6%)", // --card
  red: "hsl(0, 80%, 45%)", // --destructive
  green: "hsl(140, 70%, 40%)", // --primary
  yellow: "hsl(60, 60%, 45%)", // yellow - adapted from chart colors
  blue: "hsl(180, 60%, 35%)", // blue - adapted from chart colors
  magenta: "hsl(260, 60%, 35%)", // magenta - adapted from chart colors
  cyan: "hsl(200, 60%, 35%)", // cyan - adapted from chart colors
  white: "hsl(130, 40%, 95%)", // --foreground
  brightBlack: "hsl(130, 30%, 80%)", // --muted-foreground
  brightRed: "hsl(0, 80%, 55%)", // brighter --destructive
  brightGreen: "hsl(140, 70%, 50%)", // brighter --primary
  brightYellow: "hsl(60, 60%, 55%)", // brighter yellow
  brightBlue: "hsl(180, 60%, 45%)", // brighter blue
  brightMagenta: "hsl(260, 60%, 45%)", // brighter magenta
  brightCyan: "hsl(200, 60%, 45%)", // brighter cyan
  brightWhite: "hsl(130, 40%, 95%)", // --foreground
};

// For backward compatibility
export const customLightTheme = defaultLightTheme;
export const customDarkTheme = defaultDarkTheme;

// Shadcn Light Theme
export const shadcnLightTheme: ITheme = createShadcnTheme(false);

// Shadcn Dark Theme
export const shadcnDarkTheme: ITheme = createShadcnTheme(true);

// Catppuccin Light Theme
export const catppuccinLightTheme: ITheme = {
  background: "hsl(240, 12%, 95%)",
  foreground: "hsl(240, 10%, 5%)",
  cursor: "hsl(266.04, 85.05%, 58.04%)",
  cursorAccent: "hsl(240, 12%, 95%)",
  selectionBackground: "hsla(230, 30%, 85%, 0.3)",
  black: "hsl(240, 8%, 93%)",
  red: "hsl(347.08, 86.67%, 44.12%)",
  green: "hsl(140, 70%, 35%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(266.04, 85.05%, 58.04%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(240, 10%, 98%)",
  brightBlack: "hsl(240, 10%, 40%)",
  brightRed: "hsl(0, 80%, 55%)",
  brightGreen: "hsl(140, 70%, 45%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(266.04, 85.05%, 58.04%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(240, 12%, 97%)",
};

// Catppuccin Dark Theme
export const catppuccinDarkTheme: ITheme = {
  background: "hsl(240, 15%, 12%)",
  foreground: "hsl(240, 10%, 98%)",
  cursor: "hsl(266.04, 85.05%, 58.04%)",
  cursorAccent: "hsl(240, 15%, 12%)",
  selectionBackground: "hsla(260, 25%, 25%, 0.4)",
  black: "hsl(240, 15%, 10%)",
  red: "hsl(347.08, 86.67%, 44.12%)",
  green: "hsl(140, 70%, 40%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(266.04, 85.05%, 58.04%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(240, 10%, 98%)",
  brightBlack: "hsl(240, 10%, 70%)",
  brightRed: "hsl(0, 80%, 60%)",
  brightGreen: "hsl(140, 70%, 50%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(266.04, 85.05%, 58.04%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(240, 10%, 98%)",
};

// Bubblegum Light Theme
export const bubblegumLightTheme: ITheme = {
  background: "hsl(330, 47.06%, 93.33%)",
  foreground: "hsl(0, 0%, 35.69%)",
  cursor: "hsl(325.58, 57.85%, 56.27%)",
  cursorAccent: "hsl(330, 47.06%, 93.33%)",
  selectionBackground: "hsla(325.58, 57.85%, 56.27%, 0.3)",
  black: "hsl(330, 30%, 90%)",
  red: "hsl(359.57, 92%, 70.59%)",
  green: "hsl(140, 70%, 35%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(325.58, 57.85%, 56.27%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(0, 0%, 98%)",
  brightBlack: "hsl(330, 20%, 40%)",
  brightRed: "hsl(359.57, 92%, 80%)",
  brightGreen: "hsl(140, 70%, 45%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(325.58, 57.85%, 66%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Bubblegum Dark Theme
export const bubblegumDarkTheme: ITheme = {
  background: "hsl(201.43, 43.75%, 12.55%)",
  foreground: "hsl(333.75, 40%, 92.16%)",
  cursor: "hsl(325.58, 57.85%, 56.27%)",
  cursorAccent: "hsl(201.43, 43.75%, 12.55%)",
  selectionBackground: "hsla(325.58, 57.85%, 56.27%, 0.4)",
  black: "hsl(201.43, 33.33%, 16.47%)",
  red: "hsl(359.57, 92%, 70.59%)",
  green: "hsl(140, 70%, 40%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(325.58, 57.85%, 56.27%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(333.75, 40%, 92.16%)",
  brightBlack: "hsl(201.43, 20%, 70%)",
  brightRed: "hsl(359.57, 92%, 80%)",
  brightGreen: "hsl(140, 70%, 50%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(325.58, 57.85%, 66%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(333.75, 40%, 98%)",
};

// Ocean Light Theme
export const oceanLightTheme: ITheme = {
  background: "hsl(208, 100%, 97.06%)",
  foreground: "hsl(216.92, 19.12%, 26.67%)",
  cursor: "hsl(142.09, 70.56%, 45.29%)",
  cursorAccent: "hsl(208, 100%, 97.06%)",
  selectionBackground: "hsla(142.09, 70.56%, 45.29%, 0.3)",
  black: "hsl(208, 90%, 95%)",
  red: "hsl(0, 84.24%, 60.2%)",
  green: "hsl(142.09, 70.56%, 45.29%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(142.09, 70.56%, 45.29%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(216.92, 19.12%, 98%)",
  brightBlack: "hsl(208, 20%, 40%)",
  brightRed: "hsl(0, 84.24%, 70%)",
  brightGreen: "hsl(142.09, 70.56%, 55%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(142.09, 70.56%, 55%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(216.92, 19.12%, 100%)",
};

// Ocean Dark Theme
export const oceanDarkTheme: ITheme = {
  background: "hsl(222.22, 47.37%, 11.18%)",
  foreground: "hsl(216, 12.2%, 83.92%)",
  cursor: "hsl(142.09, 70.56%, 45.29%)",
  cursorAccent: "hsl(222.22, 47.37%, 11.18%)",
  selectionBackground: "hsla(142.09, 70.56%, 45.29%, 0.4)",
  black: "hsl(222.22, 30%, 16%)",
  red: "hsl(0, 84.24%, 60.2%)",
  green: "hsl(142.09, 70.56%, 45.29%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(142.09, 70.56%, 45.29%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(216, 12.2%, 83.92%)",
  brightBlack: "hsl(222.22, 20%, 70%)",
  brightRed: "hsl(0, 84.24%, 70%)",
  brightGreen: "hsl(142.09, 70.56%, 55%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(142.09, 70.56%, 55%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(216, 12.2%, 98%)",
};

// Coffee Light Theme
export const coffeeLightTheme: ITheme = {
  background: "hsl(0, 0%, 97.65%)",
  foreground: "hsl(0, 0%, 12.55%)",
  cursor: "hsl(16.67, 21.95%, 32.16%)",
  cursorAccent: "hsl(0, 0%, 97.65%)",
  selectionBackground: "hsla(16.67, 21.95%, 32.16%, 0.3)",
  black: "hsl(0, 0%, 95%)",
  red: "hsl(10.16, 77.87%, 53.92%)",
  green: "hsl(140, 70%, 35%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(16.67, 21.95%, 32.16%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(0, 0%, 98%)",
  brightBlack: "hsl(0, 0%, 40%)",
  brightRed: "hsl(10.16, 77.87%, 63%)",
  brightGreen: "hsl(140, 70%, 45%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(16.67, 21.95%, 42%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Coffee Dark Theme
export const coffeeDarkTheme: ITheme = {
  background: "hsl(0, 0%, 6.67%)",
  foreground: "hsl(0, 0%, 93.33%)",
  cursor: "hsl(16.67, 21.95%, 32.16%)",
  cursorAccent: "hsl(0, 0%, 6.67%)",
  selectionBackground: "hsla(16.67, 21.95%, 32.16%, 0.4)",
  black: "hsl(0, 0%, 10%)",
  red: "hsl(10.16, 77.87%, 53.92%)",
  green: "hsl(140, 70%, 40%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(16.67, 21.95%, 32.16%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(0, 0%, 93.33%)",
  brightBlack: "hsl(0, 0%, 70%)",
  brightRed: "hsl(10.16, 77.87%, 63%)",
  brightGreen: "hsl(140, 70%, 50%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(16.67, 21.95%, 42%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(0, 0%, 98%)",
};

// Candy Light Theme
export const candyLightTheme: ITheme = {
  background: "hsl(200, 23.08%, 97.45%)",
  foreground: "hsl(0, 0%, 20%)",
  cursor: "hsl(349.52, 100%, 87.65%)",
  cursorAccent: "hsl(200, 23.08%, 97.45%)",
  selectionBackground: "hsla(349.52, 100%, 87.65%, 0.3)",
  black: "hsl(200, 20%, 95%)",
  red: "hsl(0, 84.24%, 60.2%)",
  green: "hsl(140, 70%, 35%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(349.52, 100%, 87.65%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(0, 0%, 98%)",
  brightBlack: "hsl(200, 20%, 40%)",
  brightRed: "hsl(0, 84.24%, 70%)",
  brightGreen: "hsl(140, 70%, 45%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(349.52, 100%, 97%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Candy Dark Theme
export const candyDarkTheme: ITheme = {
  background: "hsl(220, 14.75%, 11.96%)",
  foreground: "hsl(0, 0%, 89.8%)",
  cursor: "hsl(349.52, 100%, 87.65%)",
  cursorAccent: "hsl(220, 14.75%, 11.96%)",
  selectionBackground: "hsla(349.52, 100%, 87.65%, 0.4)",
  black: "hsl(220, 10%, 16%)",
  red: "hsl(0, 84.24%, 60.2%)",
  green: "hsl(140, 70%, 40%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(349.52, 100%, 87.65%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(0, 0%, 89.8%)",
  brightBlack: "hsl(220, 10%, 70%)",
  brightRed: "hsl(0, 84.24%, 70%)",
  brightGreen: "hsl(140, 70%, 50%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(349.52, 100%, 97%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(0, 0%, 98%)",
};

// Retro Light Theme
export const retroLightTheme: ITheme = {
  background: "hsl(43.85, 86.67%, 94.12%)",
  foreground: "hsl(192.2, 80.82%, 14.31%)",
  cursor: "hsl(330.96, 64.08%, 51.96%)",
  cursorAccent: "hsl(43.85, 86.67%, 94.12%)",
  selectionBackground: "hsla(330.96, 64.08%, 51.96%, 0.3)",
  black: "hsl(43.85, 80%, 90%)",
  red: "hsl(1.04, 71.19%, 52.35%)",
  green: "hsl(140, 70%, 35%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(330.96, 64.08%, 51.96%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(192.2, 80.82%, 98%)",
  brightBlack: "hsl(43.85, 40%, 40%)",
  brightRed: "hsl(1.04, 71.19%, 62%)",
  brightGreen: "hsl(140, 70%, 45%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(330.96, 64.08%, 61%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(192.2, 80.82%, 100%)",
};

// Retro Dark Theme
export const retroDarkTheme: ITheme = {
  background: "hsl(192.22, 100%, 10.59%)",
  foreground: "hsl(180, 6.93%, 60.39%)",
  cursor: "hsl(330.96, 64.08%, 51.96%)",
  cursorAccent: "hsl(192.22, 100%, 10.59%)",
  selectionBackground: "hsla(330.96, 64.08%, 51.96%, 0.4)",
  black: "hsl(192.22, 80%, 16%)",
  red: "hsl(1.04, 71.19%, 52.35%)",
  green: "hsl(140, 70%, 40%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(330.96, 64.08%, 51.96%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(180, 6.93%, 60.39%)",
  brightBlack: "hsl(192.22, 40%, 70%)",
  brightRed: "hsl(1.04, 71.19%, 62%)",
  brightGreen: "hsl(140, 70%, 50%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(330.96, 64.08%, 61%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(180, 6.93%, 80%)",
};

// Graphite Light Theme
export const graphiteLightTheme: ITheme = {
  background: "hsl(0, 0%, 94.12%)",
  foreground: "hsl(0, 0%, 20%)",
  cursor: "hsl(0, 0%, 37.65%)",
  cursorAccent: "hsl(0, 0%, 94.12%)",
  selectionBackground: "hsla(0, 0%, 37.65%, 0.3)",
  black: "hsl(0, 0%, 90%)",
  red: "hsl(0, 60%, 50%)",
  green: "hsl(140, 70%, 35%)",
  yellow: "hsl(42, 87%, 55%)",
  blue: "hsl(0, 0%, 37.65%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(180, 70%, 45%)",
  white: "hsl(0, 0%, 98%)",
  brightBlack: "hsl(0, 0%, 40%)",
  brightRed: "hsl(0, 60%, 60%)",
  brightGreen: "hsl(140, 70%, 45%)",
  brightYellow: "hsl(42, 87%, 65%)",
  brightBlue: "hsl(0, 0%, 47%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(180, 70%, 55%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Graphite Dark Theme
export const graphiteDarkTheme: ITheme = {
  background: "hsl(0, 0%, 10.2%)",
  foreground: "hsl(0, 0%, 85.1%)",
  cursor: "hsl(0, 0%, 37.65%)",
  cursorAccent: "hsl(0, 0%, 10.2%)",
  selectionBackground: "hsla(0, 0%, 37.65%, 0.4)",
  black: "hsl(0, 0%, 16%)",
  red: "hsl(0, 60%, 50%)",
  green: "hsl(140, 70%, 40%)",
  yellow: "hsl(42, 87%, 60%)",
  blue: "hsl(0, 0%, 37.65%)",
  magenta: "hsl(300, 60%, 60%)",
  cyan: "hsl(180, 70%, 50%)",
  white: "hsl(0, 0%, 85.1%)",
  brightBlack: "hsl(0, 0%, 70%)",
  brightRed: "hsl(0, 60%, 60%)",
  brightGreen: "hsl(140, 70%, 50%)",
  brightYellow: "hsl(42, 87%, 70%)",
  brightBlue: "hsl(0, 0%, 47%)",
  brightMagenta: "hsl(300, 60%, 70%)",
  brightCyan: "hsl(180, 70%, 60%)",
  brightWhite: "hsl(0, 0%, 98%)",
};

// Function to get the appropriate theme based on design theme and color mode
export const getTerminalTheme = (
  designTheme: string,
  isDark: boolean
): ITheme => {
  switch (designTheme) {
    case "default":
      return isDark ? catppuccinDarkTheme : catppuccinLightTheme;
    case "bubblegum":
      return isDark ? bubblegumDarkTheme : bubblegumLightTheme;
    case "ocean":
      return isDark ? oceanDarkTheme : oceanLightTheme;
    case "coffee":
      return isDark ? coffeeDarkTheme : coffeeLightTheme;
    case "candy":
      return isDark ? candyDarkTheme : candyLightTheme;
    case "retro":
      return isDark ? retroDarkTheme : retroLightTheme;
    case "graphite":
      return isDark ? graphiteDarkTheme : graphiteLightTheme;
    default:
      return isDark ? catppuccinDarkTheme : catppuccinLightTheme;
  }
};
