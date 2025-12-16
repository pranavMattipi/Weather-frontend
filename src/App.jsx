import React, { useState } from "react";
import {
  CloudIcon,
  SunIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C"); // C or F

  const convertTemp = (tempC) => {
    return unit === "C" ? tempC : (tempC * 9) / 5 + 32;
  };

  async function fetchWeather(city) {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocal) {
      // development: call your local backend
      const res = await fetch(`http://localhost:8000/api/weather?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("Local backend error");
      return await res.json();
    } else {
      // production: call OpenWeather directly (set API key in Vercel env)
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
      if (!apiKey) throw new Error("WEATHER API key missing in environment");

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`OpenWeather error: ${res.status} ${text || res.statusText}`);
      }
      const data = await res.json();

      // normalize to the same shape your app expects from the backend
      return {
        city: data.name,
        temp: data.main?.temp,
        humidity: data.main?.humidity,
        wind: data.wind?.speed,
        condition: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon,
      };
    }
  }

  const getWeather = async () => {
    if (!city.trim()) return;

    try {
      const data = await fetchWeather(city);

      if (data.error) {
        setError("City not found");
        setWeather(null);
      } else {
        setWeather(data);
        setError("");
      }
    } catch (err) {
      setError("Server Error");
      setWeather(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-indigo-500 p-4">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl w-full max-w-lg p-8 text-center">
        
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-white drop-shadow mb-6 flex justify-center items-center gap-2">
          <SunIcon className="w-9 h-9 text-yellow-300" />
          Weather Forecast
        </h1>

        {/* Search Box */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter city name..."
            className="w-full px-4 py-3 rounded-xl bg-white/80 outline-none text-gray-800 placeholder-gray-500 shadow-lg"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather()} // ⭐ ENTER to search
          />
          <button
            onClick={getWeather}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white font-semibold shadow-lg transition"
          >
            Search
          </button>
        </div>

        {/* Celsius / Fahrenheit Toggle */}
        {weather && (
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setUnit("C")}
              className={`px-4 py-2 rounded-lg font-semibold ${
                unit === "C"
                  ? "bg-white text-blue-600 shadow"
                  : "bg-white/20 text-white"
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit("F")}
              className={`px-4 py-2 rounded-lg font-semibold ${
                unit === "F"
                  ? "bg-white text-blue-600 shadow"
                  : "bg-white/20 text-white"
              }`}
            >
              °F
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-200 font-semibold mt-4">{error}</p>
        )}

        {/* Weather Card */}
        {weather && (
          <div className="mt-6 bg-white/20 backdrop-blur-2xl rounded-2xl p-6 text-white shadow-inner animate-fadeIn">
            <h2 className="text-3xl font-bold mb-1">{weather.city}</h2>

            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="weather icon"
              className="mx-auto drop-shadow-xl"
            />

            <p className="text-4xl font-bold mt-2">
              🌡 {convertTemp(weather.temp).toFixed(1)}°{unit}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4 text-lg">
              <p className="bg-white/20 p-3 rounded-xl">
                💧 Humidity:{" "}
                <span className="font-semibold">{weather.humidity}%</span>
              </p>
              <p className="bg-white/20 p-3 rounded-xl">
                🌬 Wind:{" "}
                <span className="font-semibold">{weather.wind} m/s</span>
              </p>
              <p className="col-span-2 bg-white/20 p-3 rounded-xl capitalize">
                ☁ Condition:{" "}
                <span className="font-semibold">{weather.condition}</span>
              </p>
            </div>

            <button
              onClick={getWeather}
              className="mt-6 flex mx-auto items-center gap-2 bg-blue-700 hover:bg-blue-800 px-5 py-3 rounded-xl shadow-lg"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
