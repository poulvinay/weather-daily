import { initTheme } from './theme.js';
import { fetchWeather, renderSearchSuggestions, clearSearchSuggestions } from './weather_api.js';
import { renderWeather, renderStats, getLastData } from './weather_ui.js';
import { initMap } from './map_service.js';
import { renderForecast } from './chart_service.js';

let lastWeatherData = null;

function searchWeather() {
    const input = document.getElementById("searchInput");
    const city = input ? input.value : "";
    if (!city) return;

    const match = city.trim().match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)/);
    if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[3]);
        fetchWeather(`${lat},${lon}`, onDataReceived, onSuggestionsReceived);
        return;
    }

    fetchWeather(city, onDataReceived, onSuggestionsReceived);
}

function onDataReceived(data) {
    lastWeatherData = data;
    clearSearchSuggestions();
    renderWeather(data, lastWeatherData);

    if (data.location && data.location.name) {
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(data.location.name)}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
        document.title = `${data.location.name} Weather - Premium Dashboard`;
    }
}

function onSuggestionsReceived(data) {
    renderSearchSuggestions(data, (query) => {
        fetchWeather(query, onDataReceived, onSuggestionsReceived);
    });
}

function goToCurrentLocation() {
    const btn = document.getElementById("locateBtn");
    if (!navigator.geolocation) {
        fetchWeather("Pune", onDataReceived, onSuggestionsReceived);
        return;
    }
    if (btn) btn.classList.add("loading");
    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            if (btn) btn.classList.remove("loading");
            fetchWeather(`${lat},${lon}`, onDataReceived, onSuggestionsReceived);
        },
        () => {
            if (btn) btn.classList.remove("loading");
            fetchWeather("Pune", onDataReceived, onSuggestionsReceived);
        },
        { timeout: 8000 }
    );
}

// Slider logic
function openSlider(type, dayIndex = 0) {
    const overlay = document.getElementById("sliderOverlay");
    const forecastSlider = document.getElementById("forecastSlider");
    const chartsSlider = document.getElementById("chartsSlider");
    const navButtons = document.querySelectorAll(".nav-btn");

    navButtons.forEach(btn => btn.classList.remove("active"));

    if (type === 'forecast') {
        const btnId = dayIndex === 0 ? "btnToday" : (dayIndex === 1 ? "btnDay1" : "btnDay2");
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add("active");
        
        forecastSlider.classList.add("open");
        chartsSlider.classList.remove("open");
        
        const data = getLastData();
        const days = data?.forecast?.forecastday || [];
        let title = "Forecast";
        if (dayIndex === 0) title = "Today's Weather";
        else if (days[dayIndex]) {
            const date = new Date(`${days[dayIndex].date}T00:00:00`);
            title = date.toLocaleDateString([], { day: 'numeric', month: 'long', weekday: 'long' });
        }
        document.getElementById("sliderTitle").innerText = title;

        renderStats(dayIndex);
        filterForecast(dayIndex);

    } else {
        const btnCharts = document.getElementById("btnCharts");
        if (btnCharts) btnCharts.classList.add("active");
        chartsSlider.classList.add("open");
        forecastSlider.classList.remove("open");
        
        // Fix: Re-render charts when slider opens to ensure canvas is visible
        const data = getLastData();
        if (data) {
            // Use setTimeout to ensure the slider open animation has started/completed
            // and the container is definitely visible in the DOM.
            setTimeout(() => {
                renderForecast(data);
            }, 100);
        }
    }

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeSliders() {
    const overlay = document.getElementById("sliderOverlay");
    const sliders = document.querySelectorAll(".bottom-slider");
    const navButtons = document.querySelectorAll(".nav-btn");

    overlay.classList.remove("open");
    sliders.forEach(s => s.classList.remove("open"));
    navButtons.forEach(btn => btn.classList.remove("active"));
    document.body.style.overflow = "";
}

function filterForecast(dayIndex) {
    const forecastGrid = document.getElementById("forecast");
    if (!forecastGrid) return;
    forecastGrid.classList.add("filtering");
    const cards = forecastGrid.querySelectorAll(".forecast-card");
    cards.forEach((card, index) => {
        card.classList.toggle("show", index === dayIndex);
    });
}

window.goToCurrentLocation = goToCurrentLocation;
window.openSlider = openSlider;
window.closeSliders = closeSliders;

function initMapInfoPopup() {
    const btn = document.getElementById("mapInfoButton");
    const close = document.getElementById("mapInfoClose");
    const modal = document.getElementById("mapInfoModal");
    if (btn) btn.addEventListener("click", () => modal && modal.classList.add("open"));
    if (close) close.addEventListener("click", () => modal && modal.classList.remove("open"));
    if (modal) modal.addEventListener("click", (e) => e.target === modal && modal.classList.remove("open"));

    // Add keyboard shortcut Shift+?
    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key === "?") {
            e.preventDefault();
            modal && modal.classList.add("open");
        }
        // Add Shift+S to focus search bar
        if (e.shiftKey && e.key === "S") {
            e.preventDefault();
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMapInfoPopup();

    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            searchWeather();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');

    if (queryParam) {
        document.getElementById("searchInput").value = queryParam;
        fetchWeather(queryParam, onDataReceived, onSuggestionsReceived);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`, onDataReceived, onSuggestionsReceived);
        }, () => {
            fetchWeather("Pune", onDataReceived, onSuggestionsReceived);
        }, { timeout: 5000 });
    } else {
        fetchWeather("Pune", onDataReceived, onSuggestionsReceived);
    }
});

window.addEventListener('mapLocationSelected', (e) => {
    fetchWeather(`${e.detail.lat},${e.detail.lng}`, onDataReceived, onSuggestionsReceived);
});
