# Portfolio architecture

React 18 frontend uses pinned ES modules from esm.sh, with no build step. GitHub Pages serves the root directory. Project filters work with bundled case studies and static JSON.

## Local frontend

From the repository root run `python -m http.server 8080` and visit `http://localhost:8080`.

## Local API

Use Python 3.10 or newer. From the repository root:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

API docs: http://localhost:8000/docs. To connect the frontend, set `window.PORTFOLIO_API_BASE` to the API origin via a script before the app module in index.html. For local frontend at port 8080 set `CORS_ORIGINS=http://localhost:8080,https://gunavikesh.github.io` before starting the API. In production deploy the API separately with `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` and configure its HTTPS origin in index.html. GitHub Pages cannot execute Python. The frontend remains functional without an API deployment. No database or secrets required.
