# CI/CD Examples

This directory contains CI/CD configuration examples for various platforms.

## Available Examples

### 1. GitHub Actions
**File**: `../.github/workflows/llm-evaluation.yml` (already set up)

**Features**:
- Runs on push and PR
- Comments results on PRs
- Uploads artifacts
- Enforces quality gate

**Setup**: Add `ANTHROPIC_API_KEY` to GitHub Secrets

---

### 2. GitLab CI/CD
**File**: `gitlab-ci.yml`

**Setup**:
```bash
cp ci-examples/gitlab-ci.yml .gitlab-ci.yml
# Add ANTHROPIC_API_KEY to GitLab CI/CD Variables
git add .gitlab-ci.yml
git commit -m "Add GitLab CI"
git push
```

---

### 3. CircleCI
**File**: `circleci-config.yml`

**Setup**:
```bash
mkdir -p .circleci
cp ci-examples/circleci-config.yml .circleci/config.yml
# Add ANTHROPIC_API_KEY to CircleCI Environment Variables
git add .circleci/config.yml
git commit -m "Add CircleCI"
git push
```

---

### 4. Jenkins
**File**: `Jenkinsfile`

**Setup**:
```bash
cp ci-examples/Jenkinsfile Jenkinsfile
# Add credential 'anthropic-api-key' in Jenkins
git add Jenkinsfile
git commit -m "Add Jenkins pipeline"
git push
```

---

### 5. Bitbucket Pipelines
**File**: `bitbucket-pipelines.yml`

**Setup**:
```bash
cp ci-examples/bitbucket-pipelines.yml bitbucket-pipelines.yml
# Add ANTHROPIC_API_KEY to Bitbucket Repository Variables
git add bitbucket-pipelines.yml
git commit -m "Add Bitbucket Pipelines"
git push
```

---

## Quick Start

1. **Choose your platform** from the list above
2. **Copy the config file** to your project root
3. **Add your API key** to platform secrets/variables
4. **Push to trigger** the first run

## Full Documentation

See `../CI-CD-GUIDE.md` for:
- Detailed setup instructions
- Configuration options
- Cost management
- Troubleshooting
- Advanced workflows

---

**Need help?** Check the CI-CD-GUIDE.md or README.md
