# 🤖 GitHub Action

Automatically run visual QA on every deployment — no AI tool required.

---

## What it does

Every time you deploy, perceptdot takes a screenshot of your live URL and checks for visual bugs. Results appear directly in your workflow summary.

---

## Setup (3 steps)

### Step 1 — Get your API key

Enter your email at [perceptdot.com](https://perceptdot.com) — key sent instantly.

### Step 2 — Add the secret

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

- Name: `PERCEPT_API_KEY`
- Value: your API key

### Step 3 — Add the action to your workflow

```yaml
name: Deploy and Visual QA

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Your existing deploy step
      - name: Deploy
        id: deploy
        run: echo "url=https://your-site.com" >> $GITHUB_OUTPUT

      # perceptdot visual check
      - name: Visual QA
        uses: perceptdot/eye-action@v1
        with:
          url: ${{ steps.deploy.outputs.url }}
          api_key: ${{ secrets.PERCEPT_API_KEY }}
          fail_on_issue: 'false'
```

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | ✅ | — | URL to check (e.g. Vercel preview URL) |
| `api_key` | ✅ | — | Your perceptdot API key |
| `fail_on_issue` | ❌ | `false` | Set `true` to fail the workflow if visual issues are found |

---

## Outputs

| Output | Description |
|--------|-------------|
| `result` | Full AI analysis result (JSON) |
| `has_issues` | `true` if visual issues were detected |
| `summary` | Human-readable summary of findings |

---

## Example: Block deploy on visual bug

Set `fail_on_issue: 'true'` to automatically block merges when layout bugs are found:

```yaml
- name: Visual QA (blocking)
  uses: perceptdot/eye-action@v1
  with:
    url: ${{ steps.deploy.outputs.url }}
    api_key: ${{ secrets.PERCEPT_API_KEY }}
    fail_on_issue: 'true'
```

---

## Example: Use with Vercel preview deployments

```yaml
- name: Deploy to Vercel
  id: vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

- name: Visual QA on preview
  uses: perceptdot/eye-action@v1
  with:
    url: ${{ steps.vercel.outputs.preview-url }}
    api_key: ${{ secrets.PERCEPT_API_KEY }}
```

---

## Viewing results

After the workflow runs, click the **perceptdot Visual Check** step to see:

- ✅ No issues, or a list of detected bugs with severity levels
- Number of tiles analyzed and scan time
- Credits used

---

{% hint style="info" %}
**Tip:** Use `fail_on_issue: 'false'` (default) during initial setup to observe results without blocking your pipeline. Switch to `'true'` once you're confident in the signal.
{% endhint %}
