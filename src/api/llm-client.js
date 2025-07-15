// src/api/llm-client.js
// Real API client implementation (replace mock calls)

const axios = require('axios');

class LLMClient {
  constructor(apiKeys = {}) {
    this.apiKeys = apiKeys;
    this.requestCounts = {};
    this.errorCounts = {};
    
    // Initialize counters
    this.availableModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-sonnet', 'gemini-pro', 'deepseek'];
    this.availableModels.forEach(model => {
      this.requestCounts[model] = 0;
      this.errorCounts[model] = 0;
    });
  }

  getApiConfig(modelName) {
    switch (modelName) {
      case 'deepseek':
        return {
          url: "https://api.deepseek.com/chat/completions",
          model: "deepseek-chat"
        };
      
      case 'claude-3-sonnet':
        return {
          url: "https://api.anthropic.com/v1/messages",
          model: "claude-3-5-sonnet-20241022",
          isAnthropic: true
        };
      
        case 'gemini-pro':
            return {
                url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
                model: "gemini-1.5-flash-latest",
                isGoogle: true
            };
      
      default:
        return {
          url: "https://api.openai.com/v1/chat/completions",
          model: modelName
        };
    }
  }

  getHeaders(modelName) {
    switch (modelName) {
      case 'claude-3-sonnet':
        return {
          "x-api-key": this.apiKeys.anthropic,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01"
        };
      
      case 'gemini-pro':
        return {
          "Content-Type": "application/json"
        };
      
      case 'deepseek':
        return {
          "Authorization": `Bearer ${this.apiKeys.deepseek}`,
          "Content-Type": "application/json"
        };
      
      default: // OpenAI models
        return {
          "Authorization": `Bearer ${this.apiKeys.openai}`,
          "Content-Type": "application/json"
        };
    }
  }

  buildRequestBody(prompt, modelName, temperature = 0.7, maxTokens = 1500) {
    const apiConfig = this.getApiConfig(modelName);
    
    if (apiConfig.isAnthropic) {
      return {
        model: apiConfig.model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "user", content: prompt }]
      };
    } else if (apiConfig.isGoogle) {
      return {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };
    } else {
      return {
        model: apiConfig.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature
      };
    }
  }

  parseResponse(response, modelName) {
    const apiConfig = this.getApiConfig(modelName);
    
    if (apiConfig.isAnthropic) {
      if (!response.data?.content?.[0]?.text) {
        throw new Error('Invalid response format from Anthropic API');
      }
      return {
        text: response.data.content[0].text.trim(),
        usage: response.data.usage
      };
    } else if (apiConfig.isGoogle) {
      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Google API');
      }
      return {
        text: response.data.candidates[0].content.parts[0].text.trim(),
        usage: response.data.usageMetadata
      };
    } else {
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API');
      }
      return {
        text: response.data.choices[0].message.content.trim(),
        usage: response.data.usage
      };
    }
  }

  estimateTokenCount(text) {
    // Rough estimation: 4 characters ≈ 1 token
    return Math.ceil(text.length / 4);
  }

  async callAPI(prompt, modelName, temperature = 0.7, maxTokens = 1500) {
    const startTime = Date.now();
    this.requestCounts[modelName]++;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const apiConfig = this.getApiConfig(modelName);
        const headers = this.getHeaders(modelName);
        const requestBody = this.buildRequestBody(prompt, modelName, temperature, maxTokens);
        
        const finalUrl = modelName === 'gemini-pro' ? 
          `${apiConfig.url}?key=${this.apiKeys.google}` : 
          apiConfig.url;
        
        const response = await axios.post(finalUrl, requestBody, {
          headers,
          timeout: 60000
        });
        
        const parsedResponse = this.parseResponse(response, modelName);
        const responseTime = Date.now() - startTime;
        
        const inputTokens = this.estimateTokenCount(prompt);
        const outputTokens = this.estimateTokenCount(parsedResponse.text);
        const totalTokens = inputTokens + outputTokens;
        
        return {
          text: parsedResponse.text,
          usage: {
            prompt_tokens: inputTokens,
            completion_tokens: outputTokens,
            total_tokens: totalTokens
          },
          responseTime,
          model: modelName,
          temperature
        };
        
      } catch (error) {
        // Check if we should retry
        if ((error.code === 'ECONNABORTED' || error.response?.status === 529) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ ${modelName} error (attempt ${attempt}/${maxRetries}), retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Try again
        }
        
        // Final failure - increment error count and throw
        this.errorCounts[modelName]++;
        
        let errorType = 'unknown';
        if (error.response) {
          errorType = `http_${error.response.status}`;
        } else if (error.code === 'ECONNABORTED') {
          errorType = 'timeout';
        } else if (error.code === 'ENOTFOUND') {
          errorType = 'network';
        }
        
        throw new Error(`${modelName} API Error (${errorType}): ${error.message}`);
      }
    }
  }

  getStats() {
    return {
      requests: { ...this.requestCounts },
      errors: { ...this.errorCounts },
      errorRates: Object.keys(this.errorCounts).reduce((rates, model) => {
        rates[model] = this.requestCounts[model] > 0 ? 
          (this.errorCounts[model] / this.requestCounts[model]) : 0;
        return rates;
      }, {})
    };
  }

  resetStats() {
    this.availableModels.forEach(model => {
      this.requestCounts[model] = 0;
      this.errorCounts[model] = 0;
    });
  }
}

module.exports = { LLMClient };