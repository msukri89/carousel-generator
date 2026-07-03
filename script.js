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
        history.back(); 
    } else {
        e.preventDefault();
        history.pushState(null, null, location.href);
        backPressTime = currentTime;
        exitToast.style.opacity = '1';
        setTimeout(() => exitToast.style.opacity = '0', 2000);
    }
});
// ===================================================================

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 255, b: 255 };
}

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

// Pembuatan UI
function createSlideInput() {
    totalInputCards++;
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.innerHTML = `
        <h3>Slide ${totalInputCards}</h3>
        <textarea id="utama${totalInputCards}" class="input-field" placeholder="Teks Utama..."></textarea>
        <input type="text" id="cta${totalInputCards}" class="input-field" placeholder="Teks Sorotan (CTA)...">
        <input type="text" id="bawah${totalInputCards}" class="input-field" placeholder="Teks Bawah/Kecil...">
        
        <div style="display: flex; gap: 15px; align-items: center; padding: 10px; background: #FAFAFC; border-radius: 8px; border: 1px solid #E5E5EA; margin-bottom: 5px;">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Warna Panel</label>
                <input type="color" id="bgcolor${totalInputCards}" value="#FFFFFF" style="width: 50px; height: 30px; border: none; cursor: pointer; background: transparent; padding: 0;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Transparansi Overlay</label>
                <input type="range" id="bgopacity${totalInputCards}" min="0" max="1" step="0.05" value="0.5" style="width: 100%;">
            </div>
        </div>
    `;
    slideInputsContainer.appendChild(card);
}

for (let i = 0; i < 5; i++) { createSlideInput(); }

addSlideBtn.addEventListener('click', () => { createSlideInput(); });

// ================= GENERATE SLIDES =================
generateBtn.addEventListener('click', () => {
    carouselContent.innerHTML = '';
    let activeSlidesData = [];

    for (let i = 1; i <= totalInputCards; i++) {
        const utama = document.getElementById(`utama${i}`).value.trim();
        const cta = document.getElementById(`cta${i}`).value.trim();
        const bawah = document.getElementById(`bawah${i}`).value.trim();
        const bgColor = document.getElementById(`bgcolor${i}`).value;
        const bgOpacity = document.getElementById(`bgopacity${i}`).value;
        
        if (utama !== '' || cta !== '' || bawah !== '') {
            activeSlidesData.push({ utama, cta, bawah, bgColor, bgOpacity });
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

        // Manajemen Latar Belakang (Warna & Seamless Image)
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
            const rgb = hexToRgb(data.bgColor);
            overlay.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${data.bgOpacity})`; 
            slide.appendChild(overlay);
        } else {
            slide.style.backgroundColor = data.bgColor;
        }

        const centerWrapper = document.createElement('div');
        centerWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; z-index: 2; position: relative;';

        if(data.utama) centerWrapper.innerHTML += `<div class="teks-utama editable-text swiper-no-swiping" contenteditable="true">${data.utama.replace(/\n/g, '<br>')}</div>`;
        if(data.cta) centerWrapper.innerHTML += `<div class="teks-cta editable-text swiper-no-swiping" contenteditable="true">${data.cta}</div>`;
        
        slide.appendChild(centerWrapper);
        
        // Teks Bawah
        if(data.bawah) {
            const bawahEl = document.createElement('div');
            bawahEl.className = 'teks-bawah editable-text swiper-no-swiping';
            bawahEl.contentEditable = "true";
            bawahEl.innerHTML = data.bawah;
            
            // max-width dipersempit agar tidak tabrakan dengan icon
            bawahEl.style.position = 'absolute';
            bawahEl.style.zIndex = '999';
            bawahEl.style.left = '0';
            bawahEl.style.right = '0';
            bawahEl.style.bottom = '35px';
            bawahEl.style.boxSizing = 'border-box';
            bawahEl.style.maxWidth = 'calc(100% - 180px)';
            bawahEl.style.textAlign = 'center';
            bawahEl.style.margin = '0 auto';
            bawahEl.style.wordWrap = 'break-word';

            slide.appendChild(bawahEl);
        }

        // --- FITUR BARU: FOOTER SHARE & SAVE ---
        
        // 1. Icon Share (Kiri Bawah) - Pesawat Kertas
        const footerLeft = document.createElement('div');
        footerLeft.className = 'footer-action share-action editable-text swiper-no-swiping';
        footerLeft.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span>SHARE</span>
        `;
        slide.appendChild(footerLeft);

        // 2. Icon Save (Kanan Bawah) - Bookmark ala TikTok
        const footerRight = document.createElement('div');
        footerRight.className = 'footer-action save-action editable-text swiper-no-swiping';
        footerRight.innerHTML = `
            <span>SAVE</span>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        slide.appendChild(footerRight);
        
        // ----------------------------------------

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

// ================= LOGIKA EDITOR CANVAS =================
carouselContent.addEventListener('click', (e) => {
    const targetText = e.target.closest('.editable-text');

    if (targetText) {
        if (activeEl) activeEl.classList.remove('active-edit');
        activeEl = targetText;
        activeEl.classList.add('active-edit');
        stylePanel.classList.remove('hidden');

        const computedStyle = window.getComputedStyle(activeEl);
        document.getElementById('select-weight').value = computedStyle.fontWeight;
        
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

// Kontrol Teks Blok (Rich Text Formatting)
document.getElementById('btn-format-bold').addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('bold', false, null); });
document.getElementById('btn-format-italic').addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('italic', false, null); });
document.getElementById('btn-format-cali').addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('fontName', false, 'Dancing Script, cursive'); });
document.getElementById('btn-format-upper').addEventListener('mousedown', (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection.toString().length > 0) document.execCommand('insertText', false, selection.toString().toUpperCase());
});

// Kontrol Fungsi Editor
document.getElementById('btn-size-up').addEventListener('click', () => {
    if(!activeEl) return; let size = parseFloat(window.getComputedStyle(activeEl).fontSize); activeEl.style.fontSize = (size + 2) + 'px';
});
document.getElementById('btn-size-down').addEventListener('click', () => {
    if(!activeEl) return; let size = parseFloat(window.getComputedStyle(activeEl).fontSize); activeEl.style.fontSize = (size - 2) + 'px';
});
document.getElementById('btn-lh-up').addEventListener('click', () => {
    if(!activeEl) return; let lh = parseFloat(window.getComputedStyle(activeEl).lineHeight); activeEl.style.lineHeight = (lh + 2) + 'px';
});
document.getElementById('btn-lh-down').addEventListener('click', () => {
    if(!activeEl) return; let lh = parseFloat(window.getComputedStyle(activeEl).lineHeight); activeEl.style.lineHeight = (lh - 2) + 'px';
});
document.getElementById('select-weight').addEventListener('change', (e) => { if(!activeEl) return; activeEl.style.fontWeight = e.target.value; });
document.getElementById('select-font').addEventListener('change', (e) => { if(!activeEl) return; activeEl.style.fontFamily = e.target.value; });
document.getElementById('input-color').addEventListener('input', (e) => { if(!activeEl) return; activeEl.style.color = e.target.value; });

// Alignment Kontrol
document.getElementById('btn-align-left').addEventListener('click', () => { if(!activeEl) return; activeEl.style.textAlign = 'left'; });
document.getElementById('btn-align-center').addEventListener('click', () => { if(!activeEl) return; activeEl.style.textAlign = 'center'; });
document.getElementById('btn-align-right').addEventListener('click', () => { if(!activeEl) return; activeEl.style.textAlign = 'right'; });

// Kontrol Aspect Ratio
document.getElementById('select-ratio').addEventListener('change', (e) => {
    const wrapper = document.querySelector('.carousel-wrapper');
    wrapper.style.aspectRatio = e.target.value;
    if (swiperInstance) setTimeout(() => swiperInstance.update(), 150);
});

// Kembali
backBtn.addEventListener('click', () => {
    if (activeEl) activeEl.classList.remove('active-edit');
    stylePanel.classList.add('hidden');
    reviewScreen.classList.remove('active');
    inputScreen.classList.add('active');
});

// Download
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
        
        const canvas = await html2canvas(slides[i], { scale: 2, useCORS: true, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `Slide_Konten_${i+1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    downloadBtn.innerText = '✅ Berhasil Diunduh';
    setTimeout(() => { downloadBtn.innerText = 'Download Semua'; downloadBtn.disabled = false; }, 3000);
});
