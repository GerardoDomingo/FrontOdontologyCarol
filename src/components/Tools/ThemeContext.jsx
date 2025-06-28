// src/context/ThemeContext.jsx
import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        console.error("useThemeContext debe usarse dentro de ThemeProviderComponent");
        return { isDarkTheme: false, toggleTheme: () => {} };
    }
    return context;
};

const ThemeProviderComponent = ({ children }) => {
    // Detectar la preferencia del sistema al cargar
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Obtener el tema guardado o usar la preferencia del sistema
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const storedTheme = localStorage.getItem('appTheme');
        return storedTheme ? storedTheme === 'dark' : prefersDarkMode;
    });

    // Alternar el tema y guardarlo en localStorage
    const toggleTheme = useCallback(() => {
        setIsDarkTheme((prev) => {
            const newTheme = !prev;
            localStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
            return newTheme;
        });
    }, []);

    // Crear el tema de Material UI basado en el estado actual
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: isDarkTheme ? 'dark' : 'light',
                },
            }),
        [isDarkTheme]
    );

    // Sincronizar el tema con la preferencia del sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => setIsDarkTheme(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProviderComponent;
