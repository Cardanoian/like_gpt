import { ThemeProvider } from './contexts/ThemeContext';
import { ChatView } from './views/ChatView';

function App() {
	return (
		<ThemeProvider>
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
				<ChatView />
			</div>
		</ThemeProvider>
	);
}

export default App;
