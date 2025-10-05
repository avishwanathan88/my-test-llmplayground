const axios = require('axios');

// API Key mapping for different providers - REMOVED for security
// Users must provide their own API keys
const API_KEYS = {
    // Server-side keys removed to prevent personal key usage
    // All keys must be provided by users
};

// API endpoints for different providers
const API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    google: 'https://generativelanguage.googleapis.com/v1beta/models',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    huggingface: 'https://api-inference.huggingface.co/models'
};

// Secure API key retrieval function
function getAPIKey(provider, userApiKeys = null) {
    // User API keys are now mandatory
    if (!userApiKeys || !userApiKeys[provider]) {
        throw new Error(`API key required for provider: ${provider}. Please provide your own API key in the settings.`);
    }
    
    return userApiKeys[provider];
}

// Validate provider and model
function validateRequest(provider, model) {
    const validProviders = ['openai', 'anthropic', 'google', 'groq', 'huggingface'];
    
    if (!validProviders.includes(provider)) {
        throw new Error(`Invalid provider: ${provider}`);
    }
    
    if (!model || typeof model !== 'string') {
        throw new Error('Model is required and must be a string');
    }
}

// Format request based on provider
function formatRequest(provider, model, message, parameters) {
    const { temperature = 0.7, maxTokens, presencePenalty = 0, frequencyPenalty = 0 } = parameters;
    
    switch (provider) {
        case 'openai':
        case 'groq':
            return {
                model: model,
                messages: [{ role: 'user', content: message }],
                temperature: temperature,
                max_tokens: maxTokens || 1024,
                presence_penalty: presencePenalty,
                frequency_penalty: frequencyPenalty
            };
            
        case 'anthropic':
            return {
                model: model,
                max_tokens: maxTokens || 1024,
                temperature: temperature,
                messages: [{ role: 'user', content: message }]
            };
            
        case 'google':
            // Google API requires a minimum of 2 tokens
            const googleMaxTokens = Math.max(maxTokens || 1024, 2);
            return {
                contents: [{ parts: [{ text: message }] }],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: googleMaxTokens,
                    topP: 1 - presencePenalty,
                    topK: Math.max(1, Math.round(40 * (1 - frequencyPenalty)))
                }
            };
            
        default:
            throw new Error(`Request formatting not implemented for provider: ${provider}`);
    }
}

// Get headers for API requests
function getHeaders(provider, apiKey) {
    switch (provider) {
        case 'openai':
        case 'groq':
            return {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
            
        case 'anthropic':
            return {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            };
            
        case 'google':
            return {
                'Content-Type': 'application/json'
            };
            
        default:
            return {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        console.log('Received API request:', req.body);
        
        const { provider, model, message, parameters = {}, userApiKeys } = req.body;
        
        // Validate request
        validateRequest(provider, model);
        
        // Get API key for the provider (user keys take priority)
        const apiKey = getAPIKey(provider, userApiKeys);
        
        // Format request based on provider
        const requestData = formatRequest(provider, model, message, parameters);
        
        // Get appropriate headers
        const headers = getHeaders(provider, apiKey);
        
        // Construct API URL
        let apiUrl = API_ENDPOINTS[provider];
        if (provider === 'google') {
            apiUrl = `${apiUrl}/${model}:generateContent?key=${apiKey}`;
        }
        
        console.log(`Making API call to ${provider} with model ${model}`);
        console.log('Request data:', JSON.stringify(requestData, null, 2));
        
        // Make API call
        const response = await axios.post(apiUrl, requestData, { headers });
        
        console.log('API response received:', response.status);
        
        // Extract response based on provider
        let responseText = '';
        switch (provider) {
            case 'openai':
            case 'groq':
                responseText = response.data.choices[0].message.content;
                break;
                
            case 'anthropic':
                responseText = response.data.content[0].text;
                break;
                
            case 'google':
                // Handle Google API response structure safely
                if (response.data.candidates && response.data.candidates[0]) {
                    const candidate = response.data.candidates[0];
                    
                    // Try to extract content first, regardless of finish reason
                    let content = '';
                    if (candidate.content && 
                        candidate.content.parts && 
                        candidate.content.parts[0] && 
                        candidate.content.parts[0].text) {
                        content = candidate.content.parts[0].text;
                    }
                    
                    // If we have content, use it (even if truncated)
                    if (content) {
                        responseText = content;
                        // Optionally add a note if truncated
                        if (candidate.finishReason === 'MAX_TOKENS') {
                            responseText += '\n\n[Note: Response was truncated due to token limit]';
                        }
                    } else {
                        // Only show error messages if there's truly no content
                        if (candidate.finishReason === 'SAFETY') {
                            responseText = 'Response was blocked due to safety filters.';
                        } else if (candidate.finishReason === 'MAX_TOKENS') {
                            responseText = 'Response was truncated due to very low token limit. Please increase max tokens.';
                        } else if (candidate.finishReason === 'STOP') {
                            responseText = 'Response completed but no content was generated.';
                        } else {
                            responseText = `Response generation stopped: ${candidate.finishReason || 'Unknown reason'}`;
                        }
                        console.log('Google API response structure:', JSON.stringify(response.data, null, 2));
                    }
                } else {
                    // Handle case where no candidates are returned
                    responseText = 'No response content available from Google API';
                    console.log('Google API response structure:', JSON.stringify(response.data, null, 2));
                }
                break;
                
            default:
                responseText = 'Response format not implemented for this provider';
        }
        
        console.log('Sending response back to client');
        
        res.json({
            success: true,
            response: responseText,
            provider: provider,
            model: model
        });
        
    } catch (error) {
        console.error('API Error:', error.message);
        
        // Log more detailed error information for debugging
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        
        // Handle specific error types
        if (error.response) {
            // API responded with error status
            let errorMessage = error.response.data?.error?.message || error.message;
            
            // Handle Google API specific errors
            if (req.body.provider === 'google' && error.response.status === 400) {
                const errorData = error.response.data;
                if (errorData?.error?.message?.includes('maxOutputTokens')) {
                    errorMessage = 'Max tokens value is too low for Google API. Please set it to at least 2 tokens.';
                } else if (errorData?.error?.message) {
                    errorMessage = `Google API Error: ${errorData.error.message}`;
                }
            }
            
            res.status(error.response.status).json({
                success: false,
                error: errorMessage,
                provider: req.body.provider
            });
        } else if (error.message.includes('API key not found')) {
            // Missing API key
            res.status(401).json({
                success: false,
                error: `API key not configured for ${req.body.provider}`,
                provider: req.body.provider
            });
        } else {
            // Other errors
            res.status(500).json({
                success: false,
                error: error.message,
                provider: req.body.provider
            });
        }
    }
};