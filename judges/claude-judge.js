#!/usr/bin/env node
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Claude-as-Judge: Evaluates LLM outputs using Claude API
 *
 * This script can be used standalone or integrated with PromptFoo
 */

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

/**
 * Evaluation criteria for LLM outputs
 */
const EVALUATION_PROMPT = `You are an expert code reviewer evaluating LLM-generated code.

TASK DESCRIPTION:
{{task}}

LLM OUTPUT:
{{output}}

Evaluate the output on these criteria (score 0-10 for each):

1. **Correctness**: Does it solve the task correctly?
2. **Completeness**: Are all requirements met?
3. **Code Quality**: Is it maintainable, readable, follows best practices?
4. **Token Efficiency**: Is the code concise without being cryptic?
5. **Error Handling**: Are errors handled properly with context?
6. **Security**: Any security issues or vulnerabilities?

Respond in this JSON format:
{
  "correctness": {"score": 0-10, "reasoning": "..."},
  "completeness": {"score": 0-10, "reasoning": "..."},
  "code_quality": {"score": 0-10, "reasoning": "..."},
  "token_efficiency": {"score": 0-10, "reasoning": "..."},
  "error_handling": {"score": 0-10, "reasoning": "..."},
  "security": {"score": 0-10, "reasoning": "..."},
  "overall_score": 0-10,
  "overall_assessment": "brief summary",
  "passes": true/false,
  "recommendations": ["..."]
}

Score >= 7 = passes, < 7 = fails
Be strict but fair. Code should be production-ready.`;

/**
 * Evaluate an LLM output using Claude
 */
export async function evaluateWithClaude(task, output, customPrompt = null) {
  const prompt = customPrompt || EVALUATION_PROMPT;
  const evaluationText = prompt
    .replace('{{task}}', task)
    .replace('{{output}}', output);

  try {
    const message = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: evaluationText
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      evaluation,
      raw_response: responseText,
      tokens_used: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      evaluation: null
    };
  }
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node claude-judge.js <task> <output>');
    console.log('Example: node claude-judge.js "Create email validator" "function validate(email) {...}"');
    process.exit(1);
  }

  const [task, output] = args;

  console.log('🤖 Evaluating with Claude...\n');

  const result = await evaluateWithClaude(task, output);

  if (result.success) {
    const { evaluation, tokens_used } = result;

    console.log('📊 EVALUATION RESULTS\n');
    console.log(`Overall Score: ${evaluation.overall_score}/10`);
    console.log(`Status: ${evaluation.passes ? '✅ PASS' : '❌ FAIL'}\n`);

    console.log('Detailed Scores:');
    Object.entries(evaluation).forEach(([key, value]) => {
      if (typeof value === 'object' && value.score !== undefined) {
        console.log(`  ${key}: ${value.score}/10 - ${value.reasoning}`);
      }
    });

    console.log(`\n${evaluation.overall_assessment}`);

    if (evaluation.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      evaluation.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    console.log(`\n💰 Cost: ~$${((tokens_used.input * 3 + tokens_used.output * 15) / 1_000_000).toFixed(4)}`);
  } else {
    console.error('❌ Evaluation failed:', result.error);
    process.exit(1);
  }
}

export default evaluateWithClaude;
