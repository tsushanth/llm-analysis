# Basic Usage Examples

## Simple Analysis

```javascript
const { LLMAnalysisService } = require('llm-output-analysis');

async function runBasicAnalysis() {
  const service = new LLMAnalysisService();
  await service.initialize();
  
  const prompts = [
    {
      prompt: "What is the capital of France?",
      topic: "factual",
      expectedType: "fact"
    }
  ];
  
  const results = await service.runAnalysis(prompts);
  console.log(results);
}
```

## Temperature Comparison

```javascript
const results = await service.runAnalysis(prompts, {
  temperatures: [0.1, 0.5, 0.9, 1.3],
  samplesPerPrompt: 8,
  useRotation: false
});

// Analyze temperature impact
results.forEach(result => {
  console.log(`Temperature ${result.temperature}: Uniqueness=${result.uniqueness}`);
});
```

## Model Comparison

```javascript
const results = await service.runAnalysis(prompts, {
  temperatures: [0.7],
  samplesPerPrompt: 10,
  useRotation: true
});

// Extract model performance
const modelStats = {};
results[0].outputs.forEach(output => {
  if (!modelStats[output.model]) {
    modelStats[output.model] = { validationScores: [], costs: [] };
  }
  modelStats[output.model].validationScores.push(parseFloat(output.validationScore));
  modelStats[output.model].costs.push(parseFloat(output.cost));
});
```

## Cost Analysis

```javascript
const { CostCalculator } = require('llm-output-analysis/utils');

const calculator = new CostCalculator();
const cost = calculator.calculateCost(1000, 500, 'gpt-4');
console.log(`Cost: ${cost.toFixed(4)}`);

// Compare costs across models
const comparison = calculator.compareModelCosts(1000, 500);
console.log(comparison);
```

## Custom Validation

```javascript
const service = new LLMAnalysisService();

// Add custom validator
service.validateRecipeContent = function(output) {
  const hasIngredients = /ingredients?:/i.test(output);
  const hasInstructions = /instructions?:|steps?:/i.test(output);
  const hasTime = /\d+\s*(min|hour|hr)/i.test(output);
  
  return {
    score: (hasIngredients + hasInstructions + hasTime) / 3,
    details: { hasIngredients, hasInstructions, hasTime }
  };
};

const prompts = [
  {
    prompt: "Create a recipe for chocolate chip cookies",
    topic: "recipe",
    expectedType: "structured_text"
  }
];
```