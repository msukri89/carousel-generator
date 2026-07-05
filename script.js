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
const floatingToolbar = document.getElementById('floating-toolbar');
const closeToolbarBtn = document.getElementById('close-toolbar');

let swiperInstance = null;
let bgImageUrl = '';
let activeEl = null; 
let totalInputCards = 0; 

// ================= FITUR DOUBLE BACK =================
let backPressTime = 0;
const exitToast = document.getElementById('exit-toast');
history.pushState(null, null, location.href);
window.addEventListener('popstate', (e) => {
    const currentTime = new Date().getTime();
    if (currentTime - backPressTime < 2000) { history.back(); } 
    else {
        e.preventDefault();
        history.pushState(null, null, location.href);
        backPressTime = currentTime;
        exitToast.style.opacity = '1';
        setTimeout(() => exitToast.style.opacity = '0', 2000);
    }
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 255, b: 255 };
}

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
        <input type="text" id="atas${totalInputCards}" class="input-field" placeholder="Teks Atas (Kecil Bold)...">
        <textarea id="tengah${totalInputCards}" class="input-field" placeholder="Teks Tengah (Besar Heavy)..."></textarea>
        <input type="text" id="bawah${totalInputCards}" class="input-field" placeholder="Teks Bawah (Kecil Reguler)...">
        
        <div style="display: flex; gap: 15px; align-items: center; padding: 10px; background: #FAFAFC; border-radius: 8px; border: 1px solid #E5E5EA; margin-bottom: 5px;">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700;">WARNA PANEL</label>
                <input type="color" id="bgcolor${totalInputCards}" value="#FFFFFF" style="width: 50px; height: 30px; border: none; cursor: pointer; background: transparent; padding: 0;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700;">TRANSPARANSI OVERLAY</label>
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
        const atas = document.getElementById(`atas${i}`).value.trim();
        const tengah = document.getElementById(`tengah${i}`).value.trim();
        const bawah = document.getElementById(`bawah${i}`).value.trim();
        const bgColor = document.getElementById(`bgcolor${i}`).value;
        const bgOpacity = document.getElementById(`bgopacity${i}`).value;
        
        if (atas !== '' || tengah !== '' || bawah !== '') {
            activeSlidesData.push({ atas, tengah, bawah, bgColor, bgOpacity });
        }
    }

    if(activeSlidesData.length === 0) { alert("Isi minimal 1 slide terlebih dahulu!"); return; }
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
            const rgb = hexToRgb(data.bgColor);
            overlay.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${data.bgOpacity})`; 
            slide.appendChild(overlay);
        } else {
            slide.style.backgroundColor = data.bgColor;
        }

        const centerWrapper = document.createElement('div');
        centerWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; z-index: 2; position: relative; margin-bottom: 60px;';

        if(data.atas) centerWrapper.innerHTML += `<div class="teks-atas editable-text swiper-no-swiping" contenteditable="true" data-x="0" data-y="0">${data.atas}</div>`;
        if(data.tengah) centerWrapper.innerHTML += `<div class="teks-tengah editable-text swiper-no-swiping" contenteditable="true" data-x="0" data-y="0">${data.tengah.replace(/\n/g, '<br>')}</div>`;
        
        slide.appendChild(centerWrapper);
        
        if(data.bawah) {
            const bawahEl = document.createElement('div');
            bawahEl.className = 'teks-bawah editable-text swiper-no-swiping';
            bawahEl.contentEditable = "true";
            bawahEl.innerHTML = data.bawah;
            bawahEl.setAttribute('data-x', '0');
            bawahEl.setAttribute('data-y', '0');
            slide.appendChild(bawahEl);
        }
        
        const footerLeft = document.createElement('div');
        footerLeft.className = 'footer-action share-action editable-text swiper-no-swiping';
        footerLeft.setAttribute('data-x', '0'); footerLeft.setAttribute('data-y', '0');
        footerLeft.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span>SHARE</span>`;
        slide.appendChild(footerLeft);

        const footerRight = document.createElement('div');
        footerRight.className = 'footer-action save-action editable-text swiper-no-swiping';
        footerRight.setAttribute('data-x', '0'); footerRight.setAttribute('data-y', '0');
        footerRight.innerHTML = `<span>SAVE</span><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
        slide.appendChild(footerRight);

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
    
    swiperInstance.on('slideChange', () => { hideFloatingToolbar(); });
});

// ================= FITUR GESER SENTUH (DRAG & DROP) =================
let isDragging = false;
let startX, startY;
let currentTransformX = 0, currentTransformY = 0;

// Membuat Garis Panduan (Guidelines) untuk Indikator Magnet Posisi Tengah
const carouselWrapper = document.querySelector('.carousel-wrapper');
carouselWrapper.style.position = 'relative'; // Memastikan garis panduan ada di dalam canvas

const guideVertical = document.createElement('div');
guideVertical.style.cssText = 'position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: var(--blue-ios); z-index: 9999; display: none; transform: translateX(-50%); pointer-events: none; box-shadow: 0 0 5px rgba(255,255,255,0.5);';

const guideHorizontal = document.createElement('div');
guideHorizontal.style.cssText = 'position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: var(--blue-ios); z-index: 9999; display: none; transform: translateY(-50%); pointer-events: none; box-shadow: 0 0 5px rgba(255,255,255,0.5);';

carouselWrapper.appendChild(guideVertical);
carouselWrapper.appendChild(guideHorizontal);

function hideFloatingToolbar() {
    floatingToolbar.classList.add('hidden');
    if (activeEl) activeEl.classList.remove('active-edit');
    activeEl = null;
}

function showFloatingToolbar(el) {
    floatingToolbar.classList.remove('hidden');
    const rect = el.getBoundingClientRect();
    const toolbarHeight = floatingToolbar.offsetHeight || 180;
    
    let topPos = rect.top - toolbarHeight - 15;
    if (topPos < 10) { 
        topPos = rect.bottom + 15;
    }
    floatingToolbar.style.top = `${topPos}px`;
    
    const computedStyle = window.getComputedStyle(el);
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
}

closeToolbarBtn.addEventListener('click', hideFloatingToolbar);

carouselContent.addEventListener('touchstart', dragStart, { passive: false });
carouselContent.addEventListener('touchmove', drag, { passive: false });
carouselContent.addEventListener('touchend', dragEnd);
carouselContent.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    const target = e.target.closest('.editable-text');
    
    if (!target && !e.target.closest('#floating-toolbar')) {
        hideFloatingToolbar();
        return;
    }
    
    if (target) {
        if (activeEl && activeEl !== target) {
            activeEl.classList.remove('active-edit');
        }
        activeEl = target;
        activeEl.classList.add('active-edit');
        isDragging = true;
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        currentTransformX = parseFloat(activeEl.getAttribute('data-x')) || 0;
        currentTransformY = parseFloat(activeEl.getAttribute('data-y')) || 0;
        
        floatingToolbar.classList.add('hidden');
    }
}

function drag(e) {
    if (!isDragging || !activeEl) return;
    
    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
        e.preventDefault(); 
    }
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    // Fitur Magnet/Snap ke Tengah (Toleransi 20px agar lebih terasa)
    let finalX = currentTransformX + dx;
    let finalY = currentTransformY + dy;
    const snapThreshold = 20;
    
    let isSnappedX = false;
    let isSnappedY = false;

    if (Math.abs(finalX) < snapThreshold) {
        finalX = 0;
        isSnappedX = true;
    }
    if (Math.abs(finalY) < snapThreshold) {
        finalY = 0;
        isSnappedY = true;
    }

    // Tampilkan garis bantu jika nempel ke tengah (snap aktif)
    guideVertical.style.display = isSnappedX ? 'block' : 'none';
    guideHorizontal.style.display = isSnappedY ? 'block' : 'none';

    activeEl.style.transform = `translate(${finalX}px, ${finalY}px)`;
    
    // Simpan posisi sementara saat ditarik
    activeEl.dataset.tempX = finalX;
    activeEl.dataset.tempY = finalY;
}

function dragEnd(e) {
    if (!isDragging || !activeEl) return;
    isDragging = false;
    
    // Hilangkan garis bantu saat jari/kursor dilepas
    guideVertical.style.display = 'none';
    guideHorizontal.style.display = 'none';
    
    // Simpan posisi permanen yang sudah terkena magnet
    const finalX = parseFloat(activeEl.dataset.tempX) || 0;
    const finalY = parseFloat(activeEl.dataset.tempY) || 0;
    
    activeEl.setAttribute('data-x', finalX);
    activeEl.setAttribute('data-y', finalY);
    
    showFloatingToolbar(activeEl);
}

// ================= FITUR TERAPKAN KE SEMUA (APPLY TO ALL) =================
document.getElementById('btn-apply-all').addEventListener('click', () => {
    if(!activeEl) return;
    
    let targetClass = '';
    const classes = ['teks-atas', 'teks-tengah', 'teks-bawah', 'share-action', 'save-action'];
    classes.forEach(c => { if(activeEl.classList.contains(c)) targetClass = c; });
    
    if(targetClass) {
        const allTargets = document.querySelectorAll(`.${targetClass}`);
        const currentX = activeEl.getAttribute('data-x') || 0;
        const currentY = activeEl.getAttribute('data-y') || 0;
        
        allTargets.forEach(el => {
            if (el !== activeEl) {
                // Terapkan semua gaya desain
                el.style.fontSize = activeEl.style.fontSize;
                el.style.fontWeight = activeEl.style.fontWeight;
                el.style.fontFamily = activeEl.style.fontFamily;
                el.style.color = activeEl.style.color;
                el.style.textAlign = activeEl.style.textAlign;
                el.style.fontStyle = activeEl.style.fontStyle;
                el.style.textTransform = activeEl.style.textTransform;
                
                // Terapkan posisi kordinat
                el.setAttribute('data-x', currentX);
                el.setAttribute('data-y', currentY);
                el.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });
        
        const originalBtnText = document.getElementById('btn-apply-all').innerText;
        document.getElementById('btn-apply-all').innerText = "✅ Diterapkan!";
        setTimeout(() => { document.getElementById('btn-apply-all').innerText = originalBtnText; }, 1500);
    }
});

// ================= KONTROL TOOLBAR (SUDAH DIPERBAIKI) =================
document.getElementById('btn-format-bold').addEventListener('click', (e) => { 
    e.preventDefault();
    if(!activeEl) return;
    const currentWeight = window.getComputedStyle(activeEl).fontWeight;
    activeEl.style.fontWeight = (currentWeight === '700' || currentWeight === '900' || currentWeight === 'bold') ? '400' : '700';
    document.getElementById('select-weight').value = activeEl.style.fontWeight;
});

document.getElementById('btn-format-italic').addEventListener('click', (e) => { 
    e.preventDefault();
    if(!activeEl) return;
    const currentStyle = window.getComputedStyle(activeEl).fontStyle;
    activeEl.style.fontStyle = currentStyle === 'italic' ? 'normal' : 'italic';
});

document.getElementById('btn-format-cali').addEventListener('click', (e) => { 
    e.preventDefault();
    if(!activeEl) return;
    activeEl.style.fontFamily = "'Dancing Script', cursive";
    document.getElementById('select-font').value = "'Dancing Script', cursive";
});

document.getElementById('btn-format-upper').addEventListener('click', (e) => {
    e.preventDefault();
    if(!activeEl) return;
    const currentTransform = window.getComputedStyle(activeEl).textTransform;
    activeEl.style.textTransform = currentTransform === 'uppercase' ? 'none' : 'uppercase';
});

// Ukuran Teks
document.getElementById('btn-size-up').addEventListener('click', () => {
    if(!activeEl) return; let size = parseFloat(window.getComputedStyle(activeEl).fontSize); activeEl.style.fontSize = (size + 2) + 'px';
});
document.getElementById('btn-size-down').addEventListener('click', () => {
    if(!activeEl) return; let size = parseFloat(window.getComputedStyle(activeEl).fontSize); activeEl.style.fontSize = (size - 2) + 'px';
});

// Jenis Font, Ketebalan, dan Warna
document.getElementById('select-weight').addEventListener('change', (e) => { if(!activeEl) return; activeEl.style.fontWeight = e.target.value; });
document.getElementById('select-font').addEventListener('change', (e) => { if(!activeEl) return; activeEl.style.fontFamily = e.target.value; });
document.getElementById('input-color').addEventListener('input', (e) => { if(!activeEl) return; activeEl.style.color = e.target.value; });

// Rata Kanan Kiri (Alignment)
document.getElementById('btn-align-left').addEventListener('click', () => { if(!activeEl) return; activeEl.style.textAlign = 'left'; });
document.getElementById('btn-align-center').addEventListener('click', () => { if(!activeEl) return; activeEl.style.textAlign = 'center'; });
document.getElementById('btn-align-right').addEventListener('click', () => { if(!activeEl) return; activeEl.style.textAlign = 'right'; });

// ================= DOWNLOAD & LAINNYA =================
document.getElementById('select-ratio').addEventListener('change', (e) => {
    const wrapper = document.querySelector('.carousel-wrapper');
    wrapper.style.aspectRatio = e.target.value;
    if (swiperInstance) setTimeout(() => swiperInstance.update(), 150);
});

backBtn.addEventListener('click', () => {
    hideFloatingToolbar();
    reviewScreen.classList.remove('active');
    inputScreen.classList.add('active');
});

downloadBtn.addEventListener('click', async () => {
    hideFloatingToolbar();
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
