import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
	const { theme, setTheme } = useTheme();
	console.log(theme);

	return (
		<button
			onClick={() => {
				setTheme(theme === 'light' ? 'dark' : 'light');
			}}
			className='p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
			title={`Current theme: ${theme}`}
		>
			{theme === 'light' && <Sun className='w-5 h-5' />}
			{theme === 'dark' && <Moon className='w-5 h-5' />}
			{theme === 'system' && <Monitor className='w-5 h-5' />}
		</button>
	);
};
