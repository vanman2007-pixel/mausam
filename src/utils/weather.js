const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

export async function getWeather(latitude, longitude) {
  const weatherParams = new URLSearchParams({
    latitude,
    longitude,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,visibility",
    hourly:
      "temperature_2m,apparent_temperature,precipitation_probability,weather_code,uv_index",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    timezone: "auto",
    forecast_days: 7,
  });

  const airParams = new URLSearchParams({
    latitude,
    longitude,
    current: "european_aqi,pm2_5,uv_index",
    timezone: "auto",
  });

  const [weatherResponse, airResponse] = await Promise.all([
    fetch(`${WEATHER_URL}?${weatherParams}`),
    fetch(`${AIR_URL}?${airParams}`),
  ]);

  if (!weatherResponse.ok || !airResponse.ok) {
    throw new Error("Unable to fetch weather data.");
  }

  const weather = await weatherResponse.json();
  const air = await airResponse.json();

  return {
    current: {
      time: weather.current?.time || "",
      temperature: weather.current?.temperature_2m ?? null,
      feelsLike: weather.current?.apparent_temperature ?? null,
      humidity: weather.current?.relative_humidity_2m ?? null,
      wind: weather.current?.wind_speed_10m ?? null,
      visibility: weather.current?.visibility ?? null,
      weatherCode: weather.current?.weather_code ?? 0,
      aqi: air.current?.european_aqi ?? null,
      pm25: air.current?.pm2_5 ?? null,
      uv: air.current?.uv_index ?? null,
    },

    hourly: weather.hourly || {
      time: [],
      temperature_2m: [],
      apparent_temperature: [],
      precipitation_probability: [],
      weather_code: [],
      uv_index: [],
    },

    daily: weather.daily || {
      time: [],
      weather_code: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_probability_max: [],
      sunrise: [],
      sunset: [],
    },

    timezone: weather.timezone || "auto",
  };
}

export async function searchCities(query) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name: trimmedQuery,
    count: "6",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `${GEOCODING_URL}?${params}`
  );

  if (!response.ok) {
    throw new Error("Unable to search locations.");
  }

  const data = await response.json();

  return (data.results || []).map((place) => ({
    id: place.id,
    name: place.name,
    country: place.country || "",
    countryCode: place.country_code || "",
    admin1: place.admin1 || "",
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || "",
  }));
}