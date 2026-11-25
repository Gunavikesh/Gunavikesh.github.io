"""Read-only portfolio API. No secrets or private information."""
import os
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

DATA = Path(__file__).resolve().parents[1] / "data" / "portfolio.json"
app = FastAPI(title="Gunavikesh Portfolio API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "https://gunavikesh.github.io,http://localhost:5173,http://localhost:8000").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)

def load_data():
    return json.loads(DATA.read_text(encoding="utf-8"))

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/profile")
def profile():
    return load_data()["profile"]

@app.get("/api/projects")
def projects(domain: str | None = None):
    items = load_data()["projects"]
    return [item for item in items if domain is None or item["domain"].casefold() == domain.casefold()]

@app.get("/api/projects/{project_id}")
def project(project_id: str):
    for item in load_data()["projects"]:
        if item["id"] == project_id:
            return item
    raise HTTPException(status_code=404, detail="Project not found")
