#!/usr/bin/env node

/**
 * Generates evaluation prompts for Claude Code (FREE - no API costs)
 *
 * This script analyzes a project and creates a detailed prompt
 * that you can paste into Claude Code for manual evaluation.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_DIR = '/Users/kalpeshjaju/Development';

/**
 * Analyzes project and generates evaluation prompt
 */
async function generatePrompt(projectName) {
  const projectPath = path.join(DEV_DIR, projectName);

  try {
    // Read key files
    const claudeMd = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
    const packageJson = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));

    // Get file structure
    const { execSync } = await import('child_process');
    const fileList = execSync(
      `find "${projectPath}" -type f \\( -name "*.ts" -o -name "*.js" \\) -not -path "*/node_modules/*" | head -20`,
      { encoding: 'utf-8' }
    );

    // Count lines in each file
    const files = fileList.trim().split('\n').filter(Boolean);
    const fileStats = await Promise.all(
      files.slice(0, 10).map(async (file) => {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        return { file: file.replace(projectPath + '/', ''), lines };
      })
    );

    const filesOver500 = fileStats.filter(f => f.lines > 500);

    // Generate prompt
    const prompt = `# Evaluate Project: ${projectName}

Please evaluate this project's code quality on a scale of 0-10 for each criterion.

## Project Overview

**Name**: ${projectName}
**Description**: ${packageJson.description || 'No description'}
**Total Files**: ${fileStats.length}
**Files Over 500 Lines**: ${filesOver500.length} ${filesOver500.length > 0 ? '❌ VIOLATION' : '✅'}

${filesOver500.length > 0 ? `
### ⚠️ Files Exceeding 500 Lines:
${filesOver500.map(f => `- ${f.file}: ${f.lines} lines`).join('\n')}
` : ''}

### File Sizes:
${fileStats.map(f => `- ${f.file}: ${f.lines} lines ${f.lines > 500 ? '❌' : '✅'}`).join('\n')}

## Key Requirements (from CLAUDE.md)

\`\`\`
${claudeMd.substring(0, 1000)}...
\`\`\`

## Dependencies

${Object.keys(packageJson.dependencies || {}).length} production dependencies:
${Object.keys(packageJson.dependencies || {}).slice(0, 10).map(dep => `- ${dep}`).join('\n')}

## Evaluation Criteria

Please score each criterion from 0-10 and provide reasoning:

### 1. TOKEN EFFICIENCY (0-10)
- Are all files <500 lines? (Target: <300, Max: 500)
- Are functions <100 lines?
- Is code concise without duplication?
- Is it optimized for Claude's context window?

### 2. CODE QUALITY (0-10)
- TypeScript with strict mode? (or plain JavaScript?)
- Proper imports (no wildcards)?
- Error handling with context?
- Clean, maintainable code?
- Consistent naming conventions?

### 3. ARCHITECTURE (0-10)
- Modular design with separation of concerns?
- Easy to extend and maintain?
- Clear data flow?
- Well-organized directory structure?

### 4. PRODUCTION READINESS (0-10)
- Tests exist and pass?
- Documentation complete?
- Error handling comprehensive?
- Works for real-world use cases?

### 5. BUSINESS VALUE (0-10)
- Solves a real problem?
- Cost-effective?
- Time-efficient?
- Valuable to users?

## Output Format

Please provide:

\`\`\`json
{
  "overall_score": <average of all scores 0-10>,
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
  "recommendations": ["list of top 5 improvements"],
  "cost_estimate": "<estimated monthly Claude API cost>"
}
\`\`\`

And a brief summary explaining the scores.`;

    return prompt;

  } catch (error) {
    throw new Error(`Failed to analyze ${projectName}: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📋 Usage: node generate-claude-code-prompt.js <project-name>');
    console.log('');
    console.log('Example: node generate-claude-code-prompt.js bank-of-agents');
    console.log('');
    console.log('This generates a prompt you can paste into Claude Code for FREE evaluation.');
    console.log('No API costs! Just copy-paste the output into Claude.ai or Claude Code.');
    process.exit(1);
  }

  const projectName = args[0];

  console.log(`🔍 Generating evaluation prompt for: ${projectName}\n`);

  try {
    const prompt = await generatePrompt(projectName);

    // Save to file
    const outputDir = path.join(__dirname, '..', 'outputs');
    await fs.mkdir(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, `prompt-${projectName}.txt`);
    await fs.writeFile(outputFile, prompt);

    console.log('✅ Prompt generated!\n');
    console.log('📄 Saved to:', outputFile);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Open the prompt file:');
    console.log(`   cat "${outputFile}"`);
    console.log('');
    console.log('2. Copy the entire prompt');
    console.log('');
    console.log('3. Paste it into:');
    console.log('   - Claude Code (this tool - FREE!)');
    console.log('   - Claude.ai chat (if you prefer web interface)');
    console.log('');
    console.log('4. Claude will evaluate your project for FREE (no API costs)');
    console.log('');
    console.log('💰 Cost: $0 (uses your Claude Pro subscription)');
    console.log('');

    // Also print the prompt
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('COPY THIS PROMPT:');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(prompt);
    console.log('\n═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
