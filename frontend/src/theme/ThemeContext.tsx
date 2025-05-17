import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: { main: mode === 'dark' ? '#183153' : '#4f6d9a' },
    secondary: { main: mode === 'dark' ? '#4f6d9a' : '#183153' },
    background: {
      default: mode === 'dark' ? '#16213a' : '#e6ecf5',
      paper: mode === 'dark' ? '#1a2236' : '#fff',
    },
    text: {
      primary: mode === 'dark' ? '#fff' : '#1a2236',
      secondary: mode === 'dark' ? '#e6ecf5' : '#4a5677',
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#16213a' : '#e6ecf5',
        },
      },
    },
  },
});

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === 'dark' || saved === 'light') setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const muiTheme = createTheme(getDesignTokens(theme));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 