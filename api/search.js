export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ 
                success: false, 
                error: 'Query parameter is required' 
            });
        }

        console.log('Search API called with query:', query);

        // Initialize results array
        const results = [];

        try {
            // Use DuckDuckGo Instant Answer API for web search
            const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
            
            console.log('Calling DuckDuckGo API:', searchUrl);
            
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SearchBot/1.0)',
                },
                timeout: 10000 // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`DuckDuckGo API returned ${response.status}`);
            }

            const data = await response.json();
            console.log('DuckDuckGo response received:', Object.keys(data));

            // Add abstract if available
            if (data.Abstract) {
                results.push({
                    title: data.AbstractSource || 'DuckDuckGo',
                    snippet: data.Abstract,
                    url: data.AbstractURL || ''
                });
            }

            // Add related topics
            if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                data.RelatedTopics.slice(0, 2).forEach(topic => {
                    if (topic.Text) {
                        results.push({
                            title: topic.FirstURL ? new URL(topic.FirstURL).hostname : 'Related',
                            snippet: topic.Text,
                            url: topic.FirstURL || ''
                        });
                    }
                });
            }

            // Add answer if available
            if (data.Answer) {
                results.unshift({
                    title: 'Direct Answer',
                    snippet: data.Answer,
                    url: ''
                });
            }

        } catch (apiError) {
            console.warn('DuckDuckGo API failed:', apiError.message);
            // Continue to fallback logic below
        }

        // If no results from DuckDuckGo, provide helpful fallback responses
        if (results.length === 0) {
            const lowerQuery = query.toLowerCase();
            
            if (lowerQuery.includes('weather')) {
                results.push({
                    title: 'Weather Information',
                    snippet: 'For current weather information, please specify your location (city, state/country). For example: "What\'s the weather in New York?" or "Weather forecast for London, UK". Weather data requires location details to provide accurate forecasts and current conditions.',
                    url: ''
                });
            } else if (lowerQuery.includes('temperature')) {
                results.push({
                    title: 'Temperature Information',
                    snippet: 'To get temperature information, please specify a location. For example: "Temperature in Tokyo" or "Current temperature in Paris, France". Location is essential for accurate temperature data.',
                    url: ''
                });
            } else if (lowerQuery.includes('news') || lowerQuery.includes('current') || lowerQuery.includes('latest')) {
                results.push({
                    title: 'Current Information',
                    snippet: `For the latest information about "${query}", I recommend checking reliable news sources or official websites. My knowledge has a cutoff date and I cannot access real-time information.`,
                    url: ''
                });
            } else {
                results.push({
                    title: 'Search Results',
                    snippet: `I couldn't find specific real-time information for "${query}". For the most current and accurate information, please check reliable sources directly.`,
                    url: ''
                });
            }
        }

        console.log('Returning results:', results.length, 'items');

        return res.status(200).json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error('Search API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Search service temporarily unavailable',
            details: error.message
        });
    }
}