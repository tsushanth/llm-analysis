// LLM Output Analysis Service
// A service for analyzing uniqueness, quality, and cost-effectiveness of LLM outputs

const { pipeline } = require('@xenova/transformers');
const cosineSimilarity = require('cosine-similarity');
const crypto = require('crypto');

class LLMAnalysisService {
  constructor() {
    this.embedder = null;
    this.results = [];
    this.models = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-sonnet', 'gemini-pro', 'deepseek'];
    this.currentModelIndex = 0;
    
    // Cost per 1K tokens (approximate, update with current pricing)
    this.costPer1K = {
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-3.5-turbo': 0.002,
      'claude-3-sonnet': 0.015,
      'gemini-pro': 0.001,
      'deepseek': 0.0014
    };
  }

  async initialize() {
    console.log('🔄 Loading embedding model...');
    this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true
    });
    console.log('✅ Embedding model loaded');
  }

  async generateEmbedding(text) {
    if (!this.embedder) await this.initialize();
    const output = await this.embedder(text, { pooling: 'mean' });
    return output.data;
  }

  // Set API client (can be mock or real)
  setApiClient(apiClient) {
    this.apiClient = apiClient;
  }

  // API client wrapper - uses real client if available, otherwise mock
  async callLLMAPI(prompt, modelName, temperature = 0.7) {
    if (this.apiClient) {
      try {
        const result = await this.apiClient.callAPI(prompt, modelName, temperature);
        return {
          response: result.text,
          tokenCount: result.usage.total_tokens,
          cost: this.calculateCost(result.usage.total_tokens, modelName),
          usage: result.usage,
          responseTime: result.responseTime
        };
      } catch (error) {
        console.error(`❌ Real API call failed for ${modelName}: ${error.message}`);
        // Fall back to mock if real API fails
        return this.generateMockResponse(prompt, modelName, temperature);
      }
    } else {
      // Use mock implementation
      console.log(`📡 Mock API call: ${modelName} @ temp=${temperature}`);
      return this.generateMockResponse(prompt, modelName, temperature);
    }
  }

  calculateCost(tokenCount, modelName) {
    return (tokenCount / 1000) * this.costPer1K[modelName];
  }

  generateMockResponse(prompt, modelName, temperature) {
    // Enhanced mock response generation
    const baseResponse = `Mock response for: ${prompt.substring(0, 50)}...`;
    const variation = Math.random() * temperature;
    
    const styleVariations = {
      'gpt-4': `${baseResponse} [GPT-4 detailed analysis with ${variation.toFixed(2)} creativity]`,
      'gpt-3.5-turbo': `${baseResponse} [GPT-3.5 concise response with ${variation.toFixed(2)} variation]`,
      'claude-3-sonnet': `${baseResponse} [Claude thoughtful approach with ${variation.toFixed(2)} nuance]`,
      'gemini-pro': `${baseResponse} [Gemini structured response with ${variation.toFixed(2)} precision]`,
      'deepseek': `${baseResponse} [DeepSeek efficient response with ${variation.toFixed(2)} focus]`
    };
    
    const response = styleVariations[modelName] || baseResponse;
    const tokenCount = this.estimateTokenCount(prompt + response);
    
    return {
      response,
      tokenCount,
      cost: this.calculateCost(tokenCount, modelName),
      usage: {
        prompt_tokens: this.estimateTokenCount(prompt),
        completion_tokens: this.estimateTokenCount(response),
        total_tokens: tokenCount
      },
      responseTime: 1000 + Math.random() * 2000 // Mock response time
    };
  }

  generateMockResponse(prompt, style, temperature) {
    // Mock response generation with style variations
    const baseResponse = `Mock response for: ${prompt.substring(0, 50)}...`;
    const variation = Math.random() * temperature;
    
    const styleVariations = {
      'gpt4_style': `${baseResponse} [GPT-4 detailed analysis with ${variation.toFixed(2)} creativity]`,
      'gpt35_style': `${baseResponse} [GPT-3.5 concise response with ${variation.toFixed(2)} variation]`,
      'claude_style': `${baseResponse} [Claude thoughtful approach with ${variation.toFixed(2)} nuance]`,
      'gemini_style': `${baseResponse} [Gemini structured response with ${variation.toFixed(2)} precision]`,
      'deepseek_style': `${baseResponse} [DeepSeek efficient response with ${variation.toFixed(2)} focus]`
    };
    
    return styleVariations[style] || baseResponse;
  }

  estimateTokenCount(text) {
    // Rough token estimation (4 characters ≈ 1 token)
    return Math.ceil(text.length / 4);
  }

  getNextModel() {
    const model = this.models[this.currentModelIndex];
    this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length;
    return model;
  }

  calculateUniqueness(outputs) {
    if (outputs.length < 2) return 0;
    
    const embeddings = outputs.map(output => output.embedding);
    let totalDistance = 0;
    let comparisons = 0;
    
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        totalDistance += (1 - similarity); // Distance = 1 - similarity
        comparisons++;
      }
    }
    
    return totalDistance / comparisons;
  }

  calculateDuplicateRate(outputs, threshold = 0.75) {
    if (outputs.length < 2) return 0;
    
    const embeddings = outputs.map(output => output.embedding);
    let duplicates = 0;
    let comparisons = 0;
    
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        if (similarity > threshold) duplicates++;
        comparisons++;
      }
    }
    
    return duplicates / comparisons;
  }

  // Enhanced validation with detailed analysis
  validateOutput(output, expectedType, topic) {
    const validation = {
      isValid: false,
      issues: [],
      score: 0,
      details: {},
      confidence: 0
    };
    
    // Basic validation
    if (!output || output.length < 10) {
      validation.issues.push('Output too short');
      validation.confidence = 0.9;
      return validation;
    }
    
    // Topic-specific validation with detailed scoring
    switch (topic) {
      case 'math':
        validation.score = this.validateMathContent(output);
        validation.details = this.getMathValidationDetails(output);
        break;
      case 'language':
        validation.score = this.validateLanguageContent(output);
        validation.details = this.getLanguageValidationDetails(output);
        break;
      case 'crossword':
        validation.score = this.validateCrosswordContent(output);
        validation.details = this.getCrosswordValidationDetails(output);
        break;
      case 'anagram':
        validation.score = this.validateAnagramContent(output);
        validation.details = this.getAnagramValidationDetails(output);
        break;
      case 'programming':
        validation.score = this.validateProgrammingContent(output);
        validation.details = this.getProgrammingValidationDetails(output);
        break;
      default:
        validation.score = this.validateGenericContent(output);
        validation.details = { genericValidation: true };
    }
    
    validation.isValid = validation.score > 0.5;
    validation.confidence = Math.min(0.9, validation.score + 0.1);
    
    return validation;
  }

  validateMathContent(output) {
    // Enhanced math validation with specific checks
    const patterns = {
      hasNumbers: /\d/.test(output),
      hasOperators: /[\+\-\*\/\=]/.test(output),
      hasPercentage: /\d+%/.test(output),
      hasDecimal: /\d+\.\d+/.test(output),
      hasUnit: /(feet|meters|miles|km|inches|cm|dollars|\$)/.test(output),
      hasValidFormat: /^\d+(\.\d+)?$/.test(output.trim()), // For simple answers
      hasExplanation: output.length > 20 && /because|since|therefore/.test(output.toLowerCase())
    };
    
    let score = 0;
    if (patterns.hasNumbers) score += 0.3;
    if (patterns.hasOperators || patterns.hasValidFormat) score += 0.2;
    if (patterns.hasPercentage) score += 0.15;
    if (patterns.hasDecimal) score += 0.1;
    if (patterns.hasUnit) score += 0.15;
    if (patterns.hasExplanation) score += 0.1;
    
    // Penalty for obviously wrong math
    if (output.includes('undefined') || output.includes('NaN') || output.includes('error')) {
      score *= 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  getMathValidationDetails(output) {
    return {
      hasNumbers: /\d/.test(output),
      hasOperators: /[\+\-\*\/\=]/.test(output),
      hasPercentage: /\d+%/.test(output),
      hasDecimal: /\d+\.\d+/.test(output),
      hasUnit: /(feet|meters|miles|km|inches|cm|dollars|\$)/.test(output),
      length: output.length,
      containsErrors: output.includes('undefined') || output.includes('NaN') || output.includes('error')
    };
  }

  validateLanguageContent(output) {
    // Enhanced language validation with grammar and coherence checks
    const checks = {
      hasProperLength: output.length > 20,
      hasCapitalization: /[A-Z]/.test(output),
      hasPunctuation: /[.!?]/.test(output),
      hasVariedVocabulary: new Set(output.toLowerCase().split(/\s+/)).size > 5,
      hasCoherentStructure: output.split(/[.!?]/).length > 1,
      hasConnectiveWords: /(and|but|however|therefore|because|since|although)/.test(output.toLowerCase()),
      hasProperSentences: output.split(/[.!?]/).filter(s => s.trim().length > 10).length > 0
    };
    
    let score = 0;
    Object.values(checks).forEach(check => {
      if (check) score += 0.14; // Distribute across 7 checks
    });
    
    // Bonus for creativity and engagement
    if (output.length > 100) score += 0.02;
    
    return Math.min(score, 1.0);
  }

  getLanguageValidationDetails(output) {
    const words = output.toLowerCase().split(/\s+/);
    const sentences = output.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      uniqueWords: new Set(words).size,
      avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
      hasCapitalization: /[A-Z]/.test(output),
      hasPunctuation: /[.!?]/.test(output),
      readabilityScore: this.calculateReadabilityScore(output)
    };
  }

  calculateReadabilityScore(text) {
    // Simple readability heuristic
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]/).filter(s => s.trim()).length;
    const syllables = text.split(/[aeiou]/i).length - 1;
    
    if (sentences === 0) return 0;
    
    // Simplified Flesch formula
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    return Math.max(0, Math.min(1, (206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord) / 100));
  }

  validateCrosswordContent(output) {
    try {
      const parsed = JSON.parse(output);
      
      const checks = {
        hasGrid: Array.isArray(parsed.grid),
        hasClues: Array.isArray(parsed.clues) || (parsed.across && parsed.down),
        hasValidDimensions: parsed.grid && parsed.grid.length === 5 && parsed.grid.every(row => row.length === 5),
        hasWords: parsed.words && Array.isArray(parsed.words),
        hasIntersections: this.checkCrosswordIntersections(parsed.grid),
        hasValidClueFormat: this.checkClueFormat(parsed.clues || parsed.across || [])
      };
      
      let score = 0;
      Object.values(checks).forEach(check => {
        if (check) score += 0.16; // Distribute across 6 checks
      });
      
      // Bonus for complexity
      if (parsed.words && parsed.words.length >= 8) score += 0.04;
      
      return Math.min(score, 1.0);
    } catch (e) {
      return 0.1;
    }
  }

  checkCrosswordIntersections(grid) {
    if (!grid || !Array.isArray(grid)) return false;
    
    // Check for at least some intersections (not all empty)
    let intersections = 0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] && grid[i][j] !== ' ') {
          intersections++;
        }
      }
    }
    
    return intersections > 10; // Reasonable threshold
  }

  checkClueFormat(clues) {
    if (!Array.isArray(clues)) return false;
    
    return clues.every(clue => 
      clue && 
      typeof clue === 'object' && 
      clue.clue && 
      typeof clue.clue === 'string' &&
      clue.clue.length > 5
    );
  }

  getCrosswordValidationDetails(output) {
    try {
      const parsed = JSON.parse(output);
      return {
        hasValidJSON: true,
        hasGrid: Array.isArray(parsed.grid),
        gridSize: parsed.grid ? `${parsed.grid.length}x${parsed.grid[0]?.length || 0}` : 'N/A',
        wordCount: parsed.words ? parsed.words.length : 0,
        clueCount: parsed.clues ? parsed.clues.length : 0,
        structure: Object.keys(parsed).join(', ')
      };
    } catch (e) {
      return {
        hasValidJSON: false,
        error: e.message,
        rawLength: output.length
      };
    }
  }

  validateProgrammingContent(output) {
    const patterns = {
      hasCodeBlocks: /```[\s\S]*```/.test(output) || /\{\s*[\s\S]*\}/.test(output),
      hasVariables: /\b(var|let|const|int|string|float|def|function)\b/.test(output),
      hasControlStructures: /\b(if|for|while|switch|case|try|catch)\b/.test(output),
      hasValidSyntax: this.checkBasicSyntax(output),
      hasComments: /\/\/|\/\*|\#/.test(output),
      hasProperIndentation: this.checkIndentation(output)
    };
    
    let score = 0;
    Object.values(patterns).forEach(check => {
      if (check) score += 0.16;
    });
    
    return Math.min(score, 1.0);
  }

  checkBasicSyntax(code) {
    // Basic syntax validation
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
  }

  checkIndentation(code) {
    const lines = code.split('\n');
    let properlyIndented = 0;
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('    ') || line.startsWith('\t') || !line.startsWith(' ')) {
        properlyIndented++;
      }
    }
    
    return properlyIndented / lines.length > 0.7;
  }

  getProgrammingValidationDetails(output) {
    return {
      hasCodeBlocks: /```[\s\S]*```/.test(output),
      hasVariables: /\b(var|let|const|int|string|float|def|function)\b/.test(output),
      hasControlStructures: /\b(if|for|while|switch|case|try|catch)\b/.test(output),
      hasComments: /\/\/|\/\*|\#/.test(output),
      lineCount: output.split('\n').length,
      syntaxValid: this.checkBasicSyntax(output)
    };
  }

  validateAnagramContent(output) {
    const patterns = {
      hasArrow: /->|→|=>/.test(output),
      hasColon: /:/.test(output),
      hasLetters: /[a-zA-Z]/.test(output),
      hasMultipleWords: output.split(/\s+/).length > 2,
      hasValidFormat: /\w+\s*[:\->\→=>]\s*\w+/.test(output),
      hasExplanation: output.length > 20
    };
    
    let score = 0;
    Object.values(patterns).forEach(check => {
      if (check) score += 0.16;
    });
    
    return Math.min(score, 1.0);
  }

  getAnagramValidationDetails(output) {
    return {
      hasArrow: /->|→|=>/.test(output),
      hasColon: /:/.test(output),
      hasLetters: /[a-zA-Z]/.test(output),
      wordCount: output.split(/\s+/).length,
      hasValidFormat: /\w+\s*[:\->\→=>]\s*\w+/.test(output),
      length: output.length
    };
  }

  validateGenericContent(output) {
    // Generic content validation
    const hasReasonableLength = output.length > 15;
    const hasProperCapitalization = /[A-Z]/.test(output);
    
    if (!hasReasonableLength) return 0.3;
    if (!hasProperCapitalization) return 0.5;
    
    return 0.6 + Math.random() * 0.3;
  }

  // Enhanced analysis with detailed metrics and insights
  async runAnalysis(prompts, config = {}) {
    const {
      temperatures = [0.3, 0.7, 1.0],
      samplesPerPrompt = 5,
      useRotation = true,
      duplicateThreshold = 0.75,
      includeFailureAnalysis = true,
      trackResponseTimes = true
    } = config;
    
    console.log('🚀 Starting Enhanced LLM Analysis...');
    console.log(`📝 Prompts: ${prompts.length}`);
    console.log(`🌡️ Temperatures: ${temperatures.join(', ')}`);
    console.log(`🔄 Samples per prompt: ${samplesPerPrompt}`);
    console.log(`🔄 Model rotation: ${useRotation ? 'enabled' : 'disabled'}`);
    
    const results = [];
    const startTime = Date.now();
    
    for (const promptData of prompts) {
      const { prompt, topic, expectedType, complexity } = promptData;
      
      for (const temperature of temperatures) {
        console.log(`\n🔍 Analyzing: ${topic} (${complexity || 'standard'}) @ temp=${temperature}`);
        
        const outputs = [];
        const costs = [];
        const responseTimes = [];
        const failures = [];
        
        // Generate multiple outputs
        for (let i = 0; i < samplesPerPrompt; i++) {
          const modelName = useRotation ? this.getNextModel() : 'gpt-4';
          
          try {
            const startRequestTime = Date.now();
            const result = await this.callLLMAPI(prompt, modelName, temperature);
            const requestTime = Date.now() - startRequestTime;
            
            const embedding = await this.generateEmbedding(result.response);
            const validation = this.validateOutput(result.response, expectedType, topic);
            
            outputs.push({
              response: result.response,
              embedding,
              model: modelName,
              tokenCount: result.tokenCount,
              cost: result.cost,
              validation,
              responseTime: result.responseTime || requestTime,
              usage: result.usage,
              sample: i + 1
            });
            
            costs.push(result.cost);
            responseTimes.push(result.responseTime || requestTime);
            
            console.log(`  ✅ ${modelName} (${i+1}/${samplesPerPrompt}): ${validation.score.toFixed(3)} validation, ${result.cost.toFixed(4)} cost`);
            
          } catch (error) {
            console.error(`  ❌ ${modelName} (${i+1}/${samplesPerPrompt}): ${error.message}`);
            if (includeFailureAnalysis) {
              failures.push({
                model: modelName,
                error: error.message,
                sample: i + 1,
                temperature
              });
            }
          }
        }
        
        // Calculate comprehensive metrics
        const uniqueness = this.calculateUniqueness(outputs);
        const duplicateRate = this.calculateDuplicateRate(outputs, duplicateThreshold);
        const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
        const avgValidation = outputs.reduce((sum, o) => sum + o.validation.score, 0) / outputs.length;
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        
        // Advanced metrics
        const validationStdDev = this.calculateStandardDeviation(outputs.map(o => o.validation.score));
        const costEfficiency = avgValidation / avgCost;
        const modelDistribution = this.calculateModelDistribution(outputs);
        
        // Quality insights
        const qualityInsights = this.generateQualityInsights(outputs, topic, temperature);
        
        const result = {
          // Basic info
          topic,
          complexity: complexity || 'standard',
          temperature,
          modelRotation: useRotation,
          promptLength: prompt.length,
          
          // Sample metrics
          samplesGenerated: outputs.length,
          samplesAttempted: samplesPerPrompt,
          failureRate: failures.length / samplesPerPrompt,
          
          // Uniqueness metrics
          uniqueness: uniqueness.toFixed(4),
          duplicateRate: duplicateRate.toFixed(4),
          
          // Cost metrics
          avgCost: avgCost.toFixed(4),
          totalCost: costs.reduce((a, b) => a + b, 0).toFixed(4),
          costEfficiency: costEfficiency.toFixed(4),
          
          // Quality metrics
          avgValidation: avgValidation.toFixed(4),
          validationStdDev: validationStdDev.toFixed(4),
          
          // Performance metrics
          avgResponseTime: Math.round(avgResponseTime),
          totalAnalysisTime: Date.now() - startTime,
          
          // Distribution metrics
          modelDistribution,
          
          // Quality insights
          qualityInsights,
          
          // Detailed outputs
          outputs: outputs.map(o => ({
            model: o.model,
            responseLength: o.response.length,
            tokenCount: o.tokenCount,
            cost: o.cost.toFixed(4),
            validationScore: o.validation.score.toFixed(4),
            validationDetails: o.validation.details,
            validationIssues: o.validation.issues,
            responseTime: o.responseTime,
            usage: o.usage,
            sample: o.sample
          })),
          
          // Failure analysis
          failures: includeFailureAnalysis ? failures : undefined
        };
        
        results.push(result);
        
        console.log(`  📊 Summary: Uniqueness=${result.uniqueness}, Validation=${result.avgValidation}, Cost=${result.avgCost}, Efficiency=${result.costEfficiency}`);
      }
    }
    
    console.log(`\n🎯 Analysis completed in ${Date.now() - startTime}ms`);
    return results;
  }

  calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  calculateModelDistribution(outputs) {
    const distribution = {};
    outputs.forEach(output => {
      distribution[output.model] = (distribution[output.model] || 0) + 1;
    });
    
    // Convert to percentages
    const total = outputs.length;
    Object.keys(distribution).forEach(model => {
      distribution[model] = ((distribution[model] / total) * 100).toFixed(1) + '%';
    });
    
    return distribution;
  }

  generateQualityInsights(outputs, topic, temperature) {
    const insights = [];
    
    // Temperature insights
    if (temperature > 1.0) {
      insights.push('High temperature may cause inconsistent outputs');
    } else if (temperature < 0.3) {
      insights.push('Low temperature may reduce creativity');
    }
    
    // Topic-specific insights
    switch (topic) {
      case 'math':
        const mathAccuracy = outputs.reduce((sum, o) => sum + o.validation.score, 0) / outputs.length;
        if (mathAccuracy < 0.6) {
          insights.push('Mathematical accuracy below expected threshold');
        }
        break;
      case 'crossword':
        const crosswordSuccess = outputs.filter(o => o.validation.score > 0.5).length;
        if (crosswordSuccess < outputs.length * 0.3) {
          insights.push('Complex crossword generation shows high failure rate');
        }
        break;
      case 'language':
        const avgLength = outputs.reduce((sum, o) => sum + o.response.length, 0) / outputs.length;
        if (avgLength < 50) {
          insights.push('Language outputs may be too brief');
        }
        break;
    }
    
    // Model performance insights
    const modelPerformance = {};
    outputs.forEach(output => {
      if (!modelPerformance[output.model]) {
        modelPerformance[output.model] = [];
      }
      modelPerformance[output.model].push(output.validation.score);
    });
    
    let bestModel = null;
    let bestScore = 0;
    Object.entries(modelPerformance).forEach(([model, scores]) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestModel = model;
      }
    });
    
    if (bestModel) {
      insights.push(`${bestModel} showed best performance for ${topic}`);
    }
    
    return insights;
  }

  generateReport(results) {
    console.log('\n📊 ANALYSIS REPORT');
    console.log('==================');
    
    // Summary statistics
    const summaryByTopic = {};
    
    for (const result of results) {
      if (!summaryByTopic[result.topic]) {
        summaryByTopic[result.topic] = {
          uniqueness: [],
          duplicateRate: [],
          avgCost: [],
          avgValidation: []
        };
      }
      
      summaryByTopic[result.topic].uniqueness.push(parseFloat(result.uniqueness));
      summaryByTopic[result.topic].duplicateRate.push(parseFloat(result.duplicateRate));
      summaryByTopic[result.topic].avgCost.push(parseFloat(result.avgCost));
      summaryByTopic[result.topic].avgValidation.push(parseFloat(result.avgValidation));
    }
    
    // Print summary
    for (const [topic, data] of Object.entries(summaryByTopic)) {
      const avgUniqueness = data.uniqueness.reduce((a, b) => a + b, 0) / data.uniqueness.length;
      const avgDuplicateRate = data.duplicateRate.reduce((a, b) => a + b, 0) / data.duplicateRate.length;
      const avgCost = data.avgCost.reduce((a, b) => a + b, 0) / data.avgCost.length;
      const avgValidation = data.avgValidation.reduce((a, b) => a + b, 0) / data.avgValidation.length;
      
      console.log(`\n${topic.toUpperCase()}:`);
      console.log(`  Uniqueness: ${avgUniqueness.toFixed(4)}`);
      console.log(`  Duplicate Rate: ${avgDuplicateRate.toFixed(4)}`);
      console.log(`  Avg Cost: $${avgCost.toFixed(4)}`);
      console.log(`  Validation Score: ${avgValidation.toFixed(4)}`);
    }
    
    // Temperature analysis
    console.log('\n🌡️ TEMPERATURE ANALYSIS:');
    const tempAnalysis = {};
    
    for (const result of results) {
      if (!tempAnalysis[result.temperature]) {
        tempAnalysis[result.temperature] = {
          uniqueness: [],
          duplicateRate: [],
          avgValidation: []
        };
      }
      
      tempAnalysis[result.temperature].uniqueness.push(parseFloat(result.uniqueness));
      tempAnalysis[result.temperature].duplicateRate.push(parseFloat(result.duplicateRate));
      tempAnalysis[result.temperature].avgValidation.push(parseFloat(result.avgValidation));
    }
    
    for (const [temp, data] of Object.entries(tempAnalysis)) {
      const avgUniqueness = data.uniqueness.reduce((a, b) => a + b, 0) / data.uniqueness.length;
      const avgDuplicateRate = data.duplicateRate.reduce((a, b) => a + b, 0) / data.duplicateRate.length;
      const avgValidation = data.avgValidation.reduce((a, b) => a + b, 0) / data.avgValidation.length;
      
      console.log(`  Temp ${temp}: Uniqueness=${avgUniqueness.toFixed(4)}, Duplicates=${avgDuplicateRate.toFixed(4)}, Validation=${avgValidation.toFixed(4)}`);
    }
    
    return {
      summaryByTopic,
      tempAnalysis,
      fullResults: results
    };
  }

  exportResults(results, filename = 'llm_analysis_results.json') {
    const fs = require('fs');
    const exportData = {
      timestamp: new Date().toISOString(),
      analysisConfig: {
        models: this.models,
        costPer1K: this.costPer1K
      },
      results
    };
    
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`\n💾 Results exported to ${filename}`);
  }
}

// Example usage and test prompts
const testPrompts = [
  {
    prompt: "Solve this math problem: What is 15% of 240?",
    topic: "math",
    expectedType: "calculation"
  },
  {
    prompt: "Generate 5 anagrams of the word 'LISTEN'",
    topic: "anagram",
    expectedType: "word_list"
  },
  {
    prompt: "Create a 5x5 crossword puzzle with clues about animals",
    topic: "crossword",
    expectedType: "json"
  },
  {
    prompt: "Write a creative story about a robot learning to paint",
    topic: "language",
    expectedType: "narrative"
  },
  {
    prompt: "Explain the concept of machine learning in simple terms",
    topic: "language",
    expectedType: "explanation"
  }
];

// Main execution
async function main() {
  const analyzer = new LLMAnalysisService();
  await analyzer.initialize();
  
  const results = await analyzer.runAnalysis(testPrompts, {
    temperatures: [0.3, 0.7, 1.0],
    samplesPerPrompt: 5,
    useRotation: true,
    duplicateThreshold: 0.75
  });
  
  const report = analyzer.generateReport(results);
  analyzer.exportResults(results);
}

// Export for use as module
module.exports = { LLMAnalysisService, testPrompts };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}