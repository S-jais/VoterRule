import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, t, SUPPORTED_LANGUAGES } from '@voterrule/i18n';

export type Theme = 'dark' | 'light';

interface UserSession {
  id: string;
  displayName: string;
  email?: string;
  locale: Locale;
  isStaff: boolean;
  token?: string;
}

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  liteMode: boolean;
  setLiteMode: (lite: boolean) => void;
  user: UserSession | null;
  setUser: (u: UserSession | null) => void;
  isDemo: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('voterrule_theme') as Theme | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [liteMode, setLiteModeState] = useState<boolean>(false);
  const [user, setUserState] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('voterrule_user') || localStorage.getItem('voterrule_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isDemo] = useState<boolean>(true);

  const setUser = (u: UserSession | null) => {
    setUserState(u);
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem('voterrule_user', JSON.stringify(u));
      } else {
        localStorage.removeItem('voterrule_user');
        localStorage.removeItem('voterrule_user');
      }
    }
  };

  // Load preferences from localStorage safely & sync with DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('voterrule_theme') || localStorage.getItem('voterrule_theme')) as Theme | null;
      let effectiveTheme: Theme = theme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        effectiveTheme = savedTheme;
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = prefersDark ? 'dark' : 'light';
      }
      setThemeState(effectiveTheme);
      document.documentElement.setAttribute('data-theme', effectiveTheme);

      const savedLocale = (localStorage.getItem('voterrule_locale') || localStorage.getItem('voterrule_locale')) as Locale | null;
      if (savedLocale && SUPPORTED_LANGUAGES.some((sl) => sl.code === savedLocale)) {
        setLocaleState(savedLocale);
        document.documentElement.lang = savedLocale;
        document.documentElement.dir = savedLocale === 'ur' ? 'rtl' : 'ltr';
      }
      const savedLite = localStorage.getItem('voterrule_lite_mode') || localStorage.getItem('voterrule_lite_mode');
      const isLite = savedLite === 'true';
      if (isLite) {
        setLiteModeState(true);
      }
      const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.documentElement.classList.toggle('lite', isLite);
      document.documentElement.classList.toggle('motion', !isLite && !rm);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voterrule_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voterrule_locale', l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr';
    }
  };

  const setLiteMode = (lite: boolean) => {
    setLiteModeState(lite);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voterrule_lite_mode', String(lite));
      document.documentElement.classList.toggle('lite', lite);
      document.documentElement.classList.toggle('motion', !lite);
    }
  };

  const translate = (key: string, vars?: Record<string, string | number>) => {
    return t(locale, key, vars);
  };

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        toggleTheme,
        liteMode,
        setLiteMode,
        user,
        setUser,
        isDemo,
        t: translate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
