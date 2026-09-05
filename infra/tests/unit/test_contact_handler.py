import importlib
import json
import sys
from pathlib import Path

import boto3
import pytest
from moto import mock_aws

LAMBDA_DIR = Path(__file__).resolve().parents[2] / "lambda" / "contact"


@pytest.fixture
def handler_module(monkeypatch):
    monkeypatch.setenv("TO_EMAIL", "jacobotero0313@gmail.com")
    monkeypatch.setenv("FROM_EMAIL", "jacobotero0313@gmail.com")
    sys.path.insert(0, str(LAMBDA_DIR))
    module = importlib.import_module("handler")
    importlib.reload(module)  # pick up the patched env vars / fresh ses client
    yield module
    sys.path.remove(str(LAMBDA_DIR))
    del sys.modules["handler"]


def _event(body: dict):
    return {"body": json.dumps(body)}


@mock_aws
def test_valid_submission_sends_email(handler_module):
    ses = boto3.client("ses", region_name="us-east-1")
    ses.verify_email_identity(EmailAddress="jacobotero0313@gmail.com")

    response = handler_module.handler(
        _event({"name": "Alice", "email": "alice@example.com", "message": "Hi!"}),
        None,
    )

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {"ok": True}


@mock_aws
def test_subject_is_included_in_the_email_when_given(handler_module, monkeypatch):
    ses_client = boto3.client("ses", region_name="us-east-1")
    ses_client.verify_email_identity(EmailAddress="jacobotero0313@gmail.com")

    sent = {}
    original_send = handler_module.ses.send_email

    def capture(**kwargs):
        sent.update(kwargs)
        return original_send(**kwargs)

    monkeypatch.setattr(handler_module.ses, "send_email", capture)

    response = handler_module.handler(
        _event(
            {
                "name": "Alice",
                "email": "alice@example.com",
                "subject": "Job opportunity",
                "message": "Hi!",
            }
        ),
        None,
    )

    assert response["statusCode"] == 200
    assert "Job opportunity" in sent["Message"]["Subject"]["Data"]
    assert "Job opportunity" in sent["Message"]["Body"]["Text"]["Data"]


@mock_aws
def test_omitting_subject_still_sends_the_default_subject_line(handler_module, monkeypatch):
    ses_client = boto3.client("ses", region_name="us-east-1")
    ses_client.verify_email_identity(EmailAddress="jacobotero0313@gmail.com")

    sent = {}
    original_send = handler_module.ses.send_email

    def capture(**kwargs):
        sent.update(kwargs)
        return original_send(**kwargs)

    monkeypatch.setattr(handler_module.ses, "send_email", capture)

    response = handler_module.handler(
        _event({"name": "Alice", "email": "alice@example.com", "message": "Hi!"}),
        None,
    )

    assert response["statusCode"] == 200
    assert sent["Message"]["Subject"]["Data"] == "Portfolio contact from Alice"


@mock_aws
def test_subject_too_long_returns_400(handler_module):
    response = handler_module.handler(
        _event(
            {
                "name": "Alice",
                "email": "alice@example.com",
                "subject": "x" * 201,
                "message": "Hi!",
            }
        ),
        None,
    )
    assert response["statusCode"] == 400


@mock_aws
def test_missing_fields_returns_400(handler_module):
    response = handler_module.handler(_event({"name": "", "email": "", "message": ""}), None)
    assert response["statusCode"] == 400


@mock_aws
def test_invalid_email_returns_400(handler_module):
    response = handler_module.handler(
        _event({"name": "Alice", "email": "not-an-email", "message": "Hi!"}), None
    )
    assert response["statusCode"] == 400


@mock_aws
def test_malformed_json_returns_400(handler_module):
    response = handler_module.handler({"body": "{not json"}, None)
    assert response["statusCode"] == 400
