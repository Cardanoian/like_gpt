/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			animation: {
				'bounce-slow': 'bounce 1.5s infinite',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};