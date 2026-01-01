// =========================================
// 👑 ROYAL LIVE COUNTER (NO TOOLTIP, ONLY LIST)
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. FIREBASE CONFIG
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

// 2. USER TRACKING
const userId = 'visitor_' + Math.random().toString(36).substr(2, 9);
const rawPage = window.location.pathname.split("/").pop();
const currentPage = (rawPage === "" || rawPage === "index.html") ? "Home" : rawPage.replace(".html", "");

const userRef = ref(db, 'online_users/' + userId);
set(userRef, {
    page: currentPage,
    device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "PC",
    time: Date.now()
});
onDisconnect(userRef).remove();

// 3. UI UPDATE (LIST ONLY)
const allUsersRef = ref(db, 'online_users');

onValue(allUsersRef, (snapshot) => {
    const users = snapshot.val() || {};
    const total = Object.keys(users).length;

    // Total Update
    const countElement = document.getElementById("live-count");
    if (countElement) countElement.innerText = total;

    // 🛑 Tooltip हटाने का कोड (ताकि पुराना वाला न दिखे)
    const btn = document.getElementById("counter-btn");
    if(btn) btn.removeAttribute("title"); 

    // List Update
    let pageCounts = {};
    Object.values(users).forEach(u => {
        let p = u.page || "Home";
        pageCounts[p] = (pageCounts[p] || 0) + 1;
    });

    let listHTML = `<div style="color:#b38728; font-weight:bold; margin-bottom:8px; border-bottom:1px solid #b38728; padding-bottom:4px; text-align:center;">Online</div>`;
    
    for (let [page, count] of Object.entries(pageCounts)) {
        listHTML += `
            <div class="detail-row">
                <span style="opacity:0.9">${page}</span>
                <span style="color:#fff; font-weight:bold;">${count}</span>
            </div>
        `;
    }

    const detailsBox = document.getElementById("live-details");
    if(detailsBox) detailsBox.innerHTML = listHTML;
});

// 4. CLICK EVENT (JS Controlled)
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("counter-btn");
    const details = document.getElementById("live-details");

    if (btn && details) {
        // पुराने onclick हटाकर नया लगा रहे हैं
        btn.onclick = (e) => {
            e.stopPropagation();
            btn.classList.toggle("expanded");
            details.classList.toggle("show");
        };
        
        // कहीं और क्लिक करने पर बंद हो जाए
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !details.contains(e.target)) {
                btn.classList.remove("expanded");
                details.classList.remove("show");
            }
        });
    }
});

// 5. AUTO OPEN ONCE
setTimeout(() => {
    const btn = document.getElementById("counter-btn");
    if (btn) btn.click();
    setTimeout(() => {
        const details = document.getElementById("live-details");
        if(details && details.classList.contains("show")) btn.click();
    }, 4000);
}, 2500);

