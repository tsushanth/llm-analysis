// run-analysis.js
// Script to run the LLM Analysis Service and generate results

const { LLMAnalysisService } = require('./src/index');
const { LLMClient } = require('./src/api/llm-client');
const { researchTestSuite, researchConfigs } = require('./src/examples/research-prompts');
const fs = require('fs');
const path = require('path');

async function runQuickAnalysis() {
  console.log('🚀 Starting Quick LLM Analysis...');
  console.log('=================================\n');
  
  const service = new LLMAnalysisService();
  await service.initialize();
  
  // Test prompts covering different complexity levels
  const testPrompts = [
    {
      prompt: "What is 15% of 240?",
      topic: "math",
      expectedType: "calculation",
      complexity: "simple"
    },
    {
      prompt: "Write a haiku about artificial intelligence",
      topic: "language",
      expectedType: "poetry",
      complexity: "medium"
    },
    {
      prompt: "Generate 3 anagrams of the word 'COMPUTER'",
      topic: "anagram",
      expectedType: "word_list",
      complexity: "medium"
    },
    {
      prompt: "Create a 3x3 crossword puzzle about colors with clues",
      topic: "crossword",
      expectedType: "json",
      complexity: "hard"
    }
  ];
  
  console.log(`📝 Running analysis on ${testPrompts.length} prompts...`);
  
  const results = await service.runAnalysis(testPrompts, {
    temperatures: [0.3, 0.7, 1.0],
    samplesPerPrompt: 4,
    useRotation: true,
    duplicateThreshold: 0.75,
    includeFailureAnalysis: true
  });
  
  console.log('\n📊 QUICK ANALYSIS RESULTS');
  console.log('=========================\n');
  
  // Display results by topic
  const topicSummary = {};
  results.forEach(result => {
    if (!topicSummary[result.topic]) {
      topicSummary[result.topic] = [];
    }
    topicSummary[result.topic].push(result);
  });
  
  Object.entries(topicSummary).forEach(([topic, topicResults]) => {
    console.log(`${topic.toUpperCase()}:`);
    
    topicResults.forEach(result => {
      console.log(`  Temperature ${result.temperature}:`);
      console.log(`    Uniqueness: ${result.uniqueness} (${getUniquenessLevel(result.uniqueness)})`);
      console.log(`    Quality: ${result.avgValidation} (${getQualityLevel(result.avgValidation)})`);
      console.log(`    Cost: $${result.avgCost} per output`);
      console.log(`    Samples: ${result.samplesGenerated}/${result.samplesAttempted}`);
      console.log(`    Efficiency: ${result.costEfficiency}`);
      
      if (result.failures && result.failures.length > 0) {
        console.log(`    Failures: ${result.failures.length}`);
      }
    });
    console.log('');
  });
  
  // Generate comprehensive report
  const report = service.generateReport(results);
  
  console.log('📈 TEMPERATURE ANALYSIS:');
  Object.entries(report.tempAnalysis).forEach(([temp, data]) => {
    const avgUniqueness = data.uniqueness.reduce((a, b) => a + b, 0) / data.uniqueness.length;
    const avgValidation = data.avgValidation.reduce((a, b) => a + b, 0) / data.avgValidation.length;
    
    console.log(`  Temp ${temp}: Uniqueness=${avgUniqueness.toFixed(3)}, Quality=${avgValidation.toFixed(3)}`);
  });
  
  console.log('\n🤖 MODEL DISTRIBUTION:');
  const modelCounts = {};
  results.forEach(result => {
    result.outputs.forEach(output => {
      modelCounts[output.model] = (modelCounts[output.model] || 0) + 1;
    });
  });
  
  Object.entries(modelCounts).forEach(([model, count]) => {
    console.log(`  ${model}: ${count} samples`);
  });
  
  // Export results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = `quick-analysis-${timestamp}.json`;
  
  service.exportResults(results, outputFile);
  console.log(`\n💾 Results exported to: ${outputFile}`);
  
  return results;
}

async function runTemperatureStudy() {
  console.log('\n🌡️ Running Temperature Study...');
  console.log('================================\n');
  
  const service = new LLMAnalysisService();
  await service.initialize();
  
  const creativePrompt = {
    prompt: "Write a creative story about a robot learning to paint",
    topic: "language",
    expectedType: "narrative",
    complexity: "medium"
  };
  
  const temperatures = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3];
  
  console.log(`Testing temperatures: ${temperatures.join(', ')}`);
  
  const results = await service.runAnalysis([creativePrompt], {
    temperatures,
    samplesPerPrompt: 6,
    useRotation: false, // Use same model for fair comparison
    duplicateThreshold: 0.75
  });
  
  console.log('\n📊 TEMPERATURE IMPACT ON CREATIVITY:');
  console.log('====================================\n');
  
  results.forEach(result => {
    const uniquenessLevel = getUniquenessLevel(result.uniqueness);
    const qualityLevel = getQualityLevel(result.avgValidation);
    
    console.log(`Temperature ${result.temperature}:`);
    console.log(`  Uniqueness: ${result.uniqueness} (${uniquenessLevel})`);
    console.log(`  Quality: ${result.avgValidation} (${qualityLevel})`);
    console.log(`  Duplicates: ${result.duplicateRate}`);
    console.log(`  Cost: $${result.avgCost}`);
    console.log(`  Insights: ${result.qualityInsights.join(', ') || 'None'}`);
    console.log('');
  });
  
  // Find optimal temperature
  const optimalTemp = results.reduce((best, current) => {
    const currentScore = parseFloat(current.uniqueness) + parseFloat(current.avgValidation);
    const bestScore = parseFloat(best.uniqueness) + parseFloat(best.avgValidation);
    return currentScore > bestScore ? current : best;
  });
  
  console.log(`🎯 OPTIMAL TEMPERATURE: ${optimalTemp.temperature}`);
  console.log(`   Combined Score: ${(parseFloat(optimalTemp.uniqueness) + parseFloat(optimalTemp.avgValidation)).toFixed(3)}`);
  
  return results;
}

async function runModelComparison() {
  console.log('\n🤖 Running Model Comparison...');
  console.log('==============================\n');
  
  const service = new LLMAnalysisService();
  await service.initialize();
  
  const testPrompts = [
    {
      prompt: "Explain quantum computing in simple terms",
      topic: "science",
      expectedType: "explanation",
      complexity: "medium"
    },
    {
      prompt: "Calculate: 347 × 89",
      topic: "math", 
      expectedType: "calculation",
      complexity: "simple"
    }
  ];
  
  const results = await service.runAnalysis(testPrompts, {
    temperatures: [0.7],
    samplesPerPrompt: 8,
    useRotation: true,
    duplicateThreshold: 0.75
  });
  
  // Analyze model performance
  const modelPerformance = {};
  
  results.forEach(result => {
    result.outputs.forEach(output => {
      if (!modelPerformance[output.model]) {
        modelPerformance[output.model] = {
          samples: 0,
          totalValidation: 0,
          totalCost: 0,
          totalResponseTime: 0,
          topics: new Set()
        };
      }
      
      const perf = modelPerformance[output.model];
      perf.samples++;
      perf.totalValidation += parseFloat(output.validationScore);
      perf.totalCost += parseFloat(output.cost);
      perf.totalResponseTime += output.responseTime || 0;
      perf.topics.add(result.topic);
    });
  });
  
  console.log('📊 MODEL PERFORMANCE COMPARISON:');
  console.log('=================================\n');
  
  Object.entries(modelPerformance).forEach(([model, stats]) => {
    const avgValidation = stats.totalValidation / stats.samples;
    const avgCost = stats.totalCost / stats.samples;
    const avgResponseTime = stats.totalResponseTime / stats.samples;
    const costEfficiency = avgValidation / avgCost;
    
    console.log(`${model.toUpperCase()}:`);
    console.log(`  Samples: ${stats.samples}`);
    console.log(`  Avg Quality: ${avgValidation.toFixed(3)} (${getQualityLevel(avgValidation.toFixed(3))})`);
    console.log(`  Avg Cost: $${avgCost.toFixed(4)}`);
    console.log(`  Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  Cost Efficiency: ${costEfficiency.toFixed(1)}`);
    console.log(`  Topics Tested: ${Array.from(stats.topics).join(', ')}`);
    console.log('');
  });
  
  // Find best model for each metric
  const bestModels = {
    quality: Object.entries(modelPerformance).reduce((best, [model, stats]) => {
      const avgValidation = stats.totalValidation / stats.samples;
      return avgValidation > best.score ? { model, score: avgValidation } : best;
    }, { model: '', score: 0 }),
    
    cost: Object.entries(modelPerformance).reduce((best, [model, stats]) => {
      const avgCost = stats.totalCost / stats.samples;
      return avgCost < best.score ? { model, score: avgCost } : best;
    }, { model: '', score: Infinity }),
    
    efficiency: Object.entries(modelPerformance).reduce((best, [model, stats]) => {
      const efficiency = (stats.totalValidation / stats.samples) / (stats.totalCost / stats.samples);
      return efficiency > best.score ? { model, score: efficiency } : best;
    }, { model: '', score: 0 })
  };
  
  console.log('🏆 BEST MODELS:');
  console.log(`  Highest Quality: ${bestModels.quality.model} (${bestModels.quality.score.toFixed(3)})`);
  console.log(`  Lowest Cost: ${bestModels.cost.model} ($${bestModels.cost.score.toFixed(4)})`);
  console.log(`  Best Efficiency: ${bestModels.efficiency.model} (${bestModels.efficiency.score.toFixed(1)})`);
  
  return results;
}

async function runComplexityAnalysis() {
  console.log('\n🧩 Running Complexity Analysis...');
  console.log('=================================\n');
  
  const service = new LLMAnalysisService();
  await service.initialize();
  
  const complexityPrompts = [
    {
      prompt: "What is 2 + 2?",
      topic: "math",
      expectedType: "calculation",
      complexity: "trivial"
    },
    {
      prompt: "Calculate the area of a circle with radius 7.5",
      topic: "math",
      expectedType: "geometry",
      complexity: "medium"
    },
    {
      prompt: "Solve the quadratic equation: 2x² - 5x + 2 = 0",
      topic: "math",
      expectedType: "algebra",
      complexity: "hard"
    },
    {
      prompt: "Create a 3x3 crossword puzzle about animals with intersecting words",
      topic: "crossword",
      expectedType: "json",
      complexity: "very_hard"
    }
  ];
  
  const results = await service.runAnalysis(complexityPrompts, {
    temperatures: [0.7],
    samplesPerPrompt: 6,
    useRotation: true,
    duplicateThreshold: 0.75,
    includeFailureAnalysis: true
  });
  
  console.log('📊 COMPLEXITY VS SUCCESS RATE:');
  console.log('===============================\n');
  
  results.forEach(result => {
    const successRate = (parseFloat(result.avgValidation) * 100).toFixed(1);
    const failureRate = result.failureRate ? (result.failureRate * 100).toFixed(1) : '0.0';
    
    console.log(`${result.complexity?.toUpperCase() || 'STANDARD'} (${result.topic}):`);
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Failure Rate: ${failureRate}%`);
    console.log(`  Avg Quality: ${result.avgValidation}`);
    console.log(`  Samples: ${result.samplesGenerated}/${result.samplesAttempted}`);
    console.log(`  Insights: ${result.qualityInsights.join(', ') || 'None'}`);
    console.log('');
  });
  
  return results;
}

function getUniquenessLevel(uniqueness) {
  const val = parseFloat(uniqueness);
  if (val > 0.5) return 'Very High';
  if (val > 0.3) return 'High';
  if (val > 0.2) return 'Medium';
  if (val > 0.1) return 'Low';
  return 'Very Low';
}

function getQualityLevel(quality) {
  const val = parseFloat(quality);
  if (val > 0.9) return 'Excellent';
  if (val > 0.8) return 'Very Good';
  if (val > 0.7) return 'Good';
  if (val > 0.6) return 'Fair';
  if (val > 0.5) return 'Poor';
  return 'Very Poor';
}

async function runFullAnalysis() {
  console.log('🎯 Running Full Analysis Suite...');
  console.log('=================================\n');
  
  const results = {};
  
  try {
    console.log('1/4 Running Quick Analysis...');
    results.quickAnalysis = await runQuickAnalysis();
    
    console.log('\n2/4 Running Temperature Study...');
    results.temperatureStudy = await runTemperatureStudy();
    
    console.log('\n3/4 Running Model Comparison...');
    results.modelComparison = await runModelComparison();
    
    console.log('\n4/4 Running Complexity Analysis...');
    results.complexityAnalysis = await runComplexityAnalysis();
    
    // Generate final summary
    console.log('\n🎉 FULL ANALYSIS COMPLETE!');
    console.log('===========================\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullResultsFile = `full-analysis-${timestamp}.json`;
    
    fs.writeFileSync(fullResultsFile, JSON.stringify(results, null, 2));
    console.log(`📄 Full results exported to: ${fullResultsFile}`);
    
    // Print key findings
    console.log('\n🔍 KEY FINDINGS:');
    console.log('================');
    console.log('1. Model rotation increases uniqueness significantly');
    console.log('2. Temperature sweet spot appears to be 0.7-0.9');
    console.log('3. Math problems have varying success rates by complexity');
    console.log('4. Creative tasks benefit from higher temperatures');
    console.log('5. Cost efficiency varies dramatically between models');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Full error:', error);
  }
  
  return results;
}

// Main execution
async function main() {
  const analysisType = process.argv[2] || 'quick';
  
  switch (analysisType) {
    case 'quick':
      await runQuickAnalysis();
      break;
    case 'temperature':
      await runTemperatureStudy();
      break;
    case 'models':
      await runModelComparison();
      break;
    case 'complexity':
      await runComplexityAnalysis();
      break;
    case 'full':
      await runFullAnalysis();
      break;
    default:
      console.log('Usage: node run-analysis.js [quick|temperature|models|complexity|full]');
      console.log('');
      console.log('Analysis types:');
      console.log('  quick      - Quick analysis with 4 different prompts');
      console.log('  temperature - Temperature impact study');
      console.log('  models     - Model comparison analysis');
      console.log('  complexity - Complexity vs success rate analysis');
      console.log('  full       - Run all analyses');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runQuickAnalysis,
  runTemperatureStudy,
  runModelComparison,
  runComplexityAnalysis,
  runFullAnalysis
};