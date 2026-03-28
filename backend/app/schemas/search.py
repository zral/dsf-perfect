from pydantic import BaseModel, Field


class SearchParams(BaseModel):
    q: str | None = Field(default=None, max_length=200)
    category: str | None = None
    location: str | None = None
    price_min: int | None = None
    price_max: int | None = None
    condition: str | None = None
    sort: str = "newest"
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=50)


class SuggestionItem(BaseModel):
    text: str
    category: str
    count: int


class SuggestResponse(BaseModel):
    suggestions: list[SuggestionItem]
