import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';
import Dashboard from './components/Dashboard';
import CryptoDetail from './components/CryptoDetail';
import MarketPage from './components/MarketPage';
import { getCryptoData, apiCache } from './services/cryptoService';
import Portfolio from './components/Portfolio';

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch data with status indicators
  const fetchCryptoData = async (force = false) => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setRefreshing(true);
      if (!loading) setLoading(true);
      
      // If force is true, clear specific cache entries before fetching
      if (force) {
        // Clear only market data cache, not all caches
        apiCache.remove('markets_50');
        apiCache.remove('global');
      }
      
      const data = await getCryptoData();
      setCryptoData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      let errorMessage = 'Failed to fetch cryptocurrency data.';
      
      // Display more specific error messages based on the error type
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Could not connect to CoinGecko API. Using cached data if available.';
      } else if (err.response) {
        if (err.response.status === 429) {
          errorMessage = 'Rate limit exceeded: CoinGecko API rate limit reached. Using cached data.';
        } else if (err.response.status >= 500) {
          errorMessage = 'CoinGecko API server error. Using cached data if available.';
        }
      }
      
      setError(errorMessage);
      console.error('Error fetching crypto data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Manual refresh function that users can trigger
  const handleManualRefresh = () => {
    fetchCryptoData(true); // Force refresh by clearing cache
  };

  useEffect(() => {
    // Initial fetch
    fetchCryptoData();
    
    // Set up periodic refresh - every 5 minutes
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1><a href="/">Cryptfolio</a></h1>
          <nav>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/market">Market</Link></li>
            </ul>
          </nav>
          <div className="refresh-container">
            <button 
              onClick={handleManualRefresh} 
              disabled={refreshing} 
              className="refresh-button"
              title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString([], {hour12: false})}` : 'Refresh data'}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            {lastUpdated && (
              <span className="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString([], {hour12: false})}
              </span>
            )}
          </div>
        </header>
        <main className="app-main">
          {loading && !cryptoData.length && <div className="loading">Loading cryptocurrency data...</div>}
          {error && <div className="error">{error}</div>}
          
          <Routes>
            <Route path="/" element={<Dashboard cryptoData={cryptoData} />} />
            <Route path="/crypto/:id" element={<CryptoDetail />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/portfolio" element={<Portfolio cryptoData={cryptoData} />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Data provided by CoinGecko API • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;