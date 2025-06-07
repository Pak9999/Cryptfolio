export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { path } = event.queryStringParameters || {};
    
    if (!path) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing path parameter' })
      };
    }

    // Build the full CoinGecko API URL
    const baseUrl = 'https://api.coingecko.com/api/v3';
    let apiUrl = `${baseUrl}${path}`;
    
    // Add query parameters if they exist (excluding 'path')
    const queryParams = new URLSearchParams();
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (key !== 'path') {
          queryParams.append(key, value);
        }
      });
    }
    
    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

    console.log('Proxying request to:', apiUrl);
      // Prepare headers with API key if available
    const requestHeaders = {
      'Accept': 'application/json',
      'User-Agent': 'Cryptfolio-App/1.0'
    };    // Add CoinGecko API key if available (from environment variables)
    const apiKey = process.env.COINGECKO_API_KEY;
    console.log('API Key available:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
    if (apiKey) {
      // Use x-cg-demo-api-key for free tier or x-cg-pro-api-key for pro tier
      requestHeaders['x-cg-demo-api-key'] = apiKey;
      console.log('Added API key to request headers');
    } else {
      console.log('No API key found in environment variables');
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders
    });
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: 'API rate limit exceeded. Please try again later.',
            retryAfter: response.headers.get('Retry-After') || '60'
          })
        };
      }
      
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
