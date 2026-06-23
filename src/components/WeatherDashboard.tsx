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
  RotateCcw,
  Compass
} from 'lucide-react';
import { CityWeather } from '../types';
import { SWISS_WEATHER } from '../data';

const WEATHER_ICONS = {
  sunny: <Sun className="text-amber-400 animate-[spin_50s_linear_infinite]" size={48} />,
  cloudy: <Cloud className="text-slate-350" size={48} />,
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
  const [cities] = useState<CityWeather[]>(SWISS_WEATHER);
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [autorotate, setAutorotate] = useState(true);

  // Auto-cycle through Swiss cities on public dashboard
  useEffect(() => {
    if (!autorotate) return;

    const interval = setInterval(() => {
      setActiveCityIdx((prev) => (prev + 1) % cities.length);
    }, 8000); // cycle cities every 8s

    return () => clearInterval(interval);
  }, [autorotate, cities.length]);

  const activeCity = cities[activeCityIdx] || cities[0];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex justify-center items-center overflow-hidden bg-slate-950 font-sans">
      {/* Background imagery with overlay according to cities */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity.city}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img 
              referrerPolicy="no-referrer"
              src={activeCity.bgUrl} 
              alt={activeCity.city}
              className="w-full h-full object-cover filtering-blur"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/90 via-slate-950/70 to-slate-950" />
      </div>

      <div className="relative z-10 w-full h-full max-w-5xl mx-auto px-4 py-6 flex flex-col justify-between">
        {/* TOP HEADER LIST */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-bold uppercase tracking-widest bg-blue-900/15 px-3 py-1 rounded-full border border-blue-500/20 max-w-fit">
              <MapPin size={12} />
              <span>Schweizer Kachelwetter</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1.5">Meteo Public</h1>
          </div>

          {/* Quick Tabs to select city / toggle auto */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800/80 rounded-lg p-1">
            {cities.map((city, idx) => (
              <button
                key={city.city}
                onClick={() => {
                  setActiveCityIdx(idx);
                  setAutorotate(false); // pause auto rotation when user selects
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeCityIdx === idx
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {city.city}
              </button>
            ))}

            <button
              onClick={() => setAutorotate(!autorotate)}
              className={`p-1.5 rounded-md text-xs transition-all ${
                autorotate ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title={autorotate ? "Auto-Wechsel aktiv" : "Auto-Wechsel aktivieren"}
            >
              <RotateCcw size={14} className={autorotate ? 'animate-spin-[12s_linear_infinite]' : ''} />
            </button>
          </div>
        </div>

        {/* MIDDLE SECTION - FULL SIZED WEATHER CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto pt-4 md:pt-0">
          
          {/* Main Weather Metric Box (7 columns) */}
          <motion.div 
            layout
            className="lg:col-span-7 bg-[#0b1222]/85 backdrop-blur-md rounded-2xl border border-slate-800/40 p-6 flex flex-col justify-between shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-extrabold text-slate-100 tracking-tight">{activeCity.city}</h2>
                <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} className="text-blue-400" />
                  Kanton {activeCity.city === 'Zürich' ? 'Zürich' : activeCity.city === 'Lugano' ? 'Tessin' : activeCity.city === 'St. Moritz' ? 'Graubünden' : activeCity.city === 'Genf' ? 'Genf' : 'Bern'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-xs font-semibold">Zustand</span>
                <span className="text-blue-400 font-semibold text-sm">{CONDITION_TEXTS[activeCity.condition]}</span>
              </div>
            </div>

            <div className="flex items-center justify-between my-8">
              <div className="flex items-center space-x-4">
                <div className="bg-[#0f1d35] p-4 rounded-2xl border border-blue-500/10">
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

              {/* Core metrics column */}
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850 w-full max-w-44">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Droplets size={12} className="text-blue-400" /> Feuchte</span>
                  <span className="text-slate-200 font-bold">{activeCity.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Wind size={12} className="text-cyan-400" /> Wind</span>
                  <span className="text-slate-200 font-bold">{activeCity.windSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Thermometer size={12} className="text-rose-400" /> Regen</span>
                  <span className="text-slate-200 font-bold">{activeCity.precipitation}%</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex justify-between pt-3 border-t border-slate-800/50">
              <p>Meteo Schweiz • Automatische Station</p>
              <p>Zuletzt aktualisiert: Jetzt</p>
            </div>
          </motion.div>

          {/* 5-Day Forecast Panel (5 columns) */}
          <motion.div 
            layout
            className="lg:col-span-5 bg-[#0b1222]/85 backdrop-blur-md rounded-2xl border border-slate-800/40 p-6 flex flex-col justify-between shadow-xl"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">5-Tage-Prognose</h3>
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
                    <span className="text-sm font-semibold w-16">{fc.day}</span>
                    <div className="flex items-center gap-2">
                      {WEATHER_MINI_ICONS[fc.condition]}
                      <span className="text-xs text-slate-450 font-medium">{CONDITION_TEXTS[fc.condition]}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-100">{fc.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Hint box */}
            <div className="mt-4 p-3 bg-[#0d1c33]/40 border border-blue-500/10 rounded-xl text-[11px] text-[#a2aebf]/95 leading-relaxed">
              <strong>MeteoCH Hinweis:</strong> Starke Winde im Alpenraum ab Donnerstag erwartet. UV-Index heute mässig bis erhöht.
            </div>
          </motion.div>
        </div>

        {/* BOTTOM METADATA RAIL */}
        <div className="text-center text-xs text-slate-500 pt-4 flex flex-col sm:flex-row sm:justify-between items-center gap-1 text-slate-550 border-t border-slate-900/50">
          <p>© 2026 Swiss Kiosk Weather Net. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Verbindung zu MeteoSchweiz hergestellt
          </p>
        </div>
      </div>
    </div>
  );
}
