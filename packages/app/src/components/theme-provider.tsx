import { createContext, useContext, useEffect, useState } from "react";

type ColorMode = "dark" | "light" | "system";
type DesignTheme = "default" | "bubblegum" | "ocean" | "coffee";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultColorMode?: ColorMode;
  defaultDesignTheme?: DesignTheme;
  storageKeyPrefix?: string;
};

type ThemeProviderState = {
  colorMode: ColorMode;
  designTheme: DesignTheme;
  setColorMode: (colorMode: ColorMode) => void;
  setDesignTheme: (designTheme: DesignTheme) => void;
  getActualColorMode: () => "dark" | "light";
};

const initialState: ThemeProviderState = {
  colorMode: "system",
  designTheme: "default",
  setColorMode: () => null,
  setDesignTheme: () => null,
  getActualColorMode: () => "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultColorMode = "system",
  defaultDesignTheme = "default",
  storageKeyPrefix = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [colorMode, setColorMode] = useState<ColorMode>(
    () =>
      (localStorage.getItem(`${storageKeyPrefix}-mode`) as ColorMode) ||
      defaultColorMode
  );

  const [designTheme, setDesignTheme] = useState<DesignTheme>(
    () =>
      (localStorage.getItem(`${storageKeyPrefix}-design`) as DesignTheme) ||
      defaultDesignTheme
  );

  const getActualColorMode = (): "dark" | "light" => {
    if (colorMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return colorMode;
  };

  useEffect(() => {
    const root = window.document.documentElement;

    // Handle color mode
    root.classList.remove("light", "dark");

    if (colorMode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(colorMode);
    }

    // Handle design theme
    root.classList.remove(
      "default-theme",
      "bubblegum-theme",
      "ocean-theme",
      "coffee-theme"
    );
    root.classList.add(`${designTheme}-theme`);
  }, [colorMode, designTheme]);

  const value = {
    colorMode,
    designTheme,
    setColorMode: (mode: ColorMode) => {
      localStorage.setItem(`${storageKeyPrefix}-mode`, mode);
      setColorMode(mode);
    },
    setDesignTheme: (theme: DesignTheme) => {
      localStorage.setItem(`${storageKeyPrefix}-design`, theme);
      setDesignTheme(theme);
    },
    getActualColorMode,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
