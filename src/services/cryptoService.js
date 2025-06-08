import axios from 'axios';

// Determine the proxy base URL based on environment
const getProxyBaseUrl = () => {
  // Always use the deployed Netlify proxy with API key for consistency
  // This ensures both local development and production use the authenticated proxy
  return 'https://Cryptfolioproxy.netlify.app/.netlify/functions/crypto-proxy';
};

const PROXY_BASE_URL = getProxyBaseUrl();

// Data Cache configuration
const CACHE_DURATION = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes 
  DETAILS: 15 * 60 * 1000, // 15 minutes 
  HISTORICAL: 30 * 60 * 1000, // 30 minutes
  GLOBAL: 10 * 60 * 1000, // 10 minutes
};

// In-memory cache object
const cache = {
  data: {},
  
  // Set cache with expiration
  set(key, value, duration = CACHE_DURATION.DEFAULT) {
    const expiry = Date.now() + duration;
    this.data[key] = { value, expiry };
    
    // Optional: Store in localStorage for persistence across page refreshes
    try {
      localStorage.setItem(`cryptoCache_${key}`, JSON.stringify({ value, expiry }));
    } catch (e) {
      console.warn('Could not store cache in localStorage', e);
    }
  },
  
  // Get cache if it exists and is not expired
  get(key) {
    // First check memory cache
    const item = this.data[key];
    
    // If not in memory, try localStorage
    if (!item) {
      try {
        const storedItem = localStorage.getItem(`cryptoCache_${key}`);
        if (storedItem) {
          const parsedItem = JSON.parse(storedItem);
          // Load into memory cache
          this.data[key] = parsedItem;
          return this.get(key); // Re-run to check expiry
        }
      } catch (e) {
        console.warn('Could not retrieve cache from localStorage', e);
      }
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiry) {
      delete this.data[key];
      try {
        localStorage.removeItem(`cryptoCache_${key}`);
      } catch (e) {
        console.warn('Could not remove expired cache from localStorage', e);
      }
      return null;
    }
    
    return item.value;
  },
  
  // Remove item from cache
  remove(key) {
    delete this.data[key];
    try {
      localStorage.removeItem(`cryptoCache_${key}`);
    } catch (e) {
      console.warn('Could not remove cache from localStorage', e);
    }
  },
  
  // Clear all cache
  clear() {
    this.data = {};
    
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('cryptoCache_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Could not clear cache from localStorage', e);
    }
  }
};

// Helper function to make API calls with caching using proxy
const cachedApiCall = async (endpoint, params = {}, cacheKey, cacheDuration) => {
  // Create a unique cache key based on endpoint and parameters
  const fullCacheKey = cacheKey || `${endpoint}_${JSON.stringify(params)}`;
  
  // Check cache first
  const cachedData = cache.get(fullCacheKey);
  if (cachedData) {
/*     console.log(`Using cached data for ${fullCacheKey}`);
 */    return cachedData;
  }

  // Before making a new request, always save any existing data as stale backup
  const existingData = cache.get(fullCacheKey);
  if (existingData) {
    cache.set(fullCacheKey + '_stale', existingData, CACHE_DURATION.DEFAULT * 5); // Stale data kept for longer
  }
  
  try {
    // Build proxy URL with path parameter
    const proxyUrl = new URL(PROXY_BASE_URL);
    proxyUrl.searchParams.set('path', endpoint);
    
    // Add all other parameters to the proxy URL
    Object.entries(params).forEach(([key, value]) => {
      proxyUrl.searchParams.set(key, value);
    });
    
/*     console.log('Making proxy request to:', proxyUrl.toString());
 */    
    // Make API call through proxy
    const response = await axios.get(proxyUrl.toString(), { 
      timeout: 15000, // 15 second timeout (increased for proxy)
      headers: {
        'Accept': 'application/json',
      }
    });
    
    // Cache successful response
    cache.set(fullCacheKey, response.data, cacheDuration);
    
    return response.data;
  } catch (error) {
    // Handle rate limiting specifically
    if (error.response && error.response.status === 429) {
      console.warn('CoinGecko API rate limit reached! Using cached data if available');
      
      // Attempt to get any cached data
      const cachedData = cache.get(fullCacheKey + '_stale') || cache.get(fullCacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // If no cached data, throw a user-friendly error
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    // Handles various error types
    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      console.warn(`Server error ${error.response.status}: ${error.response.statusText}`);
      
      // Handle rate limiting (status code 429)
      if (error.response.status === 429) {
        console.warn('CoinGecko API rate limit reached!');
      }
      
      // Handle server errors (likely temporary)
      if (error.response.status >= 500) {
        console.warn('CoinGecko API server error - likely temporary');
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.warn('Network error - no response received from CoinGecko API');
    } else {
      // Error in setting up the request
      console.warn('Error setting up request:', error.message);
    }
    
    // Try to get stale cache as fallback
    const staleData = cache.get(fullCacheKey + '_stale');
    if (staleData) {
      console.log('Serving stale data due to API error');
      return staleData;
    }
    
    // If no stale data but we have data in localStorage for emergency fallback
    try {
      const localStorageKey = `cryptoCache_${fullCacheKey}`;
      const storedItem = localStorage.getItem(localStorageKey);
      if (storedItem) {
        const parsedItem = JSON.parse(storedItem);
        console.log('Using emergency localStorage fallback data');
        return parsedItem.value;
      }
    } catch (e) {
      // Ignore localStorage errors at this point
    }
    
    console.error(`Error fetching data for ${endpoint}:`, error);
    throw error;
  }
};

// Get top cryptocurrencies by market cap
export const getCryptoData = async (count = 50) => {
  const cacheKey = `markets_${count}`;
  const params = {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: count,
    page: 1,
    sparkline: true,
    price_change_percentage: '24h,7d,30d'
  };
  
  try {
    return await cachedApiCall('/coins/markets', params, cacheKey, CACHE_DURATION.DEFAULT);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

// Get detailed data for a specific cryptocurrency
export const getCryptoDetails = async (id) => {
  const cacheKey = `details_${id}`;
  const params = {
    localization: false,
    tickers: true,
    market_data: true,
    community_data: true,
    developer_data: true,
    sparkline: true
  };
  
  try {
    return await cachedApiCall(`/coins/${id}`, params, cacheKey, CACHE_DURATION.DETAILS);
  } catch (error) {
    console.error(`Error fetching details for ${id}:`, error);
    throw error;
  }
};

// Get historical market data for charts
export const getHistoricalData = async (id, days = 7) => {
  const cacheKey = `history_${id}_${days}`;
  const params = {
    vs_currency: 'usd',
    days: days
  };
  
  try {
    return await cachedApiCall(`/coins/${id}/market_chart`, params, cacheKey, CACHE_DURATION.HISTORICAL);
  } catch (error) {
    console.error(`Error fetching historical data for ${id}:`, error);
    throw error;
  }
};

// Search for cryptocurrencies
export const searchCryptos = async (query) => {
  const cacheKey = `search_${query}`;
  const params = {
    query: query
  };
  
  try {
    return await cachedApiCall(`/search`, params, cacheKey, CACHE_DURATION.DEFAULT);
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error);
    throw error;
  }
};

// Get global crypto market data
export const getGlobalData = async () => {
  const cacheKey = 'global';
  
  try {
    return await cachedApiCall(`/global`, {}, cacheKey, CACHE_DURATION.GLOBAL);
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
};

// Export cache for direct access if needed
export const apiCache = cache;