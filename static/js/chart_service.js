let forecastChartTempInstance = null;
let forecastChartPrecipInstance = null;
let forecastChartWindInstance = null;
let forecastChartHumUVInstance = null;

export function renderForecast(data) {
    const forecastContainer = document.getElementById("forecast");
    const subtitle = document.getElementById("forecastSubtitle");
    if (!forecastContainer) return;

    const days = data?.forecast?.forecastday || [];
    forecastContainer.innerHTML = "";

    const ctxTemp = document.getElementById('forecastChartTemp');
    const ctxPrecip = document.getElementById('forecastChartPrecip');
    const ctxWind = document.getElementById('forecastChartWind');
    const ctxHumUV = document.getElementById('forecastChartHumUV');

    if (ctxTemp && ctxPrecip && ctxWind && ctxHumUV) {
        if (forecastChartTempInstance) forecastChartTempInstance.destroy();
        if (forecastChartPrecipInstance) forecastChartPrecipInstance.destroy();
        if (forecastChartWindInstance) forecastChartWindInstance.destroy();
        if (forecastChartHumUVInstance) forecastChartHumUVInstance.destroy();

        const labels = days.map(d => new Date(`${d.date}T00:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
        const maxTemps = days.map(d => d.day.maxtemp_c);
        const minTemps = days.map(d => d.day.mintemp_c);
        const avgTemps = days.map(d => d.day.avgtemp_c);
        const precip = days.map(d => d.day.totalprecip_mm);
        const snow = days.map(d => d.day.totalsnow_cm);
        const wind = days.map(d => d.day.maxwind_kph);
        const humidity = days.map(d => d.day.avghumidity);
        const uv = days.map(d => d.day.uv);
        const chanceRain = days.map(d => d.day.daily_chance_of_rain);
        const chanceSnow = days.map(d => d.day.daily_chance_of_snow);

        const textColor = '#888';
        const gridColor = 'rgba(128, 128, 128, 0.2)';

        // Chart 1: Temperatures
        forecastChartTempInstance = new Chart(ctxTemp, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Max Temp (°C)',
                        data: maxTemps,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Avg Temp (°C)',
                        data: avgTemps,
                        borderColor: 'rgba(255, 206, 86, 1)',
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Min Temp (°C)',
                        data: minTemps,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor } },
                    title: { display: true, text: 'Temperature Forecast', color: textColor, font: { size: 14 } }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { title: { display: true, text: '°C', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });

        // Chart 2: Precipitation
        forecastChartPrecipInstance = new Chart(ctxPrecip, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Rain (mm)',
                        data: precip,
                        type: 'bar',
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        yAxisID: 'yPrecip'
                    },
                    {
                        label: 'Snow (cm)',
                        data: snow,
                        type: 'bar',
                        backgroundColor: 'rgba(200, 230, 255, 0.6)',
                        yAxisID: 'yPrecip'
                    },
                    {
                        label: 'Chance of Rain (%)',
                        data: chanceRain,
                        borderColor: 'rgba(99, 132, 255, 1)',
                        backgroundColor: 'rgba(99, 132, 255, 0.2)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'yOther'
                    },
                    {
                        label: 'Chance of Snow (%)',
                        data: chanceSnow,
                        borderColor: 'rgba(150, 200, 255, 1)',
                        backgroundColor: 'rgba(150, 200, 255, 0.2)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'yOther'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor } },
                    title: { display: true, text: 'Precipitation Forecast', color: textColor, font: { size: 14 } }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    yOther: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Chance (%)', color: textColor },
                        min: 0,
                        max: 100,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    yPrecip: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Amount', color: textColor },
                        ticks: { color: textColor },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        // Chart 3: Wind
        forecastChartWindInstance = new Chart(ctxWind, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Max Wind (km/h)',
                        data: wind,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor } },
                    title: { display: true, text: 'Wind Forecast', color: textColor, font: { size: 14 } }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    y: { title: { display: true, text: 'km/h', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });

        // Chart 4: Humidity & UV
        forecastChartHumUVInstance = new Chart(ctxHumUV, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Humidity (%)',
                        data: humidity,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'yHum'
                    },
                    {
                        label: 'UV Index',
                        data: uv,
                        borderColor: 'rgba(200, 200, 200, 1)',
                        backgroundColor: 'rgba(200, 200, 200, 0.2)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'yUv'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: textColor } },
                    title: { display: true, text: 'Humidity & UV Forecast', color: textColor, font: { size: 14 } }
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { color: gridColor } },
                    yHum: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Humidity (%)', color: textColor },
                        min: 0,
                        max: 100,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    yUv: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'UV Index', color: textColor },
                        min: 0,
                        ticks: { color: textColor },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    if (subtitle) {
        const tz = data?.location?.tz_id ? ` • ${data.location.tz_id}` : "";
        subtitle.textContent = days.length ? `${days.length} days${tz}` : "";
    }

    days.forEach((d) => {
        const day = d.day || {};
        const condition = day.condition || {};
        const astro = d.astro || {};
        const hours = d.hour || [];

        const card = document.createElement("div");
        card.className = "forecast-card";

        const dateLabel = new Date(`${d.date}T00:00:00`).toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

        const iconUrl = condition.icon ? `https:${condition.icon}` : "";
        const willRain = day.daily_will_it_rain === 1;
        const willSnow = day.daily_will_it_snow === 1;
        const chanceRain = day.daily_chance_of_rain ?? 0;
        const chanceSnow = day.daily_chance_of_snow ?? 0;
        const humidityData = day.avghumidity ?? "--";
        const vis = day.avgvis_km ?? "--";
        const uvData = day.uv ?? "--";
        const snowCm = day.totalsnow_cm ?? 0;

        const hourlyHtml = hours.map((h) => {
            const time = (h.time || "").split(" ")[1] || "--:--";
            const hIcon = h?.condition?.icon ? `https:${h.condition.icon}` : "";
            const hText = h?.condition?.text || "";
            const precipVal = h.precip_mm ?? 0;
            const windVal = h.wind_kph ?? "--";
            const tempVal = h.temp_c ?? "--";
            return `
<div class="hourly-row">
  <div class="hourly-time">${time}</div>
  <div class="hourly-main">
    ${hIcon ? `<img class="hourly-icon" alt="${hText || "Hour"}" src="${hIcon}">` : ""}
    <div class="hourly-text">${tempVal} °C • ${hText}</div>
  </div>
  <div class="hourly-meta">
    <div>${precipVal} mm</div>
    <div>${windVal} km/h</div>
  </div>
</div>`;
        }).join("");

        card.innerHTML = `
<div class="forecast-top">
  <div class="forecast-date">${dateLabel}</div>
  ${iconUrl ? `<img class="forecast-icon" alt="${condition.text || "Forecast"}" src="${iconUrl}">` : ""}
</div>
<div class="forecast-condition">${condition.text || "--"}</div>
<div class="forecast-temps">
  <span><strong>Max:</strong> ${day.maxtemp_c ?? "--"} °C</span>
  <span><strong>Min:</strong> ${day.mintemp_c ?? "--"} °C</span>
  <span><strong>Avg:</strong> ${day.avgtemp_c ?? "--"} °C</span>
</div>
<div class="forecast-meta">
  <div class="forecast-meta-item">
    <i class="fa-solid fa-cloud-rain"></i>
    <span>${willRain ? "Rain" : "No rain"} (${chanceRain}%)</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-snowflake"></i>
    <span>${willSnow ? "Snow" : "No snow"} (${chanceSnow}%)</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-droplet"></i>
    <span>Precip: ${day.totalprecip_mm ?? 0} mm</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-wind"></i>
    <span>Wind: ${day.maxwind_kph ?? "--"} km/h</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-water"></i>
    <span>Humidity: ${humidityData}%</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-eye"></i>
    <span>Visibility: ${vis} km</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-sun"></i>
    <span>UV: ${uvData}</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-snowflake"></i>
    <span>Snow: ${snowCm} cm</span>
  </div>
</div>
<div class="forecast-meta" style="margin-top:10px">
  <div class="forecast-meta-item">
    <i class="fa-solid fa-sun"></i>
    <span>Sunrise: ${astro.sunrise || "--"}</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-sun"></i>
    <span>Sunset: ${astro.sunset || "--"}</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-moon"></i>
    <span>Moonrise: ${astro.moonrise || "--"}</span>
  </div>
  <div class="forecast-meta-item">
    <i class="fa-solid fa-moon"></i>
    <span>Moonset: ${astro.moonset || "--"}</span>
  </div>
</div>
<details class="forecast-details">
  <summary>Hourly forecast (24h)</summary>
  <div class="hourly-list">
    ${hourlyHtml || "<div class='hourly-text'>No hourly data.</div>"}
  </div>
</details>
`;
        forecastContainer.appendChild(card);
    });
}
