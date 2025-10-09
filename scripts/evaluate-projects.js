#!/usr/bin/env node

/**
 * Evaluates all projects in the Development directory using Claude Judge
 * Generates comprehensive quality reports for each project
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DEV_DIR = '/Users/kalpeshjaju/Development';
const PROJECTS = [
  'bank-of-agents',
  'brand-design-agent',
  'flyberry-brand-research',
  'ui-ux-audit-tool'
];

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

/**
 * Reads project structure and key files
 */
async function analyzeProject(projectName) {
  const projectPath = path.join(DEV_DIR, projectName);

  try {
    // Read key files
    const claudeMd = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
    const packageJson = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));

    // Get file structure
    const { execSync } = await import('child_process');
    const fileList = execSync(`find "${projectPath}" -type f -name "*.ts" -o -name "*.js" | grep -v node_modules | head -20`, { encoding: 'utf-8' });

    // Count lines in each file
    const files = fileList.trim().split('\n').filter(Boolean);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        return { file: file.replace(projectPath + '/', ''), lines };
      })
    );

    return {
      name: projectName,
      claudeMd,
      packageJson,
      fileStats,
      filesOver500: fileStats.filter(f => f.lines > 500)
    };
  } catch (error) {
    console.error(`Error analyzing ${projectName}:`, error.message);
    return null;
  }
}

/**
 * Evaluates project using Claude
 */
async function evaluateWithClaude(projectData) {
  const prompt = `Evaluate this project's code quality on a scale of 0-10 for each criterion:

PROJECT: ${projectData.name}

KEY REQUIREMENTS (from CLAUDE.md):
${projectData.claudeMd.substring(0, 1500)}

FILE STATISTICS:
- Total files analyzed: ${projectData.fileStats.length}
- Files over 500 lines: ${projectData.filesOver500.length} ${projectData.filesOver500.length > 0 ? '❌ VIOLATION' : '✅'}
${projectData.filesOver500.slice(0, 5).map(f => `  - ${f.file}: ${f.lines} lines`).join('\n')}

DEPENDENCIES: ${Object.keys(projectData.packageJson.dependencies || {}).length} packages

Evaluate on these criteria:
1. TOKEN EFFICIENCY (0-10): Files <500 lines, functions <100 lines
2. CODE QUALITY (0-10): TypeScript strict, no any, proper imports, error handling
3. ARCHITECTURE (0-10): Modular design, separation of concerns
4. PRODUCTION READINESS (0-10): Tests, documentation, error handling
5. BUSINESS VALUE (0-10): Solves real problem, cost-effective, time-efficient

Return ONLY a JSON object (no markdown):
{
  "overall_score": <average of scores 0-10>,
  "scores": {
    "token_efficiency": <0-10>,
    "code_quality": <0-10>,
    "architecture": <0-10>,
    "production_readiness": <0-10>,
    "business_value": <0-10>
  },
  "passes": <true if overall_score >= 7>,
  "critical_issues": ["list of blocking issues"],
  "strengths": ["list of what works well"],
  "recommendations": ["list of improvements"],
  "cost_estimate": "<estimated monthly Claude API cost>"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const responseText = message.content[0].text;

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse JSON from Claude response: ${responseText}`);
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting project evaluation...\n');

  const results = [];

  for (const project of PROJECTS) {
    console.log(`📊 Analyzing ${project}...`);
    const projectData = await analyzeProject(project);

    if (!projectData) {
      console.log(`❌ Skipped ${project}\n`);
      continue;
    }

    console.log(`🤖 Evaluating ${project} with Claude...`);
    const evaluation = await evaluateWithClaude(projectData);

    results.push({
      project,
      ...evaluation,
      filesOver500: projectData.filesOver500.length
    });

    console.log(`✅ ${project}: ${evaluation.overall_score.toFixed(1)}/10 ${evaluation.passes ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_projects: results.length,
      passing: results.filter(r => r.passes).length,
      failing: results.filter(r => !r.passes).length,
      average_score: (results.reduce((sum, r) => sum + r.overall_score, 0) / results.length).toFixed(2)
    },
    results
  };

  // Save results
  const outputDir = path.join(__dirname, '..', 'outputs');
  await fs.mkdir(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `evaluation-${Date.now()}.json`);
  await fs.writeFile(outputFile, JSON.stringify(report, null, 2));

  console.log('\n📈 EVALUATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Total Projects: ${report.summary.total_projects}`);
  console.log(`Passing (≥7/10): ${report.summary.passing} ✅`);
  console.log(`Failing (<7/10): ${report.summary.failing} ❌`);
  console.log(`Average Score: ${report.summary.average_score}/10`);
  console.log(`\nDetailed results saved to: ${outputFile}\n`);

  // Print individual results
  results.forEach(r => {
    console.log(`\n${r.project}: ${r.overall_score.toFixed(1)}/10 ${r.passes ? '✅' : '❌'}`);
    console.log(`  Token Efficiency: ${r.scores.token_efficiency}/10 ${r.filesOver500 > 0 ? `(${r.filesOver500} files >500 lines)` : ''}`);
    console.log(`  Code Quality: ${r.scores.code_quality}/10`);
    console.log(`  Architecture: ${r.scores.architecture}/10`);
    console.log(`  Production Ready: ${r.scores.production_readiness}/10`);
    console.log(`  Business Value: ${r.scores.business_value}/10`);

    if (r.critical_issues && r.critical_issues.length > 0) {
      console.log(`\n  🚨 Critical Issues:`);
      r.critical_issues.forEach(issue => console.log(`     - ${issue}`));
    }

    if (r.recommendations && r.recommendations.length > 0 && r.recommendations.length <= 3) {
      console.log(`\n  💡 Top Recommendations:`);
      r.recommendations.slice(0, 3).forEach(rec => console.log(`     - ${rec}`));
    }
  });

  console.log('\n✅ Evaluation complete!\n');

  process.exit(results.filter(r => !r.passes).length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Evaluation failed:', error.message);
  process.exit(1);
});
