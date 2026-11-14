# Daily Cab - Multilingual Web Platform & Mobile App

Official website, highway transit simulator, and mobile app pre-registration portal for **Daily Cab** (Shrirampur ⇄ Sangamner ⇄ Ahilyanagar ⇄ Pune).

---

## 🚀 Business Overview
- **Brand**: DAILY CAB
- **Tagline**: *Your Journey. Our Commitment.*
- **Core Pillars**: COMFORTABLE | AFFORDABLE | RELIABLE
- **Booking & WhatsApp**: `+91 9529657004`
- **Official Website**: `https://dailycab.co.in`
- **Languages Supported**: **English (EN)**, **मराठी (Marathi)**, and **हिंदी (Hindi)** with instant zero-reload language switcher
- **Dedicated Application Page**: [app.html](app.html) highlighting mobile app features, ride history, and commuter benefits

---

## 🌟 Key Features & Capabilities

### 1. Trilingual System (`translations.js` + `script.js`)
- **Languages**:
  - 🇬🇧 **English (EN)**: Default international view.
  - 🚩 **मराठी (Marathi - MR)**: Tailored for local commuters, daily travelers, and families in Shrirampur, Sangamner, Ahilyanagar, and Pune.
  - 🇮🇳 **हिंदी (Hindi - HI)**: Ideal for inter-state travelers and corporate executives.
- Instant, client-side switching with persistent language preference saved in `localStorage`.
- Language-aware WhatsApp message formatting (generates Marathi/Hindi/English formatted booking requests).
- 327+ keys with 100% key parity across all 3 languages.

### 2. Dedicated Mobile Application Page (`app.html`)
- Standalone landing page solely focused on the **Daily Cab Mobile App**:
  - **Full Ride History & GST Tax Invoices**: Review every completed journey with 1-click official invoice download simulator.
  - **3-Step Hassle-Free Booking**: Save Home/Office addresses for single-tap rebooking.
  - **Real-Time GPS Tracking & Live ETA**: See your assigned driver approaching with car registration number (`MH 17 AB 1234`), OTP verification, and emergency SOS.
  - **Commuter Passes**: Weekly 10-trip & monthly discounted passes for daily commuters.
  - **App Store Status**: "Coming Soon" notification badge for Google Play and Apple App Store.
  - **Pre-Registration & Launch Notify**: Interactive form allowing passengers to enter their mobile number or email ID to get notified when the app goes live.

### 3. Highway Transit Animation Banner
- Dynamic highway transit animation with auto-cruise vehicle physics, animated road dividers, illuminated headlight beams, and scroll-linked vehicle progression from Shrirampur to Pune with live digital HUD odometer.
- Fully hardware-accelerated CSS 3D transforms with reduced motion accessibility compliance.

### 4. Transparent Fares
- **Seat Sharing**: Starting from **₹550** / seat with dedicated stops and AC comfort.
- **Dedicated Sedan**: Starting from **₹2,200** for private door-to-door trips.
- **Spacious SUV / Ertiga**: Starting from **₹3,200** for family and group travel.

---

## 📂 File Structure

```
daily-pune-cab/
├── index.html       # Main multilingual website with booking engine, routes & highway banner
├── app.html         # Dedicated standalone Mobile Application showcase page
├── translations.js  # Trilingual dictionary (EN, MR, HI - 327 keys)
├── script.js        # Multilingual engine, app tabs, invoice modal, WhatsApp generator
├── styles.css       # Custom design system with cyan glow & highway animations
├── .gitignore       # Git ignore rules
└── README.md        # Documentation and launch instructions
```

---

## 💻 How to View & Run Locally

### Option 1: Direct File Opening
Open `index.html` or `app.html` directly in any modern web browser.

### Option 2: Run a Local HTTP Server
```powershell
python -m http.server 8000
```
Then visit `http://localhost:8000` (Main website) or `http://localhost:8000/app.html` (Mobile App page).

---

## 🌐 Deploy to GitHub Pages
1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose `Deploy from a branch`.
3. Select `main` branch and `/ (root)` folder, then click **Save**.
4. Your website will be live at `https://<your-username>.github.io/<repo-name>/`.
