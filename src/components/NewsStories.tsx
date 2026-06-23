import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsStory } from '../types';
import { INITIAL_STORIES } from '../data';
import { Calendar, User, Clock, ArrowRight, RefreshCw } from 'lucide-react';

const DURATION = 7000; // 7 seconds

/* ---------- RELATIVE TIME HELPER ---------- */
function formatRelativeTime(dateStr: string): string {
  try {
    if (!dateStr) return 'Jetzt';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Jetzt';

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return 'Jetzt';
    if (diffMins < 60) return `${Math.max(1, diffMins)}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('de-CH', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return 'Jetzt';
  }
}

/* ---------- BADGE HELPER ---------- */
function getBadge(s: NewsStory): string {
  const t = (s.title + ' ' + (s.category || '')).toLowerCase();
  if (t.includes('live') || t.includes('ticker')) return 'LIVE-TICKER';
  if (t.includes('interview')) return 'INTERVIEW';
  if (t.includes('kommentar')) return 'KOMMENTAR';
  if (t.includes('kurzmeldung')) return 'KURZMELDUNG';
  if (t.includes('analyse')) return 'ANALYSE';
  return '';
}

export default function NewsStories() {
  const [stories] = useState<NewsStory[]>(INITIAL_STORIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const progressInterval = useRef<number | null>(null);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    // Reset timer and progress when starting a new slide
    setProgress(0);
    startTime.current = Date.now();

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const stepMs = 30; // Milliseconds for visual smoothness
    progressInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setCurrentIndex((prev) => (prev + 1) % stories.length);
      }
    }, stepMs);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, stories.length]);

  const activeStory = stories[currentIndex] || stories[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex justify-center items-center overflow-hidden bg-[#000]">
      {/* Aspect locked content box matching Calc format to look like a physical display */}
      <div 
        id="news-story-display" 
        className="w-full h-full sm:max-w-[430px] sm:max-h-[760px] md:max-w-[450px] md:max-h-[800px] lg:max-w-[500px] lg:max-h-[880px] bg-[#050b14] relative overflow-hidden flex flex-col shadow-2xl border border-slate-800/40 rounded-t-xl sm:rounded-b-xl"
      >
        {/* SEGMENTED PROGRESS INDICATION */}
        <div className="absolute top-[2.5vh] left-0 right-0 flex gap-1.5 px-[4%] z-30">
          {stories.map((s, idx) => {
            let widthPct = 0;
            if (idx < currentIndex) {
              widthPct = 100;
            } else if (idx === currentIndex) {
              widthPct = progress;
            } else {
              widthPct = 0;
            }

            return (
              <div 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer backdrop-blur-[2px]"
                title={`Story ${idx + 1}`}
              >
                <div 
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* HEADER META DATA */}
        <div className="absolute top-[5vh] left-0 right-0 flex justify-between px-[5%] z-30 select-none pointer-events-none">
          <div className="text-[1.8vh] font-bold drop-shadow-md">
            <span className="text-white bg-slate-900/30 px-2 py-0.5 rounded backdrop-blur-[2px]">
              {activeStory?.category || 'NZZ'}
            </span>
            <span className="text-[#a2aebf]/90 ml-2 font-normal bg-slate-900/30 px-1.5 py-0.5 rounded backdrop-blur-[2px]">
              {formatRelativeTime(activeStory?.pubDate)}
            </span>
          </div>
        </div>

        {/* ROTATING SLIDES CONTAINER */}
        <div className="flex-1 flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Image Section */}
              <div className="h-[48%] relative overflow-hidden group">
                <img 
                  referrerPolicy="no-referrer"
                  src={activeStory?.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200'} 
                  alt={activeStory?.title}
                  className="w-full h-full object-fit-cover object-center transition-transform duration-[7000ms] scale-100 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-transparent to-transparent opacity-80" />
              </div>

              {/* Text Content Section */}
              <div className="flex-1 px-[6%] pt-[3vh] pb-[4vh] flex flex-col">
                {/* Custom Category Badge finder */}
                {getBadge(activeStory) && (
                  <div className="text-[1.3vh] font-extrabold text-[#2e96ff] tracking-[1.5px] uppercase mb-[1.5vh]">
                    {getBadge(activeStory)}
                  </div>
                )}

                <h1 className="font-serif text-[3.2vh] leading-tight text-white font-semibold mb-[2vh] tracking-tight">
                  {activeStory?.title}
                </h1>

                <p className="text-[1.8vh] text-[#a2aebf] leading-relaxed mb-auto overflow-y-auto">
                  {activeStory?.description}
                </p>

                {activeStory?.creator && (
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-900/50">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <User size={12} />
                    </div>
                    <p className="text-[1.5vh] text-[#a2aebf]/70 font-medium">
                      {activeStory.creator}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* MANUAL NAVIGATION OVERLAYS FOR COMFORT */}
        <div className="absolute top-[20%] left-0 bottom-[55%] w-[15%] cursor-poly pointer-events-auto hover:bg-gradient-to-r hover:from-white/5 to-transparent flex items-center justify-start p-2 transition-opacity group" onClick={handlePrev}>
          <span className="text-white opacity-0 group-hover:opacity-60 text-2xl pl-1 selection:bg-transparent">‹</span>
        </div>
        <div className="absolute top-[20%] right-0 bottom-[55%] w-[15%] cursor-poly pointer-events-auto hover:bg-gradient-to-l hover:from-white/5 to-transparent flex items-center justify-end p-2 transition-opacity group" onClick={handleNext}>
          <span className="text-white opacity-0 group-hover:opacity-60 text-2xl pr-1 selection:bg-transparent">›</span>
        </div>
      </div>
    </div>
  );
}
