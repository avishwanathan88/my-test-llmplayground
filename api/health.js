module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    // Check which API keys are available
    const apiKeys = {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        huggingface: !!process.env.HF_TOKEN
    };
    
    const availableProviders = Object.keys(apiKeys).filter(key => apiKeys[key]);
    const totalKeys = availableProviders.length;
    
    res.json({
        status: 'healthy',
        providers: availableProviders,
        apiKeysLoaded: `${totalKeys}/5`,
        timestamp: new Date().toISOString()
    });
};