# Cryptfolio

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

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`.

## Features

- **Real-time Market Data**: View live cryptocurrency prices and market statistics
- **Portfolio Tracking**: Add and manage your own real or made up cryptocurrency holdings
- **Interactive Charts**: Analyze price trends with Chart.js integration
- **Market Overview**: Browse top cryptocurrencies with sorting and filtering
- **Portfolio Sharing**: Export and import portfolios using shareable codes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Persistence**: Your portfolio data is saved locally
- **Search Functionality**: Find specific cryptocurrencies quickly with both the name or shorthandle q

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

## API Integration

This project uses the free tier of the CoinGecko API. The application includes:

- **Caching**: Reduces API calls by caching responses
- **Error Handling**: Hopefully graceful fallbacks when API is unavailable
- **Rate Limiting**: Respects API rate limits

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


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
