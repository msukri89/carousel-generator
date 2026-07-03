const inputScreen = document.getElementById('input-screen');
const reviewScreen = document.getElementById('review-screen');
const generateBtn = document.getElementById('generate-btn');
const backBtn = document.getElementById('back-btn');
const downloadBtn = document.getElementById('download-btn');
const carouselContent = document.getElementById('carousel-content');
const slideInputsContainer = document.getElementById('slide-inputs-container');
const addSlideBtn = document.getElementById('add-slide-btn');
const bgInput = document.getElementById('bg-input');
const uploadText = document.getElementById('upload-text');
const stylePanel = document.getElementById('style-panel');

let swiperInstance = null;
let bgImageUrl = '';
let activeEl = null; 
let totalInputCards = 0; 

// ================= FITUR 1: DOUBLE BACK UNTUK EXIT =================
let backPressTime = 0;
const exitToast = document.getElementById('exit-toast');
history.pushState(null, null, location.href);

window.addEventListener('popstate', (e) => {
    const currentTime = new Date().getTime();
    if (currentTime - backPressTime < 2000) {
        // Jika ditekan dua kali berturut-turut, keluar dari aplikasi
        history.back(); 
    } else {
        // Blokir exit pertama, munculkan peringatan
        e.preventDefault();
        history.pushState(null, null, location.href);
        backPressTime = currentTime;
        exitToast.style.opacity = '1';
        setTimeout(() => exitToast.style.opacity = '0', 2000);
    }
});
// ===================================================================

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

function createSlideInput() {
    totalInputCards++;
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.innerHTML = `
        <h3>Slide ${totalInputCards}</h3>
        <textarea id="utama${totalInputCards}" class="input-field" placeholder="Teks Utama..."></textarea>
        <input type="text" id="cta${totalInputCards}" class="input-field" placeholder="Teks Sorotan (CTA)...">
        <input type="text" id="bawah${totalInputCards}" class="input-field" placeholder="Teks Bawah/Kecil...">
    `;
    slideInputsContainer.appendChild(card);
}

for (let i = 0; i < 5; i++) {
    createSlideInput();
}

addSlideBtn.addEventListener('click', () => {
    createSlideInput();
});

generateBtn.addEventListener('click', () => {
    carouselContent.innerHTML = '';
    let activeSlidesData = [];

    for (let i = 1; i <= totalInputCards; i++) {
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

    activeSlidesData.forEach((data, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.style.position = 'relative';
        slide.style.overflow = 'hidden'; 

        if (bgImageUrl !== '') {
            const bgLayer = document.createElement('div');
            bgLayer.style.position = 'absolute';
            bgLayer.style.top = '0';
            bgLayer.style.left = `-${index * 100}%`; 
            bgLayer.style.width = `${totalSlides * 100}%`;
            bgLayer.style.height = '100%';
            bgLayer.style.backgroundImage = `url(${bgImageUrl})`;
            bgLayer.style.backgroundSize = '100% 100%';
            bgLayer.style.zIndex = '0';
            slide.appendChild(bgLayer);
            
            const overlay = document.createElement('div');
            overlay.className = 'slide-bg-overlay';
            overlay.style.backgroundColor = 'rgba(255, 255, 255, 0)'; 
            slide.appendChild(overlay);
        } else {
            slide.style.backgroundColor = '#FFFFFF';
        }

        const centerWrapper = document.createElement('div');
        centerWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; z-index: 2; position: relative;';

        if(data.utama) centerWrapper.innerHTML += `<div class="teks-utama editable-text swiper-no-swiping" contenteditable="true">${data.utama.replace(/\n/g, '<br>')}</div>`;
        if(data.cta) centerWrapper.innerHTML += `<div class="teks-cta editable-text swiper-no-swiping" contenteditable="true">${data.cta}</div>`;
        
        slide.appendChild(centerWrapper);
        
        if(data.bawah) {
            const bawahEl = document.createElement('div');
            bawahEl.className = 'teks-bawah editable-text swiper-no-swiping';
            bawahEl.contentEditable = "true";
            bawahEl.innerHTML = data.bawah;
            bawahEl.style.position = 'absolute';
            bawahEl.style.zIndex = '999';
            bawahEl.style.left = '40px';
            bawahEl.style.right = '40px';
            bawahEl.style.bottom = '35px';
            bawahEl.style.boxSizing = 'border-box';
            bawahEl.style.maxWidth = 'calc(100% - 80px)';
            bawahEl.style.textAlign = 'center';
            bawahEl.style.margin = '0 auto';
            bawahEl.style.wordWrap = 'break-word';

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
        noSwiping: true,
        noSwipingClass: 'swiper-no-swiping'
    });
});

// LOGIKA EDITOR CANVAS
carouselContent.addEventListener('click', (e) => {
    // Cari elemen terdekat yang memiliki class editable-text (berfungsi juga jika klik pada <span> di dalam)
    const targetText = e.target.closest('.editable-text');

    if (targetText) {
        if (activeEl) activeEl.classList.remove('active-edit');
        activeEl = targetText;
        activeEl.classList.add('active-edit');
        stylePanel.classList.remove('hidden');

        const computedStyle = window.getComputedStyle(activeEl);
        document.getElementById('select-weight').value = computedStyle.fontWeight;
        
        // Cek Font bawaan element tsb untuk sinkronisasi select input font
        if(computedStyle.fontFamily.includes('Dancing Script')) {
            document.getElementById('select-font').value = "'Dancing Script', cursive";
        } else {
            document.getElementById('select-font').value = "'Gilroy', sans-serif";
        }
        
        const rgb = computedStyle.color.match(/\d+/g);
        if(rgb) {
            const hex = `#${((1 << 24) + (+rgb[0] << 16) + (+rgb[1] << 8) + +rgb[2]).toString(16).slice(1)}`;
            document.getElementById('input-color').value = hex;
        }
    } else {
        if (activeEl) activeEl.classList.remove('active-edit');
        activeEl = null;
        stylePanel.classList.add('hidden');
    }
});


// ================= FITUR 2 & 4: KONTROL TEKS BLOK (RICH TEXT FORMATTING) =================
// Menggunakan event mousedown dan preventDefault agar seleksi kata (blok biru) tidak hilang saat ditekan
document.getElementById('btn-format-bold').addEventListener('mousedown', (e) => {
    e.preventDefault(); document.execCommand('bold', false, null);
});
document.getElementById('btn-format-italic').addEventListener('mousedown', (e) => {
    e.preventDefault(); document.execCommand('italic', false, null);
});
document.getElementById('btn-format-cali').addEventListener('mousedown', (e) => {
    e.preventDefault(); document.execCommand('fontName', false, 'Dancing Script, cursive');
});
document.getElementById('btn-format-upper').addEventListener('mousedown', (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
        // Paksa kata yang diblok menjadi huruf besar
        document.execCommand('insertText', false, selection.toString().toUpperCase());
    }
});

// =======================================================================================

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

// Kontrol Ubah Seluruh Jenis Font
document.getElementById('select-font').addEventListener('change', (e) => {
    if(!activeEl) return;
    activeEl.style.fontFamily = e.target.value;
});

document.getElementById('input-color').addEventListener('input', (e) => {
    if(!activeEl) return;
    activeEl.style.color = e.target.value;
});

// ALIGNMENT KONTROL
document.getElementById('btn-align-left').addEventListener('click', () => {
    if(!activeEl) return;
    activeEl.style.textAlign = 'left';
});
document.getElementById('btn-align-center').addEventListener('click', () => {
    if(!activeEl) return;
    activeEl.style.textAlign = 'center';
});
document.getElementById('btn-align-right').addEventListener('click', () => {
    if(!activeEl) return;
    activeEl.style.textAlign = 'right';
});

// KONTROL UKURAN CAROUSEL (ASPECT RATIO)
document.getElementById('select-ratio').addEventListener('change', (e) => {
    const wrapper = document.querySelector('.carousel-wrapper');
    wrapper.style.aspectRatio = e.target.value;
    
    if (swiperInstance) {
        setTimeout(() => {
            swiperInstance.update();
        }, 150);
    }
});

// KEMBALI
backBtn.addEventListener('click', () => {
    if (activeEl) activeEl.classList.remove('active-edit');
    stylePanel.classList.add('hidden');
    reviewScreen.classList.remove('active');
    inputScreen.classList.add('active');
});

// DOWNLOAD
downloadBtn.addEventListener('click', async () => {
    if (activeEl) activeEl.classList.remove('active-edit');
    stylePanel.classList.add('hidden');

    downloadBtn.innerText = 'Memproses... ⏳';
    downloadBtn.disabled = true;
    
    const slides = document.querySelectorAll('.swiper-slide');
    
    for(let i = 0; i < slides.length; i++) {
        swiperInstance.slideTo(i, 0); 
        await new Promise(r => setTimeout(r, 400)); 
        
        if (window.getSelection) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) sel.removeAllRanges();
        }
        if (document.activeElement) document.activeElement.blur();
        
        const canvas = await html2canvas(slides[i], { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: null
        });
        
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
