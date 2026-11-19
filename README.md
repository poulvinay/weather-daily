# Weather Dashboard

A Flask-based weather dashboard with a Mapbox map, 3-day forecast, hourly breakdowns, rain/snow effects, and light/dark theme. Weather data is fetched from [WeatherAPI](https://www.weatherapi.com/) via an AJAX endpoint (`/weather`).

<video width="100%" autoplay muted loop playsinline>
  <source src="static/demo_walkthrough.mp4" type="video/mp4">
</video>

## Project Structure

```
WeatherApi/
├── app.py                  # Flask app — serves page + /weather JSON endpoint
├── requirements.txt        # Python dependencies
├── Dockerfile
├── docker-compose.yml
├── .env                    # API key (not committed to git)
├── static/
│   └── style.css           # All styles
├── templates/
│   └── index.html          # Main dashboard template
```

## Prerequisites

- Python 3.11+
- Docker & Docker Compose
- A free [WeatherAPI](https://www.weatherapi.com/) key

## Configuration

Create a `.env` file in the project root:

```bash
WEATHER_API_KEY=your_api_key_here
MAPBOX_TOKEN=your_public_mapbox_token_here
```

The WeatherAPI key is used by Flask and is never sent to the browser. The Mapbox public token is read from `.env` and supplied to the browser because Mapbox GL JS requires it client-side.

---

## Running with Docker (recommended)

### Build the image

```bash
docker compose build
```

### Start the container

```bash
docker compose up -d
```

App is available at **http://localhost:5000**

### View logs

```bash
docker compose logs -f
```

### Stop the container

```bash
docker compose down
```

### Restart the container (e.g. after a config change)

```bash
docker compose restart
```

### Rebuild and restart after code changes

```bash
docker compose build && docker compose up -d
```

---

## Running locally (without Docker)

### 1. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure API keys

Make sure the project-root `.env` file contains both `WEATHER_API_KEY` and `MAPBOX_TOKEN`, as shown in the configuration section above.

### 4. Start the Flask dev server

```bash
python app.py
```

App is available at **http://localhost:5000**

The standalone Mapbox test page is available at **http://localhost:5000/mapbox-test**.

### Reload after code changes

Flask dev server (debug mode) auto-reloads on file save. To enable debug mode:

```bash
FLASK_DEBUG=1 python app.py
```

---

## API Endpoint

| Method | Path                | Description                           |
| ------ | ------------------- | ------------------------------------- |
| `GET`  | `/`                 | Serves the dashboard UI               |
| `GET`  | `/weather?q=<city>` | Returns forecast JSON from WeatherAPI |

### `/weather` query params

| Param  | Required | Default | Description                       |
| ------ | -------- | ------- | --------------------------------- |
| `q`    | ✅       | —       | City name, `lat,lon`, or zip code |
| `days` | ❌       | `3`     | Number of forecast days (1–3)     |

### Example

```bash
curl "http://localhost:5000/weather?q=London&days=3"
```
