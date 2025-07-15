// src/examples/research-prompts.js
// Research-focused prompt sets for systematic analysis

const mathPrompts = [
    {
      prompt: "Calculate: 247 × 83",
      topic: "math",
      expectedType: "calculation",
      complexity: "simple",
      expectedAnswer: "20501",
      category: "multiplication"
    },
    {
      prompt: "What is 18% of 350?",
      topic: "math",
      expectedType: "percentage",
      complexity: "simple",
      expectedAnswer: "63",
      category: "percentage"
    },
    {
      prompt: "Convert 25 kilometers to miles (1 km = 0.621371 miles)",
      topic: "math",
      expectedType: "conversion",
      complexity: "medium",
      expectedAnswer: "15.53 miles",
      category: "unit_conversion"
    },
    {
      prompt: "Find the area of a circle with radius 7.5 cm",
      topic: "math",
      expectedType: "geometry",
      complexity: "medium",
      expectedAnswer: "176.71 cm²",
      category: "geometry"
    },
    {
      prompt: "Solve for x: 3x² - 12x + 9 = 0",
      topic: "math",
      expectedType: "algebra",
      complexity: "hard",
      expectedAnswer: "x = 1 or x = 3",
      category: "quadratic_equations"
    },
    {
      prompt: "Calculate the compound interest on $5,000 at 4.5% annual rate for 3 years",
      topic: "math",
      expectedType: "financial",
      complexity: "hard",
      expectedAnswer: "$5,708.14",
      category: "compound_interest"
    }
  ];
  
  const languagePrompts = [
    {
      prompt: "Write a haiku about winter",
      topic: "language",
      expectedType: "poetry",
      complexity: "simple",
      category: "creative_writing"
    },
    {
      prompt: "Explain photosynthesis in 2-3 sentences",
      topic: "language",
      expectedType: "explanation",
      complexity: "medium",
      category: "scientific_explanation"
    },
    {
      prompt: "Write a persuasive paragraph about renewable energy",
      topic: "language",
      expectedType: "persuasive",
      complexity: "medium",
      category: "persuasive_writing"
    },
    {
      prompt: "Create a dialogue between two characters discussing time travel",
      topic: "language",
      expectedType: "dialogue",
      complexity: "hard",
      category: "creative_dialogue"
    },
    {
      prompt: "Write a technical manual entry for installing a smoke detector",
      topic: "language",
      expectedType: "technical",
      complexity: "hard",
      category: "technical_writing"
    },
    {
      prompt: "Compose a limerick about a programmer",
      topic: "language",
      expectedType: "poetry",
      complexity: "medium",
      category: "structured_poetry"
    }
  ];
  
  const complexInstructionPrompts = [
    {
      prompt: `Create a 5×5 crossword puzzle with the following requirements:
  1. Theme: "Technology"
  2. Include both across and down clues
  3. Ensure proper word intersections
  4. All words must be real English words
  5. Format as JSON with grid and clues
  6. Include difficulty rating for each clue`,
      topic: "crossword",
      expectedType: "json",
      complexity: "very_hard",
      category: "structured_generation"
    },
    {
      prompt: `Design a JSON schema for a library management system that includes:
  1. Book records with ISBN, title, author, publication year
  2. User accounts with borrowing history
  3. Transaction logs with timestamps
  4. Search functionality specifications
  5. Data validation rules
  6. Relationship mappings between entities`,
      topic: "programming",
      expectedType: "json",
      complexity: "very_hard",
      category: "system_design"
    },
    {
      prompt: `Create a complete recipe with the following specifications:
  1. Dish: "Fusion Pasta"
  2. Combines Italian and Asian flavors
  3. Serves 4 people
  4. Include prep time, cook time, and total time
  5. List ingredients with exact measurements
  6. Provide step-by-step instructions
  7. Include nutritional information estimate
  8. Suggest wine pairing`,
      topic: "cooking",
      expectedType: "structured_text",
      complexity: "hard",
      category: "detailed_instructions"
    },
    {
      prompt: `Generate a business plan outline for a sustainable food delivery service:
  1. Executive summary
  2. Market analysis with target demographics
  3. Competitive landscape
  4. Revenue model with pricing strategy
  5. Marketing and customer acquisition plan
  6. Operations and logistics
  7. Financial projections for 3 years
  8. Risk assessment and mitigation strategies`,
      topic: "business",
      expectedType: "structured_text",
      complexity: "very_hard",
      category: "business_planning"
    }
  ];
  
  const anagramPrompts = [
    {
      prompt: "Generate 5 anagrams of the word 'LISTEN'",
      topic: "anagram",
      expectedType: "word_list",
      complexity: "simple",
      category: "word_games"
    },
    {
      prompt: "Create anagrams for these words: EARTH, HEART, HATER",
      topic: "anagram",
      expectedType: "word_list",
      complexity: "medium",
      category: "word_games"
    },
    {
      prompt: "Find anagrams for 'CONVERSATION' and provide definitions",
      topic: "anagram",
      expectedType: "word_list",
      complexity: "hard",
      category: "word_games"
    }
  ];
  
  const logicPuzzles = [
    {
      prompt: "If all roses are flowers and some flowers are red, can we conclude that some roses are red?",
      topic: "logic",
      expectedType: "logical_reasoning",
      complexity: "medium",
      category: "syllogism"
    },
    {
      prompt: "Three people need to cross a bridge at night. They have one flashlight. The bridge can hold only two people at once. Alice takes 1 minute, Bob takes 2 minutes, Carol takes 5 minutes. What's the fastest way for all three to cross?",
      topic: "logic",
      expectedType: "problem_solving",
      complexity: "hard",
      category: "optimization"
    },
    {
      prompt: "You have 8 balls, one of which is heavier than the others. Using a balance scale only twice, how can you identify the heavier ball?",
      topic: "logic",
      expectedType: "problem_solving",
      complexity: "hard",
      category: "logical_deduction"
    }
  ];
  
  const codingPrompts = [
    {
      prompt: "Write a Python function to find the factorial of a number",
      topic: "programming",
      expectedType: "code",
      complexity: "simple",
      category: "basic_algorithms"
    },
    {
      prompt: "Create a JavaScript function that debounces another function",
      topic: "programming",
      expectedType: "code",
      complexity: "medium",
      category: "advanced_concepts"
    },
    {
      prompt: "Implement a binary search tree class in Python with insert, search, and delete methods",
      topic: "programming",
      expectedType: "code",
      complexity: "hard",
      category: "data_structures"
    },
    {
      prompt: "Design a React component for a todo list with add, edit, delete, and filter functionality",
      topic: "programming",
      expectedType: "code",
      complexity: "very_hard",
      category: "ui_components"
    }
  ];
  
  // Edge cases and challenging prompts
  const edgeCasePrompts = [
    {
      prompt: "Explain quantum entanglement to a 5-year-old",
      topic: "science",
      expectedType: "explanation",
      complexity: "hard",
      category: "complex_simplification"
    },
    {
      prompt: "Write a story that begins and ends with the same sentence",
      topic: "language",
      expectedType: "narrative",
      complexity: "hard",
      category: "constrained_writing"
    },
    {
      prompt: "Create a poem where each line starts with the next letter of the alphabet",
      topic: "language",
      expectedType: "poetry",
      complexity: "hard",
      category: "structured_constraints"
    },
    {
      prompt: "Design a programming language syntax for time travel operations",
      topic: "programming",
      expectedType: "conceptual",
      complexity: "very_hard",
      category: "abstract_design"
    }
  ];
  
  // Prompts designed to test specific failure modes
  const failureModePrompts = [
    {
      prompt: "Calculate the exact value of π to 50 decimal places",
      topic: "math",
      expectedType: "calculation",
      complexity: "impossible",
      category: "precision_limits",
      expectedFailure: "hallucination"
    },
    {
      prompt: "What did I have for breakfast this morning?",
      topic: "personal",
      expectedType: "factual",
      complexity: "impossible",
      category: "personal_knowledge",
      expectedFailure: "lack_of_context"
    },
    {
      prompt: "Translate this sentence to Klingon: 'The weather is nice today'",
      topic: "language",
      expectedType: "translation",
      complexity: "hard",
      category: "fictional_languages",
      expectedFailure: "limited_training_data"
    }
  ];
  
  // Prompts for testing consistency
  const consistencyPrompts = [
    {
      prompt: "What is the capital of France?",
      topic: "factual",
      expectedType: "fact",
      complexity: "trivial",
      category: "basic_facts",
      expectedConsistency: "high"
    },
    {
      prompt: "List three benefits of exercise",
      topic: "health",
      expectedType: "list",
      complexity: "simple",
      category: "general_knowledge",
      expectedConsistency: "medium"
    },
    {
      prompt: "Write a creative story about a robot",
      topic: "language",
      expectedType: "narrative",
      complexity: "medium",
      category: "creative_generation",
      expectedConsistency: "low"
    }
  ];
  
  // Comprehensive test suite
  const researchTestSuite = {
    basic: [...mathPrompts.slice(0, 2), ...languagePrompts.slice(0, 2)],
    comprehensive: [
      ...mathPrompts,
      ...languagePrompts,
      ...anagramPrompts,
      ...logicPuzzles,
      ...codingPrompts.slice(0, 2)
    ],
    complexInstructions: complexInstructionPrompts,
    edgeCases: edgeCasePrompts,
    failureModes: failureModePrompts,
    consistency: consistencyPrompts,
    full: [
      ...mathPrompts,
      ...languagePrompts,
      ...complexInstructionPrompts,
      ...anagramPrompts,
      ...logicPuzzles,
      ...codingPrompts,
      ...edgeCasePrompts
    ]
  };
  
  // Analysis configurations for different research objectives
  const researchConfigs = {
    temperatureStudy: {
      temperatures: [0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5],
      samplesPerPrompt: 10,
      useRotation: false,
      duplicateThreshold: 0.75
    },
    
    modelComparison: {
      temperatures: [0.7],
      samplesPerPrompt: 15,
      useRotation: true,
      duplicateThreshold: 0.75
    },
    
    complexityAnalysis: {
      temperatures: [0.7, 1.0],
      samplesPerPrompt: 8,
      useRotation: true,
      duplicateThreshold: 0.8
    },
    
    failureAnalysis: {
      temperatures: [0.5, 1.0],
      samplesPerPrompt: 20,
      useRotation: true,
      duplicateThreshold: 0.7,
      includeFailureAnalysis: true
    },
    
    consistencyTest: {
      temperatures: [0.3],
      samplesPerPrompt: 30,
      useRotation: true,
      duplicateThreshold: 0.85
    }
  };
  
  module.exports = {
    mathPrompts,
    languagePrompts,
    complexInstructionPrompts,
    anagramPrompts,
    logicPuzzles,
    codingPrompts,
    edgeCasePrompts,
    failureModePrompts,
    consistencyPrompts,
    researchTestSuite,
    researchConfigs
  };