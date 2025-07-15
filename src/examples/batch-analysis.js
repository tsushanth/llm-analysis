// src/examples/batch-analysis.js
// Comprehensive batch analysis examples

const { LLMAnalysisService } = require('../index');

// Test prompts organized by complexity and domain
const testPrompts = {
  // Simple, deterministic tasks (should have low uniqueness, high accuracy)
  simple: [
    {
      prompt: "What is 15% of 240?",
      topic: "math",
      expectedType: "calculation",
      complexity: "simple"
    },
    {
      prompt: "Convert 5 feet to meters",
      topic: "math",
      expectedType: "conversion",
      complexity: "simple"
    },
    {
      prompt: "What is the capital of France?",
      topic: "factual",
      expectedType: "fact",
      complexity: "simple"
    }
  ],
  
  // Medium complexity tasks (moderate uniqueness, variable accuracy)
  medium: [
    {
      prompt: "Generate 3 anagrams of the word 'LISTEN'",
      topic: "anagram",
      expectedType: "word_list",
      complexity: "medium"
    },
    {
      prompt: "Write a haiku about autumn",
      topic: "language",
      expectedType: "poetry",
      complexity: "medium"
    },
    {
      prompt: "Explain photosynthesis in simple terms",
      topic: "language",
      expectedType: "explanation",
      complexity: "medium"
    }
  ],
  
  // Complex, creative tasks (high uniqueness, lower accuracy)
  complex: [
    {
      prompt: "Create a 5x5 crossword puzzle with clues about space exploration",
      topic: "crossword",
      expectedType: "json",
      complexity: "complex"
    },
    {
      prompt: "Write a short story about a time-traveling detective",
      topic: "language",
      expectedType: "narrative",
      complexity: "complex"
    },
    {
      prompt: "Design a programming algorithm to solve the traveling salesman problem",
      topic: "programming",
      expectedType: "algorithm",
      complexity: "complex"
    }
  ],
  
  // Edge cases and challenging prompts
  challenging: [
    {
      prompt: "Generate a JSON object with nested arrays and complex data structures representing a library management system",
      topic: "programming",
      expectedType: "json",
      complexity: "challenging"
    },
    {
      prompt: "Create a mathematical proof that the square root of 2 is irrational",
      topic: "math",
      expectedType: "proof",
      complexity: "challenging"
    },
    {
      prompt: "Generate a crossword puzzle where each clue is a riddle and answers form a hidden message",
      topic: "crossword",
      expectedType: "json",
      complexity: "challenging"
    }
  ]
};

// Flatten prompts for easy iteration
const getAllPrompts = () => {
  return Object.values(testPrompts).flat();
};

// Analysis configurations for different scenarios
const analysisConfigs = {
  // Basic comparison: temperature effects
  temperatureComparison: {
    temperatures: [0.1, 0.5, 0.9, 1.3],
    samplesPerPrompt: 8,
    useRotation: false,
    duplicateThreshold: 0.75,
    targetModel: 'gpt-4'
  },
  
  // Model rotation comparison
  modelRotation: {
    temperatures: [0.7],
    samplesPerPrompt: 10,
    useRotation: true,
    duplicateThreshold: 0.75
  },
  
  // Cost-effectiveness analysis
  costEffectiveness: {
    temperatures: [0.7, 1.0],
    samplesPerPrompt: 5,
    useRotation: true,
    duplicateThreshold: 0.75,
    focusOnCost: true
  },
  
  // Accuracy deep dive
  accuracyAnalysis: {
    temperatures: [0.3, 0.7],
    samplesPerPrompt: 15,
    useRotation: true,
    duplicateThreshold: 0.85,
    focusOnAccuracy: true
  }
};

async function runComprehensiveAnalysis() {
  console.log('🚀 Starting Comprehensive LLM Analysis');
  console.log('=====================================');
  
  const analyzer = new LLMAnalysisService();
  await analyzer.initialize();
  
  const allResults = {};
  
  // Run different analysis scenarios
  for (const [scenarioName, config] of Object.entries(analysisConfigs)) {
    console.log(`\n📊 Running ${scenarioName} analysis...`);
    
    // Select appropriate prompts based on scenario
    let selectedPrompts;
    if (scenarioName === 'accuracyAnalysis') {
      selectedPrompts = [...testPrompts.simple, ...testPrompts.challenging];
    } else if (scenarioName === 'costEffectiveness') {
      selectedPrompts = testPrompts.medium;
    } else {
      selectedPrompts = getAllPrompts();
    }
    
    const results = await analyzer.runAnalysis(selectedPrompts, config);
    allResults[scenarioName] = results;
    
    // Generate scenario-specific report
    console.log(`\n📈 ${scenarioName} Results:`);
    analyzer.generateReport(results);
  }
  
  // Generate comparative analysis
  generateComparativeReport(allResults);
  
  // Export all results
  analyzer.exportResults(allResults, 'comprehensive_analysis_results.json');
  
  return allResults;
}

function generateComparativeReport(allResults) {
  console.log('\n🔍 COMPARATIVE ANALYSIS');
  console.log('=======================');
  
  // Temperature vs Uniqueness analysis
  if (allResults.temperatureComparison) {
    console.log('\n🌡️ Temperature Impact on Uniqueness:');
    const tempResults = allResults.temperatureComparison;
    
    // Group by temperature
    const tempGroups = {};
    tempResults.forEach(result => {
      if (!tempGroups[result.temperature]) {
        tempGroups[result.temperature] = [];
      }
      tempGroups[result.temperature].push(parseFloat(result.uniqueness));
    });
    
    Object.entries(tempGroups).forEach(([temp, uniquenessValues]) => {
      const avgUniqueness = uniquenessValues.reduce((a, b) => a + b, 0) / uniquenessValues.length;
      console.log(`  Temp ${temp}: ${avgUniqueness.toFixed(4)} avg uniqueness`);
    });
  }
  
  // Topic difficulty analysis
  console.log('\n📚 Topic Difficulty Analysis:');
  const topicAccuracy = {};
  const topicUniqueness = {};
  
  Object.values(allResults).flat().forEach(result => {
    if (!topicAccuracy[result.topic]) {
      topicAccuracy[result.topic] = [];
      topicUniqueness[result.topic] = [];
    }
    topicAccuracy[result.topic].push(parseFloat(result.avgValidation));
    topicUniqueness[result.topic].push(parseFloat(result.uniqueness));
  });
  
  Object.entries(topicAccuracy).forEach(([topic, accuracyValues]) => {
    const avgAccuracy = accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length;
    const avgUniqueness = topicUniqueness[topic].reduce((a, b) => a + b, 0) / topicUniqueness[topic].length;
    
    console.log(`  ${topic}: Accuracy=${avgAccuracy.toFixed(3)}, Uniqueness=${avgUniqueness.toFixed(3)}`);
  });
  
  // Model performance comparison
  if (allResults.modelRotation) {
    console.log('\n🤖 Model Performance Comparison:');
    const modelPerformance = {};
    
    allResults.modelRotation.forEach(result => {
      result.outputs.forEach(output => {
        if (!modelPerformance[output.model]) {
          modelPerformance[output.model] = {
            validationScores: [],
            costs: [],
            tokenCounts: []
          };
        }
        modelPerformance[output.model].validationScores.push(parseFloat(output.validationScore));
        modelPerformance[output.model].costs.push(parseFloat(output.cost));
        modelPerformance[output.model].tokenCounts.push(output.tokenCount);
      });
    });
    
    Object.entries(modelPerformance).forEach(([model, data]) => {
      const avgValidation = data.validationScores.reduce((a, b) => a + b, 0) / data.validationScores.length;
      const avgCost = data.costs.reduce((a, b) => a + b, 0) / data.costs.length;
      const avgTokens = data.tokenCounts.reduce((a, b) => a + b, 0) / data.tokenCounts.length;
      
      console.log(`  ${model}: Validation=${avgValidation.toFixed(3)}, Cost=${avgCost.toFixed(4)}, Tokens=${avgTokens.toFixed(0)}`);
    });
  }
  
  // Cost-effectiveness insights
  if (allResults.costEffectiveness) {
    console.log('\n💰 Cost-Effectiveness Insights:');
    const costResults = allResults.costEffectiveness;
    
    // Calculate cost per unique output
    costResults.forEach(result => {
      const costPerUnique = parseFloat(result.totalCost) / (parseFloat(result.uniqueness) * result.samplesGenerated);
      console.log(`  ${result.topic} @ temp=${result.temperature}: ${costPerUnique.toFixed(4)} per unique output`);
    });
  }
}

// Specialized analysis functions
async function analyzeMathAccuracy() {
  console.log('\n🔢 Math Accuracy Deep Dive');
  console.log('===========================');
  
  const mathPrompts = [
    {
      prompt: "Calculate: 347 * 89",
      topic: "math",
      expectedType: "calculation",
      expectedAnswer: "30883"
    },
    {
      prompt: "What is 25% of 480?",
      topic: "math",
      expectedType: "percentage",
      expectedAnswer: "120"
    },
    {
      prompt: "Convert 15 kilometers to miles",
      topic: "math",
      expectedType: "conversion",
      expectedAnswer: "9.32 miles"
    }
  ];
  
  const analyzer = new LLMAnalysisService();
  await analyzer.initialize();
  
  const results = await analyzer.runAnalysis(mathPrompts, {
    temperatures: [0.1, 0.5, 1.0],
    samplesPerPrompt: 10,
    useRotation: true,
    duplicateThreshold: 0.9
  });
  
  // Enhanced validation for math problems
  results.forEach(result => {
    console.log(`\n📊 ${result.topic} @ temp=${result.temperature}:`);
    console.log(`  Validation Score: ${result.avgValidation}`);
    console.log(`  Common Issues: ${result.outputs.map(o => o.validationIssues).flat().join(', ')}`);
  });
  
  return results;
}

async function analyzeComplexInstructions() {
  console.log('\n🧩 Complex Instructions Analysis');
  console.log('=================================');
  
  const complexPrompts = [
    {
      prompt: `Create a 5x5 crossword puzzle with the following requirements:
      1. All words must be related to "technology"
      2. Include both across and down clues
      3. Ensure proper word intersections
      4. Format as JSON with grid and clues
      5. Verify all words are real English words`,
      topic: "crossword",
      expectedType: "json",
      complexity: "very_complex"
    },
    {
      prompt: `Generate a JSON object representing a complete chess game with:
      1. Starting position
      2. 20 moves in algebraic notation
      3. Board state after each move
      4. Captured pieces tracking
      5. Check/checkmate detection`,
      topic: "chess",
      expectedType: "json",
      complexity: "very_complex"
    }
  ];
  
  const analyzer = new LLMAnalysisService();
  await analyzer.initialize();
  
  const results = await analyzer.runAnalysis(complexPrompts, {
    temperatures: [0.3, 0.7, 1.0],
    samplesPerPrompt: 8,
    useRotation: true,
    duplicateThreshold: 0.7
  });
  
  // Analyze failure modes
  results.forEach(result => {
    console.log(`\n🔍 ${result.topic} Analysis:`);
    console.log(`  Success Rate: ${(parseFloat(result.avgValidation) * 100).toFixed(1)}%`);
    console.log(`  Common Failures: ${result.outputs.filter(o => parseFloat(o.validationScore) < 0.5).length}/${result.outputs.length}`);
  });
  
  return results;
}

// Export analysis functions
module.exports = {
  testPrompts,
  analysisConfigs,
  runComprehensiveAnalysis,
  analyzeMathAccuracy,
  analyzeComplexInstructions,
  getAllPrompts
};

// Run comprehensive analysis if called directly
if (require.main === module) {
  runComprehensiveAnalysis().catch(console.error);
}