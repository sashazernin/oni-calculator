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
    average: string;
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
  shadow: {
    default: string;
  };
  /** Нейтральные обводки (панели, поля в покое, разделители). */
  border: {
    main: string;
  };
  translucent: {
    main: string;
    hover: string;
    active: string;
    iconFocus: string;
    iconRipple: string;
  };
}

const theme = (appTheme: ISupportedThemes) => {
  const darkPrimary = {
    main: 'rgb(40 127 121)',
    hover: 'rgb(50 120 118)',
    active: 'rgb(22 58 55)',
    contrastText: '#f0fdff',
  } satisfies ThemeOptions['primary'];

  const lightPrimary = {
    main: 'rgb(84 201 194)',
    hover: 'rgb(120 220 214)',
    active: 'rgb(50 150 145)',
    contrastText: '#ffffff',
  } satisfies ThemeOptions['primary'];

  const pDark = darkPrimary.main;
  const pLight = lightPrimary.main;

  const darkBg = {
    default: '#2d2d2d',
    paper: '#252525',
    average: `color-mix(in srgb, rgb(232, 232, 232) 7%, rgb(37, 37, 37))`
  } as const;
  const lightBg = {
    default: '#f5f5f5',
    paper: '#ffffff',
    average: `color-mix(in srgb, rgb(31, 31, 31) 7%, rgb(255, 255, 255))`,
  } as const;

  const darkSchema: ThemeOptions = {
    mode: 'dark',
    background: {
      ...darkBg
    },
    primary: darkPrimary,
    text: {
      primary: '#e8e8e8'
    },
    layout: {
      background: '#252525'
    },
    shadow: {
      default: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
    },
    border: {
      main: 'rgba(255, 255, 255, 0.12)',
    },
    translucent: {
      main: `color-mix(in srgb, ${pDark} 28%, transparent)`,
      hover: `color-mix(in srgb, ${pDark} 40%, transparent)`,
      active: `color-mix(in srgb, ${pDark} 50%, transparent)`,
      iconFocus: `color-mix(in srgb, ${pDark} 55%, transparent)`,
      iconRipple: `color-mix(in srgb, ${pDark} 34%, transparent)`,
    },
  };

  const lightSchema: ThemeOptions = {
    mode: 'light',
    background: {
      ...lightBg
    },
    primary: lightPrimary,
    text: {
      primary: '#1f1f1f'
    },
    layout: {
      background: '#e8e8e8'
    },
    shadow: {
      default: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
    },
    border: {
      main: 'rgba(0, 0, 0, 0.12)',
    },
    translucent: {
      main: `color-mix(in srgb, ${pLight} 16%, transparent)`,
      hover: `color-mix(in srgb, ${pLight} 24%, transparent)`,
      active: `color-mix(in srgb, ${pLight} 32%, transparent)`,
      iconFocus: `color-mix(in srgb, ${pLight} 52%, transparent)`,
      iconRipple: `color-mix(in srgb, ${pLight} 34%, transparent)`,
    },
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
    document.documentElement.style.setProperty(
      '--border',
      colors.border.main
    );
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ theme: appTheme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
