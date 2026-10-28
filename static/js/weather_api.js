import { WEATHER_PROXY_URL } from './config.js';

let latestRequestId = 0;

export function fetchWeather(query, onData, onErrorSuggestions, onFinally) {
    const requestId = ++latestRequestId;
    const url = `${WEATHER_PROXY_URL}?q=${encodeURIComponent(query)}&days=3`;
    
    // Trigger loading start
    document.body.classList.add("loading-weather");

    fetch(url)
        .then(async (res) => {
            const data = await res.json();

            // ignore stale responses
            if (requestId !== latestRequestId) return;

            // 400 from proxy (Bad Request / location issues)
            if (res.status === 400) {
                onErrorSuggestions(data);
                return;
            }

            if (data && data.error && data.suggestions) {
                onErrorSuggestions(data);
                return;
            }

            try {
                onData(data);
            } catch (err) {
                console.error("Weather rendering failed:", err);
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
            // On hard failure, suggest Pune as fallback
            if (requestId === latestRequestId) {
                onErrorSuggestions({ error: "Network error", suggestions: [] });
            }
        })
        .finally(() => {
            if (requestId === latestRequestId) {
                document.body.classList.remove("loading-weather");
                if (onFinally) onFinally();
            }
        });
}

export function renderSearchSuggestions(payload, onSelect) {
    const box = document.getElementById("searchSuggestions");
    if (!box) return;

    const suggestions = payload?.suggestions;
    const original = payload?.original_query;

    if (!Array.isArray(suggestions) || !suggestions.length) {
        box.textContent = original
            ? `No exact match found for "${original}". Please check spelling.`
            : "Connection error. Please try again.";
        const input = document.getElementById("searchInput");
        if (input) input.classList.add("search-error");
        return;
    }

    box.innerHTML = "";
    const input = document.getElementById("searchInput");
    if (input) input.classList.remove("search-error");
    const label = document.createElement("span");
    label.textContent = "Did you mean:";
    box.appendChild(label);

    suggestions.slice(0, 5).forEach((s) => {
        const btn = document.createElement("button");
        const labelText = `${s.name}, ${s.region || ""} ${s.country || ""}`.trim();
        btn.textContent = labelText;
        btn.addEventListener("click", () => {
            const q = `${s.lat},${s.lon}`;
            document.getElementById("searchInput").value = labelText;
            onSelect(q);
        });
        box.appendChild(btn);
    });
}

export function clearSearchSuggestions() {
    const box = document.getElementById("searchSuggestions");
    if (box) box.innerHTML = "";
    const input = document.getElementById("searchInput");
    if (input) input.classList.remove("search-error");
}
