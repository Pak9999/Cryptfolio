import axios from 'axios';

// Base URL for CoinGecko API
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Get top cryptocurrencies by market cap
export const getCryptoData = async (count = 50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: count,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h,7d,30d'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

// Get detailed data for a specific cryptocurrency
export const getCryptoDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/coins/${id}`, {
      params: {
        localization: false,
        tickers: true,
        market_data: true,
        community_data: true,
        developer_data: true,
        sparkline: true
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${id}:`, error);
    throw error;
  }
};

// Get historical market data for charts
export const getHistoricalData = async (id, days = 7) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${id}:`, error);
    throw error;
  }
};

// Search for cryptocurrencies
export const searchCryptos = async (query) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: {
        query: query
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error);
    throw error;
  }
};

// Get global crypto market data
export const getGlobalData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/global`);
    return response.data;
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
};