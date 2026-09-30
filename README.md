# 🌦️ Mausam

### Weather that answers, not reports.

Mausam is a personalized weather experience designed to tell users what the weather actually means for their day — instead of overwhelming them with a dashboard full of numbers.

## 🚀 Why Mausam?

Most weather applications give users large amounts of information:

- Temperature
- Humidity
- Wind
- Rain probability
- AQI
- Forecasts
- UV index

But users usually want a simpler answer:

> "Can I go for a run?"
>
> "Is it comfortable outside?"
>
> "Should I carry an umbrella?"
>
> "Is the air quality okay?"
>
> "When is the best time to go outside?"

Mausam turns weather data into useful, personalized answers.

---

## ✨ Features

### 🌤️ Personalized Weather

Mausam adapts the weather experience around what matters to the user.

Users can select interests such as:

- Running & Fitness
- Health & Air
- Commute
- Family & School
- Travel
- Farming & Garden
- Beach & Outdoors
- Events

---

### 💡 Weather Verdicts

Instead of simply showing weather values, Mausam explains what those values mean.

For example:

> "Warm but comfortable. Winds are light and rain isn't currently a concern."

Users can also open the **Why?** explanation to understand which weather factors produced the recommendation.

---

### 🎯 For You

The homepage highlights information that is relevant to the user's selected interests.

This avoids forcing users to navigate through multiple dashboards.

---

### 📍 Location Search

Users can search for cities and instantly view weather information for that location.

Mausam uses Open-Meteo's geocoding service for location search.

---

### 📌 Current Location

Users can optionally allow browser location access to load weather for their current location.

---

### 🌡️ Current Conditions

Mausam provides:

- Temperature
- Feels-like temperature
- Humidity
- Wind speed
- Visibility
- UV index
- Air Quality Index
- PM2.5

---

### ⏱️ Hourly Forecast

Users can see upcoming hourly conditions including:

- Temperature
- Feels-like temperature
- Rain probability
- Weather conditions
- UV index

---

### 📅 7-Day Forecast

The application provides a seven-day forecast including:

- Daily high
- Daily low
- Rain probability
- Weather conditions
- Sunrise
- Sunset

---

### 🎬 Weather Atmosphere

The interface changes its visual atmosphere based on current weather conditions, creating a more immersive experience instead of a static dashboard.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### APIs

- Open-Meteo Weather API
- Open-Meteo Air Quality API
- Open-Meteo Geocoding API

### Storage

- Browser LocalStorage

No database or backend is required for the current MVP.

---

## 🧠 How It Works

```text
User
  ↓
Selects interests
  ↓
Searches location / uses current location
  ↓
Mausam fetches live weather data
  ↓
Weather + Air Quality data
  ↓
Personalization logic
  ↓
Useful weather verdicts
  ↓
Relevant recommendations
