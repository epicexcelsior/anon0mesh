import React, { createContext, useContext } from "react";

import { appTheme } from "@/src/design-system/theme";

type AppTheme = typeof appTheme;

const ThemeContext = createContext<AppTheme>(appTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={appTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
