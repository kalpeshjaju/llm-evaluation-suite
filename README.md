# LLM Evaluation Suite

**Automated quality assurance for LLM outputs using PromptFoo + Claude-as-Judge**

This toolkit helps you automatically evaluate LLM-generated code for quality, correctness, security, and adherence to your coding standards.

## 🎯 What This Does

- **Automates LLM evaluation**: No manual code review needed
- **Uses Claude as a judge**: Leverages LLM to evaluate LLM output
- **Tracks quality metrics**: Correctness, completeness, security, token efficiency
- **Catches regressions**: Ensure consistent quality over time
- **Cost-effective**: ~$0.003 per evaluation

## 📦 What's Included

```
llm-evaluation-suite/
├── judges/
│   └── claude-judge.js          # Custom Claude-as-Judge evaluator
├── config/
│   └── example-config.yaml      # Example PromptFoo config
├── tests/
│   ├── simple-evaluation.yaml   # Basic test pattern
│   ├── regression-test.yaml     # Regression testing pattern
│   └── comprehensive-evaluation.yaml  # Multi-criteria evaluation
├── prompts/
│   └── create-api-endpoint.txt  # Example prompt file
└── package.json
```

## 🚀 Quick Start

### 1. Setup

```bash
# Navigate to the suite
cd llm-evaluation-suite

# Install dependencies (already done)
npm install

# Setup your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Run Your First Evaluation

```bash
# Run the example evaluation
npm run test:example

# View results in browser
npm run view
```

### 3. Use Claude Judge Standalone

```bash
# Evaluate a specific output
npm run judge "Create email validator" "function validate(email) { return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email); }"
```

## 📖 Usage Patterns

### Pattern 1: Simple Evaluation

Test a single prompt with basic checks:

```yaml
# tests/my-test.yaml
prompts:
  - "Create a function that validates email"

providers:
  - anthropic:messages:claude-sonnet-4-20250514

tests:
  - assert:
      - type: llm-rubric
        value: "Does it validate emails correctly? Score 0-10"
```

Run it:
```bash
promptfoo eval -c tests/my-test.yaml
```

### Pattern 2: Comprehensive Quality Check

Evaluate multiple criteria (correctness, quality, security):

```yaml
tests:
  - description: "Correctness"
    assert:
      - type: llm-rubric
        value: "Does it solve the task correctly? Score 0-10"

  - description: "Code Quality"
    assert:
      - type: llm-rubric
        value: "Follows best practices? Score 0-10"

  - description: "Security"
    assert:
      - type: llm-rubric
        value: "Any security issues? Score 0-10"
```

### Pattern 3: Regression Testing

Compare against a golden standard:

```yaml
tests:
  - vars:
      golden_output: |
        // Your expected output here

    assert:
      - type: llm-rubric
        value: |
          Compare actual output to golden standard.
          Does it match the structure and quality?
```

### Pattern 4: Custom Evaluation Script

Use the Claude judge programmatically:

```javascript
import { evaluateWithClaude } from './judges/claude-judge.js';

const task = "Create an email validator";
const output = "function validate(email) { ... }";

const result = await evaluateWithClaude(task, output);

if (result.success) {
  console.log(`Score: ${result.evaluation.overall_score}/10`);
  console.log(`Passes: ${result.evaluation.passes}`);
}
```

## 🎨 Creating Your Own Tests

### Step 1: Create a config file

```yaml
# config/my-evaluation.yaml
description: "My custom evaluation"

prompts:
  - "Your prompt here"

providers:
  - anthropic:messages:claude-sonnet-4-20250514

tests:
  - assert:
      - type: llm-rubric
        value: "Your evaluation criteria here"
```

### Step 2: Run it

```bash
promptfoo eval -c config/my-evaluation.yaml
```

### Step 3: View results

```bash
promptfoo view
```

## 📊 Understanding Results

### Scores

- **0-3**: Critical issues, unusable
- **4-6**: Has problems, needs work
- **7-8**: Good quality, minor improvements
- **9-10**: Excellent, production-ready

### Pass/Fail Criteria

- **Default passing score**: 7/10
- Customize in your config: `threshold: 0.8` (80%)

### Cost Tracking

Each evaluation costs approximately:
- **Input tokens**: ~500-1000 tokens × $3/1M = $0.0015-$0.003
- **Output tokens**: ~500 tokens × $15/1M = $0.0075
- **Total per evaluation**: ~$0.003-$0.01

For 1,000 evaluations: **~$3-10**

## 🛠️ Available Commands

```bash
# Run evaluation
npm run eval                    # Using default promptfooconfig.yaml
npm run test:example           # Using example config

# Watch mode (re-run on changes)
npm run eval:watch

# View results in browser
npm run view

# Use Claude judge standalone
npm run judge "task" "output"
```

## 🔧 Configuration Options

### PromptFoo Config

```yaml
# Full config structure
description: "Test description"

prompts:
  - "Inline prompt"
  - file://prompts/my-prompt.txt

providers:
  - anthropic:messages:claude-sonnet-4-20250514
    config:
      temperature: 0.3
      max_tokens: 2000

tests:
  - description: "Test name"
    vars:
      custom_var: "value"

    assert:
      - type: llm-rubric
        value: "Evaluation criteria"

      - type: javascript
        value: |
          // Custom JS logic
          return { pass: true, score: 1 };

defaultTest:
  options:
    threshold: 0.7  # 70% pass rate
```

### Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=your_key_here
CLAUDE_MODEL=claude-sonnet-4-20250514  # optional
```

## 📈 Best Practices

### 1. Start Simple

Begin with basic evaluations and add complexity:
```yaml
# Start with this
assert:
  - type: llm-rubric
    value: "Does it work? Score 0-10"

# Then add more criteria
assert:
  - type: llm-rubric
    value: "Correctness: ..."
  - type: llm-rubric
    value: "Quality: ..."
  - type: llm-rubric
    value: "Security: ..."
```

### 2. Be Specific in Rubrics

**Bad**: "Is this good code?"
**Good**: "Does this code: 1) Validate inputs, 2) Handle errors with context, 3) Use TypeScript types properly?"

### 3. Combine Deterministic + LLM Checks

```yaml
assert:
  # Fast deterministic check
  - type: javascript
    value: |
      return { pass: /function/.test(output) };

  # Deeper LLM evaluation
  - type: llm-rubric
    value: "Quality assessment..."
```

### 4. Track Over Time

Save results and compare:
```bash
# Run with output
promptfoo eval -c my-test.yaml -o results-$(date +%Y%m%d).json

# Compare results over time
diff results-20241001.json results-20241008.json
```

## 🎯 Use Cases

### Use Case 1: Pre-Deployment Checks

Before deploying LLM-generated code:
```bash
promptfoo eval -c config/deployment-check.yaml
```

### Use Case 2: A/B Testing Prompts

Compare different prompts:
```yaml
prompts:
  - id: prompt-v1
    value: "Create a function..."

  - id: prompt-v2
    value: "Build a function..."

tests:
  - assert:
      - type: llm-rubric
        value: "Which produces better code?"
```

### Use Case 3: Continuous Quality Monitoring

Run evaluations on every commit:
```bash
# In your CI/CD pipeline
npm run eval && npm run validate-scores
```

## 🐛 Troubleshooting

### Error: "Could not parse JSON from Claude response"

The LLM didn't return valid JSON. Check:
- Is your rubric clear?
- Is the output too long/complex?
- Try simplifying the evaluation criteria

### Cost Too High?

- Use `claude-haiku` for cheaper evaluations
- Reduce max_tokens in judge script
- Batch evaluations instead of real-time

### Inconsistent Scores?

- Lower temperature (0.0-0.3) for more consistent results
- Be more specific in rubrics
- Use deterministic checks where possible

## 📚 Learn More

- [PromptFoo Docs](https://promptfoo.dev)
- [Claude API Docs](https://docs.anthropic.com)
- [LLM-as-Judge Best Practices](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/use-evaluation-guidelines)

## 🤝 Contributing

This is part of Kalpesh's `claude_kalpesh` project suite.

To customize for your project:
1. Copy this suite to your project
2. Create project-specific test configs
3. Adjust evaluation criteria to your standards

## 📝 License

ISC

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run eval` | Run default evaluation |
| `npm run test:example` | Run example test |
| `npm run view` | View results in browser |
| `npm run judge "task" "output"` | Standalone judge |
| `promptfoo eval -c file.yaml` | Run specific config |

**Cost**: ~$0.003 per evaluation
**Speed**: ~2-5 seconds per evaluation
**Accuracy**: High (Claude-powered)

---

**Built for**: Kalpesh's LLM quality assurance across all `claude_kalpesh` projects
