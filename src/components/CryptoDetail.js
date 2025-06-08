import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getCryptoDetails, getHistoricalData } from '../services/cryptoService';
import '../styles/CryptoDetail.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const timeframes = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
  { label: 'Max', days: 3650 }
];

const CryptoDetail = () => {
  const { id } = useParams();
  const [crypto, setCrypto] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cryptoData, marketData] = await Promise.all([
          getCryptoDetails(id),
          getHistoricalData(id, timeframes[selectedTimeframe].days)
        ]);
        setCrypto(cryptoData);
        setHistoricalData(marketData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cryptocurrency data. Please try again later.');
        setLoading(false);
        console.error('Error fetching crypto detail:', err);
      }
    };

    fetchData();
  }, [id, selectedTimeframe]);

  const handleTimeframeChange = async (index) => {
    setSelectedTimeframe(index);
    try {
      const marketData = await getHistoricalData(id, timeframes[index].days);
      setHistoricalData(marketData);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  // Format large numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format percentage change
  const formatPercentage = (num) => {
    // Handle null, undefined or NaN values
    if (num === null || num === undefined || isNaN(num)) {
      return 'N/A';
    }
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Determine color class based on value
  const getColorClass = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    return value > 0 ? 'positive' : value < 0 ? 'negative' : '';
  };

  // Prepare chart data
  const getChartData = () => {
    if (!historicalData || !historicalData.prices) return null;

    const prices = historicalData.prices;
    // Filter data points based on timeframe to avoid overcrowding the chart
    let filteredPrices = prices;
    if (prices.length > 100) {
      const interval = Math.floor(prices.length / 100);
      filteredPrices = prices.filter((_, index) => index % interval === 0);
    }

    return {
      labels: filteredPrices.map(price => {
        const date = new Date(price[0]);
        if (timeframes[selectedTimeframe].days === 1) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: 'Price (USD)',
          data: filteredPrices.map(price => price[1]),
          borderColor: '#3861FB',
          backgroundColor: 'rgba(56, 97, 251, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }
      ]
    };
  };

  return (
    <div className="crypto-detail">
      {loading ? (
        <div className="loading">Loading cryptocurrency data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : crypto ? (
        <>
          <div className="crypto-header card">
            <Link to="/" className="back-link">← Back to Dashboard</Link>
            <div className="crypto-title">
              <img src={crypto.image.large} alt={crypto.name} width="64" height="64" />
              <div>
                <h2>{crypto.name} <span className="crypto-symbol">{crypto.symbol.toUpperCase()}</span></h2>
                <div className="crypto-rank">Rank #{crypto.market_cap_rank}</div>
              </div>
            </div>
            <div className="crypto-price">
              <div className="current-price">{formatCurrency(crypto.market_data.current_price.usd)}</div>
              <div className={`price-change ${getColorClass(crypto.market_data.price_change_percentage_24h)}`}>
                {formatPercentage(crypto.market_data.price_change_percentage_24h)} (24h)
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="price-chart card">
            <div className="chart-header">
              <h3>Price Chart</h3>
              <div className="timeframe-selector">
                {timeframes.map((timeframe, index) => (
                  <button 
                    key={timeframe.label}
                    className={selectedTimeframe === index ? 'active' : ''}
                    onClick={() => handleTimeframeChange(index)}
                  >
                    {timeframe.label}
                  </button>
                ))}
              </div>
            </div>
            
            {historicalData && (
              <Line 
                data={getChartData()} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
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
            )}
          </div>

          {/* Market Data */}
          <div className="market-data card">
            <h3>Market Data</h3>
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label">Market Cap</div>
                <div className="data-value">{formatCurrency(crypto.market_data.market_cap.usd)}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Trading Volume (24h)</div>
                <div className="data-value">{formatCurrency(crypto.market_data.total_volume.usd)}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Volume / Market Cap</div>
                <div className="data-value">
                  {(crypto.market_data.total_volume.usd / crypto.market_data.market_cap.usd).toFixed(4)}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">24h Low / 24h High</div>
                <div className="data-value">
                  {formatCurrency(crypto.market_data.low_24h.usd)} / {formatCurrency(crypto.market_data.high_24h.usd)}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">Circulating Supply</div>
                <div className="data-value">{formatNumber(crypto.market_data.circulating_supply)} {crypto.symbol.toUpperCase()}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Total Supply</div>
                <div className="data-value">
                  {crypto.market_data.total_supply ? formatNumber(crypto.market_data.total_supply) : 'N/A'} {crypto.symbol.toUpperCase()}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">Max Supply</div>
                <div className="data-value">
                  {crypto.market_data.max_supply ? formatNumber(crypto.market_data.max_supply) : 'Unlimited'} {crypto.symbol.toUpperCase()}
                </div>
              </div>
              <div className="data-item">
                <div className="data-label">All-Time High</div>
                <div className="data-value">
                  {formatCurrency(crypto.market_data.ath.usd)}
                  <span className={getColorClass(crypto.market_data.ath_change_percentage.usd)}>
                    {formatPercentage(crypto.market_data.ath_change_percentage.usd)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="about-crypto card">
            <h3>About {crypto.name}</h3>
            <div className="description" dangerouslySetInnerHTML={{ __html: crypto.description.en }}></div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CryptoDetail;