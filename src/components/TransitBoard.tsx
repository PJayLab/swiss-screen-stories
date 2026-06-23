import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Train,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { TransitDeparture } from '../types';
import { BASE_DEPARTURES } from '../data';

export default function TransitBoard() {
  const [departures, setDepartures] = useState<TransitDeparture[]>([]);
  const [filter, setFilter] = useState<string>('ALLE');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate dynamic timetable relative to real current time!
  const generateTimetable = (baseTime: Date) => {
    const list: TransitDeparture[] = [];
    const currentMins = baseTime.getMinutes();
    const currentHour = baseTime.getHours();

    BASE_DEPARTURES.forEach((dep, index) => {
      // spread train departure times relative to now
      // e.g. index * 5 minutes into the future
      const totalOffset = (index * 4) + 2; 
      let departureMin = currentMins + totalOffset;
      let departureHour = currentHour;

      if (departureMin >= 60) {
        departureHour = (departureHour + Math.floor(departureMin / 60)) % 24;
        departureMin = departureMin % 60;
      }

      const timeString = `${String(departureHour).padStart(2, '0')}:${String(departureMin).padStart(2, '0')}`;
      
      list.push({
        ...dep,
        time: timeString
      });
    });

    // Sort by departure time
    list.sort((a, b) => a.time.localeCompare(b.time));
    return list;
  };

  useEffect(() => {
    // Initial generation
    setDepartures(generateTimetable(new Date()));

    // Keep clocks up to date
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Regenerate every full minute to roll departures
      if (now.getSeconds() === 0) {
        setDepartures(generateTimetable(now));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDepartures(generateTimetable(new Date()));
      setIsRefreshing(false);
    }, 800);
  };

  // Filter list
  const filteredDeps = departures.filter(dep => {
    if (filter === 'ALLE') return true;
    if (filter === 'S-BAHN') return dep.type === 'S-Bahn';
    if (filter === 'FERNVERKEHR') return dep.type === 'InterCity' || dep.type === 'InterRegio' || dep.type === 'EuroCity';
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex justify-center items-center overflow-hidden bg-slate-950 font-sans">
      <div className="w-full h-full max-w-5xl mx-auto px-4 py-6 flex flex-col justify-between">
        
        {/* BOARD STATION HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-[#eb0000] text-xs font-black uppercase tracking-widest bg-[#eb0000]/10 px-2.5 py-1 rounded border border-[#eb0000]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#eb0000] animate-pulse" />
              <span>SBB CFF FFS • Live Abfahrten</span>
            </div>
            <h1 className="text-3xl font-black text-slate-150 tracking-tight mt-1.5 flex items-center gap-2">
              <Train size={24} className="text-slate-205" />
              Zürich HB <span className="text-xs font-normal text-slate-400 font-mono select-all bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">CH-ZUE</span>
            </h1>
          </div>

          {/* STATION TIME CLOCK */}
          <div className="bg-[#0b1222] border border-slate-800 rounded-xl px-5 py-2.5 flex items-center space-x-4 self-stretch sm:self-auto shadow-lg">
            <div className="text-[#ffb700] font-mono text-3xl font-bold tracking-wider leading-none">
              {currentTime.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
              <span className="text-sm font-semibold opacity-70 ml-1">
                {currentTime.toLocaleTimeString('de-CH', { second: '2-digit' })}
              </span>
            </div>
            <div className="text-slate-400 border-l border-slate-700/60 pl-4 leading-none text-xs flex flex-col justify-center">
              <span className="font-semibold text-slate-300">BAHNHOFAUSGABE</span>
              <span className="mt-1 font-mono">{currentTime.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* TIMER TIMETABLE TIMEFRAME FILTERS */}
        <div className="flex justify-between items-center my-4">
          <div className="flex space-x-1.5 bg-slate-900 rounded-lg p-1 border border-slate-800/60 text-xs">
            {['ALLE', 'S-BAHN', 'FERNVERKEHR'].map((btn) => (
              <button
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-3 py-1.5 font-bold rounded-md transition-all ${
                  filter === btn
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          <button
            onClick={triggerManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800/60 active:scale-95 transition-all text-center"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* TIMETABLE BOARD GRID (RESEMBLING PHYSICAL LCD SCREEN) */}
        <div className="flex-1 bg-[#040914] border border-slate-850 rounded-xl overflow-hidden shadow-2xl flex flex-col shadow-inner">
          {/* TIMETABLE HEADERS */}
          <div className="bg-[#0b1424] px-4 py-3 border-b border-slate-850 text-[11px] font-bold text-slate-400 uppercase tracking-widest grid grid-cols-12 gap-2 select-none select-poly">
            <div className="col-span-2 sm:col-span-1">Abfahrt</div>
            <div className="col-span-2 sm:col-span-2">Linie</div>
            <div className="col-span-6 sm:col-span-6">Zielort / Fahrtverlauf</div>
            <div className="col-span-2 sm:col-span-2 text-center">Gleis</div>
            <div className="hidden sm:block sm:col-span-1 text-right">Meldung</div>
          </div>

          {/* TIMETABLE SCROLL LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
            {filteredDeps.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500">
                <AlertTriangle size={32} className="mb-2 text-amber-500/80" />
                <p className="text-sm">Keine Abfahrten im gewählten Segment gefunden.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredDeps.map((dep, index) => {
                  const hasDelay = dep.delay > 0;
                  const isLateStyle = hasDelay ? 'text-rose-400' : 'text-emerald-400';
                  
                  return (
                    <motion.div
                      key={dep.time + dep.line + dep.destination}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: Math.min(index * 0.05, 0.4) }}
                      className="px-4 py-4 grid grid-cols-12 gap-2 items-center hover:bg-slate-900/50 transition-colors duration-150 border-r border-slate-850 font-sans"
                    >
                      {/* DEPARTURE TIME */}
                      <div className="col-span-2 sm:col-span-1">
                        <span className="font-mono text-base font-bold text-slate-100">{dep.time}</span>
                      </div>

                      {/* TRAIN TYPE / ID */}
                      <div className="col-span-2 sm:col-span-2 flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${
                          dep.type === 'InterCity' 
                            ? 'bg-[#eb0000] text-white' 
                            : dep.type === 'InterRegio'
                            ? 'bg-[#d63030] text-white'
                            : dep.type === 'S-Bahn'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-50'
                        }`}>
                          {dep.line}
                        </span>
                      </div>

                      {/* DESTINATION */}
                      <div className="col-span-6 sm:col-span-6 flex items-center space-x-1.5 pr-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="font-medium text-[15px] text-slate-200 select-all">{dep.destination}</span>
                      </div>

                      {/* PLATFORM */}
                      <div className="col-span-2 sm:col-span-2 text-center">
                        <span className="font-mono font-black text-xl text-[#0066cc] bg-[#0066cc]/10 border border-[#0066cc]/30 px-3 py-0.5 rounded-md inline-block min-w-10">
                          {dep.track}
                        </span>
                      </div>

                      {/* STATUS MESSAGES */}
                      <div className="col-span-12 sm:col-span-1 flex justify-end items-center text-xs mt-1 sm:mt-0">
                        {hasDelay ? (
                          <span className="flex items-center gap-1 font-bold text-rose-400 font-mono text-right bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/25">
                            +{dep.delay}'
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                            Pünktlich
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* SBB BOARD TICKER PREVIEW FOOTER */}
          <div className="bg-[#0c1224] border-t border-slate-850 py-3.5 px-4 text-xs flex justify-between items-center text-slate-400">
            <p className="flex items-center gap-1.5 pr-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block animate-pulse"></span>
              <strong>Aktuelle Störung:</strong> Streckenunterbruch im Gotthardtunnel. Züge werden umgeleitet. Reisezeit verlängert sich um 40 Min.
            </p>
            <ChevronRight size={16} className="text-slate-500 cursor-pointer hidden sm:block shrink-0" />
          </div>
        </div>

        {/* BOARD SYSTEM STATUS METRICS */}
        <div className="flex justify-between items-center text-slate-500 text-[11px] pt-4">
          <p>© 2026 Schweizerische Bundesbahnen SBB CFF FFS</p>
          <p className="flex items-center gap-1">
            <CheckCircle size={10} className="text-emerald-500" />
            Empfänger ZRH-SBB-02 OPERATIONAL
          </p>
        </div>
      </div>
    </div>
  );
}
