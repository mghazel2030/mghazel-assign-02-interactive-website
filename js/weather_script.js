/* 
   =========================================================
   Weather App JS File: File: weather_script.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The main JavaScript file of the App.
   =========================================================
   Developer: Mohsen Ghazel
   Version: 28-Mar-2026
   =========================================================
*/

/* -----------------------------
   EVENT LISTENERS
----------------------------- */

document.getElementById('searchCityButton').addEventListener('click', () => {
    const city = document.getElementById('searchCityInput').value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    getWeatherByCity(city);
});

document.getElementById('useLocationButton').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            getWeatherByCoords(latitude, longitude, "Current Location");
        },
        () => alert("Unable to retrieve your location.")
    );
});

document.getElementById('clearWeatherButton').addEventListener('click', clearWeather);

document.getElementById('themeToggle').addEventListener('click', () => {
    const body = document.body;
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');

    const btn = document.getElementById('themeToggle');
    btn.textContent = body.classList.contains('dark-mode') ? "☀️ Light" : "🌙 Dark";
});


/* -----------------------------
   WEATHER ICON MAPPING
----------------------------- */

const weatherIcons = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌦️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    71: "❄️", 73: "❄️", 75: "❄️",
    80: "🌦️", 81: "🌦️", 82: "🌧️",
    95: "⛈️", 96: "⛈️", 99: "⛈️"
};

let tempChart = null;

/* ============================================================
   FETCHING WEATHER DATA
   ============================================================ */

async function getWeatherByCity(city) {
    try {
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error("Location service error: " + geoRes.status);

        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another city.");
        }

        const loc = geoData.results[0];
        await fetchWeather(loc.latitude, loc.longitude, `${loc.name}, ${loc.country}`);

    } catch (err) {
        console.error(err);
        alert("System Error: " + err.message);
    }
}

async function getWeatherByCoords(lat, lon, label) {
    try {
        await fetchWeather(lat, lon, label || "Current Location");
    } catch (err) {
        console.error(err);
        alert("System Error: " + err.message);
    }
}

async function fetchWeather(lat, lon, label) {
    const weatherUrl =
        "https://api.open-meteo.com/v1/forecast?" +
        `latitude=${lat}&longitude=${lon}` +
        "&current_weather=true" +
        "&hourly=temperature_2m,relativehumidity_2m,weathercode" +
        "&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,uv_index_max" +
        "&timezone=auto";

    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error("Weather service error: " + res.status);

    const data = await res.json();
    updateUI(label, data);
}

/* ============================================================
   UI UPDATE
   ============================================================ */

function updateUI(locationLabel, data) {
    const panel = document.getElementById('weatherPanel');
    panel.classList.remove('weather-display-hidden');

    const current = data.current_weather;
    const daily = data.daily;
    const hourly = data.hourly;

    /* ----- CURRENT WEATHER ----- */
    const code = current.weathercode;
    const icon = weatherIcons[code] || "❓";

    document.getElementById('currentCity').textContent = locationLabel;
    document.getElementById('currentTemperature').textContent = `${Math.round(current.temperature)}°C`;
    document.getElementById('currentDescription').textContent = describeWeatherCode(code);
    document.getElementById('currentWindSpeed').textContent = `${Math.round(current.windspeed)} km/h`;
    document.getElementById('currentWeatherIcon').textContent = icon;

    // Humidity from hourly
    document.getElementById('currentHumidityValue').textContent =
        hourly.relativehumidity_2m?.[0] ? `${hourly.relativehumidity_2m[0]}%` : "--%";

    // UV index
    document.getElementById('currentUVIndex').textContent =
        daily.uv_index_max?.[0] != null ? daily.uv_index_max[0].toFixed(1) : "--";

    // Sunrise / Sunset
    document.getElementById('sunriseTime').textContent =
        daily.sunrise?.[0] ? formatTimeFromISO(daily.sunrise[0]) : "--";

    document.getElementById('sunsetTime').textContent =
        daily.sunset?.[0] ? formatTimeFromISO(daily.sunset[0]) : "--";

    /* ----- HOURLY FORECAST ----- */
    renderHourly(hourly);

    /* ----- DAILY FORECAST ----- */
    renderDaily(daily);

    /* ----- WEEKLY CHART ----- */
    renderChart(daily);
}

/* ============================================================
   RENDER: HOURLY FORECAST
   ============================================================ */
function renderHourly(hourly) {
    const container = document.getElementById('hourlyForecastContainer');
    container.innerHTML = '';

    if (!hourly || !hourly.time) return;

    const now = new Date();
    const times = hourly.time;
    const temps = hourly.temperature_2m;
    const hums = hourly.relativehumidity_2m;
    const codes = hourly.weathercode;

    let startIndex = times.findIndex(t => new Date(t) >= now);
    if (startIndex < 0) startIndex = 0;

    const endIndex = Math.min(startIndex + 12, times.length);

    for (let i = startIndex; i < endIndex; i++) {
        const card = document.createElement('div');
        card.className = 'hourly-card';

        card.innerHTML = `
            <div class="hourly-time">${formatHourFromISO(times[i])}</div>
            <div class="hourly-icon">${weatherIcons[codes[i]] || "❓"}</div>
            <div class="hourly-temp">${Math.round(temps[i])}°C</div>
            <div class="hourly-humidity">${hums[i]}% RH</div>
        `;

        container.appendChild(card);
    }
}

/* ============================================================
   RENDER: DAILY FORECAST
   ============================================================ */
function renderDaily(daily) {
    const list = document.getElementById('forecastList');
    list.innerHTML = '';

    const days = Math.min(7, daily.time.length);

    for (let i = 0; i < days; i++) {
        const li = document.createElement('li');
        li.className = 'forecast-item';

        li.innerHTML = `
            <div class="forecast-text">
                <span class="forecast-icon">${weatherIcons[daily.weathercode[i]] || "❓"}</span>
                <span>${formatDateLabel(daily.time[i])}</span>
            </div>
            <div class="forecast-right">
                <span class="temp-badge">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
        `;

        list.appendChild(li);
    }
}

/* ============================================================
   RENDER: WEEKLY TEMPERATURE CHART
   ============================================================ */
function renderChart(daily) {
    const ctx = document.getElementById('weeklyTemperatureChart').getContext('2d');

    if (tempChart) tempChart.destroy();

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: daily.time.slice(0, 7).map(formatShortDateLabel),
            datasets: [{
                label: 'Daily Max Temperature (°C)',
                data: daily.temperature_2m_max.slice(0, 7),
                borderColor: '#2979ff',
                backgroundColor: 'rgba(41, 121, 255, 0.25)',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#1a237e'
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
        }
    });
}

/* ============================================================
   CLEAR WEATHER PANEL
   ============================================================ */
function clearWeather() {
    document.getElementById('weatherPanel').classList.add('weather-display-hidden');

    document.getElementById('searchCityInput').value = "";

    document.getElementById('currentCity').textContent = "";
    document.getElementById('currentTemperature').textContent = "--°C";
    document.getElementById('currentDescription').textContent = "";
    document.getElementById('currentWindSpeed').textContent = "-- km/h";
    document.getElementById('currentHumidityValue').textContent = "--%";
    document.getElementById('currentUVIndex').textContent = "--";
    document.getElementById('sunriseTime').textContent = "--";
    document.getElementById('sunsetTime').textContent = "--";
    document.getElementById('currentWeatherIcon').textContent = "☀️";

    document.getElementById('hourlyForecastContainer').innerHTML = "";
    document.getElementById('forecastList').innerHTML = "";

    if (tempChart) {
        tempChart.destroy();
        tempChart = null;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   FORMAT HELPERS
   ============================================================ */
function formatTimeFromISO(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatHourFromISO(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit' });
}

function formatDateLabel(iso) {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatShortDateLabel(iso) {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function describeWeatherCode(code) {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55].includes(code)) return "Drizzle";
    if ([61, 63, 65].includes(code)) return "Rain";
    if ([71, 73, 75].includes(code)) return "Snow";
    if ([80, 81, 82].includes(code)) return "Rain showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Unknown conditions";
}