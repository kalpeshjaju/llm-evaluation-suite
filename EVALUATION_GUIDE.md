# Evaluation Guide: API vs Claude Code

This guide explains **two ways** to evaluate your projects:
1. **API Mode** (costs money, fully automated)
2. **Claude Code Mode** (FREE, manual)

---

## 🆓 Method 1: Claude Code (FREE - Recommended for Regular Use)

**Cost**: $0 (included in Claude Pro subscription)

### How It Works

1. Generate an evaluation prompt
2. Paste it into Claude Code
3. Get instant evaluation (no API charges)

### Usage

```bash
# Generate evaluation prompt for a project
npm run eval:prompt <project-name>

# Example:
npm run eval:prompt bank-of-agents
```

This creates a detailed prompt file that you can:
- Copy into Claude Code (this tool)
- Paste into Claude.ai web interface
- Share with team members

### When to Use

- ✅ Manual code reviews
- ✅ Regular quality checks
- ✅ Learning and exploring
- ✅ When cost is a concern
- ✅ One-off evaluations

### Example Workflow

```bash
# 1. Generate prompt
npm run eval:prompt brand-design-agent

# 2. Copy the output (shown in terminal)

# 3. Paste into Claude Code and say:
"Evaluate this project using the prompt above"

# 4. Get instant FREE evaluation!
```

---

## 💰 Method 2: API Mode (Automated, Costs Money)

**Cost**: ~$0.003-0.01 per evaluation

### How It Works

1. Script automatically calls Claude API
2. Analyzes all projects
3. Generates JSON + Markdown reports

### Usage

```bash
# Evaluate all projects automatically
npm run eval:all
```

Output:
- `outputs/evaluation-[timestamp].json` - Raw data
- `outputs/EVALUATION_REPORT.md` - Formatted report

### When to Use

- ✅ CI/CD automation
- ✅ Batch processing (many projects)
- ✅ Regular scheduled checks
- ✅ When you need JSON output
- ✅ Integration with other tools

### Cost Analysis

| Projects | Cost per Run | Monthly (1x/day) |
|----------|--------------|------------------|
| 1 project | $0.003 | $0.09 |
| 4 projects | $0.012 | $0.36 |
| 10 projects | $0.030 | $0.90 |
| 50 projects | $0.150 | $4.50 |

**Note**: Very affordable, but Claude Code is FREE!

---

## 📊 Comparison

| Feature | Claude Code (FREE) | API Mode (Paid) |
|---------|-------------------|-----------------|
| **Cost** | $0 | ~$0.003-0.01/eval |
| **Speed** | ~30 seconds | ~10 seconds |
| **Automation** | Manual | Fully automated |
| **Output Format** | Chat/Text | JSON + Markdown |
| **CI/CD** | No | Yes |
| **Batch Processing** | One at a time | All at once |
| **Best For** | Regular reviews | Automation |

---

## 🎯 Recommended Strategy

**Daily Development** (FREE):
```bash
# Use Claude Code for your active project
npm run eval:prompt <project-name>
# Then paste into Claude Code
```

**Weekly Batch Review** (Paid):
```bash
# Evaluate all projects at once
npm run eval:all
# Review the markdown report
```

**CI/CD Pipeline** (Paid):
```bash
# Add to your GitHub Actions
npm run eval:all
# Fail build if score < 7
```

---

## 🚀 Quick Start Examples

### Example 1: Evaluate One Project (FREE)

```bash
# Generate prompt
npm run eval:prompt ui-ux-audit-tool

# Copy the output and paste into Claude Code:
"Please evaluate the ui-ux-audit-tool project using this prompt..."
```

**Result**: FREE evaluation in 30 seconds

---

### Example 2: Evaluate All Projects (Paid)

```bash
# Run automated evaluation
npm run eval:all

# View results
cat outputs/EVALUATION_REPORT.md
```

**Result**: Complete report with all 4 projects (~$0.012)

---

### Example 3: Daily Quality Check (FREE)

```bash
# In Claude Code, just ask:
"Evaluate the current project's code quality"
```

**Result**: Instant free analysis of your working directory

---

## 💡 Pro Tips

### Save Money

1. **Use Claude Code for daily work** - It's free!
2. **Use API for automation only** - CI/CD, batch jobs
3. **Cache API results** - Don't re-evaluate unchanged code

### Get Better Results

1. **Be specific**: "Evaluate error handling in auth.js"
2. **Focus areas**: "Check token efficiency in all files"
3. **Compare**: "Compare v1 vs v2 architecture"

### Integration Ideas

**Git Pre-Commit Hook** (FREE):
```bash
# Use Claude Code to review changes before commit
npm run eval:prompt $(git diff --name-only)
```

**GitHub Actions** (Paid):
```yaml
- name: Quality Check
  run: npm run eval:all
```

**Daily Cron Job** (Paid):
```bash
0 9 * * * cd /path/to/project && npm run eval:all
```

---

## 🔧 Configuration

### API Mode Settings

Edit `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-20250514  # Default model
```

### Claude Code Mode Settings

No configuration needed! Just:
1. Have Claude Pro subscription
2. Use Claude Code CLI
3. Paste generated prompts

---

## 📝 Summary

| Scenario | Recommended Method |
|----------|-------------------|
| Daily coding | 🆓 Claude Code |
| Learning | 🆓 Claude Code |
| One-off reviews | 🆓 Claude Code |
| CI/CD pipeline | 💰 API Mode |
| Batch 10+ projects | 💰 API Mode |
| Cost-conscious | 🆓 Claude Code |
| Need automation | 💰 API Mode |

**Default Recommendation**: Start with Claude Code (free), add API automation later if needed.

---

## 🆘 Troubleshooting

### "API key not found"
- Only affects API mode
- Claude Code mode doesn't need API key
- Add `ANTHROPIC_API_KEY` to `.env` for API mode

### "Prompt too long"
- Claude Code can handle long prompts
- For API mode, reduce project size first

### "Want to save API costs"
- Switch to Claude Code mode (free)
- Use `npm run eval:prompt` instead of `npm run eval:all`

---

**Questions?** Ask Claude Code directly - it's free! 🎉

🤖 Generated with [Claude Code](https://claude.com/claude-code)
