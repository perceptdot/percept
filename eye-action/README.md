# perceptdot Visual Check

> AI-powered visual QA for every deployment — catch UI bugs automatically, headless, in CI/CD.

[![Source](https://img.shields.io/badge/source-perceptdot%2Fpercept%2Feye--action-blue?logo=github)](https://github.com/perceptdot/percept/tree/main/eye-action)

## What it does

1. Takes a screenshot of your deployed URL using headless Chrome
2. Runs a DOM audit and AI visual analysis of each 1280×1600 px tile (layout breaks, overflow, broken images, low contrast, etc.)
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
        uses: perceptdot/percept/eye-action@v1.0.0
        with:
          url: 'https://your-preview-url.vercel.app'
          api_key: ${{ secrets.PERCEPT_API_KEY }}
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
        uses: perceptdot/percept/eye-action@v1.0.0
        with:
          url: ${{ steps.vercel.outputs.preview_url }}
          api_key: ${{ secrets.PERCEPT_API_KEY }}
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

No visual issues detected. The layout renders correctly.

> Checked in 7.1s · 1 credit

Powered by perceptdot
```

## Get your API key

Free at [perceptdot.com](https://perceptdot.com): 100 credits per month, no credit card. Store it as the repository secret `PERCEPT_API_KEY`.

1 credit = 1 tile (a 1280×1600 px slice of the page). A short page is about 1 credit, a long landing page 3–5 credits. A check takes about 7 seconds for a typical page, up to ~20 seconds for long pages.

Or via Claude Code:
```
claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp --header "X-Percept-Key: YOUR_KEY"
```

Privacy: screenshots are sent to Google (Gemini API) and Cloudflare (Workers AI, fallback) for analysis and are not stored. Analysis results (never screenshots) are cached up to 10 minutes per URL. Google may use data sent to unpaid Gemini API tiers to improve its products, so do not check pages with personal data.

## License

MIT
