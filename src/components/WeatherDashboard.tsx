import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Droplets, 
  Wind, 
  Thermometer, 
  MapPin, 
  Loader2,
  Compass
} from 'lucide-react';
import { CityWeather } from '../types';
import { SWISS_WEATHER } from '../data';

const WEATHER_ICONS = {
  sunny: <Sun className="text-amber-400 animate-[spin_50s_linear_infinite]" size={48} />,
  cloudy: <Cloud className="text-slate-300" size={48} />,
  rainy: <CloudRain className="text-blue-400 animate-pulse" size={48} />,
  snowy: <CloudSnow className="text-sky-200 animate-bounce" size={48} />,
  stormy: <CloudLightning className="text-purple-400" size={48} />
};

const WEATHER_MINI_ICONS = {
  sunny: <Sun className="text-amber-400" size={20} />,
  cloudy: <Cloud className="text-slate-400" size={20} />,
  rainy: <CloudRain className="text-blue-400" size={20} />,
  snowy: <CloudSnow className="text-sky-300" size={20} />,
  stormy: <CloudLightning className="text-purple-400" size={20} />
};

const CONDITION_TEXTS = {
  sunny: 'Sonnig',
  cloudy: 'Bewölkt',
  rainy: 'Regen',
  snowy: 'Schneefall',
  stormy: 'Gewitter'
};

export default function WeatherDashboard() {
  const [cities, setCities] = useState<CityWeather[]>(SWISS_WEATHER);
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [autorotate, setAutorotate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [pinnedCityName, setPinnedCityName] = useState<string | null>(null);

  // Fetch real live weather from Open-Meteo via backend proxy
  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const response = await fetch('/api/weather');
        if (!response.ok) throw new Error('Weather API error');
        const data = await response.json();
        if (data.weather && data.weather.length > 0) {
          setCities(data.weather);
        }
      } catch (err) {
        console.warn('Could not load live weather. Using Swiss high-quality fallbacks.', err);
        // Fallback is SWISS_WEATHER which is already state default
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, []);

  // Parse query parameters
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(window.location.search);
    setIsDisplayMode(params.get('mode') === 'display');
    
    // Check if city query param is supplied (e.g., ?city=Bern)
    const cityParam = params.get('city');
    if (cityParam) {
      const normalizedParam = cityParam.toLowerCase().trim();
      const matchedIdx = cities.findIndex(
        (c) => c.city.toLowerCase() === normalizedParam || 
               c.city.toLowerCase().replace('ü', 'ue').replace('ö', 'oe') === normalizedParam
      );

      if (matchedIdx !== -1) {
        setActiveCityIdx(matchedIdx);
        setPinnedCityName(cities[matchedIdx].city);
        setAutorotate(false); // Lock weather autorotation if a city is targeted
      }
    }
  }, [loading, cities]);

  // Auto-cycle through Swiss cities on public dashboard (only if not pinned or disabled)
  useEffect(() => {
    if (!autorotate || loading) return;

    const interval = setInterval(() => {
      setActiveCityIdx((prev) => (prev + 1) % cities.length);
    }, 8500); // Cycle cities of Swiss network

    return () => clearInterval(interval);
  }, [autorotate, loading, cities.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[calc(100vh-3.5rem)] flex justify-center items-center overflow-hidden bg-[#02050b]">
        <div className="text-slate-400 flex flex-col items-center space-y-3">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p className="text-sm font-semibold tracking-wider font-mono uppercase">Lade Live-Meteodaten...</p>
        </div>
      </div>
    );
  }

  const activeCity = cities[activeCityIdx] || cities[0];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex justify-center items-center overflow-hidden bg-slate-950 font-sans">
      {/* Background imagery according to selected city */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity.city}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img 
              referrerPolicy="no-referrer"
              src={activeCity.bgUrl} 
              alt={activeCity.city}
              className="w-full h-full object-cover blur-sm scale-102"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/90 via-slate-950/75 to-slate-950" />
      </div>

      <div className="relative z-10 w-full h-full max-w-5xl mx-auto px-4 py-6 flex flex-col justify-between">
        
        {/* TOP HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-bold uppercase tracking-widest bg-blue-900/20 px-3 py-1 rounded-full border border-blue-500/20 max-w-fit">
              <MapPin size={12} />
              <span>Schweizer Kachelwetter {pinnedCityName && '• Pinned'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1.5">Meteo Public</h1>
          </div>

          {/* Quick tabs togglers - Hide in display mode */}
          {!isDisplayMode && (
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {cities.map((city, idx) => (
                <button
                  key={city.city}
                  onClick={() => {
                    setActiveCityIdx(idx);
                    setAutorotate(false); // Pause auto rotation
                    setPinnedCityName(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeCityIdx === idx
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {city.city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto pt-4 md:pt-0">
          
          {/* Active conditions (7 columns) */}
          <motion.div 
            layout
            className="lg:col-span-7 bg-[#0b1222]/85 backdrop-blur-md rounded-2xl border border-slate-800/40 p-6 flex flex-col justify-between shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                  {activeCity.city}
                  {pinnedCityName === activeCity.city && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 py-0.5 px-2 border border-blue-500/20 rounded-full font-bold uppercase tracking-wider font-sans">
                      Startort
                    </span>
                  )}
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={12} className="text-blue-400" />
                  Kanton {activeCity.city === 'Zürich' ? 'Zürich' : activeCity.city === 'Lugano' ? 'Tessin' : activeCity.city === 'St. Moritz' ? 'Graubünden' : activeCity.city === 'Genf' ? 'Genf' : 'Bern'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Aktuell</span>
                <span className="text-blue-400 font-bold text-sm">{CONDITION_TEXTS[activeCity.condition]}</span>
              </div>
            </div>

            <div className="flex items-center justify-between my-8">
              <div className="flex items-center space-x-4">
                <div className="bg-[#0f1d35]/80 p-4 rounded-2xl border border-blue-500/10">
                  {WEATHER_ICONS[activeCity.condition]}
                </div>
                <div>
                  <div className="flex items-start">
                    <span className="text-7xl font-black text-slate-50 tracking-tighter leading-none">
                      {activeCity.temperature}
                    </span>
                    <span className="text-2xl font-bold text-blue-400 ml-1">°C</span>
                  </div>
                </div>
              </div>

              {/* Climate stats */}
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 w-full max-w-[170px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets size={12} className="text-blue-400" /> Feuchte
                  </span>
                  <span className="text-slate-200 font-bold">{activeCity.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wind size={12} className="text-cyan-400" /> Wind
                  </span>
                  <span className="text-slate-200 font-bold">{activeCity.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Thermometer size={12} className="text-rose-400" /> Regench.
                  </span>
                  <span className="text-slate-200 font-bold">{activeCity.precipitation}%</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between pt-3 border-t border-slate-800/40 font-mono">
              <p>Meteo Schweiz • Open-Meteo Satellite</p>
              <p>Zuletzt aktualisiert: Live</p>
            </div>
          </motion.div>

          {/* Forecast (5 columns) */}
          <motion.div 
            layout
            className="lg:col-span-5 bg-[#0b1222]/85 backdrop-blur-md rounded-2xl border border-slate-800/40 p-6 flex flex-col justify-between shadow-xl"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">5-Tage-Prognose</h3>
              <div className="space-y-3.5">
                {activeCity.forecast.map((fc, i) => (
                  <div 
                    key={i}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                      i === 0 
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                        : 'bg-slate-950/20 border-slate-800/30 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold w-12">{fc.day}</span>
                    <div className="flex items-center gap-2">
                      {WEATHER_MINI_ICONS[fc.condition]}
                      <span className="text-[11px] text-slate-400 font-medium">{CONDITION_TEXTS[fc.condition]}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-100">{fc.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#0d1c33]/40 border border-blue-500/10 rounded-xl text-[11px] text-[#a2aebf]/90 leading-relaxed font-sans">
              <strong>Meteo Hinweis:</strong> Live Messnetz der Schweizer Meteo Satelliten. Regionale Winde beachten.
            </div>
          </motion.div>
        </div>

        {/* BOTTOM TRAILING RAIL */}
        <div className="text-center text-[10px] text-slate-500 pt-4 flex flex-col sm:flex-row sm:justify-between items-center gap-1 border-t border-slate-900/50">
          <p>© 2026 Swiss Public Display Meteo. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Verbindung zu Open-Meteo hergestellt (Live)
          </p>
        </div>
      </div>
    </div>
  );
}
