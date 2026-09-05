import json
import os
import re

import boto3

ses = boto3.client("ses")

TO_EMAIL = os.environ["TO_EMAIL"]
FROM_EMAIL = os.environ["FROM_EMAIL"]

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MAX_MESSAGE_LENGTH = 5000
MAX_SUBJECT_LENGTH = 200


def handler(event, _context):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "invalid JSON body"})

    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    # Optional: the frontend's other three fields are unchanged and still
    # required exactly as before. A blank or absent subject is not an error.
    subject = (body.get("subject") or "").strip()
    message = (body.get("message") or "").strip()

    if not name or not email or not message:
        return _response(400, {"error": "name, email, and message are required"})
    if not EMAIL_RE.match(email):
        return _response(400, {"error": "invalid email address"})
    if len(message) > MAX_MESSAGE_LENGTH:
        return _response(400, {"error": "message too long"})
    if len(subject) > MAX_SUBJECT_LENGTH:
        return _response(400, {"error": "subject too long"})

    email_subject = (
        f"Portfolio contact from {name}: {subject}"
        if subject
        else f"Portfolio contact from {name}"
    )
    body_lines = [f"From: {name} <{email}>"]
    if subject:
        body_lines.append(f"Subject: {subject}")
    body_lines.append(f"\n{message}")

    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [TO_EMAIL]},
        ReplyToAddresses=[email],
        Message={
            "Subject": {"Data": email_subject},
            "Body": {"Text": {"Data": "\n".join(body_lines)}},
        },
    )

    return _response(200, {"ok": True})


def _response(status: int, payload: dict):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
