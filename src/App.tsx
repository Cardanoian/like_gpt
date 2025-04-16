import { ThemeProvider } from './contexts/ThemeContext';
import { ChatView } from './views/ChatView';
import { useEffect } from 'react';
import 'katex/dist/katex.min.css';

function App() {
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // 초기 높이 설정
    setAppHeight();

    // resize 및 orientation 변경 시 높이 재설정
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);

    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);

  return (
    <ThemeProvider>
      <div className='min-h-[var(--app-height)] bg-gray-50 dark:bg-gray-900'>
        <ChatView />
      </div>
    </ThemeProvider>
  );
}

export default App;
