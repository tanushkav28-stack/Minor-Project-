"""
Cognivibe AI - FastAPI Main Application
"""

from typing import Dict, Any, Optional
import os
import sys

# Add root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from fastapi import FastAPI, Depends, HTTPException, Header, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse, JSONResponse
    from backend.app.core.config import settings
    from backend.app.api.dependencies import get_current_user_from_headers
    from backend.app.api.routes import (
        auth as auth_routes,
        analysis as analysis_routes,
        dashboard as dashboard_routes,
        reports as reports_routes,
        extension as extension_routes,
        users as users_routes
    )

    app = FastAPI(
        title="Cognivibe AI (MannSetu AI) API",
        description="A Context-Aware, Multitask AI System for Mental Health Language Analysis in Code-Mixed Hinglish Content",
        version="2.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    async def get_current_user(request: Request) -> Optional[Dict[str, Any]]:
        return get_current_user_from_headers(dict(request.headers))

    # Health check
    @app.get("/")
    def root():
        return {
            "name": "Cognivibe AI Backend",
            "version": "2.0.0",
            "status": "online",
            "docs": "/docs"
        }

    # Auth routes
    @app.post("/api/auth/register")
    async def register(request: Request):
        body = await request.json()
        code, res = auth_routes.handle_register(body)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.post("/api/auth/login")
    async def login(request: Request):
        body = await request.json()
        code, res = auth_routes.handle_login(body)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/auth/me")
    async def me(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = auth_routes.handle_me(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    # Analysis routes
    @app.post("/api/analysis/text")
    async def analyze_text(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = analysis_routes.handle_analyze_text(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.post("/api/analysis/post")
    async def analyze_post(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = analysis_routes.handle_analyze_post(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.post("/api/analysis/context")
    async def analyze_context(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = analysis_routes.handle_analyze_context(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/analysis/history")
    async def get_history(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = analysis_routes.handle_get_history(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.delete("/api/analysis/history")
    async def clear_history(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = analysis_routes.handle_clear_history(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.delete("/api/analysis/{analysis_id}")
    async def delete_analysis(analysis_id: str, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = analysis_routes.handle_delete_analysis(analysis_id, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    # Dashboard routes
    @app.get("/api/dashboard/summary")
    async def dashboard_summary(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = dashboard_routes.handle_get_summary(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/dashboard/trends")
    async def dashboard_trends(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = dashboard_routes.handle_get_trends(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/dashboard/benchmarks")
    async def dashboard_benchmarks():
        code, res = dashboard_routes.handle_get_benchmarks()
        return res

    # Reports routes
    @app.post("/api/reports/generate")
    async def generate_report(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = reports_routes.handle_generate_report(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/reports/list")
    async def list_reports(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = reports_routes.handle_list_reports(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/reports/{report_id}/download")
    async def download_report(report_id: str, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, html = reports_routes.handle_download_report(report_id, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail="Report generation failed.")
        return HTMLResponse(content=html)

    # Extension routes
    @app.post("/api/extension/connect")
    async def extension_connect(request: Request):
        body = await request.json()
        code, res = extension_routes.handle_extension_connect(body)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/extension/status")
    async def extension_status(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = extension_routes.handle_extension_status(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.post("/api/extension/analyze")
    async def extension_analyze(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = extension_routes.handle_extension_analyze(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    # Users & Privacy
    @app.get("/api/users/profile")
    async def get_profile(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = users_routes.handle_get_profile(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.put("/api/users/profile")
    async def update_profile(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = users_routes.handle_update_profile(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.get("/api/users/privacy")
    async def get_privacy(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = users_routes.handle_get_privacy(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.put("/api/users/privacy")
    async def update_privacy(request: Request, user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        body = await request.json()
        code, res = users_routes.handle_update_privacy(body, user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

    @app.delete("/api/users/account")
    async def delete_account(user: Optional[Dict[str, Any]] = Depends(get_current_user)):
        code, res = users_routes.handle_delete_account(user)
        if code >= 400:
            raise HTTPException(status_code=code, detail=res.get("detail", "Error"))
        return res

except ImportError:
    app = None

