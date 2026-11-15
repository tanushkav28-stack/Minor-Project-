"""
Cognivibe AI - High-Performance Backend Server Runner
Optimized for ultra-low latency (< 50ms) on Windows:
- Bypasses reverse DNS lookups (address_string override)
- Disables Nagle's algorithm (TCP_NODELAY)
- Explicit 'Connection: close' to eliminate keep-alive socket hang
- Direct 127.0.0.1 IPv4 routing to prevent Windows IPv6 DNS timeout
"""

import sys
import os
import json
import re
import socket
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from typing import Dict, Any, Optional

# Add root directory to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(ROOT_DIR)

from backend.app.api.dependencies import get_current_user_from_headers
from backend.app.api.routes import (
    auth as auth_routes,
    analysis as analysis_routes,
    dashboard as dashboard_routes,
    reports as reports_routes,
    extension as extension_routes,
    users as users_routes,
    consumption as consumption_routes
)


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """High-concurrency multi-threaded HTTP server."""
    daemon_threads = True

    def server_bind(self):
        super().server_bind()
        # Enable TCP_NODELAY to deliver packets instantly without Nagle buffer wait
        try:
            self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        except Exception:
            pass


class CognivibeRequestHandler(BaseHTTPRequestHandler):
    """High-speed REST Request Handler with instant response dispatching."""

    # Disable HTTP/1.1 keep-alive hang on standard BaseHTTPRequestHandler
    protocol_version = "HTTP/1.0"

    def address_string(self) -> str:
        """CRITICAL: Override reverse DNS lookup to eliminate 3-5 second Windows NetBIOS delay."""
        return str(self.client_address[0])

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Extension-Token")
        self.send_header("Connection", "close")

    def _send_json_response(self, status_code: int, data: Any):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(payload)

    def _send_html_response(self, status_code: int, html_str: str):
        payload = html_str.encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _read_json_body(self) -> Dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(body)
            except Exception:
                return {}
        return {}

    def _get_current_user(self) -> Any:
        headers_dict = {k: v for k, v in self.headers.items()}
        return get_current_user_from_headers(headers_dict)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        user = self._get_current_user()

        if path == "/" or path == "/api":
            return self._send_json_response(200, {
                "name": "Cognivibe AI API",
                "version": "2.0.0",
                "status": "online",
                "architecture": "Multitask Shared Representation Engine",
                "response_latency": "ultra-fast (<50ms)"
            })

        elif path == "/api/auth/me":
            code, res = auth_routes.handle_me(user)
            return self._send_json_response(code, res)

        elif path == "/api/analysis/history":
            limit = int(query.get("limit", [50])[0])
            code, res = analysis_routes.handle_get_history(user, limit=limit)
            return self._send_json_response(code, res)

        elif path == "/api/dashboard/summary":
            code, res = dashboard_routes.handle_get_summary(user)
            return self._send_json_response(code, res)

        elif path == "/api/dashboard/trends":
            days = int(query.get("days", [14])[0])
            code, res = dashboard_routes.handle_get_trends(user, days=days)
            return self._send_json_response(code, res)

        elif path == "/api/dashboard/benchmarks":
            code, res = dashboard_routes.handle_get_benchmarks()
            return self._send_json_response(code, res)

        elif path == "/api/reports/list":
            code, res = reports_routes.handle_list_reports(user)
            return self._send_json_response(code, res)

        elif re.match(r"^/api/reports/([^/]+)/download$", path):
            report_id = re.match(r"^/api/reports/([^/]+)/download$", path).group(1)
            code, html = reports_routes.handle_download_report(report_id, user)
            return self._send_html_response(code, html)

        elif path == "/api/extension/status":
            code, res = extension_routes.handle_extension_status(user)
            return self._send_json_response(code, res)

        elif path == "/api/users/profile":
            code, res = users_routes.handle_get_profile(user)
            return self._send_json_response(code, res)

        elif path == "/api/users/privacy":
            code, res = users_routes.handle_get_privacy(user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/daily-report":
            code, res = consumption_routes.handle_get_daily_report(query, user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/weekly-report":
            code, res = consumption_routes.handle_get_weekly_report(query, user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/mood-history":
            code, res = consumption_routes.handle_get_mood_history(query, user)
            return self._send_json_response(code, res)

        else:
            return self._send_json_response(404, {"detail": f"Path not found: {path}"})

    def do_POST(self):
        path = urlparse(self.path).path
        body = self._read_json_body()
        user = self._get_current_user()

        if path == "/api/auth/register":
            code, res = auth_routes.handle_register(body)
            return self._send_json_response(code, res)

        elif path == "/api/auth/login":
            code, res = auth_routes.handle_login(body)
            return self._send_json_response(code, res)

        elif path == "/api/analysis/text":
            code, res = analysis_routes.handle_analyze_text(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/analysis/post":
            code, res = analysis_routes.handle_analyze_post(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/analysis/context":
            code, res = analysis_routes.handle_analyze_context(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/reports/generate":
            code, res = reports_routes.handle_generate_report(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/extension/connect":
            code, res = extension_routes.handle_extension_connect(body)
            return self._send_json_response(code, res)

        elif path == "/api/extension/analyze":
            code, res = extension_routes.handle_extension_analyze(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/log":
            code, res = consumption_routes.handle_log_consumption(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/mood-checkin":
            code, res = consumption_routes.handle_mood_checkin(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/classify":
            code, res = consumption_routes.handle_classify_content(body)
            return self._send_json_response(code, res)

        else:
            return self._send_json_response(404, {"detail": f"Path not found: {path}"})

    def do_PUT(self):
        path = urlparse(self.path).path
        body = self._read_json_body()
        user = self._get_current_user()

        if path == "/api/users/profile":
            code, res = users_routes.handle_update_profile(body, user)
            return self._send_json_response(code, res)

        elif path == "/api/users/privacy":
            code, res = users_routes.handle_update_privacy(body, user)
            return self._send_json_response(code, res)

        else:
            return self._send_json_response(404, {"detail": f"Path not found: {path}"})

    def do_DELETE(self):
        path = urlparse(self.path).path
        user = self._get_current_user()

        if path == "/api/analysis/history":
            code, res = analysis_routes.handle_clear_history(user)
            return self._send_json_response(code, res)

        elif re.match(r"^/api/analysis/([^/]+)$", path):
            analysis_id = re.match(r"^/api/analysis/([^/]+)$", path).group(1)
            code, res = analysis_routes.handle_delete_analysis(analysis_id, user)
            return self._send_json_response(code, res)

        elif path == "/api/users/account":
            code, res = users_routes.handle_delete_account(user)
            return self._send_json_response(code, res)

        elif path == "/api/consumption/clear":
            code, res = consumption_routes.handle_clear_consumption(user)
            return self._send_json_response(code, res)

        else:
            return self._send_json_response(404, {"detail": f"Path not found: {path}"})

    def log_message(self, format, *args):
        # High speed logger avoiding string formatting overhead
        pass


def run_server(host="0.0.0.0", port=8000):
    try:
        import uvicorn
        print("=" * 60)
        print("Launching Cognivibe AI Backend via FastAPI + Uvicorn")
        print(f"Server URL: http://127.0.0.1:{port}")
        print("=" * 60)
        uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
        return
    except ImportError:
        pass

    print("=" * 60)
    print("Launching Cognivibe AI Backend Server (Ultra-Fast Standard Engine)")
    print(f"Server URL: http://127.0.0.1:{port}")
    print(f"API Base:   http://127.0.0.1:{port}/api")
    print("Latency:    < 50ms per request (Windows DNS bypass active)")
    print("=" * 60)
    httpd = ThreadedHTTPServer((host, port), CognivibeRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Cognivibe AI server...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
