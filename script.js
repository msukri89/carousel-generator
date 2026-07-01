const inputScreen = document.getElementById('input-screen');
const reviewScreen = document.getElementById('review-screen');
const generateBtn = document.getElementById('generate-btn');
const backBtn = document.getElementById('back-btn');
const downloadBtn = document.getElementById('download-btn');
const carouselContent = document.getElementById('carousel-content');
const slideInputsContainer = document.getElementById('slide-inputs-container');
const bgInput = document.getElementById('bg-input');
const uploadText = document.getElementById('upload-text');

let swiperInstance = null;
let bgImageUrl = '';

// Fitur Upload Gambar Seamless
bgInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            bgImageUrl = event.target.result;
            uploadText.innerText = '✅ Gambar Berhasil Diupload!';
        }
        reader.readAsDataURL(file);
    }
});

// Otomatis membuat 5 Kartu Input saat web dibuka
for (let i = 1; i <= 5; i++) {
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.innerHTML = `
        <h3>Slide ${i}</h3>
        <textarea id="utama${i}" class="input-field" placeholder="Teks Utama..."></textarea>
        <input type="text" id="cta${i}" class="input-field" placeholder="Teks CTA (Sorotan)...">
        <input type="text" id="bawah${i}" class="input-field" placeholder="Teks Bawah/Kecil...">
    `;
    slideInputsContainer.appendChild(card);
}

// Tombol Generate Ditekan
generateBtn.addEventListener('click', () => {
    carouselContent.innerHTML = '';
    
    let activeSlidesData = [];

    // Mengumpulkan data slide yang diisi
    for (let i = 1; i <= 5; i++) {
        const utama = document.getElementById(`utama${i}`).value.trim();
        const cta = document.getElementById(`cta${i}`).value.trim();
        const bawah = document.getElementById(`bawah${i}`).value.trim();
        
        if (utama !== '' || cta !== '' || bawah !== '') {
            activeSlidesData.push({ utama, cta, bawah });
        }
    }

    if(activeSlidesData.length === 0) {
        alert("Isi minimal 1 slide terlebih dahulu!");
        return;
    }

    const totalSlides = activeSlidesData.length;

    // Membangun Slide & Menghitung Posisi Gambar Seamless
    activeSlidesData.forEach((data, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        // Logika Gambar Seamless
        if (bgImageUrl !== '') {
            slide.style.backgroundImage = `url(${bgImageUrl})`;
            // Lebar gambar dibuat = (Jumlah Slide * 100)% agar menyambung sempurna
            slide.style.backgroundSize = `${totalSlides * 100}% 100%`;
            // Menggeser posisi background untuk setiap slide
            let positionX = totalSlides > 1 ? (index * (100 / (totalSlides - 1))) : 0;
            slide.style.backgroundPosition = `${positionX}% center`;
            // Mengurangi opacity putih agar gambar tembus pandang sedikit
            slide.style.boxShadow = 'inset 0 0 0 1000px rgba(255,255,255,0.85)';
        }

        // Memasukkan struktur teks
        let contentHTML = '';
        if(data.utama) contentHTML += `<div class="teks-utama">${data.utama.replace(/\n/g, '<br>')}</div>`;
        if(data.cta) contentHTML += `<div class="teks-cta">${data.cta}</div>`;
        if(data.bawah) contentHTML += `<div class="teks-bawah">${data.bawah}</div>`;
        
        slide.innerHTML = contentHTML;
        carouselContent.appendChild(slide);
    });

    // Pindah Layar
    inputScreen.classList.remove('active');
    reviewScreen.classList.add('active');

    if (swiperInstance) swiperInstance.destroy();
    
    swiperInstance = new Swiper(".mySwiper", {
        effect: "slide",
        grabCursor: true,
        pagination: { el: ".swiper-pagination", dynamicBullets: true },
    });
});

// Tombol Edit (Kembali)
backBtn.addEventListener('click', () => {
    reviewScreen.classList.remove('active');
    inputScreen.classList.add('active');
});

// Fitur DOWNLOAD SEMUA SLIDE
downloadBtn.addEventListener('click', async () => {
    downloadBtn.innerText = 'Memproses... ⏳';
    downloadBtn.disabled = true; // Nonaktifkan tombol sementara
    
    const slides = document.querySelectorAll('.swiper-slide');
    
    for(let i = 0; i < slides.length; i++) {
        // Geser swiper ke slide yang akan difoto agar render sempurna
        swiperInstance.slideTo(i, 0); 
        await new Promise(r => setTimeout(r, 300)); // Jeda 0.3 detik per foto
        
        // Memfoto slide menjadi kanvas
        const canvas = await html2canvas(slides[i], {
            scale: 2, // Resolusi tinggi agar jernih
            useCORS: true 
        });
        
        // Proses unduh gambar ke HP/Laptop
        const link = document.createElement('a');
        link.download = `Slide_Konten_${i+1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    downloadBtn.innerText = '✅ Berhasil Diunduh';
    setTimeout(() => {
        downloadBtn.innerText = 'Download Semua';
        downloadBtn.disabled = false;
    }, 3000);
});
