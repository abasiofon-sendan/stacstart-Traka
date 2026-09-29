from app.core import countries as C


def test_minor_conversions():
    assert C.to_minor(5000, "NG") == 500000
    assert C.to_minor(5000, "UG") == 5000  # no decimals
    assert C.to_major(500000, "NG") == 5000.0
    assert C.factor("UG") == 1
    assert C.factor("GH") == 100


def test_format_money():
    assert C.format_money(500000, "NG") == "₦5,000.00"
    assert C.format_money(500000, "KE") == "KSh 5,000.00"
    assert C.format_money(450, "GH") == "GH₵ 4.50"
    assert C.format_money(5000, "UG") == "USh 5,000"  # no decimals


def test_payment_labels():
    title, desc = C.payment_received("NG", 500000, "Mama")
    assert title == "Store account" and "bank transfer" in desc
    title, desc = C.payment_received("KE", 200000, "Achieng")
    assert title == "M-Pesa payment received" and "M-Pesa" in desc
    for cc in ("UG", "GH"):
        title, _ = C.payment_received(cc, 1000, "X")
        assert title == "MoMo payment received"


def test_invalid_country():
    try:
        C.get_country("XX")
    except KeyError:
        pass
    else:
        raise AssertionError("expected KeyError")


def test_candidate_senders_cover_countries():
    assert "08077165827" in C.candidate_senders("+2348077165827")
    assert "0712345678" in C.candidate_senders("+254712345678")
    assert "0771234567" in C.candidate_senders("+256771234567")
