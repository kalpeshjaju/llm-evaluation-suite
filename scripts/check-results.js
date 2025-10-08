#!/usr/bin/env node
/**
 * Check evaluation results and display summary
 * Used in CI/CD to parse and display test results
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

const RESULTS_FILE = 'test-results.json';

function checkResults() {
  if (!existsSync(RESULTS_FILE)) {
    console.error('❌ No results file found');
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));

  // Handle nested results structure
  const results = data.results?.results || [];

  // Parse results
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    avgScore: 0,
    totalCost: 0
  };

  if (Array.isArray(results)) {
    stats.total = results.length;
    stats.passed = results.filter(r => r.success).length;
    stats.failed = stats.total - stats.passed;

    // Calculate average score
    const scores = results
      .map(r => r.score || 0)
      .filter(s => s > 0);

    if (scores.length > 0) {
      stats.avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }

  const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;

  // Display summary
  console.log('\n📊 EVALUATION SUMMARY\n');
  console.log(`Total Tests:  ${stats.total}`);
  console.log(`Passed:       ${stats.passed} ✅`);
  console.log(`Failed:       ${stats.failed} ❌`);
  console.log(`Pass Rate:    ${passRate.toFixed(1)}%`);
  console.log(`Avg Score:    ${stats.avgScore.toFixed(1)}/10`);

  if (stats.totalCost > 0) {
    console.log(`Total Cost:   $${stats.totalCost.toFixed(4)}`);
  }

  console.log('');

  // Show status
  if (passRate >= 70) {
    console.log('✅ Quality threshold met (>= 70%)');
  } else {
    console.log('⚠️  Quality threshold not met (< 70%)');
  }

  // Show failed tests
  if (stats.failed > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    results.results
      .filter(r => !r.success)
      .forEach((r, i) => {
        console.log(`${i + 1}. ${r.description || 'Unnamed test'}`);
        if (r.error) {
          console.log(`   Error: ${r.error}`);
        }
      });
  }

  return stats;
}

// Run if called directly
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  try {
    checkResults();
  } catch (error) {
    console.error('Error checking results:', error.message);
    process.exit(1);
  }
}

export default checkResults;
