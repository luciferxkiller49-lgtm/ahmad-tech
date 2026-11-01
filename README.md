# Ahmad Tech (ahmadtech.site)

Professional WhatsApp Bot Pairing Code Gateway & MD Bot Documentation Hub.

![Ahmad Tech Preview](assets/images/og-banner.svg)

---

## 📌 Project Overview

**Ahmad Tech** (`ahmadtech.site`) is a modern web application and developer documentation platform designed for WhatsApp bot automation engineers and community users. It provides a multi-server WhatsApp Bot Pairing Code deployment panel that generates instant 8-character verification codes for multi-device Baileys bots without requiring QR camera scans.

### Key Highlights
- **WhatsApp Bot Pairing Code Deployment Panel**: Select cloud cluster, enter phone with country dial code, generate 8-digit split verification code, real-time countdown timer, and 1-click clipboard copy with feedback.
- **Multi-Server Selector**: Choose between 4 global edge nodes (US East, EU Central, Asia Singapore, Global Anycast) with live latency ping simulation.
- **Two In-Depth Guides**:
  - *WhatsApp Bot Guide*: Step-by-step linking on mobile, Baileys socket integration, `creds.json` persistence, and anti-ban engineering.
  - *WhatsApp Mini Bot & MD Bot Guide*: Architectural comparisons, 25+ essential commands encyclopedia, and 24/7 cloud deployment (Ubuntu VPS, Docker, Termux, Cloudflare).
- **Decoupled Architecture**: Strict separation between the frontend UI and backend services via `assets/js/config.js` and `assets/js/api-client.js`.
- **Pure Web Standards**: HTML5, CSS3, and vanilla JavaScript. Zero frameworks, zero external build steps, 100% lightweight and fast.
- **SEO & Social Optimization**: OpenGraph tags, Twitter Cards, Schema.org JSON-LD structured data, XML sitemap, and robots.txt.

---

## 🗂 Completed File Structure

```text
ahmad-tech/
│
├── index.html                   # Main landing page with Deployment Panel & Guides
├── bot-guide.html               # Dedicated in-depth WhatsApp Bot Guide
├── mini-md-guide.html           # Dedicated in-depth Mini Bot & MD Bot Guide
├── serve.js                     # Zero-dependency local Node.js static server
├── package.json                 # Project manifest & npm run scripts
├── robots.txt                   # Search engine crawler instructions
├── sitemap.xml                  # XML sitemap for SEO discovery
├── README.md                    # Documentation & setup guide
│
└── assets/
    ├── css/
    │   ├── style.css            # Design tokens, variables, typography, header, hero, footer
    │   ├── panel.css            # WhatsApp pairing console, server cards, inputs, timers
    │   └── guides.css           # Guide cards, command tables, code snippets, accordions
    │
    ├── js/
    │   ├── config.js            # Global configuration (servers, country codes, backend toggles)
    │   ├── api-client.js        # API service layer (mock demo + REST backend integration)
    │   ├── pairing-panel.js     # Pairing panel controller (validation, timer, copy, cooldown)
    │   └── main.js              # Theme switcher, mobile drawer navigation, accordions
    │
    └── images/
        ├── logo.svg             # Ahmad Tech vector brand logo
        ├── favicon.svg          # High-resolution vector favicon
        └── og-banner.svg        # OpenGraph 1200x630 social share card
```

---

## 🚀 How to Run Locally

You can run this project locally using any of the methods below:

### Method 1: Using the Built-in Node.js Runner (Recommended)
From the `ahmad-tech` directory:
```bash
node serve.js
```
Then open your browser at:
```text
http://localhost:3000
```

### Method 2: Using npm
```bash
npm start
```

### Method 3: Using Python
```bash
python -m http.server 3000
```

### Method 4: Direct Browser Opening
Simply double-click `index.html` to open it in your browser. All scripts, styles, and SVG graphics work directly via file URLs.

---

## 🔌 Connecting Your Backend Later

The frontend is ready for backend integration. When you are ready to connect a live Baileys or WhatsApp socket microservice:

1. Open `assets/js/config.js`.
2. Update the `backend` block:
   ```javascript
   backend: {
     // Switch mock mode to false:
     useMock: false,
     // Set your backend base URL:
     apiBaseUrl: "https://api.ahmadtech.site", // or http://localhost:5000
     endpoints: {
       pairCode: "/api/pair",
       serverStatus: "/api/servers/status",
       healthCheck: "/api/health"
     },
     timeoutMs: 15000
   }
   ```
3. Your backend needs to expose a `POST /api/pair` endpoint accepting:
   ```json
   {
     "serverId": "srv-us-east",
     "phoneNumber": "14155552671",
     "timestamp": 1730489000000
   }
   ```
   And responding with:
   ```json
   {
     "success": true,
     "code": "AHMD-7829",
     "expiresIn": 60
   }
   ```

---

## 🎨 Design & Accessibility Features
- **Dark & Light Mode**: Default cybernetic dark theme with automatic local storage persistence.
- **Mobile Responsive**: Custom drawer menu, fluid typography, touch-friendly inputs.
- **High-Contrast Monospace Display**: Large pairing code segments with dash separators.
- **Rate-Limiting Cooldown**: 30-second anti-abuse button lock to prevent socket flooding.
- **One-Click Copy**: Clipboard API with visual button animation and fallback support.

---

## 📄 License & Disclaimer
Ahmad Tech (`ahmadtech.site`) is an independent open-source developer project. It is not affiliated with, authorized, or endorsed by WhatsApp LLC or Meta Platforms, Inc.
All code is licensed under the MIT License.
