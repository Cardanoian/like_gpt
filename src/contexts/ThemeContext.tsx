// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== 'undefined') {
			return (localStorage.getItem('theme') as Theme) || 'system';
		}
		return 'system';
	});

	useEffect(() => {
		function updateTheme() {
			const root = window.document.documentElement;
			const systemDark = window.matchMedia(
				'(prefers-color-scheme: dark)'
			).matches;

			root.classList.remove('dark');

			const effectiveTheme =
				theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

			if (effectiveTheme === 'dark') {
				root.classList.add('dark');
			}

			localStorage.setItem('theme', theme);
		}

		updateTheme();

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => updateTheme();
		mediaQuery.addEventListener('change', handler);

		return () => mediaQuery.removeEventListener('change', handler);
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
