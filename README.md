# Cryptfolio

<div align="center">
  <img src="https://img.shields.io/badge/🚀-CRYPTFOLIO-3861FB?style=for-the-badge&labelColor=171924&fontSize=24" alt="Cryptfolio Logo" height="80">
  
  <h3 style="margin-top: 1rem; color: #3861FB;">A Personal Cryptocurrency Portfolio Tracker</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Powered%20by-CoinGecko%20API-58cc02?style=flat-square" alt="CoinGecko">
    <img src="https://img.shields.io/badge/Charts-Chart.js-FF6384?style=flat-square&logo=chart.js" alt="Chart.js">
  </p>
  
  <p>
    <img src="https://img.shields.io/github/stars/pak9999/Cryptfolio?style=social" alt="GitHub stars">
    <img src="https://img.shields.io/github/forks/pak9999/Cryptfolio?style=social" alt="GitHub forks">
  </p>
</div>

---

## About Cryptfolio

A sleek, responsive cryptocurrency portfolio tracker built with React that allows users to track their crypto investments and view real-time market data. The application uses the CoinGecko API to fetch live cryptocurrency data and provides charts for detailed market analysis.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before running this project, you need to have the following installed on your system:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js) or **yarn**

You can check if you have these installed by running:

```bash
node --version
npm --version
```

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/).

### Installing

Follow these step-by-step instructions to get the development environment running:

1. **Clone the repository**

```bash
git clone https://github.com/pak9999/Cryptfolio.git
```

```bash
cd Cryptfolio
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

For the best development experience with full API functionality:

```bash
npm run dev:netlify
```

This will start both the Netlify functions (with API key support) and the React app. The application will be available at:
- Frontend: `http://localhost:8888` (Netlify dev server)
- API Functions: `http://localhost:8888/.netlify/functions/`

Alternatively, you can run just the Vite server (limited API functionality due to rate limits):

```bash
npm run dev
```

**Note:** The `dev:netlify` command is recommended as it uses the authenticated CoinGecko API proxy, avoiding rate limits.

### Available Scripts

```bash
npm run dev              # Start Vite development server
npm run dev:netlify      # Start Netlify dev server (recommended)
npm run build           # Build for production
npm run preview         # Preview production build
npm run deploy          # Deploy to GitHub Pages
```

## Features

- **Real-time Market Data**: View live cryptocurrency prices and market statistics
- **Portfolio Tracking**: Add and manage your own real or made up cryptocurrency holdings
- **Interactive Charts**: Analyze price trends with Chart.js integration
- **Market Overview**: Browse top cryptocurrencies with sorting and filtering
- **Portfolio Sharing**: Export and import portfolios using shareable codes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Persistence**: Your portfolio data is saved locally
- **Search Functionality**: Find specific cryptocurrencies quickly with both the name or symbol

## Built With

* **[React](https://reactjs.org/)** - Frontend JavaScript library
* **[Vite](https://vitejs.dev/)** - Build tool and development server
* **[Chart.js](https://www.chartjs.org/)** - Charts and data visualization
* **[React Router](https://reactrouter.com/)** - Client-side routing
* **[Axios](https://axios-http.com/)** - HTTP client for API requests
* **[CoinGecko API](https://www.coingecko.com/en/api)** - Cryptocurrency market data
* **[React Chart.js 2](https://react-chartjs-2.js.org/)** - React wrapper for Chart.js

## Project Structure

```
Cryptfolio/
├── public/
├── src/
│   ├── components/
│   │   ├── CryptoDetail.js     # Individual cryptocurrency details
│   │   ├── Dashboard.js        # Main dashboard with market overview
│   │   ├── MarketPage.js       # Market data table with pagination
│   │   └── Portfolio.js        # Portfolio management
│   ├── services/
│   │   ├── cryptoService.js        # API calls and caching
│   │   ├── portfolioCodeService.js # Portfolio import/export
│   │   └── sessionService.js       # Local storage management
│   ├── styles/
│   │   └── *.css              # Component-specific styles
│   ├── App.js                 # Main application component
│   └── index.js              # Application entry point
├── package.json
├── vite.config.js
└── README.md
```

## API Integration & CORS Setup

This project uses the CoinGecko API through a Netlify serverless function to avoid CORS issues. The application includes:

- **Netlify Proxy**: Serverless function that proxies API requests to avoid CORS issues
- **Caching**: Reduces API calls by caching responses locally
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Rate Limiting**: Respects API rate limits with intelligent caching

### Development Setup with Netlify

For local development with full API functionality:

**Recommended Approach:**
```bash
npm run dev:netlify
```
This single command starts both the Netlify dev server and the React app with full API key support.

**Alternative Manual Setup:**

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Test the proxy function locally**:
```bash
npx netlify functions:serve
```
This will start the function server at `http://localhost:9999`

3. **Run the React app in another terminal**:
```bash
npm run dev
```
This will start Vite at `http://localhost:5173`

**Local Proxy Alternative:**
For development without Netlify CLI, you can use the local proxy server:
```bash
node proxy-server.js    # Start local proxy (port 8888)
```
```bash
npm run dev            # Start React app (port 5173)
```

**API Key Configuration:**
- Add your CoinGecko API key to the `.env` file as `COINGECKO_API_KEY=your_key_here`
- The local development automatically uses the deployed Netlify proxy with API authentication
- This ensures consistent behavior between local development and production

### Deployment Options

#### Option 1: Deploy to Netlify (Recommended)
1. **Create a Netlify account** at [netlify.com](https://netlify.com)
2. **Connect your GitHub repository** to Netlify
3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (set in netlify.toml)
4. **Add environment variables**:
   - Go to Site settings → Environment variables
   - Add `COINGECKO_API_KEY` with your CoinGecko API key
5. **Deploy the site** - Netlify will automatically build and deploy

#### Option 2: GitHub Pages with External Proxy
If you prefer GitHub Pages:
1. **Deploy the Netlify function separately** (create a separate Netlify account just for the proxy)
2. **Add your API key** to the Netlify environment variables
3. **Update the proxy URL** in `src/services/cryptoService.js` if needed
4. **Deploy to GitHub Pages**: `npm run deploy`

**Note:** The current configuration uses the deployed Netlify proxy for both local development and production, ensuring consistent API authentication.

### Testing the CORS Fix

You can test if the proxy is working by:
1. **Check browser console** - no more CORS errors
2. **Test function directly**:
```bash
# Local testing
curl "http://localhost:9999/.netlify/functions/crypto-proxy?path=/global"

# Production testing (replace with your URL)
curl "https://your-site.netlify.app/.netlify/functions/crypto-proxy?path=/global"
```

### Environment Configuration
Copy `.env.example` to `.env.local` and update with your Netlify URL:
```bash
cp .env.example .env.local
```

## API Key Setup

This application uses the CoinGecko API with authentication to avoid rate limits. To set up your API key:

### 1. Get a CoinGecko API Key
1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free account
3. Generate your API key from the dashboard

### 2. Configure for Local Development
1. **Create/update the `.env` file** in your project root:
```bash
COINGECKO_API_KEY=your_actual_api_key_here
```

2. **Restart your development server**:
```bash
npm run dev:netlify
```

### 3. Configure for Netlify Deployment
1. **Go to your Netlify site dashboard**
2. **Navigate to Site settings → Environment variables**
3. **Add a new variable**:
   - Key: `COINGECKO_API_KEY`
   - Value: Your actual CoinGecko API key
4. **Redeploy your site**

### API Integration Features
- **Authenticated Requests**: Uses API key to avoid rate limits
- **Intelligent Caching**: Reduces API calls with local caching
- **Fallback System**: Uses cached data when API is unavailable
- **Consistent Proxy**: Same authenticated proxy for local development and production

## Authors

* **Max K** - *Main dev* - [Pak9999](https://github.com/pak9999)

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* **CoinGecko** for providing free cryptocurrency market data API
* **Chart.js** community for excellent charting capabilities
* **React** team for the amazing frontend framework
* **Vite** team for the fast build tool
* Inspiration from various cryptocurrency tracking applications

## Troubleshooting

### Common Issues

**Application won't start:**
- Make sure you have Node.js version 16 or higher
- Delete `node_modules` and run `npm install` again

**API errors:**
- Check your internet connection
- CoinGecko API might be experiencing downtime

**Charts not displaying:**
- Clear your browser cache
- Check browser console for JavaScript errors
