#!/bin/bash
# Install git hooks for LLM evaluation

set -e

echo "🔧 Installing pre-commit hook..."

# Check if we're in a git repository
if [ ! -d .git ]; then
  echo "❌ Error: Not a git repository"
  echo "   Run 'git init' first"
  exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
cp scripts/pre-commit .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed!"
echo ""
echo "📋 What this does:"
echo "   - Runs LLM evaluation before each commit"
echo "   - Blocks commit if quality < 70%"
echo "   - Only checks staged code files"
echo ""
echo "⚙️  Configuration:"
echo "   - Set quality threshold: export LLM_QUALITY_THRESHOLD=80"
echo "   - Skip for emergency: SKIP_LLM_CHECK=1 git commit"
echo ""
echo "🚀 Test it: git commit -m 'test'"
echo ""
