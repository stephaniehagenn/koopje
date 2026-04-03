# 🍼 Baby Product Price Tracker

Automated price tracking for baby products from Dutch retailers with daily updates.

## 🚀 Features

- ✅ Automated daily price scraping (6:00 AM)
- ✅ Live API with real-time data
- ✅ React app with clean UI
- ✅ Multi-retailer comparison
- ✅ Price alerts & notifications
- ✅ 100% free hosting (€0/month)

## 🏗️ Architecture

```
GitHub Actions (Daily Scraper)
        ↓
products.json (Updated Data)
        ↓
Railway.app (API Server)
        ↓
Vercel (React App)
        ↓
Users (Live Prices)
```

## 📁 Project Structure

```
baby-price-tracker/
├── .github/
│   └── workflows/
│       └── scrape.yml          # Daily automation
├── api/
│   ├── server.js               # Express API server
│   ├── package.json            # API dependencies
│   └── data/
│       └── products.json       # Price data
├── src/
│   └── App.jsx                 # React app
├── scraper_main.py             # Python scraper
└── README.md
```

## 🛠️ Setup

See `DEPLOYMENT_GUIDE.md` for complete setup instructions (30 minutes).

### Quick Start

1. **Clone & Upload to GitHub**
2. **Deploy API to Railway.app**
3. **Deploy Frontend to Vercel**
4. **Enable GitHub Actions**

## 🔧 Technologies

- **Backend:** Node.js + Express
- **Frontend:** React
- **Scraper:** Python + BeautifulSoup
- **Automation:** GitHub Actions
- **Hosting:** Railway.app + Vercel (free tiers)

## 📊 Monitored Retailers

- Bol.com
- Kruidvat
- Albert Heijn
- Jumbo
- Etos

## 🤝 Contributing

This is a personal project. Feel free to fork and adapt for your own use.

## ⚖️ Legal

This tool is for personal use only. Always respect:
- Retailers' Terms of Service
- robots.txt files
- Rate limiting (3+ seconds between requests)

For commercial use, contact retailers for official partnerships.

## 📝 License

MIT

---

**Built with ❤️ for budget-conscious parents in the Netherlands**
