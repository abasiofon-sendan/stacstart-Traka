"""Country registry — one entry per market drives currency, formatting,
payment labels, phone handling and seed products.

Amounts are stored/transported as whole MINOR units (kobo, cents, pesewas;
UGX has no subunit so 1 UGX == 1 unit) plus a currency code.
"""

from __future__ import annotations

COUNTRIES: dict[str, dict] = {
    "NG": {
        "name": "Nigeria",
        "currency": "NGN",
        "symbol": "₦",
        "symbol_space": "",
        "decimals": 2,
        "subunit": "kobo",
        "languages": ["en", "yo", "ha", "pidgin"],
        "payment_title": "Store account",
        "payment_channel": "bank transfer",
        "payment_template": "{amount} received from {sender} via bank transfer",
        "phone_intl": "+234",
        "phone_trunk": "0",
        "seeds": [
            {"name": "Peak Filled Milk Tin 400g", "cost_minor": 95000, "sell_minor": 105000},
            {"name": "Indomie Chicken 70g", "cost_minor": 25000, "sell_minor": 30000},
            {"name": "Dangote Sugar 1kg", "cost_minor": 145000, "sell_minor": 155000},
            {"name": "Coca-Cola 50cl", "cost_minor": 40000, "sell_minor": 50000},
            {"name": "Golden Penny Spaghetti 500g", "cost_minor": 120000, "sell_minor": 135000},
        ],
    },
    "KE": {
        "name": "Kenya",
        "currency": "KES",
        "symbol": "KSh",
        "symbol_space": " ",
        "decimals": 2,
        "subunit": "cent",
        "languages": ["en", "sw"],
        "payment_title": "M-Pesa payment received",
        "payment_channel": "M-Pesa",
        "payment_template": "{amount} received from {sender} via M-Pesa",
        "phone_intl": "+254",
        "phone_trunk": "0",
        "seeds": [
            {"name": "Blue Band 500g", "cost_minor": 35000, "sell_minor": 39000},
            {"name": "Unga Maize Meal 2kg", "cost_minor": 19500, "sell_minor": 21500},
            {"name": "Brookside Milk 500ml", "cost_minor": 6500, "sell_minor": 7500},
            {"name": "Coca-Cola 500ml", "cost_minor": 8000, "sell_minor": 10000},
            {"name": "Exe Wheat Flour 2kg", "cost_minor": 22000, "sell_minor": 24000},
        ],
    },
    "GH": {
        "name": "Ghana",
        "currency": "GHS",
        "symbol": "GH₵",
        "symbol_space": " ",
        "decimals": 2,
        "subunit": "pesewa",
        "languages": ["en"],
        "payment_title": "MoMo payment received",
        "payment_channel": "MoMo",
        "payment_template": "{amount} received from {sender} via MoMo",
        "phone_intl": "+233",
        "phone_trunk": "0",
        "seeds": [
            {"name": "Milo 400g", "cost_minor": 8500, "sell_minor": 9500},
            {"name": "Indomie Onion 70g", "cost_minor": 350, "sell_minor": 450},
            {"name": "Frytol Oil 1L", "cost_minor": 4500, "sell_minor": 5200},
            {"name": "Coca-Cola 500ml", "cost_minor": 800, "sell_minor": 1000},
            {"name": "Tasty Tom 400g", "cost_minor": 1200, "sell_minor": 1500},
        ],
    },
    "UG": {
        "name": "Uganda",
        "currency": "UGX",
        "symbol": "USh",
        "symbol_space": " ",
        "decimals": 0,
        "subunit": "shilling",
        "languages": ["en", "sw"],
        "payment_title": "MoMo payment received",
        "payment_channel": "MoMo",
        "payment_template": "{amount} received from {sender} via MoMo",
        "phone_intl": "+256",
        "phone_trunk": "0",
        "seeds": [
            {"name": "Blue Band 500g", "cost_minor": 14500, "sell_minor": 16000},
            {"name": "Unga Maize Flour 2kg", "cost_minor": 6800, "sell_minor": 7500},
            {"name": "Coca-Cola 500ml", "cost_minor": 2000, "sell_minor": 2500},
            {"name": "Mukwano Soap 1kg", "cost_minor": 6500, "sell_minor": 7200},
            {"name": "Nile Wheat Flour 2kg", "cost_minor": 7000, "sell_minor": 7800},
        ],
    },
}

DEFAULT_COUNTRY = "NG"


def get_country(code: str) -> dict:
    """Return config for code (case-insensitive); raises KeyError if unknown."""
    key = (code or "").strip().upper()
    if key not in COUNTRIES:
        raise KeyError(f"Unsupported country '{code}'. Supported: {sorted(COUNTRIES)}")
    return COUNTRIES[key]


_CURRENCY_TO_COUNTRY = {cfg["currency"]: code for code, cfg in COUNTRIES.items()}


def resolve_country(code: str) -> str:
    """Accept a country code OR a currency code, return the country code."""
    key = (code or "").strip().upper()
    if key in COUNTRIES:
        return key
    if key in _CURRENCY_TO_COUNTRY:
        return _CURRENCY_TO_COUNTRY[key]
    raise KeyError(f"Unsupported country/currency '{code}'. Supported: {sorted(COUNTRIES)}")


def factor(code: str) -> int:
    """Minor units per major unit (100 for 2-decimal, 1 for UGX)."""
    return 10 ** get_country(resolve_country(code))["decimals"]


def to_minor(major: float, code: str) -> int:
    return int(round(float(major) * factor(code)))


def to_major(minor: int, code: str) -> float:
    return (minor or 0) / factor(code)


def format_money(minor: int, code: str) -> str:
    """'₦5,000.00' / 'KSh 5,000.50' / 'USh 5,000' — no decimals when decimals==0."""
    cfg = get_country(resolve_country(code))
    decimals = cfg["decimals"]
    value = (minor or 0) / (10 ** decimals)
    sp = cfg.get("symbol_space", " ")
    if decimals == 0:
        return f"{cfg['symbol']}{sp}{value:,.0f}"
    return f"{cfg['symbol']}{sp}{value:,.{decimals}f}"


def payment_received(account_country: str, amount_minor: int, sender: str) -> tuple[str, str]:
    """(title, description) for an inbound payment activity, per country."""
    cfg = get_country(resolve_country(account_country))
    return (
        cfg["payment_title"],
        cfg["payment_template"].format(
            amount=format_money(amount_minor, account_country),
            sender=sender or "Unknown",
        ),
    )


def candidate_senders(sender: str) -> list[str]:
    """E164 + local variants across all configured countries (for account lookup)."""
    s = (sender or "").strip().replace(" ", "")
    out = [s]
    for cfg in COUNTRIES.values():
        intl, trunk = cfg["phone_intl"], cfg["phone_trunk"]
        if s.startswith(intl):
            out.append(trunk + s[len(intl):])
        elif s.startswith(trunk) and len(s) > 4:
            out.append(intl + s[len(trunk):])
    return list(dict.fromkeys(out))
