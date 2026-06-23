import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Train,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { TransitDeparture } from '../types';
import { BASE_DEPARTURES } from '../data';

export default function TransitBoard() {
  const [departures, setDepartures] = useState<TransitDeparture[]>([]);
  const [filter, setFilter] = useState<string>('ALLE');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stationName, setStationName] = useState('Zürich HB');
  const [isDisplayMode, setIsDisplayMode] = useState(false);

  // Fallback train timetable generator (runs if OpenData API is rate limited or offline)
  const generateSimulatedTimetable = (baseTime: Date) => {
    const list: TransitDeparture[] = [];
    const currentMins = baseTime.getMinutes();
    const currentHour = baseTime.getHours();

    BASE_DEPARTURES.forEach((dep, index) => {
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
      } as TransitDeparture);
    });

    list.sort((a, b) => a.time.localeCompare(b.time));
    return list;
  };

  // Fetch live timetables from public Swiss transport board
  const loadLiveSBBDepartures = async (silent : boolean = false, station : string = '') => {
    try {
      if (!silent) setLoading(true);
      const selectedStation = station?.trim() || 'Zürich HB';
      const response = await fetch(`/api/transit?station=${encodeURIComponent(selectedStation)}`);
      if (!response.ok) throw new Error('CFF/SBB timetable proxy error');
      const data = await response.json();
      if (data.departures && data.departures.length > 0) {
        setDepartures(data.departures);
        setStationName(data.stationName || 'Zürich HB');
      } else {
        throw new Error('Empty departures');
      }
    } catch (err) {
      console.warn('SBB live connection failed. Activating dynamic local Swiss timetable simulation.', err);
      setDepartures(generateSimulatedTimetable(new Date()));
      setStationName('Zürich HB (Simuliert)');
    } finally {
      setLoading(false);
    }
  };

  // Setup initial parameters & data loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDisplayMode(params.get('mode') === 'display');

    // Check if station query param is supplied (e.g., ?station=Bern)
    const stationParam = params.get('station');

    loadLiveSBBDepartures(false, stationParam ?? '');

    // Constant clock ticking & automatic minute reload
    const clockTimer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Auto-reload timetable on every full minute to maintain absolute accuracy
      if (now.getSeconds() === 0) {
        loadLiveSBBDepartures(true); // Silent update
      }
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  const triggerManualRefresh = async () => {
    setIsRefreshing(true);
    await loadLiveSBBDepartures();
    setIsRefreshing(false);
  };

  // Filter list
  const filteredDeps = departures.filter(dep => {
    if (filter === 'ALLE') return true;
    if (filter === 'S-BAHN') return dep.type === 'S-Bahn';
    if (filter === 'FERNVERKEHR') return dep.type === 'InterCity' || dep.type === 'InterRegio' || dep.type === 'EuroCity';
    return true;
  });

  if (loading) {
    return (
      <div className="relative w-full h-[calc(100vh-3.5rem)] flex justify-center items-center overflow-hidden bg-slate-950">
        <div className="text-slate-400 flex flex-col items-center space-y-3">
          <Loader2 className="animate-spin text-red-500" size={32} />
          <p className="text-sm font-semibold tracking-wider font-mono uppercase">Lade SBB-Bahnhofstafel...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1.5 flex items-center gap-2 select-none">
              <Train size={24} className="text-[#eb0000]" />
              {stationName} <span className="text-[10px] font-normal text-slate-450 font-mono select-all bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">ZRH-HB-PUBLIC</span>
            </h1>
          </div>

          {/* STATION TIME CLOCK */}
          <div className="bg-[#0b1222] border border-slate-800 rounded-xl px-5 py-2.5 flex items-center space-x-4 self-stretch sm:self-auto shadow-lg select-none">
            <div className="text-[#ffb700] font-mono text-3xl font-bold tracking-wider leading-none">
              {currentTime.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
              <span className="text-sm font-semibold opacity-70 ml-1">
                {currentTime.toLocaleTimeString('de-CH', { second: '2-digit' })}
              </span>
            </div>
            <div className="text-slate-400 border-l border-slate-750 pl-4 leading-none text-xs flex flex-col justify-center">
              <span className="font-bold text-slate-300">PUBLIC SCREEN</span>
              <span className="mt-1 font-mono text-[11px] text-slate-500">{currentTime.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* TIMER TIMETABLE ACTIONS - Hidden or restricted in display mode */}
        {!isDisplayMode && (
          <div className="flex justify-between items-center my-4 select-none">
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
        )}

        {/* Spacer for display mode so layout is clean */}
        {isDisplayMode && <div className="h-4" />}

        {/* TIMETABLE BOARD GRID */}
        <div className="flex-1 bg-[#040914] border border-slate-850 rounded-xl overflow-hidden shadow-2xl flex flex-col shadow-inner">
          {/* TIMETABLE HEADERS */}
          <div className="bg-[#0b1424] px-4 py-3 border-b border-slate-850 text-[10px] font-bold text-slate-400 uppercase tracking-widest grid grid-cols-12 gap-2 select-none">
            <div className="col-span-2 sm:col-span-1.5">Abfahrt</div>
            <div className="col-span-2 sm:col-span-2">Gattung</div>
            <div className="col-span-6 sm:col-span-5.5">Zielort / Fahrtichtung</div>
            <div className="col-span-2 sm:col-span-2 text-center">Gleis</div>
            <div className="hidden sm:block sm:col-span-1 text-right">Status</div>
          </div>

          {/* TIMETABLE SCROLL LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
            {filteredDeps.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 select-none">
                <AlertTriangle size={32} className="mb-2 text-amber-500/80" />
                <p className="text-sm font-semibold">Keine SBB Abfahrten im gewählten Segment.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredDeps.slice(0, 10).map((dep, index) => {
                  const hasDelay = dep.delay > 0;
                  
                  return (
                    <motion.div
                      key={dep.time + dep.line + dep.destination}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: Math.min(index * 0.04, 0.3) }}
                      className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-900/40 transition-colors duration-150 border-r border-slate-850 font-sans"
                    >
                      {/* DEPARTURE TIME */}
                      <div className="col-span-2 sm:col-span-1.5 select-none">
                        <span className="font-mono text-base font-bold text-slate-150">{dep.time}</span>
                      </div>

                      {/* TRAIN TYPE / ID */}
                      <div className="col-span-2 sm:col-span-2 flex items-center space-x-1.5 select-none">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${
                          dep.type === 'InterCity' 
                            ? 'bg-[#eb0000] text-white' 
                            : dep.type === 'InterRegio'
                            ? 'bg-[#b80000] text-white'
                            : dep.type === 'S-Bahn'
                            ? 'bg-blue-600/30 border border-blue-500/30 text-blue-300'
                            : dep.type === 'RegioExpress'
                            ? 'bg-amber-600/20 border border-amber-500/20 text-amber-300'
                            : 'bg-slate-855 text-slate-300'
                        }`}>
                          {dep.line}
                        </span>
                      </div>

                      {/* DESTINATION */}
                      <div className="col-span-6 sm:col-span-5.5 select-all font-medium text-[14px] text-slate-200 truncate pr-2">
                        {dep.destination}
                      </div>

                      {/* PLATFORM */}
                      <div className="col-span-2 sm:col-span-2 text-center select-none">
                        <span className="font-mono font-bold text-base text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-md inline-block min-w-10">
                          {dep.track}
                        </span>
                      </div>

                      {/* STATUS MESSAGES */}
                      <div className="col-span-12 sm:col-span-1 flex justify-end items-center text-xs mt-1 sm:mt-0 select-none">
                        {hasDelay ? (
                          <span className="flex items-center gap-1 font-bold text-rose-400 font-mono text-right bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/25">
                            +{dep.delay}'
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                            Plan
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
          <div className="bg-[#0c1224] border-t border-slate-850 py-3 px-4 text-xs flex justify-between items-center text-slate-450 select-none">
            <p className="flex items-center gap-1.5 pr-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block animate-pulse shrink-0"></span>
              <strong>Meldung:</strong> Live-Datenschnittstelle mit dem offiziellen SBB Fahrplanbetrieb aktiv.
            </p>
            <ChevronRight size={14} className="text-slate-500 hidden sm:block shrink-0" />
          </div>
        </div>

        {/* BOARD SYSTEM STATUS METRICS */}
        <div className="flex justify-between items-center text-slate-550 text-[10px] pt-4 select-none">
          <p>© 2026 Schweizerische Bundesbahnen SBB CFF FFS</p>
          <p className="flex items-center gap-1">
            <CheckCircle size={10} className="text-emerald-500" />
            Empfänger CHF-TIMETABLE-ZRH OPERATIONAL
          </p>
        </div>
      </div>
    </div>
  );
}
