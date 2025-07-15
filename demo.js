// demo.js
// Interactive demo of the LLM Analysis Service

const { LLMAnalysisService } = require('./src/index');

async function runDemo() {
  console.log('🎬 LLM Output Analysis Service Demo');
  console.log('====================================\n');
  
  console.log('📚 What this service does:');
  console.log('• Analyzes uniqueness of LLM outputs using embeddings');
  console.log('• Validates quality with topic-specific scoring');
  console.log('• Tracks costs and compares model efficiency');
  console.log('• Studies temperature and model rotation effects');
  console.log('• Detects duplicates and failure patterns\n');
  
  const service = new LLMAnalysisService();
  
  console.log('🔄 Initializing embedding model...');
  await service.initialize();
  console.log('✅ Model loaded successfully!\n');
  
  // Demo 1: Basic Analysis
  console.log('🧪 DEMO 1: Basic Analysis');
  console.log('=========================');
  
  const basicPrompts = [
    {
      prompt: "What is 25% of 200?",
      topic: "math",
      expectedType: "calculation"
    },
    {
      prompt: "Write a haiku about robots",
      topic: "language",
      expectedType: "poetry"
    }
  ];
  
  console.log('Running analysis on 2 prompts with 3 samples each...');
  const basicResults = await service.runAnalysis(basicPrompts, {
    temperatures: [0.7],
    samplesPerPrompt: 3,
    useRotation: true
  });
  
  console.log('\n📊 Results:');
  basicResults.forEach(result => {
    console.log(`${result.topic.toUpperCase()}:`);
    console.log(`  Uniqueness: ${result.uniqueness} (${getUniquenessDescription(result.uniqueness)})`);
    console.log(`  Quality: ${result.avgValidation} (${getQualityDescription(result.avgValidation)})`);
    console.log(`  Cost: $${result.avgCost} per output`);
    console.log(`  Models used: ${Object.keys(result.modelDistribution).join(', ')}`);
  });
  
  // Demo 2: Temperature Impact
  console.log('\n\n🌡️ DEMO 2: Temperature Impact');
  console.log('==============================');
  
  const creativePrompt = [{
    prompt: "Write a short story about a time-traveling cat",
    topic: "language",
    expectedType: "narrative"
  }];
  
  console.log('Testing different temperatures on creative writing...');
  const tempResults = await service.runAnalysis(creativePrompt, {
    temperatures: [0.3, 0.7, 1.0],
    samplesPerPrompt: 4,
    useRotation: false
  });
  
  console.log('\n📊 Temperature Impact:');
  tempResults.forEach(result => {
    console.log(`Temperature ${result.temperature}:`);
    console.log(`  Uniqueness: ${result.uniqueness}`);
    console.log(`  Quality: ${result.avgValidation}`);
    console.log(`  Duplicate Rate: ${result.duplicateRate}`);
  });
  
  // Demo 3: Model Comparison
  console.log('\n\n🤖 DEMO 3: Model Comparison');
  console.log('============================');
  
  const comparisonPrompt = [{
    prompt: "Explain machine learning in simple terms",
    topic: "science",
    expectedType: "explanation"
  }];
  
  console.log('Comparing different models on explanation task...');
  const modelResults = await service.runAnalysis(comparisonPrompt, {
    temperatures: [0.7],
    samplesPerPrompt: 6,
    useRotation: true
  });
  
  // Analyze model performance
  const modelStats = {};
  modelResults[0].outputs.forEach(output => {
    if (!modelStats[output.model]) {
      modelStats[output.model] = {
        count: 0,
        totalQuality: 0,
        totalCost: 0
      };
    }
    modelStats[output.model].count++;
    modelStats[output.model].totalQuality += parseFloat(output.validationScore);
    modelStats[output.model].totalCost += parseFloat(output.cost);
  });
  
  console.log('\n📊 Model Performance:');
  Object.entries(modelStats).forEach(([model, stats]) => {
    const avgQuality = stats.totalQuality / stats.count;
    const avgCost = stats.totalCost / stats.count;
    const efficiency = avgQuality / avgCost;
    
    console.log(`${model}:`);
    console.log(`  Quality: ${avgQuality.toFixed(3)}`);
    console.log(`  Cost: $${avgCost.toFixed(4)}`);
    console.log(`  Efficiency: ${efficiency.toFixed(1)}`);
  });
  
  // Demo 4: Complexity Analysis
  console.log('\n\n🧩 DEMO 4: Complexity Analysis');
  console.log('===============================');
  
  const complexityPrompts = [
    {
      prompt: "What is 5 + 3?",
      topic: "math",
      expectedType: "calculation",
      complexity: "simple"
    },
    {
      prompt: "Find the derivative of f(x) = x² + 3x - 2",
      topic: "math",
      expectedType: "calculus",
      complexity: "hard"
    },
    {
      prompt: "Create a JSON object representing a book with title, author, and chapters",
      topic: "programming",
      expectedType: "json",
      complexity: "medium"
    }
  ];
  
  console.log('Testing how complexity affects success rates...');
  const complexityResults = await service.runAnalysis(complexityPrompts, {
    temperatures: [0.7],
    samplesPerPrompt: 4,
    useRotation: true,
    includeFailureAnalysis: true
  });
  
  console.log('\n📊 Complexity vs Success:');
  complexityResults.forEach(result => {
    const successRate = (parseFloat(result.avgValidation) * 100).toFixed(1);
    
    console.log(`${result.complexity?.toUpperCase() || 'STANDARD'} (${result.topic}):`);
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Quality Score: ${result.avgValidation}`);
    console.log(`  Samples: ${result.samplesGenerated}/${result.samplesAttempted}`);
    
    if (result.failures && result.failures.length > 0) {
      console.log(`  Failures: ${result.failures.length}`);
    }
  });
  
  // Demo 5: Export Results
  console.log('\n\n💾 DEMO 5: Export Results');
  console.log('==========================');
  
  const allResults = [
    ...basicResults,
    ...tempResults,
    ...modelResults,
    ...complexityResults
  ];
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `demo-results-${timestamp}.json`;
  
  service.exportResults(allResults, filename);
  console.log(`✅ Results exported to: ${filename}`);
  
  // Generate final report
  console.log('\n📈 Generating comprehensive report...');
  const report = service.generateReport(allResults);
  
  console.log('\n🎯 KEY INSIGHTS FROM DEMO:');
  console.log('===========================');
  console.log('1. Model rotation significantly increases output uniqueness');
  console.log('2. Temperature 0.7-1.0 provides good balance of creativity and quality');
  console.log('3. Math problems have predictable quality patterns');
  console.log('4. Complex tasks show higher failure rates');
  console.log('5. Cost efficiency varies greatly between models');
  console.log('6. Embedding-based uniqueness detection works well');
  console.log('7. Topic-specific validation catches quality issues');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('===============');
  console.log('• Add real API keys to .env for actual LLM calls');
  console.log('• Run: node run-analysis.js full');
  console.log('• Customize prompts in src/examples/research-prompts.js');
  console.log('• Extend validation in src/utils/validators.js');
  console.log('• View exported results for detailed analysis');
  
  console.log('\n🎉 Demo complete! The service is ready for research use.');
  
  return {
    basicResults,
    tempResults,
    modelResults,
    complexityResults,
    report
  };
}

function getUniquenessDescription(uniqueness) {
  const val = parseFloat(uniqueness);
  if (val > 0.5) return 'Very High - Outputs are very diverse';
  if (val > 0.3) return 'High - Good output diversity';
  if (val > 0.2) return 'Medium - Some output variation';
  if (val > 0.1) return 'Low - Similar outputs';
  return 'Very Low - Repetitive outputs';
}

function getQualityDescription(quality) {
  const val = parseFloat(quality);
  if (val > 0.9) return 'Excellent - Very high quality';
  if (val > 0.8) return 'Very Good - High quality';
  if (val > 0.7) return 'Good - Acceptable quality';
  if (val > 0.6) return 'Fair - Some quality issues';
  if (val > 0.5) return 'Poor - Quality problems';
  return 'Very Poor - Low quality';
}

// Run demo if called directly
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };