# perceptdot Visual Check

> AI-powered visual QA for every deployment — catch UI bugs automatically, headless, in CI/CD.

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-perceptdot%20Visual%20Check-blue?logo=github)](https://github.com/marketplace/actions/perceptdot-visual-check)

## What it does

1. Takes a screenshot of your deployed URL using headless Chrome
2. Runs AI visual analysis (detects layout breaks, overflow, missing images, z-index issues, etc.)
3. Posts results as a PR comment with severity breakdown
4. Optionally fails the workflow if issues are found

**Works with any AI coding tool**: Claude Code, Cursor, GitHub Copilot, Windsurf, Cline

## Quick start

```yaml
# .github/workflows/visual-qa.yml
name: Visual QA
on: [pull_request]

jobs:
  visual-check:
    runs-on: ubuntu-latest
    steps:
      - name: perceptdot Visual Check
        uses: perceptdot/eye-action@v1
        with:
          url: 'https://your-preview-url.vercel.app'
          api_key: ${{ secrets.PERCEPTDOT_API_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## With Vercel preview URLs

```yaml
name: Visual QA
on: [pull_request]

jobs:
  visual-check:
    runs-on: ubuntu-latest
    steps:
      - name: Wait for Vercel Preview
        uses: zentered/vercel-preview-url@v1
        id: vercel
        with:
          vercel_token: ${{ secrets.VERCEL_TOKEN }}
          vercel_project_id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: perceptdot Visual Check
        uses: perceptdot/eye-action@v1
        with:
          url: ${{ steps.vercel.outputs.preview_url }}
          api_key: ${{ secrets.PERCEPTDOT_API_KEY }}
          fail_on_issue: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | ✅ | — | URL to visually check |
| `api_key` | ✅ | — | perceptdot API key ([get free](https://perceptdot.com)) |
| `fail_on_issue` | ❌ | `false` | Fail workflow if visual issues are detected |

## Outputs

| Output | Description |
|--------|-------------|
| `has_issues` | `true` if visual issues detected |
| `summary` | One-line AI summary of findings |
| `result` | Full JSON response from perceptdot API |

## PR Comment example

```
✅ perceptdot Visual Check

URL: https://my-app.vercel.app

No visual issues detected. The layout renders correctly at 1280×800.

> Checked in 7400ms · Cost: $0.000012

Powered by perceptdot
```

## Get your API key

Free at [perceptdot.com](https://perceptdot.com) — no credit card required.

Or via Claude Code:
```
claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp
```

## License

MIT
