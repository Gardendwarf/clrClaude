import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const LS_THEME_KEY = 'clrclaude_theme';

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(LS_THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable
  }
  // No stored preference: honour the OS setting, defaulting to light.
  try {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // matchMedia unavailable
  }
  return 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Apply the data-theme attribute to <html> so CSS tokens switch
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(LS_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
