window.initGestures = function() {
  const container = document.getElementById('card-container');
  const pages = Array.from(document.querySelectorAll('.page')).sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  
  let currentPageIndex = 0; 
  let isDragging = false;
  let startX = 0;
  let activePage = null; 
  let isTurningForward = true;
  let currentRotation = 0;
  let rafId = null;

  // Sound effect (base64 short WAV - realistic paper rustle)
  // Dummy base64 for now, valid wav header to prevent errors
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playRustle() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // A simple noise burst to simulate paper
    const bufferSize = audioCtx.sampleRate * 0.15; // 150ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3)) * 0.1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.connect(audioCtx.destination);
    noise.start();
  }

  container.addEventListener('click', (e) => {
    if (isDragging) return;
    if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
    
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    if (clickX > rect.width / 2) turnPage(true);
    else turnPage(false);
  });

  function handleStart(e) {
    if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    isDragging = false;
    activePage = null;
    if (rafId) cancelAnimationFrame(rafId);
  }
  
  function handleMove(e) {
    if (startX === 0) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = clientX - startX;
    
    if (!isDragging && Math.abs(deltaX) > 10) {
      isDragging = true;
      if (deltaX < 0 && currentPageIndex < pages.length - 1) {
        activePage = pages[currentPageIndex];
        isTurningForward = true;
      } else if (deltaX > 0 && currentPageIndex > 0) {
        activePage = pages[currentPageIndex - 1];
        isTurningForward = false;
      }
    }
    
    if (isDragging && activePage) {
      e.preventDefault(); 
      const rect = container.getBoundingClientRect();
      let progress = Math.abs(deltaX) / rect.width;
      progress = Math.min(Math.max(progress, 0), 1);
      
      currentRotation = isTurningForward ? -(progress * 180) : -180 + (progress * 180);
      applyPhysics(activePage, currentRotation);
    }
  }
  
  function handleEnd(e) {
    if (!isDragging || !activePage) {
      startX = 0;
      return;
    }
    const clientX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
    const deltaX = clientX - startX;
    const rect = container.getBoundingClientRect();
    const progress = Math.abs(deltaX) / rect.width;
    
    if (progress > 0.2) animateTo(activePage, isTurningForward ? -180 : 0, true);
    else animateTo(activePage, isTurningForward ? 0 : -180, false);
    
    isDragging = false;
    startX = 0;
  }
  
  container.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove, { passive: false });
  window.addEventListener('mouseup', handleEnd);
  
  container.addEventListener('touchstart', handleStart, { passive: true });
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
  
  function applyPhysics(page, rotation) {
    const progress = Math.abs(rotation) / 180;
    // Realistic curl - skewY increases towards 90deg, then decreases
    const curl = Math.sin(progress * Math.PI) * 4; 
    page.style.transform = `rotateY(${rotation}deg) skewY(${isTurningForward ? curl : -curl}deg)`;
    
    // Shadow on the page below
    const targetShadowPage = isTurningForward ? pages[currentPageIndex + 1] : pages[currentPageIndex - 1];
    if (targetShadowPage) {
       const shadow = targetShadowPage.querySelector('.page-shadow');
       if (shadow) shadow.style.opacity = Math.sin(progress * Math.PI) * 0.6;
    }
    
    // Glare tracking reflection point
    const glare = page.querySelector('.glare');
    if (glare) {
      glare.style.opacity = Math.sin(progress * Math.PI) * 0.4;
      const xPos = 100 - (progress * 100);
      glare.style.background = `radial-gradient(circle at ${xPos}% 0%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) ${40 + progress*20}%)`;
    }
  }
  
  function animateTo(page, targetRotation, isCompleting) {
    let velocity = 0;
    const spring = 0.08;
    const friction = 0.82;
    
    function step() {
      const diff = targetRotation - currentRotation;
      velocity += diff * spring;
      velocity *= friction;
      currentRotation += velocity;
      
      applyPhysics(page, currentRotation);
      
      if (Math.abs(velocity) > 0.1 || Math.abs(diff) > 0.1) {
        rafId = requestAnimationFrame(step);
      } else {
        currentRotation = targetRotation;
        applyPhysics(page, currentRotation);
        page.style.transform = `rotateY(${targetRotation}deg)`; // remove skew
        
        if (isCompleting) {
          if (targetRotation === -180 && isTurningForward) {
             currentPageIndex++;
             playRustle();
             updateVisibility();
          } else if (targetRotation === 0 && !isTurningForward) {
             currentPageIndex--;
             playRustle();
             updateVisibility();
          }
        }
        
        // Reset shadow
        const targetShadowPage = isTurningForward ? pages[currentPageIndex + (isCompleting?0:1)] : pages[currentPageIndex + (isCompleting?0:-1)];
        if (targetShadowPage) {
           const shadow = targetShadowPage.querySelector('.page-shadow');
           if (shadow) shadow.style.opacity = 0;
        }
        activePage = null;
      }
    }
    rafId = requestAnimationFrame(step);
  }
  
  function turnPage(forward) {
    if (forward && currentPageIndex < pages.length - 1) {
      activePage = pages[currentPageIndex];
      isTurningForward = true;
      currentRotation = 0;
      animateTo(activePage, -180, true);
    } else if (!forward && currentPageIndex > 0) {
      activePage = pages[currentPageIndex - 1];
      isTurningForward = false;
      currentRotation = -180;
      animateTo(activePage, 0, true);
    }
  }
  
  function updateVisibility() {
     pages.forEach((p, idx) => {
        const content = p.querySelector('.page-content');
        if (content) {
            if (idx === currentPageIndex || idx === currentPageIndex - 1) {
                content.classList.add('is-visible');
            } else {
                content.classList.remove('is-visible');
            }
        }
     });
  }
};
