/**
 * Ahmad Tech - Frontend Configuration
 * Domain: ahmadtech.site
 * 
 * NOTE: Frontend and backend integration is strictly separated.
 * When your backend is ready, update `backend.useMock` to `false` 
 * and set `backend.apiBaseUrl` to your live API endpoint.
 */

const AHMAD_TECH_CONFIG = {
  brand: {
    name: "Ahmad Tech",
    tagline: "Professional WhatsApp Bot Pairing & Automation Gateway",
    domain: "ahmadtech.site",
    supportEmail: "support@ahmadtech.site",
    whatsappChannel: "https://whatsapp.com/channel/ahmadtech",
    telegramChannel: "https://t.me/ahmadtech_official",
    githubRepo: "https://github.com/ahmadtech-site"
  },

  backend: {
    // Set to false when connecting real Node.js / Baileys backend
    useMock: true,
    // Base URL of your backend service (e.g. 'https://api.ahmadtech.site' or 'http://localhost:5000')
    apiBaseUrl: window.location.origin,
    endpoints: {
      pairCode: "/api/pair",
      serverStatus: "/api/servers/status",
      healthCheck: "/api/health"
    },
    timeoutMs: 15000
  },

  // High-performance server cluster options for WhatsApp pairing
  servers: [
    {
      id: "srv-us-east",
      name: "Server 01 - US East (Virginia)",
      region: "North America",
      ping: 28,
      status: "online",
      load: "22%",
      badge: "Fastest US",
      isDefault: true,
      icon: "fas fa-bolt"
    },
    {
      id: "srv-eu-central",
      name: "Server 02 - EU Central (Frankfurt)",
      region: "Europe",
      ping: 42,
      status: "online",
      load: "39%",
      badge: "Low Latency",
      isDefault: false,
      icon: "fas fa-shield-alt"
    },
    {
      id: "srv-ap-singapore",
      name: "Server 03 - Asia Pacific (Singapore)",
      region: "Asia Pacific",
      ping: 64,
      status: "online",
      load: "45%",
      badge: "Stable MD",
      isDefault: false,
      icon: "fas fa-microchip"
    },
    {
      id: "srv-edge-global",
      name: "Server 04 - Global Edge Anycast",
      region: "Global",
      ping: 18,
      status: "online",
      load: "16%",
      badge: "Smart Route",
      isDefault: false,
      icon: "fas fa-globe"
    }
  ],

  // Rate limiting & security configurations
  security: {
    cooldownSeconds: 30,
    codeExpirySeconds: 60,
    minPhoneDigits: 10,
    maxPhoneDigits: 15
  },

  // Popular country dialing codes for easy UX
  countryCodes: [
    { name: "United States / Canada", code: "+1", flag: "🇺🇸" },
    { name: "Pakistan", code: "+92", flag: "🇵🇰" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "Nigeria", code: "+234", flag: "🇳🇬" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "Indonesia", code: "+62", flag: "🇮🇩" },
    { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
    { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
    { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
    { name: "Brazil", code: "+55", flag: "🇧🇷" },
    { name: "South Africa", code: "+27", flag: "🇿🇦" },
    { name: "Egypt", code: "+20", flag: "🇪🇬" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Turkey", code: "+90", flag: "🇹🇷" },
    { name: "Malaysia", code: "+60", flag: "🇲🇾" },
    { name: "Kenya", code: "+254", flag: "🇰🇪" },
    { name: "Ghana", code: "+233", flag: "🇬🇭" }
  ]
};

// Freeze config to prevent inadvertent mutation
if (typeof Object.freeze === "function") {
  Object.freeze(AHMAD_TECH_CONFIG);
}

window.AHMAD_TECH_CONFIG = AHMAD_TECH_CONFIG;
