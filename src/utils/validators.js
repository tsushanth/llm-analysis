// src/utils/validators.js
const validators = {
    validateMathContent(output) {
      const patterns = {
        hasNumbers: /\d/.test(output),
        hasOperators: /[\+\-\*\/\=]/.test(output),
        hasPercentage: /\d+%/.test(output),
        hasDecimal: /\d+\.\d+/.test(output),
        hasUnit: /(feet|meters|miles|km|inches|cm|dollars|\$|°|degrees)/.test(output.toLowerCase()),
        hasValidFormat: /^\d+(\.\d+)?$/.test(output.trim()),
        hasExplanation: output.length > 20 && /(because|since|therefore|step)/i.test(output)
      };
      
      let score = 0;
      if (patterns.hasNumbers) score += 0.3;
      if (patterns.hasOperators || patterns.hasValidFormat) score += 0.2;
      if (patterns.hasPercentage) score += 0.15;
      if (patterns.hasDecimal) score += 0.1;
      if (patterns.hasUnit) score += 0.15;
      if (patterns.hasExplanation) score += 0.1;
      
      // Penalty for errors
      if (/undefined|NaN|error|invalid/i.test(output)) {
        score *= 0.3;
      }
      
      return Math.min(score, 1.0);
    },
    
    validateLanguageContent(output) {
      const checks = {
        hasProperLength: output.length > 20,
        hasCapitalization: /[A-Z]/.test(output),
        hasPunctuation: /[.!?]/.test(output),
        hasVariedVocabulary: new Set(output.toLowerCase().split(/\s+/)).size > 5,
        hasCoherentStructure: output.split(/[.!?]/).filter(s => s.trim()).length > 0,
        hasConnectiveWords: /(and|but|however|therefore|because|since|although)/i.test(output),
        hasProperSentences: output.split(/[.!?]/).filter(s => s.trim().length > 10).length > 0
      };
      
      let score = 0;
      Object.values(checks).forEach(check => {
        if (check) score += 0.14;
      });
      
      // Bonus for length and creativity
      if (output.length > 100) score += 0.02;
      
      return Math.min(score, 1.0);
    },
    
    validateCrosswordContent(output) {
      try {
        const parsed = JSON.parse(output);
        
        const checks = {
          hasGrid: Array.isArray(parsed.grid),
          hasClues: Array.isArray(parsed.clues) || (parsed.across && parsed.down),
    validateCrosswordContent(output) {
      try {
        const parsed = JSON.parse(output);
        
        const checks = {
          hasGrid: Array.isArray(parsed.grid),
          hasClues: Array.isArray(parsed.clues) || (parsed.across && parsed.down),
          hasValidDimensions: parsed.grid && parsed.grid.length >= 3 && parsed.grid.every(row => Array.isArray(row)),
          hasWords: parsed.words && Array.isArray(parsed.words),
          hasIntersections: this.checkCrosswordIntersections(parsed.grid),
          hasValidClueFormat: this.checkClueFormat(parsed.clues || parsed.across || [])
        };
        
        let score = 0;
        Object.values(checks).forEach(check => {
          if (check) score += 0.16;
        });
        
        return Math.min(score, 1.0);
      } catch (e) {
        return 0.1;
      }
    },
    
    checkCrosswordIntersections(grid) {
      if (!grid || !Array.isArray(grid)) return false;
      
      let filledCells = 0;
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (grid[i][j] && grid[i][j] !== ' ' && grid[i][j] !== '.') {
            filledCells++;
          }
        }
      }
      
      return filledCells > Math.floor(grid.length * grid[0].length * 0.3);
    },
    
    checkClueFormat(clues) {
      if (!Array.isArray(clues)) return false;
      
      return clues.every(clue => 
        clue && 
        typeof clue === 'object' && 
        clue.clue && 
        typeof clue.clue === 'string' &&
        clue.clue.length > 5
      );
    },
    
    validateProgrammingContent(output) {
      const patterns = {
        hasCodeBlocks: /```[\s\S]*```|{[\s\S]*}/.test(output),
        hasVariables: /\b(var|let|const|int|string|float|def|function|class)\b/.test(output),
        hasControlStructures: /\b(if|for|while|switch|case|try|catch|return)\b/.test(output),
        hasValidSyntax: this.checkBasicSyntax(output),
        hasComments: /\/\/|\/\*|\#|'''|"""/.test(output),
        hasProperIndentation: this.checkIndentation(output)
      };
      
      let score = 0;
      Object.values(patterns).forEach(check => {
        if (check) score += 0.16;
      });
      
      return Math.min(score, 1.0);
    },
    
    checkBasicSyntax(code) {
      const brackets = code.match(/[\[\]{}()]/g) || [];
      const stack = [];
      const pairs = { '[': ']', '{': '}', '(': ')' };
      
      for (const bracket of brackets) {
        if (bracket in pairs) {
          stack.push(bracket);
        } else if (Object.values(pairs).includes(bracket)) {
          const last = stack.pop();
          if (pairs[last] !== bracket) return false;
        }
      }
      
      return stack.length === 0;
    },
    
    checkIndentation(code) {
      const lines = code.split('\n').filter(line => line.trim());
      if (lines.length === 0) return true;
      
      let properlyIndented = 0;
      for (const line of lines) {
        if (line.startsWith('    ') || line.startsWith('\t') || !line.startsWith(' ')) {
          properlyIndented++;
        }
      }
      
      return properlyIndented / lines.length > 0.6;
    },
    
    validateAnagramContent(output) {
      const patterns = {
        hasArrow: /->|→|=>|:/.test(output),
        hasLetters: /[a-zA-Z]/.test(output),
        hasMultipleWords: output.split(/\s+/).filter(w => w.length > 1).length > 1,
        hasValidFormat: /\w+\s*[:\->\→=>]\s*\w+/.test(output),
        hasExplanation: output.length > 20,
        hasCorrectLength: this.checkAnagramLength(output)
      };
      
      let score = 0;
      Object.values(patterns).forEach(check => {
        if (check) score += 0.16;
      });
      
      return Math.min(score, 1.0);
    },
    
    checkAnagramLength(output) {
      const match = output.match(/(\w+)\s*[:\->\→=>]\s*(\w+)/);
      if (!match) return false;
      
      const [, word1, word2] = match;
      return word1.length === word2.length;
    }
  };
  
  module.exports = { validators };
  
  // src/utils/cost-calculator.js
  class CostCalculator {
    constructor() {
      this.pricingTiers = {
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 },
        'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
        'claude-3-sonnet': { input: 0.015, output: 0.075 },
        'gemini-pro': { input: 0.00125, output: 0.00375 },
        'deepseek': { input: 0.0014, output: 0.0028 }
      };
      
      this.costHistory = [];
    }
    
    calculateCost(inputTokens, outputTokens, model) {
      const pricing = this.pricingTiers[model];
      if (!pricing) return 0;
      
      const inputCost = (inputTokens / 1000) * pricing.input;
      const outputCost = (outputTokens / 1000) * pricing.output;
      const totalCost = inputCost + outputCost;
      
      // Track cost history
      this.costHistory.push({
        model,
        inputTokens,
        outputTokens,
        inputCost,
        outputCost,
        totalCost,
        timestamp: new Date().toISOString()
      });
      
      return totalCost;
    }
    
    getCostEfficiencyScore(cost, validationScore, uniquenessScore) {
      if (cost === 0) return 0;
      return (validationScore + uniquenessScore) / cost;
    }
    
    getTotalCosts() {
      const totals = {};
      
      for (const entry of this.costHistory) {
        if (!totals[entry.model]) {
          totals[entry.model] = {
            totalCost: 0,
            totalTokens: 0,
            requestCount: 0
          };
        }
        
        totals[entry.model].totalCost += entry.totalCost;
        totals[entry.model].totalTokens += entry.inputTokens + entry.outputTokens;
        totals[entry.model].requestCount++;
      }
      
      return totals;
    }
    
    getCostBreakdown() {
      const breakdown = {};
      
      for (const entry of this.costHistory) {
        if (!breakdown[entry.model]) {
          breakdown[entry.model] = {
            inputCost: 0,
            outputCost: 0,
            totalCost: 0
          };
        }
        
        breakdown[entry.model].inputCost += entry.inputCost;
        breakdown[entry.model].outputCost += entry.outputCost;
        breakdown[entry.model].totalCost += entry.totalCost;
      }
      
      return breakdown;
    }
    
    getAverageCostPerToken(model) {
      const modelHistory = this.costHistory.filter(entry => entry.model === model);
      if (modelHistory.length === 0) return 0;
      
      const totalCost = modelHistory.reduce((sum, entry) => sum + entry.totalCost, 0);
      const totalTokens = modelHistory.reduce((sum, entry) => sum + entry.inputTokens + entry.outputTokens, 0);
      
      return totalTokens > 0 ? totalCost / totalTokens : 0;
    }
    
    predictCost(inputTokens, outputTokens, model) {
      const pricing = this.pricingTiers[model];
      if (!pricing) return null;
      
      return {
        inputCost: (inputTokens / 1000) * pricing.input,
        outputCost: (outputTokens / 1000) * pricing.output,
        totalCost: (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output,
        model: model
      };
    }
    
    compareModelCosts(inputTokens, outputTokens) {
      const comparisons = {};
      
      for (const [model, pricing] of Object.entries(this.pricingTiers)) {
        comparisons[model] = this.predictCost(inputTokens, outputTokens, model);
      }
      
      return comparisons;
    }
    
    getCostStats() {
      if (this.costHistory.length === 0) return null;
      
      const costs = this.costHistory.map(entry => entry.totalCost);
      costs.sort((a, b) => a - b);
      
      return {
        totalRequests: this.costHistory.length,
        totalCost: costs.reduce((sum, cost) => sum + cost, 0),
        averageCost: costs.reduce((sum, cost) => sum + cost, 0) / costs.length,
        medianCost: costs[Math.floor(costs.length / 2)],
        minCost: costs[0],
        maxCost: costs[costs.length - 1]
      };
    }
    
    clearHistory() {
      this.costHistory = [];
    }
  }
  
  module.exports = { CostCalculator };
  
  // src/examples/simple-usage.js
  const { LLMAnalysisService } = require('../index');
  
  async function simpleExample() {
    console.log('🚀 Simple LLM Analysis Example');
    console.log('==============================');
    
    const analyzer = new LLMAnalysisService();
    await analyzer.initialize();
    
    const prompts = [
      {
        prompt: "What is 25% of 80?",
        topic: "math",
        expectedType: "calculation"
      },
      {
        prompt: "Write a haiku about coding",
        topic: "language", 
        expectedType: "poetry"
      }
    ];
    
    console.log('Running analysis...');
    const results = await analyzer.runAnalysis(prompts, {
      temperatures: [0.3, 0.7],
      samplesPerPrompt: 3,
      useRotation: false
    });
    
    console.log('\n📊 Results Summary:');
    results.forEach(result => {
      console.log(`${result.topic} @ temp=${result.temperature}:`);
      console.log(`  Uniqueness: ${result.uniqueness}`);
      console.log(`  Validation: ${result.avgValidation}`);
      console.log(`  Cost: ${result.avgCost}`);
    });
    
    // Generate and display report
    console.log('\n📈 Detailed Report:');
    const report = analyzer.generateReport(results);
    console.log(JSON.stringify(report, null, 2));
    
    // Export results
    analyzer.exportResults(results, 'simple-analysis-results.json');
    console.log('\n💾 Results exported to simple-analysis-results.json');
  }
  
  async function temperatureComparisonExample() {
    console.log('🌡️ Temperature Comparison Example');
    console.log('==================================');
    
    const analyzer = new LLMAnalysisService();
    await analyzer.initialize();
    
    const prompt = {
      prompt: "Write a creative story about a time-traveling scientist",
      topic: "language",
      expectedType: "narrative"
    };
    
    const temperatures = [0.1, 0.5, 0.8, 1.2];
    
    console.log(`Testing temperatures: ${temperatures.join(', ')}`);
    
    const results = await analyzer.runAnalysis([prompt], {
      temperatures,
      samplesPerPrompt: 5,
      useRotation: false
    });
    
    console.log('\n📊 Temperature Impact on Uniqueness:');
    results.forEach(result => {
      console.log(`Temp ${result.temperature}: Uniqueness=${result.uniqueness}, Validation=${result.avgValidation}`);
    });
    
    // Find optimal temperature
    const bestTemp = results.reduce((best, current) => {
      const currentScore = parseFloat(current.uniqueness) + parseFloat(current.avgValidation);
      const bestScore = parseFloat(best.uniqueness) + parseFloat(best.avgValidation);
      return currentScore > bestScore ? current : best;
    });
    
    console.log(`\n🎯 Optimal temperature: ${bestTemp.temperature} (Score: ${(parseFloat(bestTemp.uniqueness) + parseFloat(bestTemp.avgValidation)).toFixed(3)})`);
  }
  
  async function modelComparisonExample() {
    console.log('🤖 Model Comparison Example');
    console.log('============================');
    
    const analyzer = new LLMAnalysisService();
    await analyzer.initialize();
    
    const prompts = [
      {
        prompt: "Explain quantum computing in simple terms",
        topic: "science",
        expectedType: "explanation"
      }
    ];
    
    const results = await analyzer.runAnalysis(prompts, {
      temperatures: [0.7],
      samplesPerPrompt: 10,
      useRotation: true
    });
    
    // Analyze model performance
    const modelStats = {};
    results[0].outputs.forEach(output => {
      if (!modelStats[output.model]) {
        modelStats[output.model] = {
          count: 0,
          totalValidation: 0,
          totalCost: 0,
          avgResponseTime: 0
        };
      }
      
      modelStats[output.model].count++;
      modelStats[output.model].totalValidation += parseFloat(output.validationScore);
      modelStats[output.model].totalCost += parseFloat(output.cost);
      modelStats[output.model].avgResponseTime += output.responseTime || 0;
    });
    
    console.log('\n📊 Model Performance Comparison:');
    Object.entries(modelStats).forEach(([model, stats]) => {
      const avgValidation = stats.totalValidation / stats.count;
      const avgCost = stats.totalCost / stats.count;
      const avgTime = stats.avgResponseTime / stats.count;
      
      console.log(`${model}:`);
      console.log(`  Samples: ${stats.count}`);
      console.log(`  Avg Validation: ${avgValidation.toFixed(3)}`);
      console.log(`  Avg Cost: ${avgCost.toFixed(4)}`);
      console.log(`  Avg Response Time: ${avgTime.toFixed(0)}ms`);
      console.log(`  Cost Efficiency: ${(avgValidation / avgCost).toFixed(1)}`);
      console.log('');
    });
  }
  
  module.exports = {
    simpleExample,
    temperatureComparisonExample,
    modelComparisonExample
  };
  
  // Run examples if called directly
  if (require.main === module) {
    const example = process.argv[2] || 'simple';
    
    switch (example) {
      case 'simple':
        simpleExample().catch(console.error);
        break;
      case 'temperature':
        temperatureComparisonExample().catch(console.error);
        break;
      case 'models':
        modelComparisonExample().catch(console.error);
        break;
      default:
        console.log('Available examples: simple, temperature, models');
    }
  }