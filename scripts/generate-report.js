#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { LLMAnalysisService } = require('../src/index');
const { researchTestSuite, researchConfigs } = require('../src/examples/research-prompts');

async function generateComprehensiveReport() {
  console.log('📊 Generating Comprehensive Analysis Report...');
  
  const service = new LLMAnalysisService();
  await service.initialize();
  
  const reportData = {
    timestamp: new Date().toISOString(),
    analysis: {}
  };
  
  // Run different analysis types
  const analysisTypes = [
    { name: 'temperatureStudy', prompts: researchTestSuite.basic, config: researchConfigs.temperatureStudy },
    { name: 'modelComparison', prompts: researchTestSuite.comprehensive, config: researchConfigs.modelComparison },
    { name: 'complexityAnalysis', prompts: researchTestSuite.complexInstructions, config: researchConfigs.complexityAnalysis },
    { name: 'consistencyTest', prompts: researchTestSuite.consistency, config: researchConfigs.consistencyTest }
  ];
  
  for (const { name, prompts, config } of analysisTypes) {
    console.log(`\n🔄 Running ${name}...`);
    
    try {
      const results = await service.runAnalysis(prompts, config);
      reportData.analysis[name] = results;
      
      const report = service.generateReport(results);
      reportData.analysis[name + 'Report'] = report;
      
      console.log(`✅ Completed ${name}`);
    } catch (error) {
      console.error(`❌ Failed ${name}:`, error.message);
      reportData.analysis[name + 'Error'] = error.message;
    }
  }
  
  // Generate final comprehensive report
  const outputPath = path.join(__dirname, '..', 'data', 'results', 'comprehensive-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n📄 Comprehensive report generated: ${outputPath}`);
  
  // Generate summary
  generateSummary(reportData);
}

function generateSummary(reportData) {
  console.log('\n📋 ANALYSIS SUMMARY');
  console.log('==================');
  
  Object.entries(reportData.analysis).forEach(([name, data]) => {
    if (name.endsWith('Report') && data.summaryByTopic) {
      console.log(`\n${name.replace('Report', '').toUpperCase()}:`);
      
      Object.entries(data.summaryByTopic).forEach(([topic, stats]) => {
        const avgUniqueness = stats.uniqueness.reduce((a, b) => a + b, 0) / stats.uniqueness.length;
        const avgValidation = stats.avgValidation.reduce((a, b) => a + b, 0) / stats.avgValidation.length;
        const avgCost = stats.avgCost.reduce((a, b) => a + b, 0) / stats.avgCost.length;
        
        console.log(`  ${topic}: Uniqueness=${avgUniqueness.toFixed(3)}, Validation=${avgValidation.toFixed(3)}, Cost=${avgCost.toFixed(4)}`);
      });
    }
  });
}

// Run if called directly
if (require.main === module) {
  generateComprehensiveReport().catch(console.error);
}

module.exports = { generateComprehensiveReport };