export type AppID = 'news' | 'weather' | 'transit';

export interface NewsStory {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  pubDate: string; // ISO or relative compatible string
  creator?: string;
}

export interface WeatherDay {
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
}

export interface CityWeather {
  city: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  humidity: number;
  windSpeed: number; // in km/h
  precipitation: number; // in %
  bgUrl: string;
  forecast: WeatherDay[];
}

export interface TransitDeparture {
  time: string; // HH:MM
  line: string; // S12, IR75, IC1, EC, RE
  destination: string;
  track: string;
  delay: number; // in minutes (0 means on time)
  type: 'S-Bahn' | 'InterRegio' | 'InterCity' | 'EuroCity' | 'RegioExpress';
}
