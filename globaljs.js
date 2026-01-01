// =========================================
// 👑 ROYAL SLIDER ENGINE (globaljs.js)
// =========================================

document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".kb-slide");
    let currentSlide = 0;

    function nextSlide() {
        // पुरानी स्लाइड से 'active' हटाओ
        slides[currentSlide].classList.remove("active");

        // अगली स्लाइड पर जाओ
        currentSlide = (currentSlide + 1) % slides.length;

        // नई स्लाइड में 'active' जोड़ो
        slides[currentSlide].classList.add("active");
    }

    // हर 5 सेकंड (5000ms) में फोटो बदलेगी
    setInterval(nextSlide, 5000);
});