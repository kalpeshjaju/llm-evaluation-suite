#!/usr/bin/env node
/**
 * Enforce quality threshold in CI/CD
 * Exits with error code if quality is below threshold
 */

import { readFileSync, existsSync } from 'fs';

const RESULTS_FILE = 'test-results.json';
const MIN_PASS_RATE = parseFloat(process.env.MIN_PASS_RATE || '70');

function enforceQuality() {
  if (!existsSync(RESULTS_FILE)) {
    console.error('❌ No results file found');
    process.exit(1);
  }

  const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));

  // Calculate pass rate
  let passed = 0;
  let total = 0;

  if (results.results && Array.isArray(results.results)) {
    total = results.results.length;
    passed = results.results.filter(r => r.success).length;
  }

  const passRate = total > 0 ? (passed / total) * 100 : 0;

  console.log('\n🔒 QUALITY GATE CHECK\n');
  console.log(`Pass Rate:      ${passRate.toFixed(1)}%`);
  console.log(`Threshold:      ${MIN_PASS_RATE}%`);

  if (passRate >= MIN_PASS_RATE) {
    console.log('\n✅ Quality gate PASSED - Code meets quality standards\n');
    process.exit(0);
  } else {
    console.error('\n❌ Quality gate FAILED - Code quality below threshold\n');
    console.error(`Required: ${MIN_PASS_RATE}% pass rate`);
    console.error(`Actual:   ${passRate.toFixed(1)}% pass rate`);
    console.error('\nPlease fix the failed evaluations before merging.\n');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    enforceQuality();
  } catch (error) {
    console.error('Error enforcing quality:', error.message);
    process.exit(1);
  }
}

export default enforceQuality;
