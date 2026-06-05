"use client";

import { createContext, useContext, useMemo } from "react";
import { THEMES } from "@/lib/constants";
import { ThemeName } from "@/types/invitation";

const ThemeContext = createContext<ThemeName>("ivory");

export function ThemeProvider({ theme, children }: { theme: ThemeName; children: React.ReactNode }) {
  const cssVars = useMemo(
    () => ({
      ["--bg" as string]: THEMES[theme].bg,
      ["--text" as string]: THEMES[theme].text,
      ["--accent" as string]: THEMES[theme].accent,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <div className="theme-shell" style={cssVars}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
