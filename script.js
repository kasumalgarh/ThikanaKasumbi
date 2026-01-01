// ==========================================
// ✅ PART 1: TREE CONFIGURATION & SETUP
// ==========================================
let allMembers = [];
let idCounter = 0;

// --- Wait for Page Load to ensure Data is ready ---
window.addEventListener('load', function() {
    console.log("Kasumalgarh System: Starting...");

    // 1. Check if Family Data is loaded
    if (typeof familyData === 'undefined') {
        console.error("⚠️ Error: family-data.js not loaded.");
        alert("Data loading... If it takes too long, please refresh.");
        return;
    }

    // 2. Initialize Tree
    const root = document.getElementById('tree-root');
    const mainUl = document.createElement('ul');
    mainUl.appendChild(buildTree(familyData)); 
    root.appendChild(mainUl);

    // 3. Initialize Index & Search
    allMembers.sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById('total-count').innerText = "Total Members: " + allMembers.length;
    renderIndex(allMembers);
});

// ==========================================
// ✅ PART 2: TREE BUILDING LOGIC
// ==========================================
function buildTree(member) {
    if (!member) return null;

    const li = document.createElement('li');
    idCounter++;
    const uniqueID = "node-" + idCounter;
    allMembers.push({ name: member.name, id: uniqueID });

    const span = document.createElement('span');
    span.innerText = member.name;
    span.id = uniqueID;
    
    // Root vs Member Style
    if(idCounter === 1) { 
        span.classList.add('root-text');
    } else {
        span.classList.add('member-text');
    }

    // ✅ FIX: Mark leaf nodes (members with no children)
    // This helps CSS stop the vertical line exactly at the box
    if (!member.children || member.children.length === 0) {
        li.classList.add('last-node');
    }

    // Social Icons for GajRaj Singh
    if(member.name && member.name.includes("GajRaj")) {
        addSocialIcons(span);
    }

    li.appendChild(span);

    // Events (Hover, Click)
    span.addEventListener('mouseenter', function(e) {
        e.stopPropagation();
        highlightPath(li);
        // Only show tooltip on Desktop (width > 768px)
        if (window.innerWidth > 768) {
            showTooltip(this, li);
        }
    });

    span.addEventListener('mouseleave', function() {
        removeHighlight();
        document.getElementById('hover-tooltip').style.display = 'none';
    });

    span.addEventListener('click', function(e) {
        e.stopPropagation();
        handleNameClick(uniqueID);
    });

    // Recursion for Children
    if (member.children && member.children.length > 0) {
        const ul = document.createElement('ul');
        member.children.forEach(child => {
            ul.appendChild(buildTree(child));
        });
        li.appendChild(ul);
    }
    return li;
}

function addSocialIcons(span) {
    let insta = document.createElement('a');
    insta.href = "https://instagram.com/gajsa.kasumbifort"; 
    insta.target = "_blank";
    insta.className = "social-link";
    insta.innerHTML = '<i class="fab fa-instagram"></i>';
    span.appendChild(insta);
    
    let fb = document.createElement('a');
    fb.href = "https://facebook.com/gajsa.kasumbi"; 
    fb.target = "_blank";
    fb.className = "social-link";
    fb.innerHTML = '<i class="fab fa-facebook-f"></i>';
    span.appendChild(fb);
}

// ==========================================
// ✅ PART 3: PANELS & INTERACTION
// ==========================================

// --- Index & Search ---
function renderIndex(listData) {
    const indexList = document.getElementById('index-list');
    indexList.innerHTML = "";
    listData.forEach(item => {
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.innerText = item.name;
        a.onclick = function(e) {
            e.stopPropagation(); 
            toggleLeftPanel(); 
            handleNameClick(item.id); 
        };
        li.appendChild(a);
        indexList.appendChild(li);
    });
}

function filterNames() {
    let input = document.getElementById('search-box');
    let clearBtn = document.getElementById('clear-search');
    let val = input.value.toLowerCase();
    
    if(val.length > 0) clearBtn.style.display = 'block';
    else clearBtn.style.display = 'none';

    let filtered = allMembers.filter(member => member.name.toLowerCase().includes(val));
    renderIndex(filtered);
}

function clearSearch() {
    document.getElementById('search-box').value = "";
    filterNames(); 
}

// --- Path Highlighting ---
function highlightPath(li) {
    let current = li;
    while (current) {
        if (current.tagName === 'LI') {
            let nameSpan = current.querySelector('span');
            if(nameSpan) nameSpan.classList.add('highlight-green');
        }
        if(current.parentElement) {
            current = current.parentElement.closest('li');
        } else {
            current = null;
        }
    }
}

function removeHighlight() {
    document.querySelectorAll('.highlight-green').forEach(el => {
        if(!el.classList.contains('active-click')) {
            el.classList.remove('highlight-green');
        }
    });
}

function handleNameClick(id) {
    document.querySelectorAll('.highlight-green').forEach(el => el.classList.remove('highlight-green'));
    document.querySelectorAll('.active-click').forEach(el => el.classList.remove('active-click'));

    let targetSpan = document.getElementById(id);
    if(targetSpan) {
        targetSpan.classList.add('highlight-green');
        targetSpan.classList.add('active-click');
        targetSpan.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        showRightPanel(targetSpan);
    }
}

// --- Right Panel & Tooltip ---
function showTooltip(spanElement, liElement) {
    let tooltip = document.getElementById('hover-tooltip');
    let name = spanElement.childNodes[0].nodeValue || spanElement.innerText;
    let details = getMemberDetails(spanElement, liElement);

    tooltip.innerHTML = `
        <strong>${name}</strong>
        ${details.fatherName} <br>
        ${details.siblingText} <br>
        <span style="color:#ddd; font-size:11px;">${details.genText}</span>
    `;

    tooltip.style.display = 'block';
    let rect = spanElement.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    let topPos = rect.bottom + 10;
    if (topPos + tooltip.offsetHeight > window.innerHeight) {
        topPos = rect.top - tooltip.offsetHeight - 10;
    }
    tooltip.style.top = topPos + 'px';
}

function showRightPanel(targetNode) {
    const panel = document.getElementById('right-panel');
    const headerBox = document.getElementById('panel-header');
    const list = document.getElementById('lineage-content');
    list.innerHTML = ""; 

    let liElement = targetNode.closest('li');
    let details = getMemberDetails(targetNode, liElement);
    
    headerBox.innerHTML = `
        <h2 class="lineage-title-name">${targetNode.childNodes[0].nodeValue || targetNode.innerText}</h2>
        <div class="lineage-details">
            <div><strong>${details.relationText}</strong> <br> ${details.rawFatherName}</div>
            <hr style="border:0; border-top:1px dashed #ccc; margin:5px 0;">
            <div>${details.siblingText}</div>
            <div><strong>${details.genText}</strong></div>
        </div>
    `;

    // Path Logic
    let path = [];
    let current = targetNode;
    while(current) {
        if(current.tagName === 'SPAN') {
            path.unshift(current.childNodes[0].nodeValue || current.innerText); 
        }
        let parentLi = current.closest('li').parentElement.closest('li');
        current = parentLi ? parentLi.querySelector('span') : null;
    }

    path.forEach(name => {
        let li = document.createElement('li');
        li.className = 'lineage-item';
        li.innerHTML = `<span class="lineage-name">${name}</span>`;
        list.appendChild(li);
    });

    panel.classList.add('open');
    document.getElementById('left-panel').classList.remove('open');
}

function getMemberDetails(spanNode, liNode) {
    let fatherName = "Th. Narayan Singh (Founder)";
    let rawFatherName = "Founder";
    let parentLi = liNode.parentElement.closest('li');
    if(parentLi) {
        rawFatherName = parentLi.querySelector('span').firstChild.textContent;
        fatherName = "Son of <br>" + rawFatherName;
    }

    let siblingsCount = 0;
    let parentUl = liNode.parentElement;
    if(parentUl && parentUl.tagName === 'UL') {
        siblingsCount = parentUl.querySelectorAll(':scope > li').length - 1;
    }
    let siblingText = siblingsCount > 0 ? `He has ${siblingsCount} more sibling(s).` : "He is the only child.";

    let depth = 1;
    let temp = liNode;
    while(temp.parentElement.closest('li')) {
        depth++;
        temp = temp.parentElement.closest('li');
    }
    let suffix = (depth==1)?'st':(depth==2)?'nd':(depth==3)?'rd':'th';
    let genText = `${depth}${suffix} Gen. of Th. Narayan Singh`;
    
    let relationText = spanNode.innerText.toLowerCase().includes('baisa') ? "Daughter of" : "Son of";
    if(depth === 1) relationText = "Founder";

    return { fatherName, rawFatherName, siblingText, genText, relationText };
}

// ==========================================
// ✅ PART 4: MOBILE MENU & UTILS
// ==========================================

function toggleLeftPanel() {
    document.getElementById('left-panel').classList.toggle('open');
    document.getElementById('right-panel').classList.remove('open');
}

function closeRightPanel() {
    document.getElementById('right-panel').classList.remove('open');
    removeHighlight();
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    let menu = document.getElementById('mobile-menu-overlay');
    menu.classList.toggle('open');
}

// Close On Outside Click
document.addEventListener('click', function(e) {
    // Mobile Menu
    let menu = document.getElementById('mobile-menu-overlay');
    let hamburger = document.querySelector('.hamburger-icon');
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
            menu.classList.remove('open');
        }
    }

    // Panels
    if (!e.target.closest('.sidebar-left') && 
        !e.target.closest('.sidebar-right') && 
        !e.target.closest('.nav-btn') &&
        !e.target.closest('.modal-box') &&
        !e.target.classList.contains('member-text')) {
        
        document.getElementById('left-panel').classList.remove('open');
        closeRightPanel();
        closeContactModal();
    }
});

// Modal Logic
function openContactModal() { document.getElementById('contactModal').style.display = 'flex'; }
function closeContactModal() { document.getElementById('contactModal').style.display = 'none'; }

function sendEmail() {
    let name = document.getElementById('req-name').value;
    let msg = document.getElementById('req-msg').value;
    
    if(name === "" || msg === "") {
        alert("Hukum, please write your name and message first.");
        return;
    }

    let btn = document.querySelector(".send-btn");
    let originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    var templateParams = { from_name: name, message: msg, reply_to: "User" };
    emailjs.send('service_vdnox8p', 'template_xx3a4tt', templateParams)
        .then(function() {
            alert("Message sent successfully!");
            document.getElementById('req-name').value = "";
            document.getElementById('req-msg').value = "";
            closeContactModal();
            btn.innerText = originalText;
            btn.disabled = false;
        }, function(error) {
            alert("Failed to send: " + JSON.stringify(error));
            btn.innerText = originalText;
            btn.disabled = false;
        });
}

// ==========================================
// ✅ PART 5: APP INSTALL (PWA)
// ==========================================
let pwaPrompt;
const pwaBtn = document.getElementById('pwa-install-btn');

// 1. Capture Install Event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    pwaPrompt = e;      

    // Show Button with Animation
    if (pwaBtn) {
        pwaBtn.style.display = 'inline-block';
        pwaBtn.style.animation = "pulse 1.5s infinite";
    }

    setTimeout(() => {
        if (pwaPrompt) {
            console.log("Auto-prompt ready");
        }
    }, 3000);
});

// 2. Handle Button Click
if (pwaBtn) {
    pwaBtn.addEventListener('click', async () => {
        if (pwaPrompt) {
            pwaPrompt.prompt();
            const { outcome } = await pwaPrompt.userChoice;
            console.log(`User responded: ${outcome}`);
            
            pwaPrompt = null;
            pwaBtn.style.display = 'none';
        }
    });
}

// 3. Hide button on iOS
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}
if (isIos() && pwaBtn) {
    pwaBtn.style.display = 'none';
}

// 4. Hide if already installed
window.addEventListener('appinstalled', () => {
    if (pwaBtn) pwaBtn.style.display = 'none';
    console.log('App successfully installed!');
});