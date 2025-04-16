import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCryptoData } from '../services/cryptoService';

const MarketPage = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap', direction: 'descending' });
  
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchAllCryptoData = async () => {
      try {
        setLoading(true);
        const data = await getCryptoData(250); // Fetch more cryptocurrencies
        setCryptoData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch cryptocurrency data. Please try again later.');
        setLoading(false);
        console.error('Error fetching crypto data:', err);
      }
    };

    fetchAllCryptoData();
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
    // Handle null, undefined or NaN values
    if (num === null || num === undefined || isNaN(num)) {
      return 'N/A';
    }
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Determine color based on value
  const getColorClass = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    return value > 0 ? 'positive' : value < 0 ? 'negative' : '';
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter cryptocurrencies by search term
  const filteredData = cryptoData.filter(crypto => {
    return (
      crypto.name.toLowerCase().includes(search.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Sort the data based on sort config
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
      return 0;
    }
    
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
    
    if (sortConfig.direction === 'ascending') {
      return a[sortConfig.key] - b[sortConfig.key];
    } else {
      return b[sortConfig.key] - a[sortConfig.key];
    }
  });

  // Paginate data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Change page handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="market-page">
      <div className="market-header">
        <h2>Cryptocurrency Market</h2>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by name or symbol..." 
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading cryptocurrency data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="crypto-table-container">
            <table className="crypto-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('market_cap_rank')}>#</th>
                  <th onClick={() => requestSort('name')}>Name</th>
                  <th onClick={() => requestSort('current_price')}>Price</th>
                  <th onClick={() => requestSort('price_change_percentage_24h')}>24h %</th>
                  <th onClick={() => requestSort('price_change_percentage_7d_in_currency')}>7d %</th>
                  <th onClick={() => requestSort('market_cap')}>Market Cap</th>
                  <th onClick={() => requestSort('total_volume')}>Volume (24h)</th>
                  <th onClick={() => requestSort('circulating_supply')}>Circulating Supply</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((crypto) => (
                  <tr key={crypto.id}>
                    <td>{crypto.market_cap_rank}</td>
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
                    <td>{formatNumber(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show 5 page buttons centered around the current page
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }
              
              return (
                <button 
                  key={pageToShow}
                  onClick={() => paginate(pageToShow)}
                  className={`pagination-btn ${currentPage === pageToShow ? 'active' : ''}`}
                >
                  {pageToShow}
                </button>
              );
            })}
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketPage;