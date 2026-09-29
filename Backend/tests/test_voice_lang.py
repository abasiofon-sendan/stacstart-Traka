from app.core.countries import default_language
from app.voice.router import TextAskRequest, _resolve_language
from app.voice.service import _lang_instruction


def test_sw_accepted_by_schema():
    req = TextAskRequest(question="Habari", language="sw")
    assert req.language == "sw"
    assert TextAskRequest(question="Habari").language is None


def test_sw_instruction():
    instr = _lang_instruction("sw")
    assert "Swahili" in instr


def test_country_defaults():
    assert default_language("KE") == "sw"
    assert default_language("UG") == "sw"
    assert default_language("NG") == "en"
    assert default_language("GH") == "en"
    assert default_language("XX") == "en"


def test_resolve_language_explicit_wins():
    assert _resolve_language(None, "dummy", "yo") == "yo"  # type: ignore[arg-type]
