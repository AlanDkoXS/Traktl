import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Auto-detect system preference on first load
    if (theme === 'system' || !theme) {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const preferredTheme = isSystemDark ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', isSystemDark);
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system preference change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
};
