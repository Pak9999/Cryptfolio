/**
 * Portfolio Code Service
 * 
 * Provides functionality to export a portfolio to a shareable code
 * and import a portfolio from a code.
 */

// Convert portfolio data to a compact code string
export const portfolioToCode = (portfolio) => {
  try {
    // Simplified format: only store essential data
    const essentialData = portfolio.map(item => ({
      id: item.id, 
      amount: item.amount,
      purchasePrice: item.purchasePrice || 0,
      purchaseDate: item.purchaseDate || ''
    }));
    
    // Convert to JSON and encode as base64
    const jsonString = JSON.stringify(essentialData);
    const base64String = btoa(jsonString);
    
    // Add a prefix to identify as a portfolio code
    return `CFTPL-${base64String}`;
  } catch (error) {
    console.error('Error generating portfolio code:', error);
    throw new Error('Failed to generate portfolio code');
  }
};

// Parse portfolio code and convert back to portfolio data
export const codeToPortfolio = (code, cryptoData) => {
  try {
    // Validate the code format
    if (!code.startsWith('CFTPL-')) {
      throw new Error('Invalid portfolio code format');
    }
    
    // Extract the base64 part
    const base64String = code.substring(6);  // Remove 'CFTPL-' prefix
    
    // Decode the base64 string to JSON
    const jsonString = atob(base64String);
    const essentialData = JSON.parse(jsonString);
    
    // Restore full portfolio items with names and symbols from cryptoData
    return essentialData.map(item => {
      const cryptoInfo = cryptoData.find(c => c.id === item.id);
      
      if (!cryptoInfo) {
        // If crypto not found in data, use placeholder values
        return {
          id: item.id,
          name: item.id, // Use id as name if actual name not available
          symbol: '???',
          amount: item.amount,
          purchasePrice: item.purchasePrice,
          purchaseDate: item.purchaseDate
        };
      }
      
      return {
        id: item.id,
        name: cryptoInfo.name,
        symbol: cryptoInfo.symbol,
        amount: item.amount,
        purchasePrice: item.purchasePrice,
        purchaseDate: item.purchaseDate
      };
    });
  } catch (error) {
    console.error('Error parsing portfolio code:', error);
    throw new Error('Invalid portfolio code or format');
  }
};

// Validate if a string is a valid portfolio code
export const isValidPortfolioCode = (code) => {
  if (!code || typeof code !== 'string' || !code.startsWith('CFTPL-')) {
    return false;
  }
  
  try {
    // Try to decode the base64 part
    const base64String = code.substring(6);
    const jsonString = atob(base64String);
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};