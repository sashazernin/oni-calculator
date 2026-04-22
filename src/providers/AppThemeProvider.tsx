import { createContext, useLayoutEffect, useMemo, useState } from 'react';

export const supportedThemes = ['system', 'light', 'dark'];

export type ISupportedThemes = typeof supportedThemes[number];

export const THEME_STORAGE_KEY = 'theme';

function readStoredTheme(): ISupportedThemes {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw && (supportedThemes as readonly string[]).includes(raw)) {
      return raw as ISupportedThemes;
    }
  } catch {
    /* private mode, quota, … */
  }
  return 'system';
}

interface ThemeOptions {
  mode: 'light' | 'dark';
  background: {
    default: string;
    paper: string;
  };
  primary: {
    main: string;
    hover: string;
    active: string;
    contrastText: string;
  };
  text: {
    primary: string;
  };
  layout: {
    background: string;
  };
}

const theme = (appTheme: ISupportedThemes) => {
  const darkSchema: ThemeOptions = {
    mode: 'dark',
    background: {
      default: 'rgb(17 34 41)',
      paper: '#0d1e25'
    },
    primary: {
      main: 'rgb(34 187 201)', // морской неон
      hover: 'rgb(72 210 220)',
      active: 'rgb(22 150 170)',
      contrastText: '#f0fdff'
    },
    text: {
      primary: '#d2eef2'
    },
    layout: {
      background: 'rgb(7 46 53)'
    }
  };

  const lightSchema: ThemeOptions = {
    mode: 'light',
    background: {
      default: '#f0fbfc',
      paper: '#e1f2f0'
    },
    primary: {
      main: 'rgb(11 128 140)',
      hover: 'rgb(16 155 170)',
      active: 'rgb(8 105 116)',
      contrastText: '#ffffff'
    },
    text: {
      primary: '#0a2f38'
    },
    layout: {
      background: 'rgb(10 130 145)'
    }
  };

  const themeColors = (() => {
    switch (appTheme) {
      case 'dark': return darkSchema;
      case 'light': return lightSchema;
      default: return lightSchema;
    }
  })();

  return themeColors;
};

export const ThemeContext = createContext({
  theme: "light" as ISupportedThemes,
  toggleTheme: (_theme: ISupportedThemes) => { },
  colors: theme('light'),
});

export function AppThemeProvider({
  children
}: Readonly<{
  children: React.ReactNode;
  userId?: string;
}>) {
  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [appTheme, setAppTheme] = useState<ISupportedThemes>(() => readStoredTheme());

  const toggleTheme = (next: ISupportedThemes) => {
    setAppTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const currentTheme = useMemo(() => {
    if (appTheme === 'system') {
      return systemDarkMode ? 'dark' : 'light';
    }
    return appTheme;
  }, [appTheme, systemDarkMode]);

  const colors = useMemo(() => theme(currentTheme), [currentTheme]);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      '--text-primary',
      colors.text.primary
    );
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ theme: appTheme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
