import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  CloudSun, 
  Train, 
  Search, 
  Wifi, 
  Volume2, 
  Tv, 
  Settings, 
  Info, 
  CircleDot,
  ServerCrash
} from 'lucide-react';
import { AppID } from '../types';

interface TaskbarProps {
  activeApp: AppID;
  onSelectApp: (app: AppID) => void;
}

export default function Taskbar({ activeApp, onSelectApp }: TaskbarProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#0a0f1d]/90 backdrop-blur-md border-t border-slate-800/65 flex items-center justify-between px-4 z-50 select-none">
      {/* START MENU POPUP */}
      <AnimatePresence>
        {startMenuOpen && (
          <>
            {/* Backdrop to close */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setStartMenuOpen(false)} 
            />
            {/* Start Menu Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 left-4 w-80 bg-[#0d1527]/95 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 shadow-2xl z-50 text-slate-100"
            >
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-sm tracking-widest text-white shadow">
                  +
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400">BOARD CONTROLLER</h4>
                  <p className="text-sm font-semibold">Swiss Public Screen OS</p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schnellstart Apps</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onSelectApp('news');
                      setStartMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all text-center ${
                      activeApp === 'news' 
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-800/40 border-transparent hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <Newspaper size={20} className="mb-1" />
                    <span className="text-[10px] font-medium">NZZ News</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectApp('weather');
                      setStartMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all text-center ${
                      activeApp === 'weather' 
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-800/40 border-transparent hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <CloudSun size={20} className="mb-1" />
                    <span className="text-[10px] font-medium">Wetter</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectApp('transit');
                      setStartMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all text-center ${
                      activeApp === 'transit' 
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-800/40 border-transparent hover:bg-slate-800/70 text-slate-300'
                    }`}
                  >
                    <Train size={20} className="mb-1" />
                    <span className="text-[10px] font-medium">SBB Fahrplan</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <CircleDot size={12} className="text-emerald-500 animate-pulse" />
                    System Status
                  </span>
                  <span className="text-emerald-400 font-semibold">Aktiv</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Display Mode</span>
                  <span className="text-slate-300">Public Kiosk (16:9)</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Refresh-Intervall</span>
                  <span className="text-slate-300">Konstant</span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Info size={11} />
                  v1.2.0-stable
                </span>
                <span className="text-blue-400 font-medium">CH-Public Display</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* START BUTTONS (Left-aligned or Windows Centered - let's make it styled in a beautiful modern bar) */}
      <div className="flex items-center space-x-1">
        {/* Start Button */}
        <button
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          className={`h-10 w-10 flex items-center justify-center rounded transition-all duration-150 ${
            startMenuOpen 
              ? 'bg-[#1b253b] scale-95 border border-slate-700/50' 
              : 'hover:bg-slate-800/50 active:scale-95'
          }`}
          title="Startmenü"
        >
          <div className="grid grid-cols-2 gap-[2px] w-[18px] h-[18px]">
            <span className="bg-[#2e96ff] rounded-[1px]" />
            <span className="bg-[#2e96ff] rounded-[1px]" />
            <span className="bg-[#2e96ff] rounded-[1px]" />
            <span className="bg-[#2e96ff] rounded-[1px]" />
          </div>
        </button>

        {/* Search button */}
        <button className="h-10 w-10 flex items-center justify-center rounded hover:bg-slate-800/50 text-slate-400 active:scale-95 transition-all">
          <Search size={18} />
        </button>
      </div>

      {/* ACTIVE APP LIST (Centered or aligned perfectly next to start) */}
      <div className="flex items-center bg-[#0d1629]/50 border border-slate-800/40 rounded-lg px-1.5 py-1 space-x-1 max-w-full">
        {/* News Shortcut */}
        <button
          onClick={() => onSelectApp('news')}
          className={`relative h-9 px-3 flex items-center justify-center rounded-md gap-2 transition-all active:scale-95 duration-150 ${
            activeApp === 'news'
              ? 'bg-blue-600/10 text-blue-400 font-medium'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          }`}
        >
          <Newspaper size={16} />
          <span className="text-xs hidden sm:inline">NZZ Stories</span>
          {activeApp === 'news' && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute bottom-0 left-1/3 right-1/3 h-[2px] bg-blue-500 rounded-full"
            />
          )}
        </button>

        {/* Weather Shortcut */}
        <button
          onClick={() => onSelectApp('weather')}
          className={`relative h-9 px-3 flex items-center justify-center rounded-md gap-2 transition-all active:scale-95 duration-150 ${
            activeApp === 'weather'
              ? 'bg-blue-600/10 text-blue-400 font-medium'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          }`}
        >
          <CloudSun size={16} />
          <span className="text-xs hidden sm:inline">Wetter</span>
          {activeApp === 'weather' && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute bottom-0 left-1/3 right-1/3 h-[2px] bg-blue-500 rounded-full"
            />
          )}
        </button>

        {/* Transit Shortcut */}
        <button
          onClick={() => onSelectApp('transit')}
          className={`relative h-9 px-3 flex items-center justify-center rounded-md gap-2 transition-all active:scale-95 duration-150 ${
            activeApp === 'transit'
              ? 'bg-blue-600/10 text-blue-400 font-medium'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          }`}
        >
          <Train size={16} />
          <span className="text-xs hidden sm:inline">SBB Fahrplan</span>
          {activeApp === 'transit' && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute bottom-0 left-1/3 right-1/3 h-[2px] bg-blue-500 rounded-full"
            />
          )}
        </button>
      </div>

      {/* SYSTEM TRAY (Right-aligned) */}
      <div className="flex items-center space-x-3 text-slate-400">
        <div className="flex items-center space-x-2 border-r border-slate-800 pr-3 text-xs">
          <Wifi size={14} className="text-slate-400" />
          <Volume2 size={14} className="text-slate-400" />
        </div>
        <div className="flex flex-col items-end leading-none">
          <span className="text-xs font-semibold text-slate-200">{formatClock(time)}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">{formatDate(time)}</span>
        </div>
      </div>
    </div>
  );
}
