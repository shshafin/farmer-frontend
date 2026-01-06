import { useEffect, useState } from "react";

export default function Weather() {
  const API_KEY = "de045abad9b6e60785752c4f3e99c1ab";
  const [city, setCity] = useState("Dhaka");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch weather data (current + forecast)
  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError("");

      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) throw new Error("City not found");
      const currentData = await currentRes.json();

      const { coord } = currentData;
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      setCurrentWeather(currentData);
      const filteredForecast = forecastData.list
        .filter((f) => f.dt_txt.includes("12:00:00"))
        .slice(0, 5);
      setForecast(filteredForecast);
    } catch (err) {
      setError("Location not found or API error");
      setCurrentWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch by geolocation
  const fetchByLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const currentData = await currentRes.json();
          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const forecastData = await forecastRes.json();
          setCurrentWeather(currentData);
          const filteredForecast = forecastData.list
            .filter((f) => f.dt_txt.includes("12:00:00"))
            .slice(0, 5);
          setForecast(filteredForecast);
        } catch (err) {
          setError("Could not fetch location weather");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Failed to get current location");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const formatDate = (dt_txt) => dt_txt?.split(" ")[0] || "";

  return (
    <>
      <div className="video-body-box">
        <h4 className="">
          প্রতিদিনের আবহাওয়া দেখে আপনার ফসলকে সুরক্ষা দিন
        </h4>
      </div>

      <div className="weather-container">
        <div className="weather-input">
          <h3>Enter Your District Or Department Name</h3>
          <input
            className="city-input"
            name="ddn"
            type="text"
            placeholder="Bng.Eng.-- District Or Department"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="button"
            className="search-btn"
            onClick={() => fetchWeather(city)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <div className="separator"></div>
          <button
            type="button"
            className="location-btn"
            onClick={fetchByLocation}
            disabled={loading}
          >
            Use Current Location
          </button>
          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
          )}
        </div>

        <div className="weather-data">
          <div className="current-weather">
            <div className="details">
              <h2>
                {currentWeather
                  ? `${currentWeather.name} (${new Date().toISOString().split("T")[0]})`
                  : "_______ ( ______ )"}
              </h2>
              <h3>
                Temperature:{" "}
                {currentWeather ? `${currentWeather.main.temp}°C` : "__°C"}
              </h3>
              <h6>
                Wind:{" "}
                {currentWeather ? `${currentWeather.wind.speed} M/S` : "__ M/S"}
              </h6>
              <h6>
                Humidity:{" "}
                {currentWeather ? `${currentWeather.main.humidity}%` : "__%"}
              </h6>
            </div>
            <div className="weather-status">
              {currentWeather ? (
                <>
                  <img
                    src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
                    alt="weather-icon"
                  />
                  <h6>{currentWeather.weather[0].description}</h6>
                </>
              ) : (
                <>
                  <img
                    src="https://openweathermap.org/img/wn/01d@4x.png"
                    alt="weather-icon"
                  />
                  <h6>clear sky</h6>
                </>
              )}
            </div>
          </div>

          <div className="days-forecast">
            <h2>5-Day Forecast</h2>
            <ul className="weather-cards">
              {forecast.length > 0
                ? forecast.map((day, i) => (
                    <li className="card" key={i}>
                      <h3>({formatDate(day.dt_txt)})</h3>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png`}
                        alt="weather-icon"
                      />
                      <h6>Temp: {day.main.temp}°C</h6>
                      <h6>Wind: {day.wind.speed} M/S</h6>
                      <h6>Humidity: {day.main.humidity}%</h6>
                    </li>
                  ))
                : Array.from({ length: 5 }).map((_, i) => (
                    <li className="card" key={i}>
                      <h3>( ______ )</h3>
                      <img
                        src="https://openweathermap.org/img/wn/01d@4x.png"
                        alt="weather-icon"
                      />
                      <h6>Temp: __C</h6>
                      <h6>Wind: __ M/S</h6>
                      <h6>Humidity: __%</h6>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}