/* =========================================
   PART 1: MOBILE MENU FIX (jQuery for Bootstrap 3)
   ========================================= */
$(document).ready(function () {
    
    // 1. मेनू के किसी भी लिंक पर क्लिक करने पर उसे बंद करें
    $('.navbar-nav li a').on('click', function(){
        // अगर यह ड्रॉपडाउन खोलने वाला बटन नहीं है, तभी मेनू बंद करें
        if (!$(this).hasClass('dropdown-toggle')) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // 2. स्क्रीन पर कहीं भी बाहर क्लिक करने पर मेनू बंद करें
    $(document).click(function (event) {
        var clickover = $(event.target);
        var $navbar = $(".navbar-collapse");
        // Bootstrap 3 में 'in' क्लास का मतलब है मेनू खुला है
        var _opened = $navbar.hasClass("in"); 
        
        // अगर मेनू खुला है और क्लिक मेनू बटन पर नहीं हुआ है
        if (_opened === true && !clickover.hasClass("navbar-toggle")) {
            $navbar.collapse('hide');
        }
    });

    // 3. Active Tab Highlight (कौन सा पेज खुला है)
    var path = window.location.pathname.split("/").pop();
    if (path == '') { path = 'index.html'; }
    var target = $('.navbar-nav a[href="' + path + '"]');
    target.parent().addClass('active'); // Li को active करें
    target.closest('.dropdown').addClass('active'); // अगर ड्रॉपडाउन में है तो उसे भी active करें
});


/* =========================================
   PART 2: GUESTBOOK & LIGHTBOX (Pure JavaScript)
   ========================================= */

// --- GUESTBOOK SETUP ---
const scriptURL = 'https://script.google.com/macros/s/AKfycbxUmHwP70tZouclG6GOuI3Ldfv2j-wyB9inNtrAZ3GIYjF03Au8LDbL7rw4q1GHr8Vi/exec';
const form = document.getElementById('guestbookForm');
const msgContainer = document.getElementById('messagesContainer');

if(form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        // बटन का टेक्स्ट बदलें
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> हुकम संदेश भेज रहा हूँ...';
        
        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
            .then(response => { 
                // सफलता का सन्देश
                document.getElementById('formStatus').innerHTML = "<span style='color:green; font-weight:bold;'><i class='fas fa-check-circle'></i> हुकम संदेश सफलतापूर्वक भेजा गया!</span>"; 
                form.reset(); 
                document.getElementById('submitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> भेजें (Send)'; 
                loadMessages(); // नए मैसेज लोड करें
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
            data.reverse().slice(0, 5).forEach(row => { 
                msgContainer.innerHTML += `<div style="border-bottom:1px dashed #ccc; padding:5px; font-size:0.9em;">
                    <strong style="color:#800000"><i class="fas fa-user-circle"></i> ${row[0]}</strong>: ${row[1]}
                </div>`; 
            });
        });
    }
}

// पेज लोड होते ही मैसेज लाएं
loadMessages();

// --- YEAR UPDATE ---
if(document.getElementById('year')) {
    document.getElementById('year').textContent = new Date().getFullYear();
}

// --- LIGHTBOX SCRIPTS (Images) ---
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
    if(modal) {
        modal.style.display = "none"; 
    }
}

// लाइटबॉक्स के बाहर क्लिक करने पर बंद हो
window.onclick = function(event) {
    var modal = document.getElementById("myLightbox");
    if (event.target == modal) { modal.style.display = "none"; }
}