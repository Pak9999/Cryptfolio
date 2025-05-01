/**
 * Session Service
 * 
 * Provides functionality for session management and data persistence
 * using localStorage to ensure data is preserved across page refreshes.
 */

// Storage keys
const STORAGE_KEYS = {
  PORTFOLIO: 'cryptfolio-portfolio',
  USER_SETTINGS: 'cryptfolio-settings',
  LAST_VISIT: 'cryptfolio-last-visit',
  THEME: 'cryptfolio-theme',
  CURRENCY: 'cryptfolio-currency'
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {boolean} - Success status
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Parsed data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear all app-related data from localStorage
 * @returns {boolean} - Success status
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Portfolio-specific functions
export const savePortfolio = (portfolioData) => {
  return saveToStorage(STORAGE_KEYS.PORTFOLIO, portfolioData);
};

export const loadPortfolio = () => {
  return loadFromStorage(STORAGE_KEYS.PORTFOLIO, []);
};

// User settings functions
export const saveUserSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.USER_SETTINGS, settings);
};

// Load user settings, with furture-proofing with theme and currency defaults
export const loadUserSettings = () => {
  return loadFromStorage(STORAGE_KEYS.USER_SETTINGS, {
    currency: 'USD',
    theme: 'light',
    refreshInterval: 300000 // 5 minutes
  });
};

// Track user visits
export const updateLastVisit = () => {
  return saveToStorage(STORAGE_KEYS.LAST_VISIT, new Date().toISOString());
};

export const getLastVisit = () => {
  return loadFromStorage(STORAGE_KEYS.LAST_VISIT, null);
};

// Check if localStorage is available
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

