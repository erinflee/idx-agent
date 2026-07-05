"""Filter schema + validator for the Week-1 eval harness.

The locked vocabulary (intents, property types, sane bounds) lives here so the
labeled dataset and the validator agree on what a "valid" filter object is.
"""

from __future__ import annotations

from dataclasses import dataclass, fields
from pathlib import Path
from typing import Optional


# Orchestrator intents — Week 9 routing labels.
INTENTS = {"search", "market", "recommend", "knowledge", "mixed"}

# Property subtypes the Week-2 parser is allowed to emit.
PROPERTY_TYPES = {
    "Condominium",
    "Townhouse",
    "SingleFamilyResidence",
}

# Boolean-ish flags: the DB stores "1" for yes and empty/NULL for no, so the
# parser only ever emits "1" (a false value is represented by omitting the key).
BOOL_FLAGS = {"1"}

# Sanity bounds — anything outside these is almost certainly a bad parse.
MAX_REASONABLE_PRICE = 500_000_000
MAX_REASONABLE_SQFT = 100_000
MAX_REASONABLE_BEDS = 20
MAX_REASONABLE_BATHS = 20
MAX_REASONABLE_HOA = 10_000

# Regenerate from the DB once:  SELECT DISTINCT L_City FROM rets_property;
CITIES_FILE = Path(__file__).with_name("ca_cities.txt")


@dataclass
class PropertyFilters:
    """Structured filter object produced by the Week-2 parser.

    Field names mirror the supported-filters table. `None` means
    "user did not specify".
    """

    city: Optional[str] = None
    maxPrice: Optional[float] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    sqft: Optional[int] = None
    property: Optional[str] = None
    pool: Optional[str] = None
    hasView: Optional[str] = None
    maxHoa: Optional[float] = None

    @classmethod
    def from_dict(cls, d: Optional[dict]) -> "PropertyFilters":
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in (d or {}).items() if k in known})


def load_known_cities(path: Path = CITIES_FILE) -> set[str]:
    """Return the set of valid CA city names (skip blank/`#` lines)."""
    text = path.read_text()
    lines = text.splitlines()
    cities = set()

    for city in lines:
        city = city.strip()
        if not city or city.startswith("#"):
            continue

        cities.add(city)
    return cities

class SchemaValidator:
    """Reject structurally-invalid filter objects before they reach DB/API.

    Used by the harness as the gate that turns a bad-input case into an
    `errored` result (negative price, unknown city, out-of-range beds, ...).
    """

    def __init__(self, known_cities: Optional[set[str]] = None):
        # Inject a city set in tests; fall back to the file in production.
        self.known_cities = (
            known_cities if known_cities is not None else load_known_cities()
        )

    def validate(self, filters) -> list[str]:
        """Return a list of human-readable error strings; empty list == valid.

        Accept either a PropertyFilters or a plain dict (use
        PropertyFilters.from_dict to normalize).
        """
        f = PropertyFilters.from_dict(filters)
        errors = []

        if f.city is not None and f.city not in self.known_cities:
            errors.append(f"unknown city: {f.city!r}")
        if f.maxPrice is not None and not (0 <= f.maxPrice <= MAX_REASONABLE_PRICE):
            errors.append(f"maxPrice out of range: {f.maxPrice}")
        if f.maxHoa is not None and not (0 <= f.maxHoa <= MAX_REASONABLE_HOA):
            errors.append(f"maxHoa out of range: {f.maxHoa}")
        if f.beds is not None and not (0 <= f.beds <= MAX_REASONABLE_BEDS):
            errors.append(f"beds out of range: {f.beds}")
        if f.baths is not None and not (0 <= f.baths <= MAX_REASONABLE_BATHS):
            errors.append(f"baths out of range: {f.baths}")
        if f.sqft is not None and not (0 <= f.sqft <= MAX_REASONABLE_SQFT):
            errors.append(f"sqft out of range: {f.sqft}")
        if f.property is not None and f.property not in PROPERTY_TYPES:
            errors.append(f"unknown property type: {f.property!r}")

        
        return errors
    
    def is_valid(self, filters) -> bool:
        return not self.validate(filters)
