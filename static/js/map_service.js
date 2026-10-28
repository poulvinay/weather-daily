import { MAPBOX_TOKEN } from './config.js';
import { zoomBasedReveal } from './utils.js';

let map;
let mapMarker;
let mapStyleReady = false;

export function initMap(lat, lon, lastWeatherData) {
    if (!map) {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/standard",
            center: [lon, lat],
            zoom: 13
        });

        mapStyleReady = false;
        map.on("style.load", () => {
            mapStyleReady = true;
            if (lastWeatherData) {
                syncMapFromWeather(lastWeatherData);
            }
        });

        map.on("click", e => {
            const { lng, lat } = e.lngLat;
            setMapMarker(lat, lng);
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                searchInput.value = `${lat.toFixed(5)},${lng.toFixed(5)}`;
            }
            const event = new CustomEvent('mapLocationSelected', { detail: { lat, lng } });
            window.dispatchEvent(event);
        });
    } else {
        map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 9), essential: true });
    }
    setMapMarker(lat, lon);
}

export function setMapMarker(lat, lon) {
    if (mapMarker) {
        mapMarker.setLngLat([lon, lat]);
    } else if (map) {
        mapMarker = new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);
    }
}

const applyLightPresetFromWeather = (isDay) => {
    if (!map || !mapStyleReady) return;
    const preset = isDay === 1 ? "day" : "night";
    try {
        map.setConfigProperty("basemap", "lightPreset", preset);
    } catch (e) {
        console.warn("Failed to set map light preset", e);
    }
};

const applyRainEffect = () => {
    if (!map || !mapStyleReady || typeof map.setRain !== "function") return;
    map.setRain({
        density: 0.6,
        intensity: 1.0,
        color: "#a8adbc",
        opacity: 0.7
    });
};

const applySnowEffect = () => {
    if (!map || !mapStyleReady || typeof map.setSnow !== "function") return;
    map.setSnow({
        density: 0.85,
        intensity: 1.0,
        color: "#ffffff",
        opacity: 1.0
    });
};

const clearPrecipitationEffects = () => {
    if (!map || !mapStyleReady) return;
    if (typeof map.setRain === "function") map.setRain(null);
    if (typeof map.setSnow === "function") map.setSnow(null);
};

export function syncMapFromWeather(data) {
    if (!data || !data.current) return;
    if (!map || !mapStyleReady) return;

    applyLightPresetFromWeather(data.current.is_day);
    
    const text = (data.current.condition?.text || "").toLowerCase();
    const precip = data.current.precip_mm || 0;

    if (text.includes("snow") || text.includes("sleet")) applySnowEffect();
    else if (text.includes("rain") || precip > 0) applyRainEffect();
    else clearPrecipitationEffects();
}
