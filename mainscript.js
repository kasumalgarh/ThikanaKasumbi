// =========================================
// 👑 ALL-IN-ONE SCRIPT (Counter + Menu + Slider + Total Visitors)
// =========================================

// --- 1. FIREBASE IMPORTS (Updated with runTransaction) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, onDisconnect, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJCSdLfT2VnVVt-xPYPHCj8YZNFrYoUIQ",
    authDomain: "kasumalgarh-live.firebaseapp.com",
    databaseURL: "https://kasumalgarh-live-default-rtdb.firebaseio.com",
    projectId: "kasumalgarh-live",
    storageBucket: "kasumalgarh-live.firebasestorage.app",
    messagingSenderId: "499782037300",
    appId: "1:499782037300:web:957745a5510125ce8cbf61",
    measurementId: "G-87CX7P9WL3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 2. GHOST KILLER COUNTER LOGIC (Live Online Users) ---
const userId = 'visitor_' + Math.random().toString(36).substr(2, 9);
const rawPage = window.location.pathname.split("/").pop();
let currentPage = "अन्य पेज";

if (rawPage === "" || rawPage.includes("index")) currentPage = "मुख्य पृष्ठ";
else if (rawPage.toLowerCase().includes("vanshawali")) currentPage = "वंशावली";
else if (rawPage.toLowerCase().includes("history")) currentPage = "इतिहास";
else if (rawPage.toLowerCase().includes("gallery")) currentPage = "गैलरी";
else if (rawPage.toLowerCase().includes("about")) currentPage = "परिचय";
else if (rawPage.toLowerCase().includes("contact")) currentPage = "संपर्क";
else if (rawPage.toLowerCase().includes("real_scene")) currentPage = "शाही दरबार"; 
else currentPage = rawPage.replace(".html", "");

const userRef = ref(db, 'online_users/' + userId);
set(userRef, {
    page: currentPage,
    device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "PC",
    time: Date.now() 
});
onDisconnect(userRef).remove();

const allUsersRef = ref(db, 'online_users');
onValue(allUsersRef, (snapshot) => {
    const users = snapshot.val() || {};
    const now = Date.now();
    Object.entries(users).forEach(([key, u]) => {
        if (!u.time || (now - u.time > 3600000)) { // 1 hour timeout
            remove(ref(db, 'online_users/' + key));
        }
    });
});

// =========================================
// 🏆 3. TOTAL LIFETIME VISITORS (New Logic)
// =========================================

// बेस नंबर (यहाँ से गिनती शुरू होगी + जो रियल आएंगे)
const STARTING_COUNT = 12450; 
const totalVisitsRef = ref(db, 'site_stats/total_visits');

// चेक करें कि बंदा पहले आ चुका है या नहीं (localStorage)
const hasVisited = localStorage.getItem('kasumalgarh_royal_visit');

if (!hasVisited) {
    // अगर नया है, तो Database में +1 करें
    runTransaction(totalVisitsRef, (currentVisits) => {
        return (currentVisits || 0) + 1;
    }).then(() => {
        // निशान लगा दें कि यह आ चुका है
        localStorage.setItem('kasumalgarh_royal_visit', 'true');
    }).catch((err) => console.log("Counter Update Error:", err));
}

// वेबसाइट पर नंबर दिखाएं (Live Update)
onValue(totalVisitsRef, (snapshot) => {
    const realCount = snapshot.val() || 0;
    const finalCount = STARTING_COUNT + realCount;
    
    // Footer में जहाँ id="total-visitors-count" है, वहां नंबर दिखाएं
    const displayElement = document.getElementById('total-visitors-count');
    if (displayElement) {
        displayElement.innerText = finalCount.toLocaleString(); // कोमा (,) के साथ (e.g., 12,451)
    }
});

// =========================================
// 4. WEBSITE UI LOGIC (Menu, Preloader, Slider)
// =========================================

// --- Preloader ---
window.addEventListener("load", function() {
    const loader = document.getElementById("preloader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => { loader.style.display = "none"; }, 800);
        }, 3000); 
    }
});

// --- Mobile Menu Logic ---
window.toggleMobilePopup = function() {
    const menu = document.getElementById('mobile-popup');
    if (menu) menu.classList.toggle('open');
};

document.addEventListener('click', function(event) {
    const menu = document.getElementById('mobile-popup');
    const toggleBtn = document.querySelector('.menu-toggle');
    
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(event.target) && (!toggleBtn || !toggleBtn.contains(event.target))) {
            menu.classList.remove('open');
        }
    }
});

// --- Slider Logic ---
const heroSection = document.getElementById('hero-slider');
if (heroSection) {
    const images = ['kasumi_fort.png', '2.jpg', '4.jpg', '3.jpg'];
    let currentIndex = 0;

    function preloadNextImage() {
        let nextIndex = (currentIndex + 1) % images.length;
        const img = new Image();
        img.src = images[nextIndex];
    }

    function changeBackgroundImage() {
        currentIndex++;
        if (currentIndex >= images.length) currentIndex = 0;
        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 51, 0.6), rgba(0, 0, 51, 0.9)), url('${images[currentIndex]}')`;
        preloadNextImage();
    }

    preloadNextImage();
    setInterval(changeBackgroundImage, 3500);
}

// --- Share Function ---
window.shareWebsite = function() {
    if (navigator.share) {
        navigator.share({
            title: 'KASUMALGARH',
            text: 'Explore the royal heritage of Fort Kasumbi.',
            url: window.location.href,
        }).catch((error) => console.log('Error sharing', error));
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    }
}

// --- Gallery Lightbox ---
window.openLightbox = function(imgSrc) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    if (lightbox && lightboxImg) {
        lightbox.style.display = "block";
        lightboxImg.src = imgSrc;
    }
}
window.closeLightbox = function() {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) lightbox.style.display = "none";
}

// --- Typing Effect ---
const text = "Khamma Ghani Hukum";
const speed = 150; 
let i = 0;

function typeWriter() {
    const target = document.getElementById("typing-text");
    if (!target) return; 

    if (i < text.length) {
        target.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    }
}
window.addEventListener("load", typeWriter);