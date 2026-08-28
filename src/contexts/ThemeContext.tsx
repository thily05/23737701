import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { COLORS } from '@constants/theme';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
    border: string;
    error: string;
    success: string;
}

export const lightColors: ThemeColors = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    textLight: COLORS.textLight,
    border: COLORS.border,
    error: COLORS.error,
    success: COLORS.success,
};

export const darkColors: ThemeColors = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.darkBackground,
    surface: COLORS.darkSurface,
    text: COLORS.darkText,
    textLight: '#99F6E4',
    border: '#134E4A',
    error: COLORS.error,
    success: COLORS.success,
};

interface ThemeContextType {
    theme: ThemeMode;
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeMode>('light');

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const isDark = theme === 'dark';
    const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

    const value = useMemo(
        () => ({
            theme,
            isDark,
            colors,
            toggleTheme,
            setTheme,
        }),
        [theme, isDark, colors, toggleTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Chuẩn điểm: Ném lỗi nếu dùng ngoài ThemeProvider
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
