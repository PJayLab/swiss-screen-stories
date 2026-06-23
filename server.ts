import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { parseStringPromise } from 'xml2js';

const app = express();
const PORT = 3000;

// Coordinates of main Swiss cities
const SWISS_CITIES = [
  { name: 'Zürich', lat: 47.3769, lon: 8.5417, bgUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=80' },
  { name: 'Bern', lat: 46.9480, lon: 7.4474, bgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80' },
  { name: 'Genf', lat: 46.2044, lon: 6.1432, bgUrl: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?w=1200&q=80' },
  { name: 'Lugano', lat: 46.0037, lon: 8.9511, bgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80' },
  { name: 'St. Moritz', lat: 46.4908, lon: 9.8355, bgUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=1200&q=80' }
];

// Helper to map Open-Meteo weather codes to our simpler condition string:
// 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'
function mapWeatherCode(code: number): 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' {
  if (code === 0) return 'sunny';
  if ([1, 2, 3, 45, 48].includes(code)) return 'cloudy';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
  if ([95, 96, 99].includes(code)) return 'stormy';
  return 'cloudy';
}

function getDayName(offset: number): string {
  if (offset === 0) return 'Heute';
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return days[date.getDay()];
}

// 1. news endpoint: proxy https://www.nzz.ch/recent.rss
app.get('/api/news', async (req, res) => {
  try {
    const rssResponse = await fetch('https://www.nzz.ch/recent.rss');
    if (!rssResponse.ok) {
      throw new Error(`NZZ feed returned status ${rssResponse.status}`);
    }
    const xmlText = await rssResponse.text();
    const result = await parseStringPromise(xmlText);
    
    const channel = result?.rss?.channel?.[0];
    const xmlItems = channel?.item || [];

    const stories = xmlItems.map((item: any) => {
      // Find image URL from enclosure or media tags
      let imageUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200';
      if (item.enclosure && item.enclosure[0] && item.enclosure[0].$ && item.enclosure[0].$.url) {
        imageUrl = item.enclosure[0].$.url;
      } else if (item['media:content'] && item['media:content'][0] && item['media:content'][0].$ && item['media:content'][0].$.url) {
        imageUrl = item['media:content'][0].$.url;
      }

      // Format description (clean off any HTML tags if present)
      let description = item.description?.[0] || '';
      description = description.replace(/<[^>]*>/g, '').trim();

      // Extract creator
      const creator = item['dc:creator']?.[0] || item.author?.[0] || 'NZZ Redaktion';

      // Parse pubDate
      const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : new Date().toISOString();

      return {
        title: item.title?.[0] || 'NZZ Story',
        description: description,
        imageUrl: imageUrl,
        category: item.category?.[0] || 'NZZ',
        pubDate: pubDate,
        creator: creator
      };
    }).slice(0, 8); // top 8 stories

    res.json({ stories });
  } catch (error: any) {
    console.error('Error fetching NZZ RSS feed:', error.message);
    res.status(500).json({ error: 'Failed to fetch news feed', details: error.message });
  }
});

// 2. weather endpoint: fetch open-meteo real weather for all swiss cities
app.get('/api/weather', async (req, res) => {
  try {
    const weatherData = await Promise.all(SWISS_CITIES.map(async (city) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max&timezone=Europe%2FBerlin`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`OpenMeteo returned status ${r.status}`);
        const data = await r.json();

        // Daily forecasts
        const dailyCodes = data.daily?.weather_code || [];
        const dailyTemps = data.daily?.temperature_2m_max || [];
        const dailyList = dailyCodes.slice(0, 5).map((code: number, idx: number) => ({
          day: getDayName(idx),
          temp: Math.round(dailyTemps[idx] || 20),
          condition: mapWeatherCode(code)
        }));

        const precipitation = data.current?.relative_humidity_2m ? Math.round(data.current.relative_humidity_2m / 2) : 25; // Estimate from humidity

        return {
          city: city.name,
          temperature: Math.round(data.current?.temperature_2m ?? 20),
          condition: mapWeatherCode(data.current?.weather_code ?? 0),
          humidity: data.current?.relative_humidity_2m ?? 60,
          windSpeed: Math.round(data.current?.wind_speed_10m ?? 12),
          precipitation: precipitation,
          bgUrl: city.bgUrl,
          forecast: dailyList
        };
      } catch (err: any) {
        console.error(`Error querying weather for ${city.name}:`, err.message);
        // Fallback for this individual city
        return {
          city: city.name,
          temperature: 18,
          condition: 'sunny' as const,
          humidity: 60,
          windSpeed: 10,
          precipitation: 15,
          bgUrl: city.bgUrl,
          forecast: [
            { day: 'Heute', temp: 18, condition: 'sunny' as const },
            { day: 'Mi', temp: 20, condition: 'sunny' as const },
            { day: 'Do', temp: 19, condition: 'cloudy' as const },
            { day: 'Fr', temp: 17, condition: 'rainy' as const },
            { day: 'Sa', temp: 18, condition: 'cloudy' as const }
          ]
        };
      }
    }));

    res.json({ weather: weatherData });
  } catch (error: any) {
    console.error('Error generating Swiss weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// 3. transit SBB endpoint: stationboard from opendata.ch
app.get('/api/transit', async (req, res) => {
  const station = req.query.station as string || 'Zürich HB';
  try {
    const rawUrl = `https://transport.opendata.ch/v1/stationboard?station=${encodeURIComponent(station)}&limit=15`;
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      throw new Error(`OpenData.ch returned status ${response.status}`);
    }
    const data = await response.json();
    const stationboard = data?.stationboard || [];

    const departures = stationboard.map((item: any) => {
      // Parse departure time
      const depDate = new Date(item.stop?.departure);
      const hours = String(depDate.getHours()).padStart(2, '0');
      const mins = String(depDate.getMinutes()).padStart(2, '0');
      const time = `${hours}:${mins}`;

      // Line label category + number e.g. S12, IC1, IR75
      const category = item.category || 'IR';
      const number = item.number || '';
      const line = `${category}${number}`.trim();

      // Platform track
      const track = item.stop?.platform || '—';

      // Calculate delay in minutes
      const delay = item.stop?.delay || 0; // standard integer in minutes

      // Determine clean unified type for filter
      let type: 'S-Bahn' | 'InterRegio' | 'InterCity' | 'EuroCity' | 'RegioExpress' = 'InterRegio';
      if (category.startsWith('S')) {
        type = 'S-Bahn';
      } else if (category === 'IC' || category === 'ICE' || category === 'TGV') {
        type = 'InterCity';
      } else if (category === 'IR') {
        type = 'InterRegio';
      } else if (category === 'EC' || category === 'RJ' || category === 'EN') {
        type = 'EuroCity';
      } else if (category === 'RE' || category === 'RX') {
        type = 'RegioExpress';
      }

      return {
        time,
        line,
        destination: item.to || 'Unbekannt',
        track,
        delay,
        type
      };
    });

    res.json({ departures, stationName: data?.station?.name || station });
  } catch (error: any) {
    console.error('Error fetching SBB departures:', error.message);
    res.status(500).json({ error: 'Failed to fetch SBB stationboard', details: error.message });
  }
});

// Configure Vite or Serve SPA statically
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
