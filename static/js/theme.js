const THEME_KEY = "weather_dashboard_theme";

export function applyTheme(theme) {
    const body = document.body;
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    if (theme === "light") {
        body.classList.add("light-theme");
        toggle.querySelector("i").className = "fa-solid fa-sun";
        toggle.querySelector("span").textContent = "Light";
    } else {
        body.classList.remove("light-theme");
        toggle.querySelector("i").className = "fa-solid fa-moon";
        toggle.querySelector("span").textContent = "Dark";
    }
}

export function initTheme() {
    const stored = window.localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;

    const initial = stored || (prefersLight ? "light" : "dark");
    applyTheme(initial);

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            const current = document.body.classList.contains("light-theme")
                ? "light"
                : "dark";
            const next = current === "light" ? "dark" : "light";
            window.localStorage.setItem(THEME_KEY, next);
            applyTheme(next);
        });
    }
}
