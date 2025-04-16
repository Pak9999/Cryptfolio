import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getGlobalData } from '../services/cryptoService';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = ({ cryptoData }) => {
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const data = await getGlobalData();
        setGlobalData(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching global data:', err);
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  // Format percentage change
  const formatPercentage = (num) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Determine color based on value
  const getColorClass = (value) => {
    return value > 0 ? 'positive' : value < 0 ? 'negative' : '';
  };
  
  // Filter cryptocurrencies by search term
  const filteredData = cryptoData.filter(crypto => {
    return (
      crypto.name.toLowerCase().includes(search.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="dashboard">
      <h2>Crypto Market Overview</h2>
      
      {/* Global Market Stats */}
      {!loading && globalData && (
        <div className="market-stats card">
          <div className="stats-grid">
            <div className="stat">
              <h3>Market Cap</h3>
              <p>{formatCurrency(globalData.total_market_cap.usd)}</p>
              <span className={getColorClass(globalData.market_cap_change_percentage_24h_usd)}>
                {formatPercentage(globalData.market_cap_change_percentage_24h_usd)}
              </span>
            </div>
            <div className="stat">
              <h3>24h Volume</h3>
              <p>{formatCurrency(globalData.total_volume.usd)}</p>
            </div>
            <div className="stat">
              <h3>BTC Dominance</h3>
              <p>{globalData.market_cap_percentage.btc.toFixed(1)}%</p>
            </div>
            <div className="stat">
              <h3>Active Cryptocurrencies</h3>
              <p>{formatNumber(globalData.active_cryptocurrencies)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Cryptocurrencies with Search */}
      <div className="top-cryptos">
        <div className="market-header">
          <h3>Top Cryptocurrencies</h3>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search by name or symbol..." 
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="crypto-table-container">
          <table className="crypto-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>24h %</th>
                <th>7d %</th>
                <th>Market Cap</th>
                <th>Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 10).map((crypto, index) => (
                <tr key={crypto.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`/crypto/${crypto.id}`} className="crypto-name">
                      <img src={crypto.image} alt={crypto.name} width="24" height="24" />
                      <span>{crypto.name}</span>
                      <small className="crypto-symbol-dashboard">{crypto.symbol.toUpperCase()}</small>
                    </Link>
                  </td>
                  <td>{formatCurrency(crypto.current_price)}</td>
                  <td className={getColorClass(crypto.price_change_percentage_24h)}>
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </td>
                  <td className={getColorClass(crypto.price_change_percentage_7d_in_currency)}>
                    {formatPercentage(crypto.price_change_percentage_7d_in_currency)}
                  </td>
                  <td>{formatCurrency(crypto.market_cap)}</td>
                  <td>{formatCurrency(crypto.total_volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="view-all">
          <Link to="/market" className="btn btn-outline">View All Cryptocurrencies</Link>
        </div>
      </div>

      {/* Featured Chart */}
      {cryptoData.length > 0 && (
        <div className="featured-chart card">
          <h3>Bitcoin Price (Last 7 Days)</h3>
          <Line
            data={{
              labels: cryptoData[0].sparkline_in_7d.price.map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - 7 + index / 24);
                return date.toLocaleDateString();
              }).filter((_, i) => i % 24 === 0),
              datasets: [
                {
                  label: 'BTC Price (USD)',
                  data: cryptoData[0].sparkline_in_7d.price.filter((_, i) => i % 24 === 0),
                  borderColor: '#F7931A',
                  backgroundColor: 'rgba(247, 147, 26, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${formatCurrency(context.parsed.y)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(value);
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;