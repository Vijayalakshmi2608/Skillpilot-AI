"""Safe pagination helpers for Flask-SQLAlchemy query objects."""
from math import ceil
from typing import Any, Callable, Optional
from flask import request

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def pagination_arguments(page: Optional[int] = None, page_size: Optional[int] = None):
    """Normalize query-string or supplied page parameters to safe positive values."""
    page = page if page is not None else request.args.get("page", 1, type=int)
    page_size = page_size if page_size is not None else request.args.get("page_size", DEFAULT_PAGE_SIZE, type=int)
    return max(1, page or 1), min(MAX_PAGE_SIZE, max(1, page_size or DEFAULT_PAGE_SIZE))


def paginate_query(query: Any, serializer: Optional[Callable[[Any], Any]] = None, page: Optional[int] = None, page_size: Optional[int] = None) -> dict:
    """Paginate an SQLAlchemy query and return data plus complete metadata."""
    current_page, size = pagination_arguments(page, page_size)
    result = query.paginate(page=current_page, per_page=size, error_out=False)
    items = result.items
    if serializer:
        items = [serializer(item) for item in items]
    return {"items": items, "pagination": {"page": current_page, "pageSize": size, "totalRecords": result.total, "totalPages": ceil(result.total / size) if result.total else 0}}
