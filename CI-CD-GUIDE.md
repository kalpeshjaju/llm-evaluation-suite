# CI/CD Integration Guide

Complete guide for integrating LLM evaluation into your CI/CD pipeline.

## Overview

This suite provides **three levels of automation**:

1. **Pre-commit hook** - Runs before each commit (local)
2. **GitHub Actions** - Runs on push/PR (cloud)
3. **Other CI/CD platforms** - GitLab, CircleCI, Jenkins, Bitbucket

---

## 1. Pre-Commit Hook (Local)

**What it does**: Runs evaluation before allowing commit

### Setup (30 seconds)

```bash
# Install the hook
npm run install-hooks

# Test it
git add .
git commit -m "test"
```

### Configuration

```bash
# Set custom quality threshold (default: 70%)
export LLM_QUALITY_THRESHOLD=80

# Skip check for emergency commits
SKIP_LLM_CHECK=1 git commit -m "emergency fix"
```

### How it works

1. Detects staged code files (`.js`, `.ts`, `.py`, etc.)
2. Runs `npm run eval`
3. Checks pass rate against threshold
4. **Blocks commit** if quality < threshold
5. **Allows commit** if quality >= threshold

### Pros & Cons

✅ **Pros**:
- Catches issues before they're committed
- Fast feedback loop
- No CI/CD costs for failed commits

❌ **Cons**:
- Requires local setup
- Can be skipped (`SKIP_LLM_CHECK=1`)
- Slower commits (~10-30 seconds)

### When to use

- Solo developers
- Small teams
- Quick quality checks
- Cost-conscious projects

---

## 2. GitHub Actions (Recommended)

**What it does**: Runs evaluation on every push and PR

### Setup (2 minutes)

#### Step 1: Copy workflow file

The workflow is already created at `.github/workflows/llm-evaluation.yml`

#### Step 2: Add API key to GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your API key (`sk-ant-...`)
5. Click "Add secret"

#### Step 3: Push to GitHub

```bash
git add .github/workflows/llm-evaluation.yml
git commit -m "Add LLM evaluation workflow"
git push
```

#### Step 4: Verify

- Go to your repo → Actions tab
- You should see "LLM Quality Check" workflow
- It will run on next push/PR

### What the workflow does

1. **On push/PR**: Triggers automatically
2. **Installs dependencies**: `npm ci`
3. **Runs evaluation**: `npm run eval`
4. **Checks quality**: Enforces 70% pass rate
5. **Comments on PR**: Shows results
6. **Uploads artifacts**: Saves results for 30 days
7. **Fails if quality < 70%**: Blocks PR merge

### Customization

Edit `.github/workflows/llm-evaluation.yml`:

```yaml
# Change quality threshold
env:
  MIN_PASS_RATE: 80  # Require 80% pass rate

# Change when it runs
on:
  push:
    branches: [ main ]  # Only on main branch

# Change model
env:
  CLAUDE_MODEL: claude-haiku  # Use cheaper model
```

### Branch Protection Rules (Optional)

Require passing evaluation before merging PRs:

1. Go to repo → Settings → Branches
2. Add rule for `main` branch
3. Check "Require status checks to pass"
4. Select "LLM Quality Check"
5. Save

Now PRs **cannot merge** if quality check fails!

### Viewing Results

**In Actions tab**:
- Go to Actions → Click workflow run
- See pass/fail status
- Download artifacts (test-results.json)

**In PR comments**:
- Bot automatically comments with results
- Shows pass rate, scores, recommendations

### Cost Management

```yaml
# Run only on main branch (save costs)
on:
  push:
    branches: [ main ]

# Or run only on PRs
on:
  pull_request:
    branches: [ main ]
```

---

## 3. Other CI/CD Platforms

### GitLab CI/CD

**Setup**:

1. Copy `ci-examples/gitlab-ci.yml` to `.gitlab-ci.yml`:
   ```bash
   cp ci-examples/gitlab-ci.yml .gitlab-ci.yml
   ```

2. Add API key to GitLab CI/CD variables:
   - Project → Settings → CI/CD → Variables
   - Add variable: `ANTHROPIC_API_KEY` = your key
   - Check "Mask variable"

3. Commit and push:
   ```bash
   git add .gitlab-ci.yml
   git commit -m "Add LLM evaluation"
   git push
   ```

**Features**:
- 3 stages: test → quality → report
- Caches node_modules
- Saves artifacts (30 days)
- Fails pipeline if quality < 70%

---

### CircleCI

**Setup**:

1. Copy config:
   ```bash
   mkdir -p .circleci
   cp ci-examples/circleci-config.yml .circleci/config.yml
   ```

2. Add API key in CircleCI:
   - Project Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY`

3. Add to context (optional):
   - Organization Settings → Contexts
   - Create "llm-evaluation" context
   - Add `ANTHROPIC_API_KEY`

4. Push:
   ```bash
   git add .circleci/config.yml
   git commit -m "Add LLM evaluation"
   git push
   ```

---

### Jenkins

**Setup**:

1. Copy Jenkinsfile:
   ```bash
   cp ci-examples/Jenkinsfile Jenkinsfile
   ```

2. Add API key in Jenkins:
   - Manage Jenkins → Credentials
   - Add "Secret text" credential
   - ID: `anthropic-api-key`
   - Secret: Your API key

3. Create pipeline job:
   - New Item → Pipeline
   - Pipeline script from SCM
   - Point to your repo

4. Push:
   ```bash
   git add Jenkinsfile
   git commit -m "Add LLM evaluation"
   git push
   ```

---

### Bitbucket Pipelines

**Setup**:

1. Copy config:
   ```bash
   cp ci-examples/bitbucket-pipelines.yml bitbucket-pipelines.yml
   ```

2. Add API key:
   - Repository Settings → Pipelines → Repository variables
   - Add `ANTHROPIC_API_KEY` (secured)

3. Enable pipelines:
   - Repository Settings → Pipelines → Settings
   - Enable Pipelines

4. Push:
   ```bash
   git add bitbucket-pipelines.yml
   git commit -m "Add LLM evaluation"
   git push
   ```

---

## Configuration Options

### Environment Variables

All platforms support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | (required) | Your Anthropic API key |
| `CLAUDE_MODEL` | `claude-sonnet-4-20250514` | Model to use |
| `MIN_PASS_RATE` | `70` | Minimum pass rate (%) |
| `LLM_QUALITY_THRESHOLD` | `70` | Same as MIN_PASS_RATE |

### Custom Thresholds

**Strict quality** (80% pass rate):
```bash
export MIN_PASS_RATE=80
```

**Lenient quality** (50% pass rate):
```bash
export MIN_PASS_RATE=50
```

**Production ready** (90% pass rate):
```bash
export MIN_PASS_RATE=90
```

---

## Workflows & Strategies

### Strategy 1: Pre-commit + GitHub Actions

**Best for**: Most teams

```
Developer commits → Pre-commit hook (quick check)
                 ↓
            Push to GitHub → GitHub Actions (full check)
                          ↓
                     Create PR → Actions comment with results
                              ↓
                         Merge (if quality >= 70%)
```

**Benefits**:
- Quick feedback locally
- Comprehensive check in CI
- PR cannot merge if quality drops

### Strategy 2: GitHub Actions Only

**Best for**: Teams who want simple setup

```
Push to GitHub → Actions run evaluation
              ↓
         Pass/Fail + Comment on PR
```

**Benefits**:
- No local setup needed
- Consistent for all contributors
- Easy to maintain

### Strategy 3: Pre-commit Only

**Best for**: Solo developers, cost-conscious

```
Commit → Pre-commit hook → Pass/Fail
```

**Benefits**:
- Zero CI/CD costs
- Fast feedback
- Full control

---

## Cost Management

### Estimate Costs

```bash
# After running eval
npm run estimate-cost
```

Shows:
- Cost per evaluation
- Daily/monthly projections
- Optimization tips

### Reduce Costs

#### 1. Use cheaper model

```yaml
# Use Haiku instead of Sonnet
env:
  CLAUDE_MODEL: claude-haiku
```

**Savings**: ~90% cheaper

#### 2. Run on specific branches only

```yaml
# Only on main branch
on:
  push:
    branches: [ main ]
```

**Savings**: 5-10x fewer runs

#### 3. Run on PRs only

```yaml
# Only on PRs, not every push
on:
  pull_request:
    branches: [ main ]
```

**Savings**: ~50% fewer runs

#### 4. Reduce evaluation frequency

```yaml
# Run only on schedule (nightly)
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
```

**Savings**: 10-20x fewer runs

### Cost Comparison

| Strategy | Runs/Day | Cost/Day | Cost/Month |
|----------|----------|----------|------------|
| Every commit | 50-100 | $0.15-0.30 | $5-10 |
| PRs only | 10-20 | $0.03-0.06 | $1-2 |
| Main branch only | 5-10 | $0.015-0.03 | $0.50-1 |
| Nightly | 1 | $0.003 | $0.10 |

---

## Troubleshooting

### "API key not found"

**Cause**: API key not set in CI/CD

**Fix**:
- GitHub: Add to Secrets
- GitLab: Add to CI/CD Variables
- CircleCI: Add to Context
- Jenkins: Add to Credentials
- Bitbucket: Add to Repository Variables

### "Quality gate failed"

**Cause**: Pass rate below threshold

**Fix**:
1. Check which tests failed: `npm run check-results`
2. View details: `npm run view`
3. Fix the issues
4. Re-run evaluation
5. Or lower threshold temporarily

### "npm ci failed"

**Cause**: package-lock.json out of sync

**Fix**:
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### "Evaluation timeout"

**Cause**: Taking too long (>10 minutes)

**Fix**:
1. Reduce number of tests
2. Use faster model (Haiku)
3. Increase timeout in workflow

### High costs

**Cause**: Running too frequently

**Fix**:
1. Run on PRs only
2. Use Haiku model
3. Reduce test complexity
4. Run on schedule instead of every push

---

## Best Practices

### 1. Start Small

Begin with:
- Pre-commit hook only
- Low threshold (50%)
- Simple evaluations

Gradually increase:
- Add GitHub Actions
- Raise threshold (70% → 80%)
- Add comprehensive tests

### 2. Monitor Costs

```bash
# Check costs weekly
npm run estimate-cost

# Set up alerts
# If cost > $10/month, optimize
```

### 3. Balance Quality vs Speed

**Fast commits** (pre-commit only):
- Pros: Quick feedback, no waiting
- Cons: Can be skipped

**Thorough checks** (CI/CD only):
- Pros: Can't be skipped, consistent
- Cons: Slower feedback

**Best of both** (pre-commit + CI/CD):
- Pre-commit: Quick sanity check
- CI/CD: Comprehensive validation

### 4. Version Your Tests

```bash
# Save test results over time
git add test-results.json
git commit -m "Save evaluation baseline"

# Compare over time
diff test-results-v1.json test-results-v2.json
```

### 5. Team Communication

Add to your PR template:
```markdown
## Quality Checks

- [ ] Pre-commit hook passed
- [ ] GitHub Actions evaluation passed
- [ ] All recommendations addressed
```

---

## Advanced: Custom Workflows

### Scheduled Quality Reports

Run daily quality check at 2 AM:

```yaml
# .github/workflows/nightly-quality.yml
name: Nightly Quality Report

on:
  schedule:
    - cron: '0 2 * * *'

jobs:
  quality-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run eval
      - run: npm run check-results
      - run: npm run estimate-cost

      # Email results
      - uses: dawidd6/action-send-mail@v3
        with:
          subject: 'Daily LLM Quality Report'
          body: file://test-results.json
```

### Compare Branches

Compare quality between branches:

```bash
# On feature branch
npm run eval
mv test-results.json results-feature.json

# On main branch
git checkout main
npm run eval
mv test-results.json results-main.json

# Compare
diff results-main.json results-feature.json
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install pre-commit hook | `npm run install-hooks` |
| Skip pre-commit check | `SKIP_LLM_CHECK=1 git commit` |
| Set quality threshold | `export MIN_PASS_RATE=80` |
| Check results | `npm run check-results` |
| Enforce quality | `npm run enforce-quality` |
| Estimate costs | `npm run estimate-cost` |
| View results | `npm run view` |

---

## Support

- **Pre-commit issues**: Check `scripts/pre-commit`
- **GitHub Actions issues**: Check `.github/workflows/llm-evaluation.yml`
- **API key issues**: Verify in platform settings
- **Cost issues**: Run `npm run estimate-cost`

---

**Built for**: Kalpesh's LLM quality assurance across all projects
