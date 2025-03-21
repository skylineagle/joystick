import { ITheme } from "xterm";

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
