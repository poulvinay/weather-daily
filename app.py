import os
import urllib.parse
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env file explicitly
load_dotenv()

app = Flask(__name__)


@app.route('/')
def index():
    """Serve the main dashboard page (no server-side weather fetch needed)."""
    return render_template(
        'index.html',
        mapbox_token=os.environ.get("MAPBOX_TOKEN", "").strip(),
    )


@app.route('/mapbox-test')
def mapbox_test():
    return render_template(
        'mapbox-test.html',
        mapbox_token=os.environ.get("MAPBOX_TOKEN", "").strip(),
    )


@app.route('/sw.js')
def serve_sw():
    return app.send_static_file('sw.js')


@app.route('/manifest.json')
def serve_manifest():
    return app.send_static_file('manifest.json')


@app.route('/robots.txt')
def serve_robots():
    return app.send_static_file('robots.txt')


@app.route('/sitemap.xml')
def serve_sitemap():
    return app.send_static_file('sitemap.xml')


@app.route('/weather')
def weather():
    """
    AJAX endpoint — replaces weather_proxy.py.
    Query params:
        q    (required) city name, lat,lon pair, or zip code
        days (optional) forecast days, default 3
    Returns JSON with forecast data, or an error/suggestions payload.
    """
    api_key = os.environ.get("WEATHER_API_KEY")

    if not api_key:
        return jsonify({
            "error": "Missing WEATHER_API_KEY env var",
            "hint": "Set WEATHER_API_KEY in your environment or .env file.",
        }), 500

    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({"error": "Missing query param: q"}), 400

    days = request.args.get('days', '3').strip() or '3'
    safe_q = urllib.parse.quote_plus(q)

    try:
        upstream_url = (
            f"https://api.weatherapi.com/v1/forecast.json?"
            f"key={api_key}&q={safe_q}&days={days}"
        )
        resp = requests.get(
            upstream_url,
            headers={"User-Agent": "flask-weather-app/1.0"},
            timeout=15,
        )

        if resp.status_code == 200:
            return jsonify(resp.json())

        # Forecast failed — try search endpoint for suggestions
        raise ValueError(f"Forecast API returned {resp.status_code}: {resp.text[:200]}")

    except Exception as e:
        # Fall back to location search so the UI can suggest valid places
        try:
            search_url = (
                f"https://api.weatherapi.com/v1/search.json?"
                f"key={api_key}&q={safe_q}"
            )
            s_resp = requests.get(
                search_url,
                headers={"User-Agent": "flask-weather-app/1.0"},
                timeout=10,
            )
            matches = s_resp.json() if s_resp.status_code == 200 else []
            return jsonify({
                "error": "Location not found for forecast",
                "original_query": q,
                "details": str(e),
                "suggestions": matches,
            }), 400
        except Exception as se:
            return jsonify({
                "error": "Upstream request failed",
                "details": str(e),
                "search_error": str(se),
            }), 502


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)