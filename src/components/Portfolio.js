import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import '../styles/Portfolio.css';
import { getCryptoData } from '../services/cryptoService';
import { portfolioToCode, codeToPortfolio, isValidPortfolioCode } from '../services/portfolioCodeService';
import { savePortfolio, loadPortfolio, isStorageAvailable } from '../services/sessionService';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Color palette for pie chart
const colorPalette = [
  '#3861FB', '#16C784', '#F7931A', '#627EEA', 
  '#E84142', '#2775CA', '#474747', '#8DC351', 
  '#26A17B', '#7D95B5', '#8A92B2', '#71C3D6', 
  '#386FB3', '#FFCC00', '#7A5886', '#00AEFF',
  '#7342DC', '#00D395', '#FF4D4D', '#2196F3'
];

const Portfolio = ({ cryptoData = [] }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [formData, setFormData] = useState({ 
    crypto: '', 
    amount: '', 
    purchasePrice: '', 
    purchaseDate: new Date().toISOString().split('T')[0] 
  });
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [historicalPortfolioValues, setHistoricalPortfolioValues] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [portfolioCode, setPortfolioCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const searchResultsRef = useRef(null);
  const codeRef = useRef(null);

  // Load portfolio from local storage on component mount
  useEffect(() => {
    // Check if localStorage is available
    if (isStorageAvailable()) {
      const savedPortfolio = loadPortfolio();
      if (savedPortfolio && savedPortfolio.length > 0) {
        setPortfolio(savedPortfolio);
      }
    }
    
    // Generate mock historical portfolio values for demonstration
    generateMockHistoricalData();
  }, []);
  
  // Generate mock historical portfolio data for the chart
  const generateMockHistoricalData = () => {
    const today = new Date();
    const mockData = [];
    
    // Generate 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Base value with some randomization
      // In a real app, you'd use actual historical values
      const baseValue = 10000;
      const randomFactor = 0.8 + (Math.random() * 0.4); // Random between 0.8 and 1.2
      const trend = 1 + (i / 100); // Slight upward trend
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: baseValue * randomFactor * trend
      });
    }
    
    setHistoricalPortfolioValues(mockData);
  };

  // Fetch crypto data if not provided as props
  useEffect(() => {
    const fetchData = async () => {
      if (!cryptoData || cryptoData.length === 0) {
        try {
          setLoading(true);
          const data = await getCryptoData();
          setLoading(false);
        } catch (error) {
          console.error('Error fetching crypto data for Portfolio:', error);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [cryptoData]);

  // Filter coins based on search term
  useEffect(() => {
    if (!cryptoData || cryptoData.length === 0) return;
    
    if (searchTerm.trim() === '') {
      setFilteredCoins([]);
      return;
    }
    
    const results = cryptoData.filter(crypto => 
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
    
    setFilteredCoins(results);
  }, [searchTerm, cryptoData]);

  // Handle clicks outside the search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchResultsRef]);

  // Calculate portfolio value and change whenever portfolio or crypto data changes
  useEffect(() => {
    if (portfolio.length > 0 && cryptoData && cryptoData.length > 0) {
      let totalValue = 0;
      let totalChange = 0;
      let totalPurchaseValue = 0;

      portfolio.forEach(item => {
        const crypto = cryptoData.find(c => c.id === item.id);
        if (crypto) {
          const value = item.amount * crypto.current_price;
          const purchaseValue = item.amount * (item.purchasePrice || crypto.current_price);
          
          totalValue += value;
          totalPurchaseValue += purchaseValue;
          totalChange += value * (crypto.price_change_percentage_24h / 100);
        }
      });

      setPortfolioValue(totalValue);
      setDailyChange(totalChange);
      
      // Update the latest historical value to be the current value
      setHistoricalPortfolioValues(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].value = totalValue;
        }
        return updated;
      });
    } else {
      setPortfolioValue(0);
      setDailyChange(0);
    }
  }, [portfolio, cryptoData]);

  // Save portfolio to local storage whenever it changes
  useEffect(() => {
    if (isStorageAvailable()) {
      savePortfolio(portfolio);
    }
  }, [portfolio]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSearchFocus = () => {
    if (searchTerm.trim() !== '') {
      setShowSearchResults(true);
    }
  };

  const handleCoinSelect = (coin) => {
    setFormData({
      ...formData,
      crypto: coin.id
    });
    setSearchTerm(coin.name);
    setShowSearchResults(false);
  };

  const handleAddCrypto = (e) => {
    e.preventDefault();
    
    if (!cryptoData || cryptoData.length === 0) {
      alert('Cryptocurrency data is not available. Please try again later.');
      return;
    }
    
    if (!formData.crypto || !formData.amount || isNaN(Number(formData.amount)) || parseFloat(formData.amount) <= 0) {
      alert('Please select a cryptocurrency and enter a valid amount');
      return;
    }
    
    const selectedCrypto = cryptoData.find(c => c.id === formData.crypto);
    
    if (!selectedCrypto) {
      alert('Please select a valid cryptocurrency');
      return;
    }
    
    // Prepare new entry with purchase price and date
    const newEntry = {
      id: formData.crypto,
      name: selectedCrypto.name,
      symbol: selectedCrypto.symbol,
      amount: parseFloat(formData.amount),
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : selectedCrypto.current_price,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0]
    };
    
    // Check if crypto already in portfolio
    const existingIndex = portfolio.findIndex(item => item.id === formData.crypto);
    
    if (existingIndex !== -1) {
      // If updating existing entry, we need to calculate weighted average purchase price
      const existing = portfolio[existingIndex];
      const totalAmount = existing.amount + newEntry.amount;
      const weightedPrice = ((existing.amount * (existing.purchasePrice || 0)) + (newEntry.amount * newEntry.purchasePrice)) / totalAmount;
      
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex] = {
        ...existing,
        amount: totalAmount,
        purchasePrice: weightedPrice
      };
      
      setPortfolio(updatedPortfolio);
    } else {
      // Add new entry
      setPortfolio([...portfolio, newEntry]);
    }
    
    // Reset form
    setFormData({ 
      crypto: '', 
      amount: '', 
      purchasePrice: '', 
      purchaseDate: new Date().toISOString().split('T')[0] 
    });
    setSearchTerm('');
  };

  const handleEditItem = (id) => {
    setEditingItemId(id);
    const item = portfolio.find(i => i.id === id);
    
    if (item) {
      setFormData({
        crypto: item.id,
        amount: item.amount.toString(),
        purchasePrice: item.purchasePrice ? item.purchasePrice.toString() : '',
        purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0]
      });
      
      // Find and set the search term for the selected crypto
      const cryptoItem = cryptoData.find(c => c.id === item.id);
      if (cryptoItem) {
        setSearchTerm(cryptoItem.name);
      }
      
      // Scroll to the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateCrypto = (e) => {
    e.preventDefault();
    
    if (!editingItemId) return;
    
    const updatedPortfolio = portfolio.map(item => {
      if (item.id === editingItemId) {
        return {
          ...item,
          amount: parseFloat(formData.amount),
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : item.purchasePrice,
          purchaseDate: formData.purchaseDate || item.purchaseDate
        };
      }
      return item;
    });
    
    setPortfolio(updatedPortfolio);
    setEditingItemId(null);
    
    // Reset form
    setFormData({ 
      crypto: '', 
      amount: '', 
      purchasePrice: '', 
      purchaseDate: new Date().toISOString().split('T')[0] 
    });
    setSearchTerm('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setFormData({ 
      crypto: '', 
      amount: '', 
      purchasePrice: '', 
      purchaseDate: new Date().toISOString().split('T')[0] 
    });
    setSearchTerm('');
  };

  const handleRemoveCrypto = (id) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  // Generate portfolio code
  const handleExportPortfolio = () => {
    try {
      const code = portfolioToCode(portfolio);
      setPortfolioCode(code);
      setShowCodeModal(true);
    } catch (error) {
      alert('Failed to generate portfolio code: ' + error.message);
    }
  };

  // Copy portfolio code to clipboard
  const handleCopyCode = () => {
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand('copy');
      alert('Portfolio code copied to clipboard!');
    }
  };

  // Show import modal
  const handleShowImport = () => {
    setImportCode('');
    setImportError('');
    setShowImportModal(true);
  };

  // Import portfolio from code
  const handleImportPortfolio = () => {
    try {
      setImportError('');
      
      if (!importCode.trim()) {
        setImportError('Please enter a portfolio code');
        return;
      }
      
      if (!isValidPortfolioCode(importCode)) {
        setImportError('Invalid portfolio code format');
        return;
      }
      
      if (portfolio.length > 0) {
        const confirmImport = window.confirm(
          'Importing will replace your current portfolio. Do you want to continue?'
        );
        if (!confirmImport) return;
      }
      
      const importedPortfolio = codeToPortfolio(importCode, cryptoData);
      setPortfolio(importedPortfolio);
      setShowImportModal(false);
      alert('Portfolio successfully imported!');
    } catch (error) {
      setImportError('Error importing portfolio: ' + error.message);
    }
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get data for pie chart
  const getPieChartData = () => {
    if (!portfolio.length || !cryptoData || !cryptoData.length) return null;
    
    const data = portfolio.map(item => {
      const crypto = cryptoData.find(c => c.id === item.id);
      return crypto ? item.amount * crypto.current_price : 0;
    });
    
    return {
      labels: portfolio.map(item => item.name),
      datasets: [
        {
          data,
          backgroundColor: colorPalette.slice(0, portfolio.length),
          borderColor: colorPalette.slice(0, portfolio.length).map(c => `${c}88`),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Get data for line chart
  const getLineChartData = () => {
    if (!historicalPortfolioValues.length) return null;
    
    return {
      labels: historicalPortfolioValues.map(dataPoint => {
        const date = new Date(dataPoint.date);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Portfolio Value',
          data: historicalPortfolioValues.map(dataPoint => dataPoint.value),
          borderColor: '#3861FB',
          backgroundColor: 'rgba(56, 97, 251, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }
      ]
    };
  };

  // Calculate profit/loss percentage
  const calculateProfitLoss = (currentValue, purchasePrice, amount) => {
    if (!purchasePrice || purchasePrice <= 0) return 0;
    const initialValue = purchasePrice * amount;
    const currentTotalValue = currentValue * amount;
    return ((currentTotalValue - initialValue) / initialValue) * 100;
  };

  // Show loading when crypto data is being loaded
  if (loading) {
    return <div className="loading">Loading cryptocurrency data...</div>;
  }

  return (
    <div className="portfolio">
      <h2>My Portfolio</h2>
      
      {/* Portfolio Actions */}
      <div className="portfolio-actions card">
        <div className="action-buttons">
          <button className="btn" onClick={handleExportPortfolio}>Export Portfolio Code</button>
          <button className="btn btn-outline" onClick={handleShowImport}>Import Portfolio Code</button>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <div className="portfolio-summary card">
        <div className="summary-header">
          <h3>Portfolio Value</h3>
          <div className="portfolio-value">
            {formatCurrency(portfolioValue)}
            <span className={dailyChange > 0 ? 'positive' : 'negative'}>
              {dailyChange > 0 ? '▲' : '▼'} 
              {formatCurrency(Math.abs(dailyChange))} (24h)
            </span>
          </div>
        </div>
        
        {/* Portfolio Value Line Chart */}
        {historicalPortfolioValues.length > 0 && (
          <div className="portfolio-line-chart">
            <h3>Portfolio Value History (30 Days)</h3>
            <Line 
              data={getLineChartData()} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return formatCurrency(context.parsed.y);
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    }
                  },
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
        
        {/* Portfolio Allocation Pie Chart */}
        {portfolio.length > 0 && getPieChartData() && (
          <div className="portfolio-allocation">
            <h3>Portfolio Allocation</h3>
            <div className="portfolio-pie-chart">
              <Pie 
                data={getPieChartData()} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        padding: 10
                      }
                    } 
                  } 
                }} 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Add/Edit Crypto Form */}
      <div className="add-crypto card">
        <h3>{editingItemId ? 'Edit Cryptocurrency' : 'Add Cryptocurrency'}</h3>
        <form onSubmit={editingItemId ? handleUpdateCrypto : handleAddCrypto}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="crypto">Cryptocurrency</label>
              <div className="search-container">
                <input 
                  type="text"
                  id="search"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.trim() !== '');
                  }}
                  onFocus={handleSearchFocus}
                  disabled={!!editingItemId}
                  className="search-input"
                />
                {showSearchResults && filteredCoins.length > 0 && (
                  <div className="search-results" ref={searchResultsRef}>
                    {filteredCoins.map(coin => (
                      <div 
                        key={coin.id} 
                        className="search-result-item" 
                        onClick={() => handleCoinSelect(coin)}
                      >
                        <img src={coin.image} alt={coin.name} width="20" height="20" />
                        <span>{coin.name}</span>
                        <small>{coin.symbol.toUpperCase()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input 
                type="number" 
                id="amount" 
                name="amount" 
                value={formData.amount} 
                onChange={handleInputChange} 
                placeholder="0.00" 
                step="any"
                min="0.000001"
                required
                disabled={!cryptoData || cryptoData.length === 0}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price (USD)</label>
              <input 
                type="number" 
                id="purchasePrice" 
                name="purchasePrice" 
                value={formData.purchasePrice} 
                onChange={handleInputChange} 
                placeholder="Purchase price in USD" 
                step="any"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input 
                type="date" 
                id="purchaseDate" 
                name="purchaseDate" 
                value={formData.purchaseDate} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          
          <div className="form-actions">
            {editingItemId ? (
              <>
                <button type="submit" className="btn">Update</button>
                <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <button 
                type="submit" 
                className="btn"
                disabled={!formData.crypto || !cryptoData || cryptoData.length === 0}
              >
                Add to Portfolio
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Portfolio Holdings */}
      <div className="portfolio-holdings card">
        <h3>Holdings</h3>
        {portfolio.length === 0 ? (
          <div className="no-holdings">
            <p>You don't have any cryptocurrencies in your portfolio yet.</p>
            <p>Use the form above to add cryptocurrencies to track.</p>
          </div>
        ) : !cryptoData || cryptoData.length === 0 ? (
          <div className="error">Unable to load current cryptocurrency data. Please try refreshing the page.</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Holdings</th>
                  <th>Purchase Price</th>
                  <th>Purchase Date</th>
                  <th>Current Price</th>
                  <th>Value</th>
                  <th>Profit/Loss</th>
                  <th>24h Change</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(item => {
                  const crypto = cryptoData.find(c => c.id === item.id);
                  if (!crypto) return (
                    <tr key={item.id}>
                      <td colSpan={9}>Loading data for {item.name}...</td>
                    </tr>
                  );
                  const value = item.amount * crypto.current_price;
                  const change = crypto.price_change_percentage_24h;
                  const profitLossPercent = calculateProfitLoss(
                    crypto.current_price, 
                    item.purchasePrice, 
                    item.amount
                  );
                  
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="crypto-name">
                          <img src={crypto.image} alt={item.name} width="24" height="24" />
                          <span>{item.name}</span>
                          <small>{item.symbol.toUpperCase()}</small>
                        </div>
                      </td>
                      <td>{item.amount} {item.symbol.toUpperCase()}</td>
                      <td>{item.purchasePrice ? formatCurrency(item.purchasePrice) : '-'}</td>
                      <td>{formatDate(item.purchaseDate)}</td>
                      <td>{formatCurrency(crypto.current_price)}</td>
                      <td>{formatCurrency(value)}</td>
                      <td className={profitLossPercent > 0 ? 'positive' : profitLossPercent < 0 ? 'negative' : ''}>
                        {item.purchasePrice ? 
                          <>
                            {profitLossPercent > 0 ? '▲' : profitLossPercent < 0 ? '▼' : ''} 
                            {Math.abs(profitLossPercent).toFixed(2)}%
                          </> : '-'}

                      </td>
                      <td className={change > 0 ? 'positive' : 'negative'}>
                        {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                      </td>
                      <td className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditItem(item.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-remove"
                          onClick={() => handleRemoveCrypto(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Export Portfolio Modal */}
      {showCodeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Your Portfolio Code</h3>
              <button className="close-btn" onClick={() => setShowCodeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Copy this code to save or share your portfolio:</p>              <div className="code-container">
                <textarea 
                  ref={codeRef}
                  readOnly
                  value={portfolioCode}
                  className="portfolio-code"
                  onClick={() => codeRef.current?.select()}
                />
              </div>
              <div className="modal-info">
                <p>
                  <strong>Important:</strong> Save this code in a secure place. 
                  Anyone with this code can see your portfolio details.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={handleCopyCode}>Copy to Clipboard</button>
              <button className="btn btn-outline" onClick={() => setShowCodeModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Portfolio Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import Portfolio</h3>
              <button className="close-btn" onClick={() => setShowImportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Paste your portfolio code below:</p>
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                className="portfolio-code"
                placeholder="Paste your CFTPL-... code here"
              />
              {importError && <div className="error-message">{importError}</div>}
              <div className="modal-info">
                <p>
                  <strong>Note:</strong> Importing a portfolio will replace your current portfolio.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={handleImportPortfolio}>Import Portfolio</button>
              <button className="btn btn-outline" onClick={() => setShowImportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;