#!/bin/bash
# setup-and-run.sh
# Quick setup script for LLM Analysis Service

echo "🚀 Setting up LLM Analysis Service..."
echo "====================================="

# Create project directory
mkdir -p llm-output-analysis
cd llm-output-analysis

# Initialize npm project
npm init -y

# Install dependencies
echo "📦 Installing dependencies..."
npm install @xenova/transformers cosine-similarity axios

# Install dev dependencies
npm install --save-dev jest nodemon eslint prettier

# Create directory structure
mkdir -p src/{api,utils,examples,tests/{unit,integration,fixtures}}
mkdir -p data/{prompts,results}
mkdir -p docs/examples
mkdir -p config
mkdir -p scripts
mkdir -p logs

# Create .gitkeep files
touch data/results/.gitkeep
touch logs/.gitkeep

# Create basic .env file
cat > .env << 'EOF'
# OpenAI API Configuration (optional - service works with mocks)
OPENAI_API_KEY=your_openai_key_here

# Anthropic API Configuration (optional)
ANTHROPIC_API_KEY=your_anthropic_key_here

# Google API Configuration (optional)
GOOGLE_API_KEY=your_google_key_here

# DeepSeek API Configuration (optional)
DEEPSEEK_API_KEY=your_deepseek_key_here

# Analysis Configuration
DEFAULT_TEMPERATURE=0.7
DEFAULT_SAMPLES_PER_PROMPT=5
DEFAULT_DUPLICATE_THRESHOLD=0.75
EOF

echo "✅ Project structure created!"
echo "✅ Dependencies installed!"
echo "✅ Environment configured!"

echo ""
echo "🔄 The service is ready to run with mock responses!"
echo "   (Add real API keys to .env for actual LLM calls)"
echo ""
echo "🚀 Quick start commands:"
echo "   node run-analysis.js quick      # Quick analysis"
echo "   node run-analysis.js temperature # Temperature study"
echo "   node run-analysis.js models     # Model comparison"
echo "   node run-analysis.js full       # Full analysis suite"
echo ""
echo "📊 The service will generate:"
echo "   - Uniqueness scores (embedding-based)"
echo "   - Quality validation scores"
echo "   - Cost analysis"
echo "   - Model performance comparisons"
echo "   - Exported JSON results"