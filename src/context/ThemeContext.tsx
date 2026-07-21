import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeClasses {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  input: string;
  accentBg: string;
  accentText: string;
  hover: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  classes: ThemeClasses;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme_mode') as ThemeMode;
    return saved || 'system';
  });
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme_mode', mode);
    
    const applyTheme = () => {
      let isDarkMode = false;
      if (mode === 'dark') {
        isDarkMode = true;
      } else if (mode === 'light') {
        isDarkMode = false;
      } else {
        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      setIsDark(isDarkMode);
      
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      }
    };
    
    applyTheme();
    
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [mode]);

  const toggleTheme = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  // القيم الديناميكية للألوان بناءً على الوضع المختار
  // تلبي طلب توحيد ألوان القوالب والنصوص عبر جميع المكونات
  const classes: ThemeClasses = {
    bg: isDark ? 'bg-[#0f172a]' : 'bg-slate-50', // ألوان خلفية عصرية
    card: isDark ? 'bg-slate-800/80 border-slate-700 backdrop-blur-sm' : 'bg-white border-slate-200 shadow-sm',
    text: isDark ? 'text-[#f8fafc]' : 'text-slate-800',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-slate-500',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    input: isDark ? 'bg-slate-900/50 border-slate-700 text-[#f8fafc] focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500',
    accentBg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100',
    accentText: isDark ? 'text-blue-400' : 'text-blue-600',
    hover: isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50',
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, classes, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
