# Claude Instructions: LLM Evaluation Suite

## Project Overview

**Purpose**: Automated LLM quality assurance using PromptFoo + Claude-as-Judge

**Tech Stack**:
- Node.js + ES modules
- PromptFoo (testing framework)
- Anthropic SDK (Claude API)
- YAML configs

**Location**: `/Users/kalpeshjaju/Library/CloudStorage/GoogleDrive-kalpesh@whatgoesaroundcomesaround.in/My Drive/claude_kalpesh/llm-evaluation-suite`

## Key Commands

```bash
# Testing
npm run judge "task" "output"          # Test judge standalone
npm run eval                            # Run default evaluation
npm run test:example                    # Run example config
npm run eval:watch                      # Watch mode
npm run view                            # View results in browser

# Development
npm install                             # Install dependencies
node judges/claude-judge.js "task" "output"  # Direct judge execution
promptfoo eval -c config/file.yaml     # Run specific config
```

## Architecture

```
llm-evaluation-suite/
├── judges/
│   └── claude-judge.js              # Core evaluation logic
├── config/
│   └── example-config.yaml          # Example PromptFoo setup
├── tests/
│   ├── simple-evaluation.yaml       # Basic pattern
│   ├── regression-test.yaml         # Regression pattern
│   └── comprehensive-evaluation.yaml # Multi-criteria
├── prompts/
│   └── create-api-endpoint.txt      # Example prompts
├── .env                              # API keys (not in git)
├── package.json                      # Dependencies + scripts
└── README.md                         # Full documentation
```

## How It Works

1. **PromptFoo** sends prompt to Claude → generates code
2. **Claude Judge** evaluates output against rubric
3. **Results** show scores (0-10) + pass/fail + recommendations

## Key Files

### `judges/claude-judge.js`
- Custom evaluator using Anthropic SDK
- Scores code on 6 criteria (correctness, quality, security, etc.)
- Returns JSON with scores + reasoning
- Can be used standalone or with PromptFoo

### `config/example-config.yaml`
- PromptFoo configuration
- Defines: prompts, providers, tests, assertions
- Uses `llm-rubric` for Claude-as-Judge evaluations

### Test Files (`tests/*.yaml`)
- Different evaluation patterns
- Show various use cases (simple, regression, comprehensive)
- Reusable templates for creating custom tests

## Coding Standards (This Project)

- **ES Modules**: `import/export` (not CommonJS)
- **Async/await**: For all API calls
- **Error handling**: Try/catch with context
- **Token efficient**: Judge prompt ~200 tokens
- **Type safety**: JSDoc comments for main functions

## Common Tasks

### Add New Evaluation Test

1. Create new YAML file in `tests/`
2. Define prompt + assertions
3. Run: `promptfoo eval -c tests/your-file.yaml`

### Modify Judge Criteria

1. Edit `EVALUATION_PROMPT` in `judges/claude-judge.js`
2. Adjust scoring criteria
3. Test: `npm run judge "task" "output"`

### Use in Another Project

1. Copy suite to project: `cp -r llm-evaluation-suite ../other-project/`
2. Create project-specific tests
3. Add to CI/CD pipeline

## Environment Setup

Required:
- `ANTHROPIC_API_KEY` in `.env`

Optional:
- `CLAUDE_MODEL` (defaults to claude-sonnet-4-20250514)

## Cost Management

- **Per evaluation**: ~$0.003-0.01
- **1000 evaluations**: ~$3-10
- Judge uses: Sonnet (fast + cheap)
- Reduce costs: Lower max_tokens, use Haiku

## Testing Checklist

Before committing changes:
- [ ] Run `npm run judge "test task" "test code"`
- [ ] Verify JSON output is valid
- [ ] Check cost estimate is reasonable
- [ ] Test with example config: `npm run test:example`

## Known Issues

1. **JSON parsing errors**: Sometimes Claude doesn't return valid JSON
   - Fix: Make rubric more specific
   - Fallback: Regex extraction in judge script

2. **High token usage**: Complex evaluations can be expensive
   - Fix: Simplify rubrics, shorter prompts
   - Use deterministic checks when possible

3. **Inconsistent scores**: Temperature affects consistency
   - Fix: Use temperature 0.0-0.3
   - Be more specific in evaluation criteria

## Integration Points

- **PromptFoo**: Test framework, handles prompt execution
- **Anthropic SDK**: Claude API for judge evaluations
- **CI/CD**: Can be integrated into GitHub Actions, etc.

## Best Practices

1. **Start simple**: Basic rubric, add complexity gradually
2. **Be specific**: Clear evaluation criteria = better results
3. **Combine checks**: Deterministic + LLM for best coverage
4. **Track costs**: Monitor token usage, optimize rubrics
5. **Version tests**: Save results over time for regression tracking

## For Kalpesh

**What this does**: Automatically checks if Claude's code output is good quality

**How to use**:
1. Add your API key to `.env`
2. Run: `npm run judge "what you asked for" "what Claude gave you"`
3. See score (0-10) and whether it passes

**What "pass" means**:
- Score >= 7 = Good to use
- Score < 7 = Needs fixes

**Cost**: About $0.003 per check (very cheap!)

**When to use**:
- Before deploying LLM-generated code
- Testing if prompt changes improve output
- Regular quality checks on auto-generated code

## Future Enhancements

- [ ] Add more judge templates (security-focused, performance, etc.)
- [ ] Create batch evaluation script
- [ ] Add cost tracking/reporting
- [ ] Integration with GitHub Actions
- [ ] Dashboard for tracking quality over time

---

## Quick Reference

| Task | Command |
|------|---------|
| Test judge | `npm run judge "task" "code"` |
| Run evaluation | `npm run eval` |
| View results | `npm run view` |
| Create test | Copy `tests/simple-evaluation.yaml` |

**Documentation**: See `README.md` for detailed usage
**Quick Start**: See `QUICKSTART.md` for 2-minute setup
