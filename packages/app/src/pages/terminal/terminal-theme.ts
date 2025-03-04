import { ITheme } from "xterm";
export const customLightTheme: ITheme = {
  background: "hsl(191.1, 44%, 96.5%)", // --background
  foreground: "hsl(191.1, 2.2%, 8.3%)", // --foreground
  cursor: "hsl(191.1, 42.7%, 44.5%)", // --primary
  cursorAccent: "hsl(191.1, 44%, 96.5%)", // --background
  selectionBackground: "hsla(191.1, 18.8%, 83%, 0.3)", // --secondary with opacity
  black: "hsl(191.1, 27.6%, 8.3%)", // dark mode --background
  red: "hsl(0, 72%, 43%)", // --destructive
  green: "hsl(142, 76%, 36%)", // Custom green color
  yellow: "hsl(42, 87%, 55%)", // Custom yellow color
  blue: "hsl(191.1, 42.7%, 44.5%)", // --primary
  magenta: "hsl(301, 64%, 53%)", // Custom magenta color
  cyan: "hsl(181, 98%, 45%)", // --sidebar-ring
  white: "hsl(191.1, 2.2%, 96.5%)", // dark mode --foreground
  brightBlack: "hsl(191.1, 2.2%, 38.3%)", // --muted-foreground
  brightRed: "hsl(0, 84%, 60%)", // Brighter --destructive
  brightGreen: "hsl(142, 76%, 48%)", // Brighter green
  brightYellow: "hsl(42, 87%, 65%)", // Brighter yellow
  brightBlue: "hsl(191.1, 88.7%, 45.3%)", // --ring
  brightMagenta: "hsl(301, 64%, 63%)", // Brighter magenta
  brightCyan: "hsl(181, 98%, 55%)", // Brighter cyan
  brightWhite: "hsl(191.1, 44%, 98.3%)", // --popover
};

export const customDarkTheme: ITheme = {
  background: "hsl(191.1, 27.6%, 8.3%)", // --background
  foreground: "hsl(191.1, 2.2%, 96.5%)", // --foreground
  cursor: "hsl(191.1, 42.7%, 44.5%)", // --primary
  cursorAccent: "hsl(191.1, 27.6%, 8.3%)", // --background
  selectionBackground: "hsla(229.1, 18.8%, 21.5%, 0.4)", // --accent with opacity
  black: "hsl(191.1, 22%, 6.5%)", // --card
  red: "hsl(0, 72%, 43%)", // --destructive
  green: "hsl(142, 76%, 45%)", // Custom green color
  yellow: "hsl(42, 87%, 60%)", // Custom yellow color
  blue: "hsl(191.1, 42.7%, 44.5%)", // --primary
  magenta: "hsl(301, 64%, 58%)", // Custom magenta color
  cyan: "hsl(181, 98%, 45%)", // --sidebar-ring
  white: "hsl(191.1, 2.2%, 96.5%)", // --foreground
  brightBlack: "hsl(191.1, 2.2%, 63.3%)", // --muted-foreground
  brightRed: "hsl(0, 84%, 60%)", // Brighter --destructive
  brightGreen: "hsl(142, 76%, 55%)", // Brighter green
  brightYellow: "hsl(42, 87%, 70%)", // Brighter yellow
  brightBlue: "hsl(191.1, 88.7%, 45.3%)", // --ring
  brightMagenta: "hsl(301, 64%, 68%)", // Brighter magenta
  brightCyan: "hsl(181, 98%, 55%)", // Brighter cyan
  brightWhite: "hsl(191.1, 2.2%, 96.5%)", // --foreground
};
