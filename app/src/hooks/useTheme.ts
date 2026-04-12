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
  // Default to light per clr design system
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
