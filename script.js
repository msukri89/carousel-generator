// Mengambil elemen dari HTML
const inputScreen = document.getElementById('input-screen');
const reviewScreen = document.getElementById('review-screen');
const generateBtn = document.getElementById('generate-btn');
const backBtn = document.getElementById('back-btn');
const carouselContent = document.getElementById('carousel-content');

let swiperInstance = null;

// Ketika tombol Generate ditekan
generateBtn.addEventListener('click', () => {
    // Bersihkan slide lama
    carouselContent.innerHTML = '';

    // Ambil teks dari 5 kotak input
    for (let i = 1; i <= 5; i++) {
        const textValue = document.getElementById(`text${i}`).value;
        
        // Buat slide baru hanya jika ada teksnya
        if (textValue.trim() !== '') {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<div>${textValue}</div>`;
            carouselContent.appendChild(slide);
        }
    }

    // Pindah ke layar Review
    inputScreen.classList.remove('active');
    reviewScreen.classList.active = true; // reset
    setTimeout(() => reviewScreen.classList.add('active'), 50);

    // Aktifkan Swiper.js untuk transisi rapi
    if (swiperInstance) {
        swiperInstance.destroy(); // Hapus yang lama jika ada
    }
    
    swiperInstance = new Swiper(".mySwiper", {
        effect: "slide", // Transisi geser mulus
        grabCursor: true,
        pagination: {
            el: ".swiper-pagination",
            dynamicBullets: true,
        },
    });
});

// Ketika tombol Edit Teks (Kembali) ditekan
backBtn.addEventListener('click', () => {
    reviewScreen.classList.remove('active');
    setTimeout(() => inputScreen.classList.add('active'), 50);
});

