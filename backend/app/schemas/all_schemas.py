"""
Cognivibe AI - Pydantic Request & Response Schemas
Compatible with Pydantic v1, v2, and pure Python dicts.
"""

from typing import List, Dict, Any, Optional

try:
    from pydantic import BaseModel, EmailStr, Field

    class UserRegisterRequest(BaseModel):
        name: str
        email: str
        password: str

    class UserLoginRequest(BaseModel):
        email: str
        password: str

    class TokenResponse(BaseModel):
        access_token: str
        token_type: str = "bearer"
        user: Dict[str, Any]

    class TextAnalysisRequest(BaseModel):
        text: str
        source_type: Optional[str] = "web_dashboard"
        include_context: Optional[bool] = False

    class PostAnalysisRequest(BaseModel):
        platform: str
        post_url: Optional[str] = None
        post_content: str
        author_consent: Optional[bool] = True

    class ContextAnalysisRequest(BaseModel):
        current_text: str
        history: List[Dict[str, Any]] = []

    class ConsentUpdateRequest(BaseModel):
        consent_status: int
        retention_days: int
        allow_extension_analysis: int

    class ReportGenerateRequest(BaseModel):
        title: Optional[str] = "Mental Health Linguistic Pattern Report"
        time_period_days: Optional[int] = 30
        include_visualizations: Optional[bool] = True

    class ExtensionConnectRequest(BaseModel):
        extension_token: str
        browser_type: Optional[str] = "Chrome"

    class ExtensionAnalyzeRequest(BaseModel):
        text: str
        platform: str
        element_type: Optional[str] = "post"
        page_url: Optional[str] = None

except ImportError:
    # Minimal fallback schema objects if pydantic is not yet installed
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__

    UserRegisterRequest = BaseModel
    UserLoginRequest = BaseModel
    TokenResponse = BaseModel
    TextAnalysisRequest = BaseModel
    PostAnalysisRequest = BaseModel
    ContextAnalysisRequest = BaseModel
    ConsentUpdateRequest = BaseModel
    ReportGenerateRequest = BaseModel
    ExtensionConnectRequest = BaseModel
    ExtensionAnalyzeRequest = BaseModel

