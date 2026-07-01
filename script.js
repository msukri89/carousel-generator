const inputScreen = document.getElementById('input-screen');
const reviewScreen = document.getElementById('review-screen');
const generateBtn = document.getElementById('generate-btn');
const backBtn = document.getElementById('back-btn');
const downloadBtn = document.getElementById('download-btn');
const carouselContent = document.getElementById('carousel-content');
const slideInputsContainer = document.getElementById('slide-inputs-container');
const bgInput = document.getElementById('bg-input');
const uploadText = document.getElementById('upload-text');
const toolbar = document.getElementById('text-toolbar');

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
        <div id="utama${i}" class="input-field utama-input" contenteditable="true" placeholder="Teks Utama..."></div>
        <div id="cta${i}" class="input-field" contenteditable="true" placeholder="Teks Sorotan..."></div>
        <div id="bawah${i}" class="input-field" contenteditable="true" placeholder="Teks Bawah/Kecil..."></div>
    `;
    slideInputsContainer.appendChild(card);
}

// === LOGIKA FLOATING TOOLBAR ===
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    
    // Cek apakah ada teks yang di-blok dan kita berada di halaman input
    if (selection.rangeCount > 0 && !selection.isCollapsed && inputScreen.classList.contains('active')) {
        const range = selection.getRangeAt(0);
        // Pastikan teks yang di-blok ada di dalam area input-field
        const isInsideInput = range.commonAncestorContainer.parentElement?.closest('.input-field') || 
                              range.commonAncestorContainer.closest?.('.input-field');
        
        if (isInsideInput) {
            const rect = range.getBoundingClientRect();
            // Posisikan toolbar tepat di atas teks yang diblok
            toolbar.style.top = `${rect.top - 45}px`;
            toolbar.style.left = `${rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
            toolbar.classList.remove('toolbar-hidden');
            return;
        }
    }
    // Sembunyikan jika tidak ada teks yang di-blok
    toolbar.classList.add('toolbar-hidden');
});

// Fungsi untuk menerapkan format pada teks yang diblok
window.applyFormat = function(styleKey, styleValue, event) {
    event.preventDefault(); // Cegah kehilangan fokus
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style[styleKey] = styleValue;

    try {
        range.surroundContents(span);
    } catch (e) {
        alert("Blok teks dalam satu blok baris saja ya untuk diformat.");
    }
    
    selection.removeAllRanges();
    toolbar.classList.add('toolbar-hidden');
};
// ================================

// Tombol Generate Ditekan
generateBtn.addEventListener('click', () => {
    carouselContent.innerHTML = '';
    
    let activeSlidesData = [];

    // Mengumpulkan data slide yang diisi (menggunakan innerHTML agar style dari span ikut terbawa)
    for (let i = 1; i <= 5; i++) {
        const utama = document.getElementById(`utama${i}`).innerHTML.trim();
        const cta = document.getElementById(`cta${i}`).innerHTML.trim();
        const bawah = document.getElementById(`bawah${i}`).innerHTML.trim();
        
        // Cek jika field hanya berisi tag html kosong (<br>) atau string kosong
        const isEmpty = (str) => str === '' || str === '<br>';

        if (!isEmpty(utama) || !isEmpty(cta) || !isEmpty(bawah)) {
            activeSlidesData.push({ utama, cta, bawah });
        }
    }

    if(activeSlidesData.length === 0) {
        alert("Isi minimal 1 slide terlebih dahulu!");
        return;
    }

    const totalSlides = activeSlidesData.length;

    // Membangun Slide 
    activeSlidesData.forEach((data, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        if (bgImageUrl !== '') {
            slide.style.backgroundImage = `url(${bgImageUrl})`;
            slide.style.backgroundSize = `${totalSlides * 100}% 100%`;
            let positionX = totalSlides > 1 ? (index * (100 / (totalSlides - 1))) : 0;
            slide.style.backgroundPosition = `${positionX}% center`;
            slide.style.boxShadow = 'inset 0 0 0 1000px rgba(255,255,255,0.85)';
        }

        let contentHTML = '<div style="flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%;">';
        if(data.utama) contentHTML += `<div class="teks-utama">${data.utama}</div>`;
        if(data.cta) contentHTML += `<div class="teks-cta">${data.cta}</div>`;
        contentHTML += '</div>';
        
        if(data.bawah) contentHTML += `<div class="teks-bawah">${data.bawah}</div>`;
        
        slide.innerHTML = contentHTML;
        carouselContent.appendChild(slide);
    });

    inputScreen.classList.remove('active');
    reviewScreen.classList.add('active');
    toolbar.classList.add('toolbar-hidden'); // Pastikan toolbar sembunyi

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

// Fitur DOWNLOAD
downloadBtn.addEventListener('click', async () => {
    downloadBtn.innerText = 'Memproses... ⏳';
    downloadBtn.disabled = true;
    
    const slides = document.querySelectorAll('.swiper-slide');
    
    for(let i = 0; i < slides.length; i++) {
        swiperInstance.slideTo(i, 0); 
        await new Promise(r => setTimeout(r, 300));
        
        const canvas = await html2canvas(slides[i], { scale: 2, useCORS: true });
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
