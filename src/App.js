import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';
import Dashboard from './components/Dashboard';


function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        const data = await getCryptoData();
        setCryptoData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cryptocurrency data. Please try again later.');
        setLoading(false);
        console.error('Error fetching crypto data:', err);
      }
    };

    fetchCryptoData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchCryptoData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Cryptfolio</h1>
          <nav>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
            </ul>
          </nav>
        </header>
        <main className="app-main">
          {loading && <div className="loading">Loading cryptocurrency data...</div>}
          {error && <div className="error">{error}</div>}
          
          <Routes>
            <Route path="/" element={<Dashboard cryptoData={cryptoData} />} />
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