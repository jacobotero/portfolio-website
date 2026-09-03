# portfolio-website

Personal portfolio site — React + Tailwind frontend on S3/CloudFront, contact
form via API Gateway + Lambda (Python) + SES, all defined as AWS CDK infra.

## Structure

- `frontend/` — React + Vite + TypeScript + Tailwind CSS
- `infra/` — AWS CDK (Python): S3, CloudFront, API Gateway, Lambda, SES, and
  the GitHub Actions OIDC deploy role
- `.github/workflows/` — CI/CD

## Local development

```
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` and set `VITE_CONTACT_API_URL`
to test the contact form against the deployed API.

## Deploying infra changes

```
cd infra
source .venv/Scripts/activate   # .venv/bin/activate on macOS/Linux
python -m pytest
cdk diff
cdk deploy
```

Or trigger the "Deploy infra" GitHub Actions workflow manually (Actions tab →
Deploy infra → Run workflow) — it never runs automatically.

Frontend changes deploy automatically to S3/CloudFront on every push to
`main` that touches `frontend/**`.
