// =========================================
// 👑 ROYAL SLIDER ENGINE (globaljs.js)
// =========================================

document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".kb-slide");
    
    // अगर स्लाइड्स नहीं मिली तो एरर न आए
    if (slides.length === 0) return;

    let currentSlide = 0;

    function nextSlide() {
        // पुरानी स्लाइड से active हटाओ
        slides[currentSlide].classList.remove("active");

        // अगली स्लाइड का नंबर निकालो
        currentSlide = (currentSlide + 1) % slides.length;

        // नई स्लाइड में active जोड़ो
        slides[currentSlide].classList.add("active");
    }

    // रफ्तार 2 सेकंड (3500ms) सेट की गई है
    setInterval(nextSlide, 3500);
});