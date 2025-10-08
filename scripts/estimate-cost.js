#!/usr/bin/env node
/**
 * Estimate API costs from evaluation results
 * Provides cost breakdown and projections
 */

import { readFileSync, existsSync } from 'fs';

const RESULTS_FILE = 'test-results.json';

// Pricing (per million tokens)
const PRICING = {
  'claude-sonnet-4-20250514': {
    input: 3,
    output: 15
  },
  'claude-haiku': {
    input: 0.25,
    output: 1.25
  },
  'claude-opus': {
    input: 15,
    output: 75
  }
};

function estimateCost() {
  if (!existsSync(RESULTS_FILE)) {
    console.log('No results file found - skipping cost estimation');
    return;
  }

  const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let numEvaluations = 0;

  // Estimate tokens from results
  if (results.results && Array.isArray(results.results)) {
    numEvaluations = results.results.length;

    // Rough estimation: ~500 input, ~300 output per evaluation
    totalInputTokens = numEvaluations * 500;
    totalOutputTokens = numEvaluations * 300;
  }

  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
  const pricing = PRICING[model] || PRICING['claude-sonnet-4-20250514'];

  const inputCost = (totalInputTokens / 1_000_000) * pricing.input;
  const outputCost = (totalOutputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  console.log('\n💰 COST ESTIMATE\n');
  console.log(`Model:            ${model}`);
  console.log(`Evaluations:      ${numEvaluations}`);
  console.log(`Input Tokens:     ~${totalInputTokens.toLocaleString()}`);
  console.log(`Output Tokens:    ~${totalOutputTokens.toLocaleString()}`);
  console.log(`Total Cost:       $${totalCost.toFixed(4)}`);

  // Projections
  console.log('\n📈 COST PROJECTIONS\n');
  console.log(`Daily (10 runs):   $${(totalCost * 10).toFixed(2)}`);
  console.log(`Monthly (300):     $${(totalCost * 300).toFixed(2)}`);
  console.log(`Per evaluation:    $${(totalCost / numEvaluations).toFixed(4)}`);

  // Cost optimization tips
  if (totalCost > 0.10) {
    console.log('\n💡 COST OPTIMIZATION TIPS\n');
    console.log('- Use claude-haiku for cheaper evaluations');
    console.log('- Reduce max_tokens in judge script');
    console.log('- Use deterministic checks where possible');
    console.log('- Batch evaluations instead of running on every commit');
  }

  console.log('');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    estimateCost();
  } catch (error) {
    console.error('Error estimating cost:', error.message);
    process.exit(1);
  }
}

export default estimateCost;
