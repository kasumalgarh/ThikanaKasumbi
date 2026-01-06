 
    const MAIN_LINEAGE_NAMES = [
        "Raj Shree Thakur Saheb Narayan Singh",
        "Th. Akhe Singh", "Th. Mangal Singh", "Th. Bakhtawar Singh",
        "Th. Raghunath Singh", "Th. Roop Singh", "Th. Ridmal Singh",
        "Th. Bhairu Singh", "Th. Mahendra Singh", "Yuvraj GajRaj Singh",
        "Bh.Khushvendra Singh"
    ];

    let allMembers = [];
    let currentZoom = 1;
    let isRightPanelOpen = false;
    let rootNodeName = "";

    function generateTreeHTML(member, isRoot, depth) {
        if (!member) return '';
        if(isRoot) rootNodeName = member.name;
        let uniqueId = "node-" + Math.floor(Math.random() * 10000000);
        allMembers.push({ name: member.name, id: uniqueId, depth: depth, data: member });

        let hasChild = (member.children && member.children.length > 0);
        let liClass = isRoot ? 'root-li gen-1' : (hasChild ? `has-children gen-${depth}` : `gen-${depth}`);
        let nameClass = isRoot ? 'root-name' : 'tree-name';
        
        // CHANGE 1: Root Name को Bold करने के लिए strong टैग लगाया
        let displayName = isRoot ? `<strong>${member.name}</strong>` : member.name;

        if(MAIN_LINEAGE_NAMES.includes(member.name.trim())) { nameClass += " main-lineage-node"; }

        // Root gets NO button.
        let toggleBtn = (hasChild && !isRoot) ? `<span class="toggle-btn" data-id="${uniqueId}">+</span>` : '';

        let html = `<li class="${liClass}" id="li-${uniqueId}">`;
        html += `<div class="tree-name-wrapper">
                    ${toggleBtn}
                    <span class="${nameClass}" id="${uniqueId}" data-id="${uniqueId}">${displayName}</span>
                 </div>`;

        if (hasChild) {
            let ulClass = isRoot ? 'root-ul' : 'children-group';
            // CHANGE 2: Default style display:none ताकि शुरुआत में सब बंद रहे
            let ulStyle = 'style="display:none;"'; 
            html += `<ul class="${ulClass}" ${ulStyle}>`;
            member.children.forEach(child => { html += generateTreeHTML(child, false, depth + 1); });
            html += '</ul>';
        }
        html += '</li>';
        return html;
    }

    $(window).on('load', function() {
        setTimeout(() => { $('#loadingOverlay').fadeOut(); $('.tree-container').addClass('loaded'); }, 800);
    });

    $(document).ready(function() {
        if (typeof familyData !== 'undefined') {
            allMembers = [];
            // CHANGE 3: Root UL को भी शुरुआत में display:none कर दिया
            let treeHTML = '<ul class="root-ul" style="display:none;">' + generateTreeHTML(familyData, true, 1) + '</ul>';
            $('#royalTreeArea').html(treeHTML);
            populateIndex();
        } else {
            $('#royalTreeArea').html('<h3 style="color:red; text-align:center;">Data File Missing!</h3>');
        }

        $(document).on('click', '.toggle-btn', function(e) {
            e.stopPropagation();
            let btn = $(this), ul = btn.closest('li').children('ul');
            if(ul.is(':visible')) { ul.slideUp(200); btn.text('+'); } 
            else { ul.slideDown(200); btn.text('-'); }
        });

        $(document).on('click', '.tree-name, .root-name', function(e) {
            showDetails($(this).attr('data-id'), e);
        });

        $(document).on('mouseenter', '.tree-name', function(e) {
             if(window.innerWidth > 768) showTooltip($(this).attr('data-id'), e);
        }).on('mouseleave', '.tree-name', function() { hideTooltip(); });
    });

    /* --- LOGIC CHANGE: Beta/Beti ki alag ginti --- */
    function getMemberInfo(id) {
        let el = $('#' + id);
        let memberObj = allMembers.find(m => m.id === id);
        
        // 1. Father Logic
        let parentLi = el.closest('li').parent('ul').closest('li');
        let fatherName = "Raj Shree Thakur Saheb Narayan Singh"; 
        
        if(parentLi.length > 0) {
            fatherName = parentLi.find('> .tree-name-wrapper > .tree-name, > .tree-name-wrapper > .root-name').text().trim();
        }

        // 2. Siblings & Gender Logic (Corrected)
        let myUl = el.closest('ul');
        let siblings = [];
        
        // Counters
        let sonCount = 0;
        let daughterCount = 0;
        let myGender = "Son"; // Default
        let myRank = 0; // Mai kitne number ka beta/beti hu

        if(myUl.length) {
            myUl.children('li').each(function() {
                // Get name safely
                let nameSpan = $(this).find('> .tree-name-wrapper > .tree-name, > .tree-name-wrapper > .root-name');
                let rawName = nameSpan.text().trim();
                let nameLower = rawName.toLowerCase();
                
                // Gender Check Helper
                let isFemale = (nameLower.includes('baisa') || nameLower.includes('bai') || nameLower.includes('rajlaxmi') || nameLower.includes('yogita') || nameLower.includes('garima'));
                
                // Increment Global Counts for this group
                if(isFemale) {
                    daughterCount++;
                } else {
                    sonCount++;
                }

                // Check if this node is ME
                if($(this).attr('id') === el.closest('li').attr('id')) {
                    myGender = isFemale ? "Daughter" : "Son";
                    myRank = isFemale ? daughterCount : sonCount; // Assign current count as my rank
                } else {
                    // Add to siblings list for display
                    siblings.push(rawName);
                }
            });
        }

        // 3. Text Generation based on new counts
        let relationText = "";
        let totalOfMyType = (myGender === "Daughter") ? daughterCount : sonCount;

        if (totalOfMyType === 1) {
            relationText = `Only ${myGender}`;
        } else {
            let suffix = (myRank===1)?'st':(myRank===2)?'nd':(myRank===3)?'rd':'th';
            // Optional: 1st ko "Eldest" likhna ho to yaha change karein
            if(myRank === 1) relationText = `Eldest ${myGender}`;
            else relationText = `${myRank}${suffix} ${myGender}`;
        }

        let sibNamesStr = siblings.length > 0 ? `<br><span style="font-size:11px; color:#800000;">(${siblings.join(', ')})</span>` : "";

        // 4. PATH HIGHLIGHTING
        let pathArray = [];
        $('.is-ancestor').removeClass('is-ancestor');
        $('.path-connector').removeClass('path-connector');

        el.parents('li').add(el.closest('li')).each(function() {
            $(this).addClass('is-ancestor');
            $(this).prevAll('li').addClass('path-connector');
            let span = $(this).children('.tree-name-wrapper').children('.tree-name, .root-name');
            if(span.length > 0) pathArray.push(span.text().trim());
        });

        return {
            name: memberObj.name,
            father: fatherName,
            relation: relationText, // Updated Relation
            siblingsDesc: siblings.length>0 ? `He has ${siblings.length} more siblings` : `Only Child`,
            sibNames: sibNamesStr,
            gen: `${memberObj.depth}th Gen`, 
            path: pathArray
        };
    }

    function showDetails(id, e) {
        e.stopPropagation();
        $('.highlight-node').removeClass('highlight-node');
        $('#' + id).addClass('highlight-node');

        let info = getMemberInfo(id);

        let detailsHTML = `
            <div class="gen-seal">
                <span class="gen-label">Gen</span>
                <span class="gen-number">${info.gen.split(' ')[0].replace(/th|st|nd|rd/g, '')}</span>
            </div>
            <h3 style="color:#800000; font-family:'Cinzel'; margin-top:5px;">${info.name}</h3>
            <div style="background:#fffbe6; padding:15px; border:1px solid #d4af37; border-radius:5px; font-family:'Merriweather'; font-size:13px; line-height:1.8;">
                <strong>${info.relation}</strong> of <strong>${info.father}</strong><br>
                <span style="color:#555;">${info.siblingsDesc} ${info.sibNames}</span><br>
                <span style="color:#800000; font-weight:bold; display:block; margin-top:5px;">${info.gen}</span>
            </div>
        `;
        $('#memberDetails').html(detailsHTML);

        let pathHTML = '';
        info.path.forEach((name, idx) => {
            let isLast = idx === info.path.length - 1;
            let style = isLast ? "color:#800000; font-weight:bold; background:#fff0d0; padding:2px 5px; border-radius:3px;" : "";
            let arrow = isLast ? '' : ' <i class="fas fa-arrow-down" style="font-size:10px; color:#d4af37; margin-left:5px;"></i>';
            pathHTML += `<div class="path-node" style="border-left:none; padding-left:0; margin-bottom:5px;">
                            <span style="${style}">${name}</span>${arrow}
                         </div>`;
        });
        $('#ancestralPath').html(pathHTML);

        $('#rightPanel').addClass('open'); $('#leftPanel').removeClass('open'); isRightPanelOpen = true;
    }

    function showTooltip(id, e) {
        let info = getMemberInfo(id);
        $('#hoverTooltip').html(`<strong style="color:#d4af37">${info.name}</strong><br>${info.relation} of ${info.father}<br>${info.gen}`).css({top:e.clientY+15, left:e.clientX+15}).show();
    }
    function hideTooltip() { $('#hoverTooltip').hide(); }

    function toggleRootChildren() {
        // Toggle Logic Fix: Ab ye hidden state se shuru karega
        let rootUl = $('.root-ul');
        if(rootUl.is(':visible')) { rootUl.slideUp(); } else { rootUl.slideDown(); }
    }

    function shareWhatsApp() {
        let msg = "हुकम, देखिए ठिकाना कसूँभी (जाखलां) की डिजिटल वंशावली। (नोट: फोटो डाउनलोड करके साथ में भेजें) \n Link: " + window.location.href;
        window.open(`whatsapp://send?text=${encodeURIComponent(msg)}`);
    }

    function captureRightPanel() {
        if(!isRightPanelOpen) { alert("Please select a member first."); return; }
        let btn = $('.mini-fab[title="Download Full HD"] i');
        btn.attr('class', 'fas fa-spinner fa-spin');

        let currentName = $('#memberDetails h3').text().replace(/ /g, "_");
        let clone = document.getElementById("captureTarget").cloneNode(true);
        
        let watermark = document.createElement("div");
        watermark.innerHTML = "Yuvraj Gajraj Singh<br><span style='font-size:0.6em'>kasumalgarh.site</span>";
        watermark.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(-45deg); font-size:24px; color:rgba(0,0,0,0.1); font-weight:bold; font-family:'Cinzel'; text-align:center; z-index:0; line-height:1.2;";
        clone.appendChild(watermark);

        clone.style.width = "320px"; clone.style.height = "auto"; clone.style.maxHeight = "none"; clone.style.overflow = "visible";
        clone.style.position = "fixed"; clone.style.top = "-10000px"; clone.style.left = "0"; clone.style.background = "#fffbf0"; clone.style.zIndex = "5000";
        document.body.appendChild(clone);

        html2canvas(clone, { scale: 4, backgroundColor: "#fffbf0", useCORS: true }).then(canvas => {
            let link = document.createElement('a');
            link.download = `Vanshawali_${currentName}.png`;
            link.href = canvas.toDataURL();
            link.click();
            document.body.removeChild(clone);
            btn.attr('class', 'fas fa-camera');
        }).catch(e => { console.log(e); btn.attr('class', 'fas fa-camera'); });
    }

    function toggleLeftPanel() { $('#leftPanel').toggleClass('open'); closeRightPanel(); }
    function closeRightPanel() { $('#rightPanel').removeClass('open'); isRightPanelOpen = false; }
    function toggleFab(btn) { $(btn).toggleClass('active'); $('#fabOptions').toggleClass('show'); }
    function zoomIn() { if(currentZoom < 3) currentZoom += 0.1; $('#treeArea').css('transform', `scale(${currentZoom})`); }
    function zoomOut() { if(currentZoom > 0.3) currentZoom -= 0.1; $('#treeArea').css('transform', `scale(${currentZoom})`); }
    function resetTree() { $('.children-group').slideUp(); $('.toggle-btn').text('+'); currentZoom=1; $('#treeArea').css('transform', `scale(1)`); closeRightPanel(); $('.is-ancestor').removeClass('is-ancestor'); $('.path-connector').removeClass('path-connector'); }
    function toggleFullScreen() { if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(()=>{}); } else { if (document.exitFullscreen) document.exitFullscreen(); } }
    
    function populateIndex() { let l=$('#indexList'); l.empty(); [...allMembers].sort((a,b)=>a.name.localeCompare(b.name)).forEach(m=>l.append(`<li onclick="jumpToNode('${m.id}')">${m.name}</li>`)); }
    
    function filterIndex() { 
        let v = $('#searchBox').val().toLowerCase(); 
        $('#clearSearchBtn').toggle(v.length > 0); 
        $('#indexList li').each(function() {
            let text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(v) > -1);
        });
    }

    function clearSearch() { $('#searchBox').val(''); filterIndex(); }
    
    function jumpToNode(id) { 
        toggleLeftPanel(); 
        let el=$('#'+id); 
        if(el.length===0) return;
        el.parents('ul').show(); 
        el.parents('li').each(function(){ $(this).find('.toggle-btn').first().text('-'); });
        setTimeout(()=>{
            el[0].scrollIntoView({behavior:"smooth",block:"center",inline:"center"}); 
            el.trigger('click');
        },400); 
    }
    
    function openRequestModal(){$('#requestModal').fadeIn();} function closeRequestModal(){$('#requestModal').fadeOut();}
    function sendRequest(){ let n=$('#reqName').val(), m=$('#reqMsg').val(); if(!n||!m) return; emailjs.send("service_vdnox8p", "template_xx3a4tt", {from_name:n, message:m}).then(()=>{alert("Sent!");closeRequestModal();}); }
    
    $(document).click(function(e) { 
        if(!$(e.target).closest('#rightPanel, .tree-name, .toggle-btn, .fab-container').length && $('#rightPanel').hasClass('open')) closeRightPanel();
        if(!$(e.target).closest('#leftPanel, .navbar-nav, .mobile-search-btn').length && $('#leftPanel').hasClass('open')) $('#leftPanel').removeClass('open');
    });
