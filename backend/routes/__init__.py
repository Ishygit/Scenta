from backend.routes.auth import router as auth_router
from backend.routes.scans import router as scans_router
from backend.routes.fragrances import router as fragrances_router
from backend.routes.favorites import router as favorites_router
from backend.routes.feedback import router as feedback_router

__all__ = [
    "auth_router",
    "scans_router",
    "fragrances_router",
    "favorites_router",
    "feedback_router"
]
