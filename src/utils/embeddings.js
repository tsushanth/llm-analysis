// src/utils/embeddings.js
// Embedding utilities for text similarity and clustering

const { pipeline } = require('@xenova/transformers');
const cosineSimilarity = require('cosine-similarity');

class EmbeddingUtils {
  constructor() {
    this.embedder = null;
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  async initialize() {
    if (!this.embedder) {
      console.log('🔄 Loading embedding model...');
      this.embedder = await pipeline('feature-extraction', this.modelName, {
        quantized: true
      });
      console.log('✅ Embedding model loaded successfully');
    }
  }

  async generateEmbedding(text) {
    if (!this.embedder) await this.initialize();
    
    // Check cache first
    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      this.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    // Generate embedding
    const output = await this.embedder(text, { pooling: 'mean' });
    const embedding = output.data;
    
    // Cache the result
    this.cache.set(cacheKey, embedding);
    this.cacheMisses++;
    
    return embedding;
  }

  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  calculateSimilarity(embedding1, embedding2) {
    // Ensure embeddings are the same length
    const minLength = Math.min(embedding1.length, embedding2.length);
    const vec1 = embedding1.slice(0, minLength);
    const vec2 = embedding2.slice(0, minLength);
    
    return cosineSimilarity(vec1, vec2);
  }

  calculatePairwiseSimilarities(embeddings) {
    const similarities = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = this.calculateSimilarity(embeddings[i], embeddings[j]);
        similarities.push({
          pair: [i, j],
          similarity: similarity
        });
      }
    }
    
    return similarities;
  }

  findMostSimilarPair(embeddings) {
    const similarities = this.calculatePairwiseSimilarities(embeddings);
    return similarities.reduce((max, current) => 
      current.similarity > max.similarity ? current : max
    );
  }

  findLeastSimilarPair(embeddings) {
    const similarities = this.calculatePairwiseSimilarities(embeddings);
    return similarities.reduce((min, current) => 
      current.similarity < min.similarity ? current : min
    );
  }

  calculateAverageDistance(embeddings) {
    const similarities = this.calculatePairwiseSimilarities(embeddings);
    const distances = similarities.map(s => 1 - s.similarity);
    return distances.reduce((sum, d) => sum + d, 0) / distances.length;
  }

  findOutliers(embeddings, threshold = 0.5) {
    const outliers = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      const similarities = [];
      
      for (let j = 0; j < embeddings.length; j++) {
        if (i !== j) {
          const similarity = this.calculateSimilarity(embeddings[i], embeddings[j]);
          similarities.push(similarity);
        }
      }
      
      const avgSimilarity = similarities.reduce((sum, s) => sum + s, 0) / similarities.length;
      
      if (avgSimilarity < threshold) {
        outliers.push({
          index: i,
          avgSimilarity: avgSimilarity
        });
      }
    }
    
    return outliers;
  }

  clusterEmbeddings(embeddings, threshold = 0.75) {
    const clusters = [];
    const assigned = new Set();
    
    for (let i = 0; i < embeddings.length; i++) {
      if (assigned.has(i)) continue;
      
      const cluster = [i];
      assigned.add(i);
      
      for (let j = i + 1; j < embeddings.length; j++) {
        if (assigned.has(j)) continue;
        
        const similarity = this.calculateSimilarity(embeddings[i], embeddings[j]);
        if (similarity > threshold) {
          cluster.push(j);
          assigned.add(j);
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  }

  analyzeEmbeddingDistribution(embeddings) {
    const similarities = this.calculatePairwiseSimilarities(embeddings);
    const values = similarities.map(s => s.similarity);
    
    values.sort((a, b) => a - b);
    
    const analysis = {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      q1: values[Math.floor(values.length * 0.25)],
      q3: values[Math.floor(values.length * 0.75)],
      stdDev: 0
    };
    
    // Calculate standard deviation
    const variance = values.reduce((sum, v) => sum + Math.pow(v - analysis.mean, 2), 0) / values.length;
    analysis.stdDev = Math.sqrt(variance);
    
    return analysis;
  }

  findDuplicates(embeddings, threshold = 0.9) {
    const duplicates = [];
    
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = this.calculateSimilarity(embeddings[i], embeddings[j]);
        if (similarity > threshold) {
          duplicates.push({
            indices: [i, j],
            similarity: similarity
          });
        }
      }
    }
    
    return duplicates;
  }

  hashText(text) {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses)
    };
  }

  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // Utility method for dimensionality reduction visualization
  reduceDimensionality(embeddings, targetDim = 2) {
    // Simple PCA approximation for visualization
    // In production, you might want to use a proper PCA library
    
    if (embeddings.length === 0) return [];
    
    const dimension = embeddings[0].length;
    const mean = new Array(dimension).fill(0);
    
    // Calculate mean
    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        mean[i] += embedding[i];
      }
    }
    
    for (let i = 0; i < dimension; i++) {
      mean[i] /= embeddings.length;
    }
    
    // Center the data
    const centered = embeddings.map(embedding => 
      embedding.map((val, i) => val - mean[i])
    );
    
    // For simplicity, just return first two dimensions
    return centered.map(embedding => embedding.slice(0, targetDim));
  }
}

module.exports = { EmbeddingUtils };