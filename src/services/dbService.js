import { Pool } from 'pg';

// PostgreSQL connection configuration
// These should be moved to environment variables in a production app
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cryptfolio',
  password: 'postgres',
  port: 5432,
});

// User Portfolio Operations
export const getUserPortfolio = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_portfolio WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    throw error;
  }
};

export const addHolding = async (userId, cryptoId, symbol, name, amount) => {
  try {
    // Check if holding already exists
    const existingHolding = await pool.query(
      'SELECT * FROM user_portfolio WHERE user_id = $1 AND crypto_id = $2',
      [userId, cryptoId]
    );

    if (existingHolding.rows.length > 0) {
      // Update existing holding
      const result = await pool.query(
        'UPDATE user_portfolio SET amount = amount + $1, updated_at = NOW() WHERE user_id = $2 AND crypto_id = $3 RETURNING *',
        [amount, userId, cryptoId]
      );
      return result.rows[0];
    } else {
      // Create new holding
      const result = await pool.query(
        'INSERT INTO user_portfolio (user_id, crypto_id, symbol, name, amount, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [userId, cryptoId, symbol, name, amount]
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error adding holding:', error);
    throw error;
  }
};

export const updateHolding = async (userId, cryptoId, amount) => {
  try {
    const result = await pool.query(
      'UPDATE user_portfolio SET amount = $1, updated_at = NOW() WHERE user_id = $2 AND crypto_id = $3 RETURNING *',
      [amount, userId, cryptoId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating holding:', error);
    throw error;
  }
};

export const removeHolding = async (userId, cryptoId) => {
  try {
    await pool.query(
      'DELETE FROM user_portfolio WHERE user_id = $1 AND crypto_id = $2',
      [userId, cryptoId]
    );
    return true;
  } catch (error) {
    console.error('Error removing holding:', error);
    throw error;
  }
};

// User Watchlist Operations
export const getUserWatchlist = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_watchlist WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    throw error;
  }
};

export const addToWatchlist = async (userId, cryptoId) => {
  try {
    const result = await pool.query(
      'INSERT INTO user_watchlist (user_id, crypto_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, cryptoId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId, cryptoId) => {
  try {
    await pool.query(
      'DELETE FROM user_watchlist WHERE user_id = $1 AND crypto_id = $2',
      [userId, cryptoId]
    );
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

// Transaction History
export const recordTransaction = async (userId, cryptoId, type, amount, price, timestamp = null) => {
  try {
    const result = await pool.query(
      'INSERT INTO transaction_history (user_id, crypto_id, type, amount, price, timestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, cryptoId, type, amount, price, timestamp || new Date()]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error recording transaction:', error);
    throw error;
  }
};

export const getTransactionHistory = async (userId, cryptoId = null) => {
  try {
    let query = 'SELECT * FROM transaction_history WHERE user_id = $1';
    let params = [userId];

    if (cryptoId) {
      query += ' AND crypto_id = $2';
      params.push(cryptoId);
    }

    query += ' ORDER BY timestamp DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

// Database initialization script
export const initDatabase = async () => {
  try {
    // Create user_portfolio table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_portfolio (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        crypto_id VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(24, 12) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        UNIQUE (user_id, crypto_id)
      )
    `);

    // Create user_watchlist table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_watchlist (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        crypto_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        UNIQUE (user_id, crypto_id)
      )
    `);

    // Create transaction_history table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transaction_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        crypto_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, 
        amount DECIMAL(24, 12) NOT NULL,
        price DECIMAL(24, 12) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};