import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppID } from './types';
import Taskbar from './components/Taskbar';
import NewsStories from './components/NewsStories';
import WeatherDashboard from './components/WeatherDashboard';
import TransitBoard from './components/TransitBoard';

export default function App() {
  const [activeApp, setActiveApp] = useState<AppID>('news');

  // Parse URL query parameter on load & when history changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const appQuery = params.get('app');
      
      if (appQuery === 'news' || appQuery === 'weather' || appQuery === 'transit') {
        setActiveApp(appQuery as AppID);
      } else {
        // Default to news, but make sure URL reflects it if no app query
        setActiveApp('news');
      }
    };

    // Run on initial load
    handleUrlChange();

    // Listen to browser navigation (back/forward button)
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const handleSelectApp = (app: AppID) => {
    setActiveApp(app);
    
    // Update URL query parameter seamlessly without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('app', app);
    window.history.pushState({ app }, '', newUrl.toString());
  };

  return (
    <div className="relative w-screen h-screen bg-[#02050b] text-slate-100 overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* Dynamic glow decoration overlay in background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none z-0" />

      {/* Main Screen Content View */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeApp === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <NewsStories />
            </motion.div>
          )}

          {activeApp === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <WeatherDashboard />
            </motion.div>
          )}

          {activeApp === 'transit' && (
            <motion.div
              key="transit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <TransitBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Windows-style bottom Tasklist Taskbar */}
      <Taskbar activeApp={activeApp} onSelectApp={handleSelectApp} />
    </div>
  );
}
