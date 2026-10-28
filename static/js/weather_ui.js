import { convertToUserTime } from './utils.js';
import { syncMapFromWeather, initMap } from './map_service.js';
import { renderForecast } from './chart_service.js';

let lastData = null;

export function renderWeather(data, lastWeatherData) {
    if (!data || !data.location || !data.current) return;
    lastData = data;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };
    const setSrc = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.src = value;
    };

    setText("city", `${data.location.name}, ${data.location.region}, ${data.location.country}`);
    setText("time", `Local Time: ${convertToUserTime(data.location.localtime)}`);
    setText("temp", `${data.current.temp_c} °C`);
    setText("condition", data.current.condition.text);

    if (data.current.condition?.icon) {
        setSrc("icon", `https:${data.current.condition.icon}`);
    }

    // New meta pills
    setText("mainHumidity", `${data.current.humidity}%`);
    setText("mainWind", `${data.current.wind_kph} km/h`);
    setText("mainUV", `UV ${data.current.uv}`);
    setText("mainFeels", `Feels ${data.current.feelslike_c}°C`);
    setText("mainPressure", `${data.current.pressure_mb} mb`);
    setText("mainVisibility", `${data.current.vis_km} km`);

    const forecastDay = data?.forecast?.forecastday?.[0]?.day;
    const tempAvg = forecastDay?.avgtemp_c ?? data.current.temp_c;
    const tempMin = forecastDay?.mintemp_c ?? data.current.temp_c;
    const tempMax = forecastDay?.maxtemp_c ?? data.current.temp_c;

    setText("mainTempAvg", `Avg ${tempAvg}°C`);
    setText("mainTempMin", `Min ${tempMin}°C`);
    setText("mainTempMax", `Max ${tempMax}°C`);

    const lastUpdatedEl = document.getElementById("mapLastUpdated");
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent =
            `Last updated: ${convertToUserTime(data.current.last_updated)}`;
    }

    updateNavButtons(data);
    syncMapFromWeather(data);
    renderStats(0);

    if (data.location) {
        initMap(data.location.lat, data.location.lon, lastWeatherData);
    }

    // We still call this to populate the forecast card content,
    // but app.js will handle chart re-rendering when the slider opens.
    renderForecast(data);
}

function updateNavButtons(data) {
    const days = data?.forecast?.forecastday || [];
    const btnDay1 = document.getElementById("btnDay1");
    const btnDay2 = document.getElementById("btnDay2");

    if (days[1] && btnDay1) {
        const date = new Date(`${days[1].date}T00:00:00`);
        btnDay1.innerText = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    if (days[2] && btnDay2) {
        const date = new Date(`${days[2].date}T00:00:00`);
        btnDay2.innerText = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
}

export function renderStats(dayIndex = 0) {
    if (!lastData) return;

    let stats = [];
    if (dayIndex === 0) {
        const curr = lastData.current;
        const astro = lastData.forecast.forecastday[0]?.astro || {};
        stats = [
            { icon: "fa-temperature-high", label: "Temperature", value: curr.temp_c + " °C" },
            { icon: "fa-temperature-half", label: "Feels Like", value: curr.feelslike_c + " °C" },
            { icon: "fa-wind", label: "Wind Speed", value: curr.wind_kph + " km/h" },
            { icon: "fa-gauge-high", label: "Gust", value: curr.gust_kph + " km/h" },
            { icon: "fa-compass", label: "Direction", value: curr.wind_dir },
            { icon: "fa-droplet", label: "Humidity", value: curr.humidity + " %" },
            { icon: "fa-sun", label: "UV Index", value: curr.uv },
            { icon: "fa-cloud-rain", label: "Precipitation", value: curr.precip_mm + " mm" },
            { icon: "fa-gauge", label: "Pressure", value: curr.pressure_mb + " mb" },
            { icon: "fa-eye", label: "Visibility", value: curr.vis_km + " km" },
            { icon: "fa-cloud", label: "Cloud Cover", value: curr.cloud + " %" },
            { icon: "fa-sun", label: "Sunrise", value: astro.sunrise || "--" },
            { icon: "fa-moon", label: "Sunset", value: astro.sunset || "--" },
            { icon: "fa-moon", label: "Moon Phase", value: astro.moon_phase || "--" }
        ];
    } else {
        const fday = lastData.forecast.forecastday[dayIndex];
        const day = fday?.day;
        const astro = fday?.astro || {};
        if (!day) return;
        stats = [
            { icon: "fa-temperature-high", label: "Avg Temp", value: day.avgtemp_c + " °C" },
            { icon: "fa-temperature-arrow-up", label: "Max Temp", value: day.maxtemp_c + " °C" },
            { icon: "fa-temperature-arrow-down", label: "Min Temp", value: day.mintemp_c + " °C" },
            { icon: "fa-wind", label: "Max Wind", value: day.maxwind_kph + " km/h" },
            { icon: "fa-droplet", label: "Avg Humidity", value: day.avghumidity + " %" },
            { icon: "fa-sun", label: "UV Index", value: day.uv },
            { icon: "fa-cloud-rain", label: "Total Precip", value: day.totalprecip_mm + " mm" },
            { icon: "fa-cloud", label: "Rain Chance", value: day.daily_chance_of_rain + " %" },
            { icon: "fa-snowflake", label: "Snow Chance", value: day.daily_chance_of_snow + " %" },
            { icon: "fa-eye", label: "Visibility", value: day.avgvis_km + " km" },
            { icon: "fa-sun", label: "Sunrise", value: astro.sunrise || "--" },
            { icon: "fa-moon", label: "Sunset", value: astro.sunset || "--" },
            { icon: "fa-moon", label: "Moon Phase", value: astro.moon_phase || "--" },
            { icon: "fa-moon", label: "Moonrise", value: astro.moonrise || "--" }
        ];
    }

    const container = document.getElementById("stats");
    if (!container) return;
    container.innerHTML = "";

    stats.forEach(s => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <i class="fa-solid ${s.icon}"></i>
            <div>
                <div class="label">${s.label}</div>
                <div class="value">${s.value}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function getLastData() { return lastData; }
