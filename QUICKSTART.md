# Quick Start Guide

## Setup (2 minutes)

### 1. Add Your API Key

Open the `.env` file and add your Anthropic API key:

```bash
# Open in your editor
open .env

# Or edit directly
nano .env
```

Add your key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Get your key**: https://console.anthropic.com/settings/keys

### 2. Test the Judge (Standalone)

Test the Claude judge with a simple example:

```bash
npm run judge "Create a greeting function" "function greet(name) { return 'Hello, ' + name; }"
```

**Expected output:**
```
🤖 Evaluating with Claude...

📊 EVALUATION RESULTS

Overall Score: 8/10
Status: ✅ PASS

Detailed Scores:
  correctness: 9/10 - Correctly implements greeting
  completeness: 8/10 - Meets basic requirements
  ...

💰 Cost: ~$0.0030
```

### 3. Run Full Evaluation Suite

Run the example evaluation with PromptFoo:

```bash
npm run test:example
```

This will:
1. Generate code using Claude
2. Evaluate it with Claude-as-Judge
3. Show pass/fail results
4. Calculate costs

### 4. View Results in Browser

```bash
npm run view
```

Opens a web interface showing:
- All test results
- Detailed scores
- Pass/fail status
- Cost breakdown

## Next Steps

### Create Your Own Test

1. **Copy an example:**
   ```bash
   cp tests/simple-evaluation.yaml tests/my-test.yaml
   ```

2. **Edit the prompt:**
   ```yaml
   prompts:
     - "Your custom prompt here"
   ```

3. **Run it:**
   ```bash
   promptfoo eval -c tests/my-test.yaml
   ```

### Use in Your Project

1. **Copy this suite:**
   ```bash
   cp -r llm-evaluation-suite ../your-project/
   ```

2. **Create project-specific tests:**
   ```bash
   cd ../your-project/llm-evaluation-suite
   # Create tests/your-project-tests.yaml
   ```

3. **Run in CI/CD:**
   ```bash
   # Add to your .github/workflows/test.yml
   - run: npm run eval
   ```

## Common Issues

### "API key not found"
- Check `.env` file has `ANTHROPIC_API_KEY=sk-ant-...`
- No quotes around the key
- No spaces before/after `=`

### "Module not found"
- Run `npm install` again
- Check you're in the right directory

### "Evaluation failed"
- Check your API key is valid
- Check you have API credits
- Try a simpler prompt first

## Cost Estimates

| Usage | Evaluations | Cost |
|-------|-------------|------|
| Testing | 10-50/day | $0.03-0.50/day |
| CI/CD | 100/day | ~$3/day |
| Heavy use | 1000/day | ~$30/day |

**Tip**: Start with 10-20 test evaluations to understand the system, then scale up.

## What's Happening Behind the Scenes

1. **PromptFoo** sends your prompt to Claude
2. **Claude** generates code
3. **Claude Judge** evaluates the output
4. **Results** show scores + recommendations

All automated, no manual review needed!

---

**Ready?** Run `npm run judge "test" "code here"` to get started!
