import json
import os
import re

import boto3

ses = boto3.client("ses")

TO_EMAIL = os.environ["TO_EMAIL"]
FROM_EMAIL = os.environ["FROM_EMAIL"]

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MAX_MESSAGE_LENGTH = 5000


def handler(event, _context):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "invalid JSON body"})

    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    message = (body.get("message") or "").strip()

    if not name or not email or not message:
        return _response(400, {"error": "name, email, and message are required"})
    if not EMAIL_RE.match(email):
        return _response(400, {"error": "invalid email address"})
    if len(message) > MAX_MESSAGE_LENGTH:
        return _response(400, {"error": "message too long"})

    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [TO_EMAIL]},
        ReplyToAddresses=[email],
        Message={
            "Subject": {"Data": f"Portfolio contact from {name}"},
            "Body": {"Text": {"Data": f"From: {name} <{email}>\n\n{message}"}},
        },
    )

    return _response(200, {"ok": True})


def _response(status: int, payload: dict):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
