const { EmbeddingUtils } = require('../../utils/embeddings');

describe('EmbeddingUtils', () => {
  let embeddingUtils;

  beforeEach(() => {
    embeddingUtils = new EmbeddingUtils();
  });

  test('should initialize embedding model', async () => {
    await embeddingUtils.initialize();
    expect(embeddingUtils.embedder).toBeDefined();
  });

  test('should generate embeddings for text', async () => {
    const text = "This is a test sentence";
    const embedding = await embeddingUtils.generateEmbedding(text);
    
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
  });

  test('should calculate similarity between embeddings', async () => {
    const text1 = "The cat sat on the mat";
    const text2 = "A cat was sitting on a mat";
    
    const embedding1 = await embeddingUtils.generateEmbedding(text1);
    const embedding2 = await embeddingUtils.generateEmbedding(text2);
    
    const similarity = embeddingUtils.calculateSimilarity(embedding1, embedding2);
    
    expect(similarity).toBeGreaterThan(0.7); // Should be similar
  });

  test('should find duplicates above threshold', async () => {
    const texts = [
      "Hello world",
      "Hello world",
      "Goodbye world"
    ];
    
    const embeddings = await embeddingUtils.generateBatchEmbeddings(texts);
    const duplicates = embeddingUtils.findDuplicates(embeddings, 0.9);
    
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].indices).toEqual([0, 1]);
  });

  test('should cluster similar embeddings', async () => {
    const texts = [
      "Cat animal pet",
      "Dog animal pet", 
      "Car vehicle transport",
      "Truck vehicle transport"
    ];
    
    const embeddings = await embeddingUtils.generateBatchEmbeddings(texts);
    const clusters = embeddingUtils.clusterEmbeddings(embeddings, 0.6);
    
    expect(clusters).toHaveLength(2); // Should form 2 clusters
  });
});

// src/tests/unit/analysis-service.test.js
const { LLMAnalysisService } = require('../../index');

describe('LLMAnalysisService', () => {
  let service;

  beforeEach(() => {
    service = new LLMAnalysisService();
  });

  test('should initialize with default configuration', () => {
    expect(service.models).toBeDefined();
    expect(service.currentModelIndex).toBe(0);
    expect(service.costPer1K).toBeDefined();
  });

  test('should validate math content correctly', () => {
    const goodMath = "The answer is 42";
    const badMath = "The answer is undefined";
    
    const goodScore = service.validateMathContent(goodMath);
    const badScore = service.validateMathContent(badMath);
    
    expect(goodScore).toBeGreaterThan(badScore);
  });

  test('should validate language content correctly', () => {
    const goodLanguage = "This is a well-structured sentence with proper grammar.";
    const badLanguage = "word";
    
    const goodScore = service.validateLanguageContent(goodLanguage);
    const badScore = service.validateLanguageContent(badLanguage);
    
    expect(goodScore).toBeGreaterThan(badScore);
  });

  test('should calculate uniqueness correctly', () => {
    const outputs = [
      { embedding: [1, 0, 0] },
      { embedding: [0, 1, 0] },
      { embedding: [0, 0, 1] }
    ];
    
    const uniqueness = service.calculateUniqueness(outputs);
    expect(uniqueness).toBeGreaterThan(0);
  });

  test('should detect duplicates correctly', () => {
    const outputs = [
      { embedding: [1, 0, 0] },
      { embedding: [1, 0, 0] }, // Duplicate
      { embedding: [0, 1, 0] }
    ];
    
    const duplicateRate = service.calculateDuplicateRate(outputs, 0.9);
    expect(duplicateRate).toBeGreaterThan(0);
  });
});

// src/tests/integration/full-analysis.test.js
const { LLMAnalysisService } = require('../../index');

describe('Full Analysis Integration', () => {
  let service;

  beforeEach(async () => {
    service = new LLMAnalysisService();
    await service.initialize();
  });

  test('should run complete analysis on sample prompts', async () => {
    const prompts = [
      {
        prompt: "What is 2 + 2?",
        topic: "math",
        expectedType: "calculation"
      }
    ];

    const results = await service.runAnalysis(prompts, {
      temperatures: [0.7],
      samplesPerPrompt: 3,
      useRotation: false
    });

    expect(results).toHaveLength(1);
    expect(results[0].topic).toBe("math");
    expect(results[0].samplesGenerated).toBeGreaterThan(0);
    expect(results[0].uniqueness).toBeDefined();
    expect(results[0].avgValidation).toBeDefined();
  }, 30000);

  test('should generate comprehensive report', async () => {
    const prompts = [
      {
        prompt: "Write a haiku",
        topic: "language",
        expectedType: "poetry"
      }
    ];

    const results = await service.runAnalysis(prompts, {
      temperatures: [0.5, 1.0],
      samplesPerPrompt: 2,
      useRotation: false
    });

    const report = service.generateReport(results);
    
    expect(report.summaryByTopic).toBeDefined();
    expect(report.tempAnalysis).toBeDefined();
    expect(report.fullResults).toBeDefined();
  }, 30000);
});

// src/tests/fixtures/sample-data.js
const samplePrompts = [
  {
    prompt: "What is the capital of France?",
    topic: "factual",
    expectedType: "fact",
    complexity: "simple",
    expectedAnswer: "Paris"
  },
  {
    prompt: "Write a creative story about a robot",
    topic: "language",
    expectedType: "narrative",
    complexity: "medium"
  },
  {
    prompt: "Calculate the area of a circle with radius 5",
    topic: "math",
    expectedType: "calculation",
    complexity: "medium",
    expectedAnswer: "78.54"
  }
];

const sampleResults = [
  {
    topic: "math",
    temperature: 0.7,
    uniqueness: "0.3456",
    duplicateRate: "0.15",
    avgCost: "0.0045",
    avgValidation: "0.85"
  },
  {
    topic: "language",
    temperature: 0.7,
    uniqueness: "0.6789",
    duplicateRate: "0.05",
    avgCost: "0.0067",
    avgValidation: "0.92"
  }
];

module.exports = {
  samplePrompts,
  sampleResults
};