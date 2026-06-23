import { NewsStory, CityWeather, TransitDeparture } from './types';

export const INITIAL_STORIES: NewsStory[] = [
  {
    title: 'Die Berner Gemeinde Nidau feiert mitten im Sommer Weihnachten',
    description: 'Am Bielersee setzt die reformierte Kirchgemeinde während der Hitzewelle auf Tannenbaum, Weihnachtslieder und Guetzli. Dahinter steckt ein frisch pensionierter Pfarrer.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    category: 'Schweiz',
    pubDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    creator: 'Christian Zingg'
  },
  {
    title: 'Zürichs Seebecken wird zum Schauplatz für nachhaltige Architektur',
    description: 'Ein innovatives Projekt zeigt, wie schwimmende Holzplattformen die städtische Hitzeinsel abkühlen und neue Räume für Flora und Fauna mitten im See schaffen können.',
    imageUrl: 'https://images.unsplash.com/photo-1516690561799-46d8f74f90f6?w=1200&q=80',
    category: 'Urbanismus',
    pubDate: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8 hours ago
    creator: 'Elena Meister'
  },
  {
    title: 'Digitaler Euro vs. E-Franken: Schweizer Nationalbank bleibt gelassen',
    description: 'Während die EZB den digitalen Euro vorantreibt, sieht die Nationalbank SNB keinen dringenden Handlungsbedarf für den Schweizer Franken. Der Fokus liegt weiterhin auf Stabilität.',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&q=80',
    category: 'Finanzen',
    pubDate: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    creator: 'Hansruedi Keller'
  },
  {
    title: 'Alpaufzug im Berner Oberland: Tradition trifft Klimawandel',
    description: 'Dieses Jahr wandern die Kühe früher als je zuvor auf die Bergweiden. Die Bauern müssen sich an veränderte Grasperioden und knappe Wasserstellen in luftiger Höhe anpassen.',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1200&q=80',
    category: 'Gesellschaft',
    pubDate: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    creator: 'Beatrix Suter'
  },
  {
    title: 'Künstliche Intelligenz in der Medizin: Ein Durchbruch in Basel',
    description: 'Forscher des Universitätsspitals Basel entwickeln ein KI-Modell, das Gewebeproben bei Tumor-Operationen in Sekundenschnelle klassifiziert. Chirurgen gewinnen wertvolle Zeit.',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=1200&q=80',
    category: 'Wissenschaft',
    pubDate: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    creator: 'Dr. Marco Studer'
  }
];

export const SWISS_WEATHER: CityWeather[] = [
  {
    city: 'Zürich',
    temperature: 24,
    condition: 'sunny',
    humidity: 55,
    windSpeed: 12,
    precipitation: 5,
    bgUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=80',
    forecast: [
      { day: 'Heute', temp: 24, condition: 'sunny' },
      { day: 'Mi', temp: 26, condition: 'sunny' },
      { day: 'Do', temp: 23, condition: 'cloudy' },
      { day: 'Fr', temp: 19, condition: 'rainy' },
      { day: 'Sa', temp: 22, condition: 'cloudy' }
    ]
  },
  {
    city: 'Bern',
    temperature: 23,
    condition: 'cloudy',
    humidity: 62,
    windSpeed: 14,
    precipitation: 20,
    bgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    forecast: [
      { day: 'Heute', temp: 23, condition: 'cloudy' },
      { day: 'Mi', temp: 25, condition: 'sunny' },
      { day: 'Do', temp: 22, condition: 'rainy' },
      { day: 'Fr', temp: 18, condition: 'rainy' },
      { day: 'Sa', temp: 21, condition: 'sunny' }
    ]
  },
  {
    city: 'Genf',
    temperature: 26,
    condition: 'sunny',
    humidity: 48,
    windSpeed: 9,
    precipitation: 0,
    bgUrl: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?w=1200&q=80',
    forecast: [
      { day: 'Heute', temp: 26, condition: 'sunny' },
      { day: 'Mi', temp: 27, condition: 'sunny' },
      { day: 'Do', temp: 25, condition: 'sunny' },
      { day: 'Fr', temp: 22, condition: 'cloudy' },
      { day: 'Sa', temp: 24, condition: 'sunny' }
    ]
  },
  {
    city: 'Lugano',
    temperature: 28,
    condition: 'stormy',
    humidity: 78,
    windSpeed: 18,
    precipitation: 85,
    bgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80',
    forecast: [
      { day: 'Heute', temp: 28, condition: 'stormy' },
      { day: 'Mi', temp: 26, condition: 'rainy' },
      { day: 'Do', temp: 25, condition: 'cloudy' },
      { day: 'Fr', temp: 27, condition: 'sunny' },
      { day: 'Sa', temp: 29, condition: 'sunny' }
    ]
  },
  {
    city: 'St. Moritz',
    temperature: 15,
    condition: 'snowy',
    humidity: 80,
    windSpeed: 21,
    precipitation: 90,
    bgUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=1200&q=80',
    forecast: [
      { day: 'Heute', temp: 15, condition: 'snowy' },
      { day: 'Mi', temp: 14, condition: 'rainy' },
      { day: 'Do', temp: 12, condition: 'snowy' },
      { day: 'Fr', temp: 15, condition: 'cloudy' },
      { day: 'Sa', temp: 17, condition: 'sunny' }
    ]
  }
];

export const BASE_DEPARTURES: Omit<TransitDeparture, 'time'>[] = [
  { line: 'IC 1', destination: 'Genf Flughafen via Bern', track: '3', delay: 0, type: 'InterCity' },
  { line: 'S 12', destination: 'Brugg AG via Baden', track: '22', delay: 2, type: 'S-Bahn' },
  { line: 'IR 75', destination: 'Konstanz via Winterthur', track: '6', delay: 0, type: 'InterRegio' },
  { line: 'IC 8', destination: 'Romanshorn via Winterthur', track: '8', delay: 0, type: 'InterCity' },
  { line: 'S 24', destination: 'Zug via Thalwil mit Überlänge', track: '32', delay: 0, type: 'S-Bahn' },
  { line: 'EC 153', destination: 'Milano Centrale via Erstfeld', track: '4', delay: 5, type: 'EuroCity' },
  { line: 'IR 37', destination: 'Basel SBB via Rheinfelden', track: '12', delay: 0, type: 'InterRegio' },
  { line: 'S 5', destination: 'Pfäffikon SZ via Uster', track: '43', delay: 0, type: 'S-Bahn' },
  { line: 'RE 48', destination: 'Schaffhausen via Bülach', track: '14', delay: 1, type: 'RegioExpress' },
  { line: 'IC 5', destination: 'Lausanne via Biel/Bienne', track: '5', delay: 0, type: 'InterCity' },
  { line: 'S 8', destination: 'Pfäffikon SZ via Thalwil', track: '33', delay: 3, type: 'S-Bahn' },
  { line: 'IR 90', destination: 'Brig via Sion - Lausanne', track: '10', delay: 0, type: 'InterRegio' }
];
