#!/usr/bin/env node

const { LLMAnalysisService } = require('../src/index');
const { performance } = require('perf_hooks');

async function runBenchmark() {
  console.log('🏃 Running Performance Benchmark...');
  
  const service = new LLMAnalysisService();
  await service.initialize();
  
  const benchmarks = [
    { name: 'Small batch', prompts: 5, samples: 3 },
    { name: 'Medium batch', prompts: 20, samples: 5 },
    { name: 'Large batch', prompts: 50, samples: 8 }
  ];
  
  const results = [];
  
  for (const benchmark of benchmarks) {
    console.log(`\n🔄 Running ${benchmark.name}...`);
    
    // Generate test prompts
    const prompts = Array.from({ length: benchmark.prompts }, (_, i) => ({
      prompt: `Test prompt ${i + 1}: What is ${i + 1} × 7?`,
      topic: 'math',
      expectedType: 'calculation'
    }));
    
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    const analysisResults = await service.runAnalysis(prompts, {
      temperatures: [0.7],
      samplesPerPrompt: benchmark.samples,
      useRotation: true
    });
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    const executionTime = endTime - startTime;
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;
    
    const benchmarkResult = {
      name: benchmark.name,
      prompts: benchmark.prompts,
      samples: benchmark.samples,
      totalSamples: benchmark.prompts * benchmark.samples,
      executionTime: Math.round(executionTime),
      memoryUsed: Math.round(memoryUsed / 1024 / 1024), // MB
      samplesPerSecond: Math.round((benchmark.prompts * benchmark.samples) / (executionTime / 1000)),
      avgTimePerSample: Math.round(executionTime / (benchmark.prompts * benchmark.samples))
    };
    
    results.push(benchmarkResult);
    
    console.log(`✅ ${benchmark.name} completed:`);
    console.log(`   Time: ${benchmarkResult.executionTime}ms`);
    console.log(`   Memory: ${benchmarkResult.memoryUsed}MB`);
    console.log(`   Throughput: ${benchmarkResult.samplesPerSecond} samples/sec`);
  }
  
  // Display summary
  console.log('\n📊 BENCHMARK SUMMARY');
  console.log('===================');
  
  results.forEach(result => {
    console.log(`${result.name}:`);
    console.log(`  Samples: ${result.totalSamples}`);
    console.log(`  Time: ${result.executionTime}ms`);
    console.log(`  Memory: ${result.memoryUsed}MB`);
    console.log(`  Throughput: ${result.samplesPerSecond} samples/sec`);
    console.log(`  Avg per sample: ${result.avgTimePerSample}ms`);
    console.log('');
  });
  
  // Performance recommendations
  console.log('💡 PERFORMANCE RECOMMENDATIONS:');
  
  const largeResult = results.find(r => r.name === 'Large batch');
  if (largeResult) {
    if (largeResult.samplesPerSecond < 10) {
      console.log('  - Consider reducing batch size for better responsiveness');
    }
    if (largeResult.memoryUsed > 500) {
      console.log('  - Memory usage is high, consider processing in smaller chunks');
    }
    if (largeResult.avgTimePerSample > 2000) {
      console.log('  - High latency per sample, check API response times');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runBenchmark().catch(console.error);
}

module.exports = { runBenchmark };