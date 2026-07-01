const inputScreen = document.getElementById('input-screen');
const reviewScreen = document.getElementById('review-screen');
const generateBtn = document.getElementById('generate-btn');
const backBtn = document.getElementById('back-btn');
const downloadBtn = document.getElementById('download-btn');
const carouselContent = document.getElementById('carousel-content');
const slideInputsContainer = document.getElementById('slide-inputs-container');
const bgInput = document.getElementById('bg-input');
const uploadText = document.getElementById('upload-text');
const stylePanel = document.getElementById('style-panel');

let swiperInstance = null;
let bgImageUrl = '';
let activeEl = null; // Menyimpan elemen teks yang sedang diedit

// Upload Gambar Seamless
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

// Otomatis membuat 5 Kartu Input
for (let i = 1; i <= 5; i++) {
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.innerHTML = `
        <h3>Slide ${i}</h3>
        <textarea id="utama${i}" class="input-field" placeholder="Teks Utama..."></textarea>
        <input type="text" id="cta${i}" class="input-field" placeholder="Teks Sorotan (CTA)...">
        <input type="text" id="bawah${i}" class="input-field" placeholder="Teks Bawah/Kecil...">
    `;
    slideInputsContainer.appendChild(card);
}

// Generate Ditekan
generateBtn.addEventListener('click', () => {
    carouselContent.innerHTML = '';
    let activeSlidesData = [];

    // Ambil nilai dari layar input
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

    // Build Slides
    activeSlidesData.forEach((data, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        // Latar Belakang Seamless
        if (bgImageUrl !== '') {
            slide.style.backgroundImage = `url(${bgImageUrl})`;
            slide.style.backgroundSize = `${totalSlides * 100}% 100%`;
            let positionX = totalSlides > 1 ? (index * (100 / (totalSlides - 1))) : 0;
            slide.style.backgroundPosition = `${positionX}% center`;
            
            // Tambahkan overlay putih transparan agar teks terbaca
            const overlay = document.createElement('div');
            overlay.className = 'slide-bg-overlay';
            slide.appendChild(overlay);
        } else {
            // Jika tidak ada gambar, pasang overlay default agar style aman
            slide.style.boxShadow = 'inset 0 0 0 1000px rgba(255,255,255,1)';
        }

        // Kontainer tengah
        const centerWrapper = document.createElement('div');
        centerWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; z-index: 2;';

        // Kita ubah teks menjadi <div contenteditable="true"> agar bisa di-klik dan diedit
        if(data.utama) centerWrapper.innerHTML += `<div class="teks-utama editable-text swiper-no-swiping" contenteditable="true">${data.utama.replace(/\n/g, '<br>')}</div>`;
        if(data.cta) centerWrapper.innerHTML += `<div class="teks-cta editable-text swiper-no-swiping" contenteditable="true">${data.cta}</div>`;
        
        slide.appendChild(centerWrapper);
        
        if(data.bawah) {
            const bawahEl = document.createElement('div');
            bawahEl.className = 'teks-bawah editable-text swiper-no-swiping';
            bawahEl.contentEditable = "true";
            bawahEl.innerHTML = data.bawah;
            slide.appendChild(bawahEl);
        }
        
        carouselContent.appendChild(slide);
    });

    inputScreen.classList.remove('active');
    reviewScreen.classList.add('active');

    if (swiperInstance) swiperInstance.destroy();
    swiperInstance = new Swiper(".mySwiper", {
        effect: "slide",
        grabCursor: true,
        pagination: { el: ".swiper-pagination", dynamicBullets: true },
        // Mencegah slide tergeser saat kita sedang blok teks (karena kita pakai swiper-no-swiping)
        noSwiping: true,
        noSwipingClass: 'swiper-no-swiping'
    });
});

// === LOGIKA EDITOR CANVAS ===
carouselContent.addEventListener('click', (e) => {
    // Cek apakah yang diklik adalah teks yang bisa diedit
    if (e.target.classList.contains('editable-text')) {
        // Hapus penanda aktif dari elemen sebelumnya
        if (activeEl) activeEl.classList.remove('active-edit');
        
        // Jadikan elemen yang diklik sebagai elemen aktif
        activeEl = e.target;
        activeEl.classList.add('active-edit');
        stylePanel.classList.remove('hidden');

        // Sinkronkan panel dengan style elemen saat ini
        const computedStyle = window.getComputedStyle(activeEl);
        document.getElementById('select-weight').value = computedStyle.fontWeight;
        
        // Convert RGB to HEX untuk input color
        const rgb = computedStyle.color.match(/\d+/g);
        if(rgb) {
            const hex = `#${((1 << 24) + (+rgb[0] << 16) + (+rgb[1] << 8) + +rgb[2]).toString(16).slice(1)}`;
            document.getElementById('input-color').value = hex;
        }
    } else {
        // Jika klik di luar teks, sembunyikan panel
        if (activeEl) activeEl.classList.remove('active-edit');
        activeEl = null;
        stylePanel.classList.add('hidden');
    }
});

// Kontrol Fungsi Editor
document.getElementById('btn-size-up').addEventListener('click', () => {
    if(!activeEl) return;
    let size = parseFloat(window.getComputedStyle(activeEl).fontSize);
    activeEl.style.fontSize = (size + 2) + 'px';
});

document.getElementById('btn-size-down').addEventListener('click', () => {
    if(!activeEl) return;
    let size = parseFloat(window.getComputedStyle(activeEl).fontSize);
    activeEl.style.fontSize = (size - 2) + 'px';
});

document.getElementById('btn-lh-up').addEventListener('click', () => {
    if(!activeEl) return;
    let lh = parseFloat(window.getComputedStyle(activeEl).lineHeight);
    activeEl.style.lineHeight = (lh + 2) + 'px';
});

document.getElementById('btn-lh-down').addEventListener('click', () => {
    if(!activeEl) return;
    let lh = parseFloat(window.getComputedStyle(activeEl).lineHeight);
    activeEl.style.lineHeight = (lh - 2) + 'px';
});

document.getElementById('select-weight').addEventListener('change', (e) => {
    if(!activeEl) return;
    activeEl.style.fontWeight = e.target.value;
});

document.getElementById('input-color').addEventListener('input', (e) => {
    if(!activeEl) return;
    activeEl.style.color = e.target.value;
});
// ===========================

backBtn.addEventListener('click', () => {
    if (activeEl) activeEl.classList.remove('active-edit');
    stylePanel.classList.add('hidden');
    reviewScreen.classList.remove('active');
    inputScreen.classList.add('active');
});

// Fitur DOWNLOAD
downloadBtn.addEventListener('click', async () => {
    // Sembunyikan garis seleksi sebelum difoto!
    if (activeEl) activeEl.classList.remove('active-edit');
    stylePanel.classList.add('hidden');

    downloadBtn.innerText = 'Memproses... ⏳';
    downloadBtn.disabled = true;
    
    const slides = document.querySelectorAll('.swiper-slide');
    
    for(let i = 0; i < slides.length; i++) {
        swiperInstance.slideTo(i, 0); 
        await new Promise(r => setTimeout(r, 400)); // Jeda sedikit lebih lama agar transisi selesai
        
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
