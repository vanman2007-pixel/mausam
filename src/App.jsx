import { useEffect, useMemo, useState } from "react";
import "./App.css";

import Personalize from "./components/Personalize";

import {
  getWeather,
  searchCities,
} from "./utils/weather";

const DEFAULT_LOCATION = {
  name: "Delhi",
  country: "India",
  latitude: 28.6139,
  longitude: 77.209,
};

const INTEREST_LABELS = {
  fitness: "Running & Fitness",
  health: "Health & Air",
  commute: "Commute",
  family: "Family & School",
  travel: "Travel",
  farming: "Farming & Garden",
  beach: "Beach & Outdoors",
  events: "Events",
};

function getWeatherInfo(code) {
  if (code === 0) {
    return {
      label: "Clear skies",
      icon: "☀️",
      theme: "clear",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Partly cloudy",
      icon: "🌤️",
      theme: "cloudy",
    };
  }

  if (code === 3) {
    return {
      label: "Overcast",
      icon: "☁️",
      theme: "cloudy",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      label: "Foggy",
      icon: "🌫️",
      theme: "fog",
    };
  }

  if (
    [51, 53, 55, 56, 57].includes(code)
  ) {
    return {
      label: "Drizzle",
      icon: "🌦️",
      theme: "rain",
    };
  }

  if (
    [61, 63, 65, 66, 67].includes(code)
  ) {
    return {
      label: "Rain",
      icon: "🌧️",
      theme: "rain",
    };
  }

  if (
    [71, 73, 75, 77].includes(code)
  ) {
    return {
      label: "Snow",
      icon: "❄️",
      theme: "snow",
    };
  }

  if (
    [80, 81, 82].includes(code)
  ) {
    return {
      label: "Showers",
      icon: "🌦️",
      theme: "rain",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorms",
      icon: "⛈️",
      theme: "storm",
    };
  }

  return {
    label: "Changing skies",
    icon: "🌤️",
    theme: "cloudy",
  };
}

function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";

  return "night";
}

function getAqiInfo(aqi) {
  if (aqi == null) {
    return {
      label: "Unavailable",
      text: "Air quality data isn't available right now.",
    };
  }

  if (aqi <= 20) {
    return {
      label: "Very good",
      text: "Air conditions look comfortable for most outdoor plans.",
    };
  }

  if (aqi <= 40) {
    return {
      label: "Good",
      text: "Air quality is generally comfortable outdoors.",
    };
  }

  if (aqi <= 60) {
    return {
      label: "Moderate",
      text: "Most people should be fine, but sensitive people may notice it.",
    };
  }

  if (aqi <= 80) {
    return {
      label: "Poor",
      text: "Consider shorter outdoor exposure if you're sensitive to air quality.",
    };
  }

  if (aqi <= 100) {
    return {
      label: "Very poor",
      text: "Outdoor activity may be less comfortable for sensitive groups.",
    };
  }

  return {
    label: "Extremely poor",
    text: "Consider reducing prolonged outdoor exposure.",
  };
}

function getUvInfo(uv) {
  if (uv == null) return "Unavailable";
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

function getVerdict(weather, interests) {
  const {
    temperature,
    feelsLike,
    wind,
    aqi,
    weatherCode,
  } = weather.current;

  const info = getWeatherInfo(weatherCode);

  const factors = [];

  if (temperature != null) {
    factors.push(
      `It's ${Math.round(temperature)}°C with a feels-like temperature of ${Math.round(
        feelsLike ?? temperature
      )}°C.`
    );
  }

  if (wind != null) {
    factors.push(`Wind is around ${Math.round(wind)} km/h.`);
  }

  if (aqi != null) {
    factors.push(`Air quality is ${Math.round(aqi)} on the European AQI scale.`);
  }

  if (info.theme === "rain") {
    return {
      title: "Keep an umbrella nearby.",
      subtitle: "Rain is part of the picture today.",
      factors,
    };
  }

  if (info.theme === "storm") {
    return {
      title: "Outdoor plans need a rethink.",
      subtitle: "Thunderstorm conditions are possible.",
      factors,
    };
  }

  if (
    interests.includes("fitness") &&
    temperature != null &&
    temperature >= 15 &&
    temperature <= 30 &&
    (aqi == null || aqi <= 60) &&
    (wind == null || wind < 25)
  ) {
    return {
      title: "Good conditions for getting outside.",
      subtitle: "Temperature, wind and air quality are working in your favour.",
      factors,
    };
  }

  if (
    interests.includes("commute") &&
    wind != null &&
    wind < 30 &&
    info.theme !== "rain"
  ) {
    return {
      title: "Your commute looks manageable.",
      subtitle: "No major weather disruption stands out right now.",
      factors,
    };
  }

  if (
    interests.includes("health") &&
    aqi != null &&
    aqi > 60
  ) {
    return {
      title: "Air quality is worth watching.",
      subtitle: "Sensitive people may want to keep outdoor exposure shorter.",
      factors,
    };
  }

  if (
    temperature != null &&
    temperature >= 18 &&
    temperature <= 32 &&
    info.theme !== "rain"
  ) {
    return {
      title: "It's a pretty comfortable day.",
      subtitle: "Nothing major is getting in the way of being outside.",
      factors,
    };
  }

  if (temperature != null && temperature > 35) {
    return {
      title: "It's going to feel hot.",
      subtitle: "Plan outdoor activity around the cooler parts of the day.",
      factors,
    };
  }

  if (temperature != null && temperature < 12) {
    return {
      title: "It's a chilly one.",
      subtitle: "Layer up if you're heading outside.",
      factors,
    };
  }

  return {
    title: "Here's what your weather looks like.",
    subtitle: "Mausam is keeping an eye on the details for you.",
    factors,
  };
}

function formatHour(value) {
  if (!value) return "--";

  const date = new Date(value);

  return date.toLocaleTimeString([], {
    hour: "numeric",
  });
}

function formatDay(value, index) {
  if (!value) return "--";

  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  const date = new Date(`${value}T12:00:00`);

  return date.toLocaleDateString([], {
    weekday: "short",
  });
}

function getRelevantHourly(weather) {
  const times = weather.hourly?.time || [];

  if (!times.length) return [];

  const now = Date.now();

  let startIndex = times.findIndex(
    (time) => new Date(time).getTime() >= now
  );

  if (startIndex === -1) {
    startIndex = 0;
  }

  return times
    .slice(startIndex, startIndex + 8)
    .map((time, offset) => {
      const index = startIndex + offset;

      return {
        time,
        temperature:
          weather.hourly.temperature_2m?.[index],
        precipitation:
          weather.hourly.precipitation_probability?.[index],
        code:
          weather.hourly.weather_code?.[index],
      };
    });
}

function getPersonalCards(weather, interests) {
  const cards = [];

  const {
    temperature,
    aqi,
    uv,
    wind,
    weatherCode,
  } = weather.current;

  const info = getWeatherInfo(weatherCode);

  if (
    interests.includes("fitness") &&
    temperature != null
  ) {
    if (
      temperature >= 15 &&
      temperature <= 30 &&
      (aqi == null || aqi <= 60) &&
      info.theme !== "rain"
    ) {
      cards.push({
        icon: "🏃",
        label: "RUNNING",
        title: "Good window to get outside",
        text: "Comfortable temperatures and manageable conditions make this a useful time for outdoor activity.",
      });
    } else {
      cards.push({
        icon: "🏃",
        label: "RUNNING",
        title: "Check conditions before heading out",
        text: "Temperature or air conditions may make outdoor exercise less comfortable.",
      });
    }
  }

  if (interests.includes("health")) {
    const aqiInfo = getAqiInfo(aqi);

    cards.push({
      icon: "🌬️",
      label: "HEALTH",
      title: `Air quality: ${aqiInfo.label}`,
      text: aqiInfo.text,
    });
  }

  if (interests.includes("commute")) {
    cards.push({
      icon: "🚗",
      label: "COMMUTE",
      title:
        info.theme === "rain"
          ? "Allow extra time"
          : "Conditions look manageable",
      text:
        info.theme === "rain"
          ? "Rain may make the journey slower or less comfortable."
          : "There is no major weather warning affecting your commute right now.",
    });
  }

  if (interests.includes("family")) {
    cards.push({
      icon: "👨‍👩‍👧",
      label: "FAMILY",
      title:
        info.theme === "rain"
          ? "Outdoor plans may need a backup"
          : "Good time to plan the day",
      text:
        info.theme === "rain"
          ? "Keep an indoor alternative ready."
          : "The current conditions don't show a major weather obstacle.",
    });
  }

  if (interests.includes("travel")) {
    cards.push({
      icon: "✈️",
      label: "TRAVEL",
      title: "Check the sky before you go",
      text: `${info.label}. ${wind != null ? `Wind is around ${Math.round(wind)} km/h.` : ""}`,
    });
  }

  if (interests.includes("beach")) {
    cards.push({
      icon: "🏖️",
      label: "OUTDOORS",
      title:
        uv != null && uv >= 6
          ? "Strong sun today"
          : "Outdoor conditions look calmer",
      text:
        uv != null && uv >= 6
          ? `UV is ${Math.round(uv)} (${getUvInfo(uv)}).`
          : "Sun intensity is currently not particularly high.",
    });
  }

  if (interests.includes("farming")) {
    cards.push({
      icon: "🌱",
      label: "GARDEN",
      title:
        info.theme === "rain"
          ? "Natural watering may be coming"
          : "Keep an eye on moisture",
      text:
        info.theme === "rain"
          ? "Rain may help outdoor plants."
          : "Current conditions don't suggest rain is doing the work for you.",
    });
  }

  if (interests.includes("events")) {
    cards.push({
      icon: "🎪",
      label: "EVENTS",
      title:
        info.theme === "rain"
          ? "Have a backup plan"
          : "Outdoor plans look possible",
      text:
        info.theme === "rain"
          ? "Weather could interfere with an outdoor event."
          : "Current conditions are not showing a major outdoor disruption.",
    });
  }

  return cards.slice(0, 3);
}

function App() {
  const [started, setStarted] = useState(false);
  const [personalized, setPersonalized] = useState(false);

  const [interests, setInterests] = useState([]);

  const [location, setLocation] = useState(DEFAULT_LOCATION);

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showWhy, setShowWhy] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("mausam-interests") || "[]"
      );

      if (Array.isArray(saved)) {
        setInterests(saved);
      }
    } catch {
      setInterests([]);
    }
  }, []);

  useEffect(() => {
    if (!started) return;

    let cancelled = false;

    async function loadWeather() {
      setLoading(true);
      setError("");

      try {
        const data = await getWeather(
          location.latitude,
          location.longitude
        );

        if (!cancelled) {
          setWeather(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "We couldn't load the weather right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, [location, started]);

  useEffect(() => {
    if (!searchOpen) return;

    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const results = await searchCities(query);

        if (!cancelled) {
          setSearchResults(results);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
          setSearchError("Couldn't search locations.");
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, searchOpen]);

  const weatherInfo = useMemo(() => {
    if (!weather) return null;

    return getWeatherInfo(weather.current.weatherCode);
  }, [weather]);

  const verdict = useMemo(() => {
    if (!weather) return null;

    return getVerdict(weather, interests);
  }, [weather, interests]);

  const hourly = useMemo(() => {
    if (!weather) return [];

    return getRelevantHourly(weather);
  }, [weather]);

  const personalCards = useMemo(() => {
    if (!weather) return [];

    return getPersonalCards(weather, interests);
  }, [weather, interests]);

  const aqiInfo = useMemo(() => {
    if (!weather) return null;

    return getAqiInfo(weather.current.aqi);
  }, [weather]);

  function startApp() {
    setStarted(true);
  }

  function completePersonalization(selected) {
    setInterests(selected);
    setPersonalized(true);
  }

  function openPersonalize() {
    setPersonalized(false);
    setStarted(true);
  }

  function selectCity(city) {
    setLocation({
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    });

    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setLocationMessage("");
    setShowWhy(false);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Location services aren't available in this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          name: "Your location",
          country: "",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
        setSearchOpen(false);
      },
      () => {
        setLocationLoading(false);
        setLocationMessage(
          "We couldn't access your location. You can search for a city instead."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  function resetSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  }

  if (!started) {
    return (
      <main className="landing">
        <video
          className="landing-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/weather.mp4" type="video/mp4" />
        </video>

        <div className="landing-overlay" />

        <nav className="landing-nav">
          <div className="brand">MAUSAM</div>

          <button
            className="nav-enter"
            onClick={startApp}
          >
            Enter →
          </button>
        </nav>

        <section className="landing-content">
          <p className="eyebrow">
            WEATHER, BUT PERSONAL
          </p>

          <h1>
            Weather that
            <br />
            <em>answers.</em>
          </h1>

          <p className="landing-copy">
            Not another dashboard full of numbers.
            <br />
            Mausam tells you what the weather means for you.
          </p>

          <button
            className="landing-cta"
            onClick={startApp}
          >
            See my weather
            <span>↗</span>
          </button>
        </section>

        <div className="landing-footer">
          <span>OPEN METEO</span>
          <span>PERSONALIZED WEATHER</span>
          <span>BUILT FOR REAL LIFE</span>
        </div>
      </main>
    );
  }

  if (!personalized && interests.length === 0) {
    return (
      <Personalize
        onComplete={completePersonalization}
      />
    );
  }

  if (loading && !weather) {
    return (
      <main className="loading-screen">
        <div className="loading-mark">M</div>

        <p>Reading the sky...</p>

        <div className="loading-line">
          <span />
        </div>
      </main>
    );
  }

  if (error && !weather) {
    return (
      <main className="error-screen">
        <div className="error-card">
          <div className="error-icon">☁️</div>

          <p className="eyebrow">SOMETHING WENT WRONG</p>

          <h1>We couldn't read the weather.</h1>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() => setLocation({ ...location })}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!weather || !weatherInfo || !verdict) {
    return null;
  }

  const current = weather.current;
  const timeOfDay = getTimeOfDay();

  return (
    <main
      className={`app weather-${weatherInfo.theme} time-${timeOfDay}`}
    >
      <div className="atmosphere atmosphere-one" />
      <div className="atmosphere atmosphere-two" />

      <nav className="topbar">
        <button
          className="brand-button"
          onClick={() => setStarted(false)}
        >
          MAUSAM
        </button>

        <div className="topbar-actions">
          <button
            className="location-button"
            onClick={() => setSearchOpen(true)}
          >
            <span>⌖</span>
            <span>{location.name}</span>
          </button>

          <button
            className="personalize-button"
            onClick={openPersonalize}
          >
            Personalize
          </button>
        </div>
      </nav>

      {locationMessage && (
        <div className="location-message">
          {locationMessage}
        </div>
      )}

      <section className="weather-page">
        <header className="weather-header">
          <div>
            <p className="eyebrow">
              {timeOfDay.toUpperCase()}
            </p>

            <h1>{location.name}</h1>

            {location.country && (
              <p className="location-country">
                {location.country}
              </p>
            )}
          </div>

          <button
            className="current-location-button"
            onClick={useCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading
              ? "Finding you..."
              : "Use my location"}
          </button>
        </header>

        <section className="hero-weather">
          <div className="hero-temperature">
            <span className="weather-icon">
              {weatherInfo.icon}
            </span>

            <span className="temperature">
              {Math.round(current.temperature ?? 0)}
            </span>

            <span className="degree">°</span>
          </div>

          <div className="hero-meta">
            <p>{weatherInfo.label}</p>

            <p>
              Feels like{" "}
              {Math.round(current.feelsLike ?? current.temperature ?? 0)}
              °
            </p>
          </div>
        </section>

        <section className="answer-card">
          <div className="answer-main">
            <div>
              <p className="card-label">
                YOUR WEATHER ANSWER
              </p>

              <h2>{verdict.title}</h2>

              <p>{verdict.subtitle}</p>
            </div>

            <button
              className="why-button"
              onClick={() => setShowWhy((value) => !value)}
            >
              {showWhy ? "Hide" : "Why?"}
            </button>
          </div>

          {showWhy && (
            <div className="why-content">
              <p className="why-heading">
                Here's what Mausam is seeing
              </p>

              <div className="why-factors">
                {verdict.factors.map((factor, index) => (
                  <div key={index}>
                    <span>0{index + 1}</span>
                    <p>{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🌬️</span>
            <span className="stat-label">AIR QUALITY</span>
            <strong>
              {current.aqi != null
                ? Math.round(current.aqi)
                : "—"}
            </strong>
            <small>
              {aqiInfo?.label || "Unavailable"}
            </small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">☀️</span>
            <span className="stat-label">UV INDEX</span>
            <strong>
              {current.uv != null
                ? Math.round(current.uv)
                : "—"}
            </strong>
            <small>
              {getUvInfo(current.uv)}
            </small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💧</span>
            <span className="stat-label">HUMIDITY</span>
            <strong>
              {current.humidity != null
                ? `${Math.round(current.humidity)}%`
                : "—"}
            </strong>
            <small>Relative humidity</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💨</span>
            <span className="stat-label">WIND</span>
            <strong>
              {current.wind != null
                ? `${Math.round(current.wind)}`
                : "—"}
            </strong>
            <small>km/h</small>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="card-label">NEXT FEW HOURS</p>
              <h2>What happens next?</h2>
            </div>
          </div>

          <div className="hourly-row">
            {hourly.map((hour, index) => {
              const info = getWeatherInfo(hour.code);

              return (
                <div
                  className={`hour-card ${
                    index === 0 ? "current-hour" : ""
                  }`}
                  key={`${hour.time}-${index}`}
                >
                  <span>
                    {index === 0
                      ? "Now"
                      : formatHour(hour.time)}
                  </span>

                  <strong>{info.icon}</strong>

                  <b>
                    {hour.temperature != null
                      ? `${Math.round(hour.temperature)}°`
                      : "—"}
                  </b>

                  <small>
                    {hour.precipitation != null
                      ? `${Math.round(hour.precipitation)}% rain`
                      : ""}
                  </small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="card-label">THE WEEK AHEAD</p>
              <h2>Plan ahead.</h2>
            </div>
          </div>

          <div className="forecast-list">
            {(weather.daily?.time || []).map(
              (day, index) => {
                const code =
                  weather.daily.weather_code?.[index];

                const info = getWeatherInfo(code);

                const max =
                  weather.daily.temperature_2m_max?.[index];

                const min =
                  weather.daily.temperature_2m_min?.[index];

                const rain =
                  weather.daily
                    .precipitation_probability_max?.[index];

                return (
                  <div
                    className="forecast-row"
                    key={day}
                  >
                    <div className="forecast-day">
                      <strong>
                        {formatDay(day, index)}
                      </strong>

                      <span>{info.label}</span>
                    </div>

                    <span className="forecast-icon">
                      {info.icon}
                    </span>

                    <span className="forecast-rain">
                      {rain != null
                        ? `${Math.round(rain)}%`
                        : "—"}
                    </span>

                    <div className="forecast-temp">
                      <strong>
                        {max != null
                          ? `${Math.round(max)}°`
                          : "—"}
                      </strong>

                      <span>
                        {min != null
                          ? `${Math.round(min)}°`
                          : "—"}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {personalCards.length > 0 && (
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="card-label">MADE FOR YOU</p>
                <h2>What matters right now.</h2>
              </div>
            </div>

            <div className="personal-grid">
              {personalCards.map((card) => (
                <article
                  className="personal-card"
                  key={`${card.label}-${card.title}`}
                >
                  <div className="personal-card-top">
                    <span className="personal-icon">
                      {card.icon}
                    </span>

                    <span className="personal-label">
                      {card.label}
                    </span>
                  </div>

                  <h3>{card.title}</h3>

                  <p>{card.text}</p>

                  <span className="card-arrow">↗</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="app-footer">
          <div>
            <strong>MAUSAM</strong>
            <span>
              Weather that answers, not reports.
            </span>
          </div>

          <span>
            Data powered by Open-Meteo
          </span>
        </footer>
      </section>

      {searchOpen && (
        <div
          className="search-backdrop"
          onClick={resetSearch}
        >
          <div
            className="search-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="search-top">
              <div>
                <p className="eyebrow">
                  FIND A PLACE
                </p>

                <h2>Where next?</h2>
              </div>

              <button
                className="close-search"
                onClick={resetSearch}
              >
                ×
              </button>
            </div>

            <div className="search-input-wrap">
              <span>⌕</span>

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search city..."
              />

              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            <button
              className="use-location-search"
              onClick={useCurrentLocation}
            >
              <span>◎</span>
              Use my current location
            </button>

            {searchLoading && (
              <div className="search-status">
                Searching...
              </div>
            )}

            {searchError && (
              <div className="search-status error">
                {searchError}
              </div>
            )}

            {!searchLoading &&
              searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((city) => (
                    <button
                      className="search-result"
                      key={city.id}
                      onClick={() => selectCity(city)}
                    >
                      <span className="result-pin">
                        ⌖
                      </span>

                      <span>
                        <strong>{city.name}</strong>

                        <small>
                          {[
                            city.admin1,
                            city.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </small>
                      </span>

                      <span className="result-arrow">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}

            {!searchLoading &&
              searchQuery.trim().length >= 2 &&
              searchResults.length === 0 &&
              !searchError && (
                <div className="search-empty">
                  No matching places found.
                </div>
              )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;