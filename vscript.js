/* =========================================
   THIKANA KASUMALGARH - FINAL SCRIPT
   ========================================= */

let allMembers = [];
let idCounter = 0;
let currentZoom = 1;

// --- 1. INITIALIZATION ---
window.onload = function() {
    console.log("Kasumalgarh System Started...");

    if (typeof familyData === 'undefined') {
        document.getElementById('tree-root').innerText = "Error: family-data.js not loaded.";
        return;
    }

    const container = document.getElementById('tree-root');
    container.innerHTML = "";
    
    // Create Root UL
    const ul = document.createElement('ul');
    ul.className = "root-ul tree-ul";
    
    // Build Tree
    ul.appendChild(buildNode(familyData, true, 1));
    container.appendChild(ul);

    // Create Index List
    allMembers.sort((a, b) => a.name.localeCompare(b.name));
    renderIndex(allMembers);

    // Update Footer Count
    let footerCount = document.getElementById('footer-count');
    if(footerCount) footerCount.innerText = "Total Members: " + allMembers.length;

    // ✅ MOBILE MENU LISTENERS (Init ke time hi laga diye)
    setupMobileMenu();
};

// --- 2. BUILD TREE NODES ---
function buildNode(member, isRoot = false, depth = 1) {
    const li = document.createElement('li');
    li.classList.add('tree-li', 'gen-' + depth);
    if (isRoot) li.classList.add('root-item');
    
    idCounter++;
    const uniqueID = "node-" + idCounter;
    allMembers.push({ name: member.name, id: uniqueID });

    // Name Box
    const span = document.createElement('span');
    span.innerText = member.name;
    span.className = isRoot ? 'member-box root-box' : 'member-box';
    span.id = uniqueID;
    
    // Event Listeners
    span.onclick = function(e) { e.stopPropagation(); handleNameClick(uniqueID, span, li); };
    span.onmouseenter = function() { if(window.innerWidth > 768) showTooltip(span, li); };
    span.onmouseleave = function() { 
        let tt = document.getElementById('hover-tooltip');
        if(tt) tt.style.display = 'none'; 
    };

    li.appendChild(span);

    // Married Info
    if(member.married_at) {
        let info = document.createElement('span');
        info.className = "married-info"; 
        info.innerText = ` married at ${member.married_at}`;
        info.style.fontSize = "11px";
        info.style.color = "#886000";
        info.style.fontStyle = "italic";
        info.style.marginLeft = "8px";
        li.appendChild(info);
    }

    // Children (Recursion)
    if (member.children && member.children.length > 0) {
        const ul = document.createElement('ul');
        ul.className = "tree-ul";
        member.children.forEach(child => {
            ul.appendChild(buildNode(child, false, depth + 1));
        });
        li.appendChild(ul);
    }
    return li;
}

// --- 3. CALCULATE RELATIONS (✅ Updated: Only Son/Daughter Logic) ---
function getDetails(span, li) {
    let parentLi = li.parentElement.closest('li');
    let fatherName = "Founder";
    let relation = "Root Ancestor";
    let siblingText = "";
    
    // Generation Count
    let depth = 1;
    let temp = li;
    while(temp.parentElement.closest('li')) { depth++; temp = temp.parentElement.closest('li'); }
    
    if(parentLi) {
        fatherName = parentLi.querySelector('span').innerText;
        
        let parentUl = li.parentElement;
        // Total Siblings (Sabko gino)
        let allSiblings = Array.from(parentUl.children).filter(child => child.tagName === 'LI');
        let totalSiblings = allSiblings.length;

        // Gender Check
        let myName = span.innerText.toLowerCase();
        let isDaughter = myName.includes('baisa') || myName.includes('bai'); 
        
        // Filter Same Gender (Sirf bhai ya sirf behne gino)
        let sameGenderSiblings = allSiblings.filter(sib => {
            let sibName = sib.querySelector('span').innerText.toLowerCase();
            let sibIsDaughter = sibName.includes('baisa') || sibName.includes('bai');
            return isDaughter === sibIsDaughter; 
        });

        // My Position
        let myIndex = sameGenderSiblings.indexOf(li) + 1;
        let genderCount = sameGenderSiblings.length; // Total same gender
        
        let childType = isDaughter ? "Daughter" : "Son";

        // ✅ LOGIC: Only Son / Only Daughter
        if (genderCount === 1) {
            relation = `Only ${childType}`;
        } else {
            let suffix = (myIndex === 1) ? 'st' : (myIndex === 2) ? 'nd' : (myIndex === 3) ? 'rd' : 'th';
            relation = `${myIndex}${suffix} ${childType}`;
        }
        
        // Sibling Text
        let otherSiblings = totalSiblings - 1;
        siblingText = (otherSiblings > 0) ? `Has ${otherSiblings} more sibling(s).` : "Only child.";
    }

    return {
        father: fatherName,
        relationTitle: relation,
        gen: `Generation: ${depth}`,
        siblings: siblingText
    };
}

// --- 4. SHOW RIGHT PANEL ---
function showRightPanel(span, li) {
    const panel = document.getElementById('right-panel');
    const content = document.getElementById('lineage-path'); 
    const detailsDiv = document.getElementById('panel-content'); 
    
    // 1. Details Section
    let details = getDetails(span, li);
    detailsDiv.innerHTML = `
        <div style="font-family:'Cinzel',serif; color:#800000; font-size:1.2rem; text-align:center; margin-bottom:10px;">
            ${span.innerText}
        </div>
        <div style="background:#fffbe6; padding:10px; border:1px solid #d4af37; border-radius:5px; font-size:13px;">
            <strong>${details.relationTitle}</strong> of <strong>${details.father}</strong><br>
            <span style="color:#d4af37; font-weight:bold;">${details.gen}</span>
        </div>
    `;

    // 2. Build Mini Tree HTML
    let treeHTML = `
        
        <div class="mini-tree-box" style="padding:10px; font-family:Merriweather,serif;">
    `;
    
    // Collect Path
    let pathArr = [];
    let current = li;
    while(current) {
        let s = current.querySelector('span');
        if(s) pathArr.unshift(s.innerText);
        current = current.parentElement ? current.parentElement.closest('li') : null;
    }

    // Collect Siblings
    let siblingsArr = [];
    let parentUl = li.parentElement;
    if(parentUl) {
        let allChildren = parentUl.children;
        for (let child of allChildren) {
            if(child.tagName === 'LI') {
                let sibName = child.querySelector('span').innerText;
                if(sibName !== span.innerText) siblingsArr.push(sibName);
            }
        }
    }

    // 3. Render Path
    let margin = 0;
    pathArr.forEach((name, index) => {
        let isLast = (index === pathArr.length - 1);
        let lineHeight = '15px'; // L-Shape fix

        let nodeStyle = isLast 
            ? 'color:#800000; font-weight:bold; background:#fff0d0; padding:5px; border:1px solid #d4af37; border-radius:4px; display:inline-block;' 
            : 'color:#333; font-weight:bold;';

        treeHTML += `
            <div style="position:relative; padding:5px 0 5px 25px; margin-left:${margin}px;">
                <div style="position:absolute; left:0; top:0; width:2px; height:${lineHeight}; background:#d4af37;"></div>
                <div style="position:absolute; left:0; top:15px; width:20px; height:2px; background:#d4af37;"></div>
                <span style="${nodeStyle}">${name}</span>
            </div>
        `;
        margin += 15; 
    });

    // 4. Render Siblings
    let siblingMargin = margin - 15; 
    
    if(siblingsArr.length > 0) {
        treeHTML += `<div style="margin-left:${siblingMargin + 5}px; font-size:11px; color:#800000; margin-top:10px; margin-bottom:5px;"><i>Siblings:</i></div>`;
        
        siblingsArr.forEach((sib, idx) => {
            let sibLineHeight = '15px'; // L-Shape fix

            treeHTML += `
                <div style="position:relative; padding:2px 0 2px 25px; margin-left:${siblingMargin}px; font-size:12px; color:#555;">
                    <div style="position:absolute; left:0; top:0; width:2px; height:${sibLineHeight}; background:#d4af37;"></div>
                    <div style="position:absolute; left:0; top:12px; width:20px; height:1px; background:#999; border-top:1px dashed #999;"></div>
                    ${sib}
                </div>
            `;
        });
    } else {
         treeHTML += `<div style="margin-left:${siblingMargin + 25}px; font-size:11px; color:#888; margin-top:5px;">(Only Child)</div>`;
    }

    treeHTML += '</div>'; 
    content.innerHTML = treeHTML;

    panel.classList.add('open');
    let leftPanel = document.getElementById('left-panel');
    if(leftPanel) leftPanel.classList.remove('open');
}

// --- 5. CLOSE PANEL ---
function closeRightPanel() {
    let panel = document.getElementById('right-panel');
    if(panel) panel.classList.remove('open');
    
    document.querySelectorAll('.highlight-green').forEach(el => el.classList.remove('highlight-green'));
}

// --- 6. HANDLE CLICKS & SEARCH ---
function handleNameClick(id, span, li) {
    document.querySelectorAll('.highlight-green').forEach(el => el.classList.remove('highlight-green'));
    highlightPath(li);
    span.classList.add('highlight-green');
    showRightPanel(span, li);
}

function highlightPath(li) {
    let current = li;
    while(current) {
        if(current.tagName==='LI') {
            let s=current.querySelector('span'); 
            if(s) s.classList.add('highlight-green');
        }
        current=current.parentElement?current.parentElement.closest('li'):null;
    }
}

function filterNames() {
    let input = document.getElementById('search-box');
    let val = input.value.toLowerCase();
    
    let btn = document.getElementById('clear-btn');
    if(btn) btn.style.display = val.length > 0 ? "block" : "none";

    renderIndex(allMembers.filter(m => m.name.toLowerCase().includes(val)));
}

function clearSearch() {
    let input = document.getElementById('search-box');
    if(input) {
        input.value = "";
        filterNames();
    }
}

function renderIndex(list) {
    const ul = document.getElementById('index-list');
    if(!ul) return;
    ul.innerHTML = "";
    list.forEach(item => {
        let li = document.createElement('li');
        li.innerText = item.name;
        li.style.cursor = "pointer";
        li.onclick = function() {
            toggleLeftPanel(); 
            let target = document.getElementById(item.id);
            if(target) {
                target.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                target.click(); 
            }
        };
        ul.appendChild(li);
    });
}

// --- 7. UI TOGGLES ---
function toggleMobileMenu() {
    let menu = document.getElementById('mobileMenu');
    // Mobile menu ID check
    if (!menu) menu = document.querySelector('.nav-links'); 
    
    if (menu) menu.classList.toggle('active');
}

function toggleLeftPanel() { 
    let left = document.getElementById('left-panel');
    let right = document.getElementById('right-panel');
    let menu = document.getElementById('mobileMenu');
    if(!menu) menu = document.querySelector('.nav-links');
    
    if(left) left.classList.toggle('open');
    if(right) right.classList.remove('open');
    if(menu) menu.classList.remove('active');
}

// ✅ NEW FUNCTION: MOBILE MENU LISTENERS
function setupMobileMenu() {
    let menuLinks = document.querySelectorAll('.nav-links a');
    let menu = document.querySelector('.nav-links');

    if(menu && menuLinks.length > 0) {
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active'); // Link click par menu band
            });
        });

        // Bahar click karne par band
        document.addEventListener('click', function(event) {
            let hamburger = document.querySelector('.hamburger');
            let isClickInside = menu.contains(event.target) || (hamburger && hamburger.contains(event.target));
            
            if (!isClickInside && menu.classList.contains('active')) {
                menu.classList.remove('active');
            }
        });
    }
}

function showTooltip(span, li) {
    let tooltip = document.getElementById('hover-tooltip');
    if(!tooltip) return;

    let details = getDetails(span, li);
    tooltip.innerHTML = `
        <div style="border-bottom:1px solid #777; padding-bottom:3px; margin-bottom:3px; color:#fff;">
            <strong>${span.innerText}</strong>
        </div>
        <div style="font-size:11px; color:#ddd;">
            ${details.relationTitle} of ${details.father}<br>
            <span style="color:#ffd700;">${details.gen}</span>
        </div>
    `;
    tooltip.style.display = 'block';
    let rect = span.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 5) + 'px';
}

function closePanelsOutside(e) {
    if(!e.target.closest('.member-box') && !e.target.closest('.smart-tools-container')) {
        closeRightPanel();
        let left = document.getElementById('left-panel');
        if(left) left.classList.remove('open');
    }
}

// --- 8. SMART TOOLS ---
function zoomIn() { if (currentZoom < 2) { currentZoom += 0.1; applyZoom(); } }
function zoomOut() { if (currentZoom > 0.3) { currentZoom -= 0.1; applyZoom(); } }
function resetZoom() { currentZoom = 1; applyZoom(); }

function applyZoom() {
    const treeRoot = document.getElementById('tree-root');
    if(treeRoot) {
        treeRoot.style.transform = `scale(${currentZoom})`;
        treeRoot.style.transformOrigin = "top center"; 
        treeRoot.style.marginTop = (currentZoom > 1) ? `${(currentZoom - 1) * 20}px` : "0";
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); } 
    else { if (document.exitFullscreen) document.exitFullscreen(); }
}

function toggleSmartMenu() {
    let options = document.getElementById('smartOptions');
    options.classList.toggle('show');
    
    let btnIcon = document.querySelector('.tools-toggle-btn i');
    if(options.classList.contains('show')) {
        btnIcon.classList.remove('fa-cog');
        btnIcon.classList.add('fa-times'); 
    } else {
        btnIcon.classList.remove('fa-times');
        btnIcon.classList.add('fa-cog'); 
    }
}

window.addEventListener('click', function(e) {
    let container = document.querySelector('.smart-tools-container');
    if (container && !container.contains(e.target)) {
        let options = document.getElementById('smartOptions');
        if(options && options.classList.contains('show')) {
            toggleSmartMenu(); 
        }
    }
});

function downloadImage() {
    const element = document.getElementById('right-panel');

    if (!element.classList.contains('open') && element.style.right !== "10px") {
        alert("Hukum, pehle kisi naam par click karein taki Path dikhai de.");
        return;
    }

    const btn = document.querySelector('.smart-btn[title="Download"] i');
    const oldClass = btn.className;
    btn.className = "fas fa-spinner fa-spin"; 

    html2canvas(element, { 
        scale: 2, 
        backgroundColor: "#fffbf0", 
        useCORS: true 
    }).then(canvas => {
        let link = document.createElement('a');
        link.download = 'Ancestral-Path.png'; 
        link.href = canvas.toDataURL('image/png');
        link.click();
        btn.className = oldClass;
    }).catch(err => {
        console.error("Photo error:", err);
        alert("Error: Photo nahi le paye.");
        btn.className = oldClass;
    });
}