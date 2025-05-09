import { ITheme } from "xterm";

// Default Light Theme
export const defaultLightTheme: ITheme = {
  background: "hsl(0, 0%, 100%)",
  foreground: "hsl(0, 0%, 0%)",
  cursor: "hsl(177.22, 100%, 29.61%)",
  cursorAccent: "hsl(0, 0%, 100%)",
  selectionBackground: "hsla(0, 0%, 94.9%, 0.3)",
  black: "hsl(0, 0%, 100%)",
  red: "hsl(359.33, 100%, 65.1%)",
  green: "hsl(177.22, 100%, 29.61%)",
  yellow: "hsl(177.22, 100%, 29.61%)",
  blue: "hsl(177.22, 100%, 29.61%)",
  magenta: "hsl(177.22, 100%, 29.61%)",
  cyan: "hsl(177.22, 100%, 29.61%)",
  white: "hsl(0, 0%, 100%)",
  brightBlack: "hsl(0, 0%, 45.1%)",
  brightRed: "hsl(359.33, 100%, 65.1%)",
  brightGreen: "hsl(177.22, 100%, 29.61%)",
  brightYellow: "hsl(177.22, 100%, 29.61%)",
  brightBlue: "hsl(177.22, 100%, 29.61%)",
  brightMagenta: "hsl(177.22, 100%, 29.61%)",
  brightCyan: "hsl(177.22, 100%, 29.61%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Default Dark Theme
export const defaultDarkTheme: ITheme = {
  background: "hsl(0, 0%, 0%)",
  foreground: "hsl(0, 0%, 100%)",
  cursor: "hsl(177.22, 100%, 29.61%)",
  cursorAccent: "hsl(0, 0%, 0%)",
  selectionBackground: "hsla(0, 0%, 10.2%, 0.3)",
  black: "hsl(0, 0%, 5.1%)",
  red: "hsl(359.33, 100%, 65.1%)",
  green: "hsl(177.22, 100%, 29.61%)",
  yellow: "hsl(177.22, 100%, 29.61%)",
  blue: "hsl(177.22, 100%, 29.61%)",
  magenta: "hsl(177.22, 100%, 29.61%)",
  cyan: "hsl(177.22, 100%, 29.61%)",
  white: "hsl(0, 0%, 100%)",
  brightBlack: "hsl(0, 0%, 45.1%)",
  brightRed: "hsl(359.33, 100%, 65.1%)",
  brightGreen: "hsl(177.22, 100%, 29.61%)",
  brightYellow: "hsl(177.22, 100%, 29.61%)",
  brightBlue: "hsl(177.22, 100%, 29.61%)",
  brightMagenta: "hsl(177.22, 100%, 29.61%)",
  brightCyan: "hsl(177.22, 100%, 29.61%)",
  brightWhite: "hsl(0, 0%, 100%)",
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

// Catppuccin Light Theme
export const catppuccinLightTheme: ITheme = {
  background: "hsl(220, 23.08%, 94.9%)",
  foreground: "hsl(233.79, 16.02%, 35.49%)",
  cursor: "hsl(266.04, 85.05%, 58.04%)",
  cursorAccent: "hsl(220, 23.08%, 94.9%)",
  selectionBackground: "hsla(266.04, 85.05%, 58.04%, 0.3)",
  black: "hsl(220, 20.69%, 88.63%)",
  red: "hsl(347.08, 86.67%, 44.12%)",
  green: "hsl(109.23, 57.64%, 39.8%)",
  yellow: "hsl(21.98, 99.18%, 51.96%)",
  blue: "hsl(266.04, 85.05%, 58.04%)",
  magenta: "hsl(300, 60%, 55%)",
  cyan: "hsl(197.07, 96.57%, 45.69%)",
  white: "hsl(240, 10%, 98%)",
  brightBlack: "hsl(232.8, 10.37%, 47.25%)",
  brightRed: "hsl(347.08, 86.67%, 54.12%)",
  brightGreen: "hsl(109.23, 57.64%, 49.8%)",
  brightYellow: "hsl(21.98, 99.18%, 61.96%)",
  brightBlue: "hsl(266.04, 85.05%, 68.04%)",
  brightMagenta: "hsl(300, 60%, 65%)",
  brightCyan: "hsl(197.07, 96.57%, 55.69%)",
  brightWhite: "hsl(220, 23.08%, 94.9%)",
};

// Catppuccin Dark Theme
export const catppuccinDarkTheme: ITheme = {
  background: "hsl(240, 21.31%, 11.96%)",
  foreground: "hsl(226.15, 63.93%, 88.04%)",
  cursor: "hsl(267.41, 83.51%, 80.98%)",
  cursorAccent: "hsl(240, 21.31%, 11.96%)",
  selectionBackground: "hsla(267.41, 83.51%, 80.98%, 0.3)",
  black: "hsl(230.53, 18.81%, 19.8%)",
  red: "hsl(343.27, 81.25%, 74.9%)",
  green: "hsl(115.45, 54.1%, 76.08%)",
  yellow: "hsl(22.96, 92%, 75.49%)",
  blue: "hsl(267.41, 83.51%, 80.98%)",
  magenta: "hsl(300, 60%, 70%)",
  cyan: "hsl(189.18, 71.01%, 72.94%)",
  white: "hsl(226.15, 63.93%, 88.04%)",
  brightBlack: "hsl(227.65, 23.61%, 71.76%)",
  brightRed: "hsl(343.27, 81.25%, 84.9%)",
  brightGreen: "hsl(115.45, 54.1%, 86.08%)",
  brightYellow: "hsl(22.96, 92%, 85.49%)",
  brightBlue: "hsl(267.41, 83.51%, 90.98%)",
  brightMagenta: "hsl(300, 60%, 80%)",
  brightCyan: "hsl(189.18, 71.01%, 82.94%)",
  brightWhite: "hsl(240, 21.31%, 11.96%)",
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

// Twitter Terminal Theme (matches .twitter-theme in index.css)
export const twitterLightTheme: ITheme = {
  background: "hsl(0, 0%, 100%)",
  foreground: "hsl(210, 25%, 7.84%)",
  cursor: "hsl(203.89, 88.28%, 53.14%)",
  cursorAccent: "hsl(0, 0%, 100%)",
  selectionBackground: "hsla(203.89, 88.28%, 53.14%, 0.3)",
  black: "hsl(240, 1.96%, 90%)",
  red: "hsl(356.3, 90.56%, 54.31%)",
  green: "hsl(159.78, 100%, 36.08%)",
  yellow: "hsl(42.03, 92.83%, 56.27%)",
  blue: "hsl(203.89, 88.28%, 53.14%)",
  magenta: "hsl(280, 90%, 50%)",
  cyan: "hsl(211.58, 51.35%, 92.75%)",
  white: "hsl(0, 0%, 100%)",
  brightBlack: "hsl(210, 25%, 7.84%)",
  brightRed: "hsl(356.3, 90.56%, 64.31%)",
  brightGreen: "hsl(159.78, 100%, 46.08%)",
  brightYellow: "hsl(42.03, 92.83%, 66.27%)",
  brightBlue: "hsl(203.89, 88.28%, 63.14%)",
  brightMagenta: "hsl(280, 90%, 60%)",
  brightCyan: "hsl(211.58, 51.35%, 97.75%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Twitter Terminal Theme (matches .twitter-theme in index.css)
export const twitterDarkTheme: ITheme = {
  background: "hsl(0, 0%, 0%)",
  foreground: "hsl(200, 6.67%, 91.18%)",
  cursor: "hsl(203.77, 87.6%, 52.55%)",
  cursorAccent: "hsl(0, 0%, 0%)",
  selectionBackground: "hsla(203.77, 87.6%, 52.55%, 0.3)",
  black: "hsl(0, 0%, 9.41%)",
  red: "hsl(356.3, 90.56%, 54.31%)",
  green: "hsl(159.78, 100%, 36.08%)",
  yellow: "hsl(42.03, 92.83%, 56.27%)",
  blue: "hsl(203.77, 87.6%, 52.55%)",
  magenta: "hsl(280, 90%, 60%)",
  cyan: "hsl(211.58, 51.35%, 92.75%)",
  white: "hsl(200, 6.67%, 91.18%)",
  brightBlack: "hsl(210, 3.39%, 46.27%)",
  brightRed: "hsl(356.3, 90.56%, 64.31%)",
  brightGreen: "hsl(159.78, 100%, 46.08%)",
  brightYellow: "hsl(42.03, 92.83%, 66.27%)",
  brightBlue: "hsl(203.77, 87.6%, 62.55%)",
  brightMagenta: "hsl(280, 90%, 70%)",
  brightCyan: "hsl(211.58, 51.35%, 97.75%)",
  brightWhite: "hsl(200, 6.67%, 91.18%)",
};

// Supabase Terminal Theme (matches .supabase-theme in index.css)
export const supabaseLightTheme: ITheme = {
  background: "hsl(0, 0%, 98.82%)",
  foreground: "hsl(0, 0%, 9.02%)",
  cursor: "hsl(151.33, 66.86%, 66.86%)",
  cursorAccent: "hsl(0, 0%, 98.82%)",
  selectionBackground: "hsla(151.33, 66.86%, 66.86%, 0.3)",
  black: "hsl(0, 0%, 92.94%)",
  red: "hsl(9.89, 81.98%, 43.53%)",
  green: "hsl(160.12, 84.08%, 39.41%)",
  yellow: "hsl(37.69, 92.13%, 50.2%)",
  blue: "hsl(151.33, 66.86%, 66.86%)",
  magenta: "hsl(258.31, 89.53%, 66.27%)",
  cyan: "hsl(217.22, 91.22%, 59.8%)",
  white: "hsl(0, 0%, 100%)",
  brightBlack: "hsl(0, 0%, 12.55%)",
  brightRed: "hsl(9.89, 81.98%, 53.53%)",
  brightGreen: "hsl(160.12, 84.08%, 49.41%)",
  brightYellow: "hsl(37.69, 92.13%, 60.2%)",
  brightBlue: "hsl(151.33, 66.86%, 76.86%)",
  brightMagenta: "hsl(258.31, 89.53%, 76.27%)",
  brightCyan: "hsl(217.22, 91.22%, 69.8%)",
  brightWhite: "hsl(0, 0%, 100%)",
};

// Supabase Terminal Theme (matches .supabase-theme in index.css)
export const supabaseDarkTheme: ITheme = {
  background: "hsl(0, 0%, 7.06%)",
  foreground: "hsl(214.29, 31.82%, 91.37%)",
  cursor: "hsl(154.9, 100%, 19.22%)",
  cursorAccent: "hsl(0, 0%, 7.06%)",
  selectionBackground: "hsla(154.9, 100%, 19.22%, 0.3)",
  black: "hsl(0, 0%, 12.16%)",
  red: "hsl(6.67, 60%, 20.59%)",
  green: "hsl(172.46, 66.01%, 50.39%)",
  yellow: "hsl(43.26, 96.41%, 56.27%)",
  blue: "hsl(154.9, 100%, 19.22%)",
  magenta: "hsl(255.14, 91.74%, 76.27%)",
  cyan: "hsl(213.12, 93.9%, 67.84%)",
  white: "hsl(214.29, 31.82%, 91.37%)",
  brightBlack: "hsl(0, 0%, 63.53%)",
  brightRed: "hsl(6.67, 60%, 30.59%)",
  brightGreen: "hsl(172.46, 66.01%, 60.39%)",
  brightYellow: "hsl(43.26, 96.41%, 66.27%)",
  brightBlue: "hsl(154.9, 100%, 29.22%)",
  brightMagenta: "hsl(255.14, 91.74%, 86.27%)",
  brightCyan: "hsl(213.12, 93.9%, 77.84%)",
  brightWhite: "hsl(214.29, 31.82%, 91.37%)",
};

// Vercel Terminal Theme (matches .vercel-theme in index.css)
export const vercelLightTheme: ITheme = {
  background: "hsl(223.81, 0%, 98.68%)",
  foreground: "hsl(0, 0%, 0%)",
  cursor: "hsl(0, 0%, 0%)",
  cursorAccent: "hsl(223.81, 0%, 98.68%)",
  selectionBackground: "hsla(0, 0%, 0%, 0.3)",
  black: "hsl(223.81, 0%, 92.15%)",
  red: "hsl(358.43, 74.91%, 59.75%)",
  green: "hsl(40.67, 100.24%, 50.92%)",
  yellow: "hsl(223.81, 0%, 64.47%)",
  blue: "hsl(0, 0%, 0%)",
  magenta: "hsl(223.75, 85.99%, 55.81%)",
  cyan: "hsl(223.81, 0%, 45.61%)",
  white: "hsl(223.81, 0%, 100%)",
  brightBlack: "hsl(223.81, 0%, 32.31%)",
  brightRed: "hsl(358.43, 74.91%, 69.75%)",
  brightGreen: "hsl(40.67, 100.24%, 60.92%)",
  brightYellow: "hsl(223.81, 0%, 74.47%)",
  brightBlue: "hsl(0, 0%, 10%)",
  brightMagenta: "hsl(223.75, 85.99%, 65.81%)",
  brightCyan: "hsl(223.81, 0%, 55.61%)",
  brightWhite: "hsl(223.81, 0%, 100%)",
};

// Vercel Terminal Theme (matches .vercel-theme in index.css)
export const vercelDarkTheme: ITheme = {
  background: "hsl(0, 0%, 0%)",
  foreground: "hsl(223.81, -172.52%, 100%)",
  cursor: "hsl(223.81, -172.52%, 100%)",
  cursorAccent: "hsl(0, 0%, 0%)",
  selectionBackground: "hsla(223.81, -172.52%, 100%, 0.3)",
  black: "hsl(223.81, 0%, 6.87%)",
  red: "hsl(359.91, 100.25%, 67.88%)",
  green: "hsl(218.16, 90.04%, 55.16%)",
  yellow: "hsl(223.81, 0%, 64.47%)",
  blue: "hsl(223.81, -172.52%, 100%)",
  magenta: "hsl(223.75, 85.99%, 55.81%)",
  cyan: "hsl(223.81, 0%, 45.61%)",
  white: "hsl(223.81, -172.52%, 100%)",
  brightBlack: "hsl(223.81, 0%, 64.47%)",
  brightRed: "hsl(359.91, 100.25%, 77.88%)",
  brightGreen: "hsl(218.16, 90.04%, 65.16%)",
  brightYellow: "hsl(223.81, 0%, 74.47%)",
  brightBlue: "hsl(223.81, 0%, 16.87%)",
  brightMagenta: "hsl(223.75, 85.99%, 65.81%)",
  brightCyan: "hsl(223.81, 0%, 55.61%)",
  brightWhite: "hsl(223.81, -172.52%, 100%)",
};

// Function to get the appropriate theme based on design theme and color mode
export const getTerminalTheme = (
  designTheme: string,
  isDark: boolean
): ITheme => {
  switch (designTheme) {
    case "default":
      return isDark ? defaultDarkTheme : defaultLightTheme;
    case "catppuccin":
      return isDark ? catppuccinDarkTheme : catppuccinLightTheme;
    case "twitter":
      return isDark ? twitterDarkTheme : twitterLightTheme;
    case "supabase":
      return isDark ? supabaseDarkTheme : supabaseLightTheme;
    case "vercel":
      return isDark ? vercelDarkTheme : vercelLightTheme;
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
