/* =========================================
   PART 1: MOBILE MENU FIX (Improved Logic)
   ========================================= */
$(document).ready(function () {
    
    // 1. मेनू लिंक क्लिक हैंडलर (ताकि लिंक पर क्लिक करने से मेनू बंद हो, लेकिन ड्रॉपडाउन पर नहीं)
    $('.navbar-nav li a').on('click', function(){
        // अगर यह ड्रॉपडाउन टॉगल नहीं है, तभी मेनू बंद करें
        if (!$(this).hasClass('dropdown-toggle') && !$(this).parent().hasClass('dropdown')) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // 2. बाहर क्लिक करने पर मेनू बंद करें (लेकिन मेनू के अंदर क्लिक करने पर नहीं)
    $(document).click(function (event) {
        var clickover = $(event.target);
        var $navbar = $(".navbar-collapse");
        var _opened = $navbar.hasClass("in");
        
        // अगर मेनू खुला है AND क्लिक मेनू के अंदर नहीं हुआ है AND क्लिक टॉगल बटन पर नहीं हुआ है
        if (_opened === true && !clickover.hasClass("navbar-toggle") && clickover.parents('.navbar-collapse').length === 0) {
            $navbar.collapse('hide');
        }
    });

    // 3. Active Tab Highlight
    var path = window.location.pathname.split("/").pop();
    if (path == '') { path = 'index.html'; }
    var target = $('.navbar-nav a[href="' + path + '"]');
    if(target.length > 0) {
        target.parent().addClass('active'); 
        target.closest('.dropdown').addClass('active'); 
    }
});


/* =========================================
   PART 2: GUESTBOOK & LIGHTBOX
   ========================================= */

// --- GUESTBOOK SETUP ---
// (यह कोड index.html के गेस्टबुक फॉर्म के लिए है)
const scriptURL = 'https://script.google.com/macros/s/AKfycbxUmHwP70tZouclG6GOuI3Ldfv2j-wyB9inNtrAZ3GIYjF03Au8LDbL7rw4q1GHr8Vi/exec';
const form = document.getElementById('guestbookForm');
const msgContainer = document.getElementById('messagesContainer');

if(form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> हुकम संदेश भेज रहा हूँ...';
        
        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
            .then(response => { 
                document.getElementById('formStatus').innerHTML = "<span style='color:green; font-weight:bold;'><i class='fas fa-check-circle'></i> हुकम संदेश सफलतापूर्वक भेजा गया!</span>"; 
                form.reset(); 
                document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> भेजें (Send)'; 
                loadMessages(); 
            })
            .catch(error => {
                console.error('Error!', error.message);
                document.getElementById('submitBtn').innerHTML = 'Error!';
            });
    });
}

function loadMessages() {
    if(msgContainer) {
        fetch(scriptURL).then(res => res.json()).then(data => {
            msgContainer.innerHTML = '';
            // केवल आखिरी 5 मैसेज दिखाएं
            if(data && data.length > 0){
                data.reverse().slice(0, 5).forEach(row => { 
                    msgContainer.innerHTML += `<div style="border-bottom:1px dashed #ccc; padding:5px; font-size:0.9em;">
                        <strong style="color:#800000"><i class="fas fa-user-circle"></i> ${row[0]}</strong>: ${row[1]}
                    </div>`; 
                });
            }
        }).catch(err => console.log("Guestbook Load Error"));
    }
}
loadMessages();

// --- YEAR UPDATE ---
if(document.getElementById('year')) {
    document.getElementById('year').textContent = new Date().getFullYear();
}

// --- LIGHTBOX SCRIPTS (Home & Gallery Updates) ---
function openLightbox(element) {
    var modal = document.getElementById("myLightbox");
    var modalImg = document.getElementById("img01");
    if(modal && modalImg) {
        modal.style.display = "block";
        modalImg.src = element.src;
    }
}

function closeLightbox() { 
    var modal = document.getElementById("myLightbox");
    if(modal) { modal.style.display = "none"; }
}

window.onclick = function(event) {
    var modal = document.getElementById("myLightbox");
    if (event.target == modal) { modal.style.display = "none"; }
}


/* =========================================
   PART 3: GALLERY PAGE LOGIC (Real Upload Engine)
   ========================================= */

// 1. Gallery Filters
function filterGallery(category) {
    $('.filter-btn').removeClass('active');
    if(window.event && window.event.target) { $(window.event.target).addClass('active'); }

    if (category == 'all') {
        $('#photos-section, #videos-section').fadeIn(400);
    } else if (category == 'photo') {
        $('#videos-section').hide();
        $('#photos-section').fadeIn(400);
    } else if (category == 'video') {
        $('#photos-section').hide();
        $('#videos-section').fadeIn(400);
    }
}

// 2. Open Gallery Modal (Images & Videos)
function openGalleryModal(element, type) {
    var modal = document.getElementById("galleryModal");
    var img = document.getElementById("modalImg");
    var vid = document.getElementById("modalVideo");
    
    if(modal) {
        modal.style.display = "block";
        if (type === 'photo') {
            img.style.display = "block";
            vid.style.display = "none";
            img.src = element.src; 
        } else if (type === 'video') {
            img.style.display = "none";
            vid.style.display = "block";
            var videoId = element.getAttribute("data-video-id");
            vid.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
        }
    }
}

function closeGalleryModal() {
    var modal = document.getElementById("galleryModal");
    if(modal) {
        modal.style.display = "none";
        var vid = document.getElementById("modalVideo");
        if(vid) vid.src = ""; 
    }
}

// 3. Add Yours Form Logic (Pop-up Open/Close)
function openForm() { 
    var formModal = document.getElementById('addYoursModal');
    if(formModal) formModal.style.display = "block"; 
}
function closeForm() { 
    var formModal = document.getElementById('addYoursModal');
    if(formModal) formModal.style.display = "none"; 
}

// 4. REAL SEND DATA LOGIC (EmailJS Integration)
function sendData() {
    // डाटा उठाओ
    var name = document.getElementById('senderName').value.trim();
    var email = document.getElementById('senderEmail').value.trim();
    var msg = document.getElementById('senderMsg').value.trim();
    var fileInput = document.getElementById('senderFile');
    var file = fileInput.files[0];
    
    // बटन ढूंढो
    var btn = document.querySelector('.submit-btn');

    // चेक करो सब भरा है या नहीं
    if (!name || !email || !file) {
        alert("हुकुम, नाम, ईमेल और फोटो भरना अनिवार्य है!");
        return;
    }

    // बटन को डिसेबल करो ताकि दो बार क्लिक न हो
    if(btn) {
        btn.disabled = true;
        btn.innerText = "हुकुम, प्रतीक्षा करें...";
        btn.style.opacity = "0.7";
    }

    // फाइल रीडर (File Reader) - फोटो को कोड में बदलने के लिए
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        
        // **COMPRESSION LOGIC** (Canvas का उपयोग करके फोटो छोटी करें)
        var img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            
            // साइज़ सेट करें (Max Width 600px)
            var maxWidth = 600;
            var scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // कम क्वालिटी (0.5) में कन्वर्ट करें ताकि ईमेल जल्दी जाए
            var compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

            // EmailJS को भेजें
            emailjs.send('service_vdnox8p', 'template_xx3a4tt', {
                from_name: name,
                from_email: email,
                message: msg,
                content: compressedBase64 
            })
            .then(function() {
                alert('खम्मा घणी! आपकी यादें सफलतापूर्वक ठिकाना कसुम्बी पहुँच गई हैं।');
                if(btn) {
                    btn.disabled = false;
                    btn.innerText = "SUBMIT";
                    btn.style.opacity = "1";
                }
                closeForm();
                // फॉर्म खाली करें
                document.getElementById('senderName').value = "";
                document.getElementById('senderEmail').value = "";
                document.getElementById('senderMsg').value = "";
                document.getElementById('senderFile').value = "";
            }, function(error) {
                alert('विफलता! हुकुम, शायद इंटरनेट धीमा है या सर्विस में दिक्कत है।\nError: ' + JSON.stringify(error));
                if(btn) {
                    btn.disabled = false;
                    btn.innerText = "Retry";
                    btn.style.opacity = "1";
                }
                console.log('Error:', error);
            });
        };
    };
}