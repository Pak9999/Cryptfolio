// Simple proxy server for local development
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 8888;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Proxy endpoint
app.get('/.netlify/functions/crypto-proxy', async (req, res) => {
  try {
    const { path, ...otherParams } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Build the full CoinGecko API URL
    const baseUrl = 'https://api.coingecko.com/api/v3';
    let apiUrl = `${baseUrl}${path}`;
    
    // Add query parameters if they exist (excluding 'path')
    const queryParams = new URLSearchParams();
    Object.entries(otherParams).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }    console.log('Proxying request to:', apiUrl);
    
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
        return res.status(429).json({ 
          error: 'API rate limit exceeded. Please try again later.',
          retryAfter: response.headers.get('Retry-After') || '60'
        });
      }
      
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Set cache headers
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    });
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Crypto proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Crypto proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/.netlify/functions/crypto-proxy`);
});
