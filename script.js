/**
 * Daily Pune Cab - Interactive Application Logic
 * Multilingual Engine (EN, MR, HI), Mobile App Showcase, Ride History Simulator, WhatsApp generator
 */

// Global State
let currentBookingType = 'Seat Sharing';
let currentLanguage = 'en';

// Google Sheets Webhook Configuration for VIP App Subscribers & Inquiries
// Connect your deployed Google Apps Script Web App URL below
const GOOGLE_SHEET_WEBHOOK_URL = '';

function sendToGoogleSheet(data) {
  if (!GOOGLE_SHEET_WEBHOOK_URL || GOOGLE_SHEET_WEBHOOK_URL.includes('REPLACE')) {
    return Promise.resolve();
  }
  try {
    const formData = new FormData();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        formData.append(key, data[key]);
      }
    }
    return fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    }).catch(err => {
      console.warn('Google Sheet submission note:', err);
    });
  } catch (err) {
    console.warn('Google Sheet sync error:', err);
    return Promise.resolve();
  }
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearElements = document.querySelectorAll('#current-year');
  yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Set default travel date to today or tomorrow
  const dateInput = document.getElementById('travel-date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Initialize Mobile Menu
  setupMobileMenu();


  // Initialize Language from localStorage if available
  const savedLang = localStorage.getItem('daily_cab_lang') || 'en';
  setLanguage(savedLang);
});

// Multilingual Translation Switcher
function setLanguage(lang) {
  if (!window.appTranslations || !window.appTranslations[lang]) {
    console.warn(`Translation dictionary for "${lang}" not found.`);
    return;
  }
  currentLanguage = lang;
  localStorage.setItem('daily_cab_lang', lang);

  const dict = window.appTranslations[lang];

  // Update text content for elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Update placeholders for inputs with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Update language buttons active state across all containers
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const btnLang = btn.getAttribute('data-lang');
    if (btnLang === lang) {
      btn.className = 'lang-btn px-2.5 py-1 rounded-full transition active bg-brand-cyan text-brand-navy font-black shadow-sm';
    } else {
      btn.className = 'lang-btn px-2.5 py-1 rounded-full transition text-slate-300 hover:text-white font-semibold';
    }
  });

  // Update dynamic select options and route details
  updateRouteOptions(lang);
  updatePassengerOptions(lang);
  updateRouteDetails();
}

// Update Route Select dropdown labels based on language
function updateRouteOptions(lang) {
  const routeSelect = document.getElementById('route-select');
  if (!routeSelect || !window.appTranslations || !window.appTranslations[lang]) return;
  const dict = window.appTranslations[lang];
  const selectedVal = routeSelect.value;

  const routeOptions = [
    { val: "Shrirampur - Sangamner - Pune", key: "route_sangamner_opt" },
    { val: "Shrirampur - Rahuri - Ahilyanagar - Pune", key: "route_ahilyanagar_opt" },
    { val: "Pune - Sangamner - Shrirampur", key: "route_pune_sangamner_opt" },
    { val: "Pune - Ahilyanagar - Shrirampur", key: "route_pune_ahilyanagar_opt" },
    { val: "Shrirampur to Pune Airport", key: "route_shrirampur_airport_opt" },
    { val: "Pune Airport to Shrirampur", key: "route_airport_shrirampur_opt" },
    { val: "Custom Outstation Journey", key: "route_custom_opt" }
  ];

  routeSelect.innerHTML = routeOptions.map(opt => `
    <option value="${opt.val}" ${opt.val === selectedVal ? 'selected' : ''}>
      ${dict[opt.key] || opt.val}
    </option>
  `).join('');
}

// Update Passengers / Vehicle dropdown options based on language
function updatePassengerOptions(lang) {
  const passengersSelect = document.getElementById('passengers');
  const seatsLabel = document.getElementById('seats-label');
  if (!passengersSelect || !window.appTranslations || !window.appTranslations[lang]) return;
  const dict = window.appTranslations[lang];
  const selectedVal = passengersSelect.value;

  if (currentBookingType === 'Seat Sharing') {
    if (seatsLabel) seatsLabel.textContent = dict['lbl_seats_needed'] || 'Seats Required';
    const sharingOptions = [
      { val: "1 Seat", label: dict['pax_1'] || "1 Seat" },
      { val: "2 Seats", label: dict['pax_2'] || "2 Seats" },
      { val: "3 Seats", label: dict['pax_3'] || "3 Seats" },
      { val: "4 Seats (Entire Sedan)", label: dict['pax_4_sharing'] || "4 Seats (Full Sedan)" },
      { val: "6-7 Seats (SUV Ertiga/Innova)", label: dict['pax_suv_sharing'] || "6-7 Seats (SUV Ertiga/Innova)" }
    ];
    passengersSelect.innerHTML = sharingOptions.map(opt => `
      <option value="${opt.val}" ${opt.val === selectedVal ? 'selected' : ''}>${opt.label}</option>
    `).join('');
  } else {
    if (seatsLabel) seatsLabel.textContent = dict['lbl_vehicle_type'] || 'Vehicle Category';
    const privateOptions = [
      { val: "Sedan (Dzire / Etios) - Up to 4 Pax", label: dict['pax_pvt_sedan'] || "Prime Sedan (Dzire/Etios) - Up to 4 Pax" },
      { val: "SUV (Ertiga / Innova) - 6 to 7 Pax", label: dict['pax_pvt_suv'] || "Spacious SUV (Ertiga/Innova) - 6 to 7 Pax" },
      { val: "Round Trip Private Cab", label: dict['pax_pvt_round'] || "Round Trip Private Cab" }
    ];
    passengersSelect.innerHTML = privateOptions.map(opt => `
      <option value="${opt.val}" ${opt.val === selectedVal ? 'selected' : ''}>${opt.label}</option>
    `).join('');
  }
}

// Mobile Menu Handler
function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('menu-icon');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    } else {
      menu.classList.add('hidden');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }
  });

  // Close mobile drawer when clicking any link
  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  });
}

// Mobile App Simulator Screen Switcher (Ride History / Live Tracking / Quick Book)
function switchAppTab(tab) {
  const historyScreens = document.querySelectorAll('#screen-history');
  const trackingScreens = document.querySelectorAll('#screen-tracking');
  const bookScreens = document.querySelectorAll('#screen-book');

  const historyBtns = document.querySelectorAll('#app-tab-history');
  const trackingBtns = document.querySelectorAll('#app-tab-tracking');
  const bookBtns = document.querySelectorAll('#app-tab-book');

  // Hide all screens first
  historyScreens.forEach(s => s.classList.add('hidden'));
  trackingScreens.forEach(s => s.classList.add('hidden'));
  bookScreens.forEach(s => s.classList.add('hidden'));

  // Reset button styles
  const resetBtnClass = 'app-screen-tab flex-1 py-1.5 rounded-lg text-center transition text-slate-300 hover:text-white';
  const activeBtnClass = 'app-screen-tab flex-1 py-1.5 rounded-lg text-center transition bg-brand-blue text-white shadow font-bold';

  historyBtns.forEach(b => b.className = resetBtnClass);
  trackingBtns.forEach(b => b.className = resetBtnClass);
  bookBtns.forEach(b => b.className = resetBtnClass);

  // Show active tab
  if (tab === 'history') {
    historyScreens.forEach(s => s.classList.remove('hidden'));
    historyBtns.forEach(b => b.className = activeBtnClass);
  } else if (tab === 'tracking') {
    trackingScreens.forEach(s => s.classList.remove('hidden'));
    trackingBtns.forEach(b => b.className = activeBtnClass);
  } else if (tab === 'book') {
    bookScreens.forEach(s => s.classList.remove('hidden'));
    bookBtns.forEach(b => b.className = activeBtnClass);
  }
}

// Pre-fill booking form when clicking "Rebook" in the app simulator
function prefillRebook(routeName) {
  const routeSelect = document.getElementById('route-select');
  if (routeSelect) {
    for (let i = 0; i < routeSelect.options.length; i++) {
      if (routeSelect.options[i].value === routeName) {
        routeSelect.selectedIndex = i;
        break;
      }
    }
    updateRouteDetails();
  }

  // Smooth scroll to booking section
  const bookingSec = document.getElementById('booking-section');
  if (bookingSec) {
    bookingSec.scrollIntoView({ behavior: 'smooth' });
    bookingSec.classList.add('ring-4', 'ring-brand-cyan');
    setTimeout(() => {
      bookingSec.classList.remove('ring-4', 'ring-brand-cyan');
    }, 2500);
  }
}

// Switch between Seat Sharing and Private Cab
function setBookingType(type) {
  currentBookingType = type;
  const sharingTab = document.getElementById('tab-sharing');
  const privateTab = document.getElementById('tab-private');

  if (sharingTab && privateTab) {
    if (type === 'Seat Sharing') {
      sharingTab.className = 'booking-tab active py-2 rounded-lg text-center transition bg-brand-navy text-white shadow-sm font-semibold';
      privateTab.className = 'booking-tab py-2 rounded-lg text-center transition text-slate-600 hover:text-brand-navy font-semibold';
    } else {
      privateTab.className = 'booking-tab active py-2 rounded-lg text-center transition bg-brand-navy text-white shadow-sm font-semibold';
      sharingTab.className = 'booking-tab py-2 rounded-lg text-center transition text-slate-600 hover:text-brand-navy font-semibold';
    }
  }

  updatePassengerOptions(currentLanguage);
  updateRouteDetails();
}

// Update pickup/drop defaults and fare estimate text based on selected route
function updateRouteDetails() {
  const routeSelect = document.getElementById('route-select');
  const pickupInput = document.getElementById('pickup-point');
  const dropInput = document.getElementById('drop-point');
  const fareHint = document.getElementById('route-fare-hint');
  
  if (!routeSelect) return;
  const route = routeSelect.value;
  const dict = window.appTranslations ? window.appTranslations[currentLanguage] : null;

  if (route.includes('Airport')) {
    if (route.startsWith('Shrirampur')) {
      if (pickupInput) {
        pickupInput.placeholder = currentLanguage === 'mr' ? 'उदा. श्रीरामपूर (घर किंवा बस स्टँड)' : (currentLanguage === 'hi' ? 'उदा. श्रीरामपुर (घर या बस स्टैंड)' : 'e.g. Shrirampur (Doorstep / Stand)');
      }
      if (dropInput) {
        dropInput.placeholder = currentLanguage === 'mr' ? 'पुणे आंतरराष्ट्रीय विमानतळ (लोहगाव)' : (currentLanguage === 'hi' ? 'पुणे अंतरराष्ट्रीय हवाई अड्डा (लोहेगांव)' : 'e.g. Pune International Airport (Lohegaon)');
      }
    } else {
      if (pickupInput) {
        pickupInput.placeholder = currentLanguage === 'mr' ? 'पुणे विमानतळ (अरायव्हल टर्मिनल)' : (currentLanguage === 'hi' ? 'पुणे हवाई अड्डा (टर्मिनल)' : 'e.g. Pune International Airport (Arrival Terminal)');
      }
      if (dropInput) {
        dropInput.placeholder = currentLanguage === 'mr' ? 'श्रीरामपूर (तुमचा पत्ता)' : (currentLanguage === 'hi' ? 'श्रीरामपुर (आपका पता)' : 'e.g. Shrirampur (Your address)');
      }
    }
    if (fareHint && dict) {
      fareHint.innerHTML = currentBookingType === 'Seat Sharing' 
        ? dict['fare_hint_airport_sharing']
        : dict['fare_hint_airport_private'];
    }
  } else if (route.startsWith('Pune')) {
    if (pickupInput) {
      pickupInput.placeholder = currentLanguage === 'mr' ? 'उदा. पुणे (शिवाजीनगर / स्वारगेट / हिंजवडी)' : (currentLanguage === 'hi' ? 'उदा. पुणे (शिवाजीनगर / स्वारगेट / हिंजवड़ी)' : 'e.g. Pune (Shivajinagar / Swargate / Hinjawadi)');
    }
    if (dropInput) {
      dropInput.placeholder = currentLanguage === 'mr' ? 'उदा. श्रीरामपूर शहर किंवा बस स्टँड' : (currentLanguage === 'hi' ? 'उदा. श्रीरामपुर शहर या बस स्टैंड' : 'e.g. Shrirampur (Town or Bus Stand)');
    }
    if (fareHint && dict) {
      fareHint.innerHTML = currentBookingType === 'Seat Sharing'
        ? dict['fare_hint_pune_sharing']
        : dict['fare_hint_pune_private'];
    }
  } else if (route.includes('Custom')) {
    if (pickupInput) {
      pickupInput.placeholder = currentLanguage === 'mr' ? 'तुमचे पिकअप शहर / पत्ता' : (currentLanguage === 'hi' ? 'आपका पिकअप शहर / पता' : 'Your Pickup City / Landmark');
    }
    if (dropInput) {
      dropInput.placeholder = currentLanguage === 'mr' ? 'जाण्याचे शहर / पत्ता' : (currentLanguage === 'hi' ? 'गंतव्य शहर / पता' : 'Destination City / Landmark');
    }
    if (fareHint && dict) {
      fareHint.innerHTML = dict['fare_hint_custom'];
    }
  } else {
    // Default Shrirampur to Pune
    if (pickupInput) {
      pickupInput.placeholder = currentLanguage === 'mr' ? 'उदा. श्रीरामपूर / लोणी / राहुरी' : (currentLanguage === 'hi' ? 'उदा. श्रीरामपुर / लोणी / राहुरी' : 'e.g. Shrirampur / Loni / Rahuri');
    }
    if (dropInput) {
      dropInput.placeholder = currentLanguage === 'mr' ? 'उदा. पुणे (विमान नगर / स्वारगेट / स्टेशन)' : (currentLanguage === 'hi' ? 'उदा. पुणे (विमान नगर / स्वारगेट / स्टेशन)' : 'e.g. Pune (Viman Nagar / Swargate / Station)');
    }
    if (fareHint && dict) {
      fareHint.innerHTML = currentBookingType === 'Seat Sharing'
        ? dict['fare_hint_sharing_default']
        : dict['fare_hint_private_default'];
    }
  }
}

// Handle Quick Booking Form submission and redirect to WhatsApp (Multilingual aware)
function handleBookingSubmit(event) {
  event.preventDefault();

  const route = document.getElementById('route-select').value;
  const pickup = document.getElementById('pickup-point').value.trim();
  const drop = document.getElementById('drop-point').value.trim();
  const date = document.getElementById('travel-date').value;
  const passengers = document.getElementById('passengers').value;
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();

  // Construct structured WhatsApp message
  const whatsappNumber = "919529657004";
  let messageLines = [];

  if (currentLanguage === 'mr') {
    messageLines = [
      `🚖 *डेली पुणे कॅब - नवीन बुकिंग विनंती*`,
      `----------------------------------------`,
      `*प्रवास प्रकार:* ${currentBookingType === 'Seat Sharing' ? 'सीट शेअरिंग' : 'प्रायव्हेट कॅब'}`,
      `*मार्ग (रूट):* ${route}`,
      `*पिकअप ठिकाण:* ${pickup}`,
      `*ड्रॉप ठिकाण:* ${drop}`,
      `*प्रवासाची तारीख:* ${date}`,
      `*सीट्स / गाडी:* ${passengers}`,
      `----------------------------------------`,
      `*प्रवाशाचे नाव:* ${name}`,
      `*संपर्क क्रमांक:* ${phone}`,
      `----------------------------------------`,
      `कृपया गाडीची उपलब्धता आणि नेमके भाडे कन्फर्म करा.`
    ];
  } else if (currentLanguage === 'hi') {
    messageLines = [
      `🚖 *डेली पुणे कैब - बुकिंग अनुरोध*`,
      `----------------------------------------`,
      `*सेवा प्रकार:* ${currentBookingType === 'Seat Sharing' ? 'सीट शेयरिंग' : 'प्राइवेट कैब'}`,
      `*रूट:* ${route}`,
      `*पिकअप:* ${pickup}`,
      `*ड्रॉप:* ${drop}`,
      `*यात्रा तिथि:* ${date}`,
      `*सीटें / गाड़ी:* ${passengers}`,
      `----------------------------------------`,
      `*यात्री का नाम:* ${name}`,
      `*संपर्क नंबर:* ${phone}`,
      `----------------------------------------`,
      `कृपया सीट उपलब्धता और किराया पुष्टि करें.`
    ];
  } else {
    messageLines = [
      `🚖 *DAILY PUNE CAB - BOOKING INQUIRY*`,
      `----------------------------------------`,
      `*Service:* ${currentBookingType}`,
      `*Route:* ${route}`,
      `*Pickup Point:* ${pickup}`,
      `*Drop Point:* ${drop}`,
      `*Travel Date:* ${date}`,
      `*Seats / Vehicle:* ${passengers}`,
      `----------------------------------------`,
      `*Passenger Name:* ${name}`,
      `*Contact Number:* ${phone}`,
      `----------------------------------------`,
      `Please confirm vehicle availability, exact timing, and fare.`
    ];
  }

  const fullMessage = messageLines.join('\n');
  const encodedMessage = encodeURIComponent(fullMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Open WhatsApp in a new tab
  window.open(whatsappUrl, '_blank');
}

// Pre-Registration & Coming Soon Notification Handler (Collect Mobile or Email)
function handleNotifySubmit(event, inputId, msgId) {
  event.preventDefault();
  const inputEl = document.getElementById(inputId);
  const msgEl = document.getElementById(msgId);
  if (!inputEl) return;
  const val = inputEl.value.trim();

  // Validate either 10-digit mobile number or valid email address
  const digitsOnly = val.replace(/[^0-9]/g, '');
  const isPhone = digitsOnly.length === 10;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  if (!isPhone && !isEmail) {
    const errorMsg = currentLanguage === 'mr' 
      ? 'कृपया वैध १०-अंकी मोबाईल नंबर किंवा ईमेल पत्ता टाका.' 
      : (currentLanguage === 'hi' 
        ? 'कृपया वैध 10-अंकों का मोबाइल नंबर या ईमेल आईडी दर्ज करें।' 
        : 'Please enter a valid 10-digit mobile number or email ID.');
    alert(errorMsg);
    return;
  }

  // 1. Save to localStorage waitlist as local backup
  try {
    const existing = JSON.parse(localStorage.getItem('daily_cab_waitlist') || '[]');
    existing.push({ contact: val, type: isPhone ? 'phone' : 'email', date: new Date().toISOString() });
    localStorage.setItem('daily_cab_waitlist', JSON.stringify(existing));
  } catch (err) {
    console.error('Waitlist storage error:', err);
  }

  // 2. Sync to Central Google Sheet (Real-time cloud database)
  const payload = {
    contact: val,
    type: isPhone ? 'Phone' : 'Email',
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    page: window.location.pathname.includes('app.html') ? 'App Page' : 'Home Page',
    source: 'VIP Waitlist Subscription'
  };
  sendToGoogleSheet(payload);

  // Display rich celebratory confirmation message
  if (msgEl) {
    msgEl.classList.remove('hidden');
    const titleText = currentLanguage === 'mr' 
      ? '🎉 तुम्ही VIP वेटलिस्टवर नोंदणीकृत झाला आहात!' 
      : (currentLanguage === 'hi' 
        ? '🎉 आप VIP वेटलिस्ट में सफलतापूर्वक जुड़ गए हैं!' 
        : '🎉 You are on the Early Access VIP List!');
    const descText = currentLanguage === 'mr' 
      ? `धन्यवाद! <strong>${val}</strong> वर डेली कॅब ॲप प्ले स्टोअर व ॲप स्टोअरवर लाइव्ह होताच आम्ही तुम्हाला थेट डाउनलोड लिंक आणि पहिल्या प्रवासासाठी ₹५० चे डिस्काउंट व्हाउचर पाठवू.` 
      : (currentLanguage === 'hi' 
        ? `धन्यवाद! <strong>${val}</strong> पर डेली कैब ऐप प्ले स्टोर व ऐप स्टोर पर लाइव होते ही हम आपको डायरेक्ट डाउनलोड लिंक और ₹50 का डिस्काउंट वाउचर भेजेंगे।` 
        : `Thank you! We will notify <strong>${val}</strong> the moment the Daily Cab App goes live on Google Play & App Store, plus send your ₹50 launch discount!`);

    msgEl.innerHTML = `
      <div class="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs flex items-start gap-3 shadow-xl">
        <i class="fa-solid fa-circle-check text-emerald-400 text-xl mt-0.5 shrink-0"></i>
        <div>
          <div class="font-bold text-white text-sm">${titleText}</div>
          <div class="text-[11px] text-slate-200 mt-1 leading-relaxed">${descText}</div>
        </div>
      </div>
    `;
    inputEl.value = '';
  }
}

// Handle Contact Section Inquiry Form
function handleInquirySubmit(event) {
  event.preventDefault();

  const name = document.getElementById('inq-name').value.trim();
  const phone = document.getElementById('inq-phone').value.trim();
  const message = document.getElementById('inq-message').value.trim();

  const whatsappNumber = "919529657004";
  let messageLines = [];

  if (currentLanguage === 'mr') {
    messageLines = [
      `📩 *नवीन विचारणा / ॲप विनंती - डेली पुणे कॅब*`,
      `----------------------------------------`,
      `*नाव:* ${name}`,
      `*मोबाईल:* ${phone}`,
      `*संदेश / आवश्यकता:*`,
      `${message}`,
      `----------------------------------------`,
      `वेबसाइटवरून पाठवले: https://dailycab.co.in`
    ];
  } else if (currentLanguage === 'hi') {
    messageLines = [
      `📩 *नई पूछताछ / ऐप अनुरोध - डेली पुणे कैब*`,
      `----------------------------------------`,
      `*नाम:* ${name}`,
      `*मोबाइल:* ${phone}`,
      `*संदेश / आवश्यकता:*`,
      `${message}`,
      `----------------------------------------`,
      `वेबसाइट से भेजा गया: https://dailycab.co.in`
    ];
  } else {
    messageLines = [
      `📩 *NEW INQUIRY / APP REQUEST - DAILY PUNE CAB*`,
      `----------------------------------------`,
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      `*Message / Requirement:*`,
      `${message}`,
      `----------------------------------------`,
      `Sent via website: https://dailycab.co.in`
    ];
  }

  const fullMessage = messageLines.join('\n');
  const encodedMessage = encodeURIComponent(fullMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}

// FAQ Accordion Toggle
function toggleFaq(button) {
  const item = button.closest('.faq-item');
  const content = item.querySelector('.faq-content');
  const icon = button.querySelector('i');

  const isOpen = !content.classList.contains('hidden');

  // Close all FAQs first
  document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
  document.querySelectorAll('.faq-item button i').forEach(ic => {
    ic.classList.remove('rotate-180');
  });

  // Toggle current FAQ
  if (!isOpen) {
    content.classList.remove('hidden');
    icon.classList.add('rotate-180');
  }
}
