document.addEventListener('DOMContentLoaded', async () => {
  const code = window.location.pathname.split('/')[2]; // /i/code
  
  if (!code) {
    showError();
    return;
  }

  try {
    let data;
    if (code === 'local') {
      let payload = new URLSearchParams(window.location.search).get('d');
      if (!payload) {
        payload = window.location.hash.substring(1);
      }
      if (!payload) throw new Error('No data in hash or query');
      data = JSON.parse(decodeURIComponent(atob(payload)));
      data.mock = true;
    } else {
      const res = await fetch(`/api/get?code=${code}`);
      if (!res.ok) throw new Error('Not found');
      data = await res.json();
    }
    
    injectData(data);
    
    // Apply theme
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const metaTheme = document.getElementById('meta-theme-color');
    if (data.theme && ['ivory', 'midnight', 'blush'].includes(data.theme)) {
      themeStylesheet.href = `/styles/themes/${data.theme}.css`;
      
      const colors = {
        ivory: '#FAF6EF',
        midnight: '#0D0A14',
        blush: '#FDF0EC'
      };
      metaTheme.content = colors[data.theme];
    }
    
    // Once everything is injected, hide loading
    setTimeout(() => {
      document.getElementById('loading').style.opacity = '0';
      document.getElementById('viewport').style.opacity = '1';
      setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) loading.remove();
      }, 500);
      
      // Initialize gestures
      if (window.initGestures) window.initGestures();
    }, 100);

  } catch (err) {
    console.error(err);
    showError(err.message);
  }
});

function showError(msg = '') {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
  const errScreen = document.getElementById('error-screen');
  if (errScreen) {
    errScreen.classList.remove('hidden');
    if (msg) {
      errScreen.innerHTML += `<p style="font-size: 0.8rem; opacity: 0.7; margin-top: 1rem;">${msg}</p>`;
    }
  }
}

function injectData(data) {
  // Page 1
  if (document.getElementById('card-host')) document.getElementById('card-host').innerHTML = data.hostName || '';
  if (document.getElementById('card-event-type')) document.getElementById('card-event-type').innerText = `${data.eventType || ''} INVITATION`;
  if (document.getElementById('card-motif')) document.getElementById('card-motif').innerHTML = getMotifSvg(data.eventType);
  
  // Page 2
  if (document.getElementById('card-names') && data.names) document.getElementById('card-names').innerHTML = data.names.replace('&', '<br>&<br>');
  if (data.specialMessage && document.getElementById('card-special-msg')) {
    const sm = document.getElementById('card-special-msg');
    sm.innerText = data.specialMessage;
    sm.classList.remove('hidden');
  }
  if (data.dressCode && document.getElementById('card-dress-code')) {
    const dc = document.getElementById('card-dress-code');
    dc.innerText = `Dress Code: ${data.dressCode}`;
    dc.classList.remove('hidden');
  }

  // Page 3 & 4
  const d = new Date(data.date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (document.getElementById('card-day')) document.getElementById('card-day').innerText = isNaN(d.getDay()) ? '' : days[d.getDay()];
  if (document.getElementById('card-date')) document.getElementById('card-date').innerText = isNaN(d.getDate()) ? (data.date || '') : `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  if (document.getElementById('card-time')) document.getElementById('card-time').innerText = data.time || '';
  
  if (document.getElementById('card-venue')) document.getElementById('card-venue').innerText = data.venueName || '';
  if (document.getElementById('card-city')) document.getElementById('card-city').innerText = data.city || '';

  // Calculate countdown
  if (document.getElementById('card-countdown')) {
    const rsvpDate = new Date(data.date);
    rsvpDate.setDate(rsvpDate.getDate() - 7); // RSVP 1 week before
    if (!isNaN(rsvpDate.getTime())) {
      document.getElementById('card-countdown').innerText = `${rsvpDate.getDate()} ${months[rsvpDate.getMonth()]} ${rsvpDate.getFullYear()}`;
    } else {
      document.getElementById('card-countdown').innerText = 'Soon';
    }
  }

  // Actions
  const rsvp = document.getElementById('action-rsvp');
  if (rsvp && data.whatsapp) {
    const encodedText = encodeURIComponent(`Hi, I'm confirming attendance for ${data.names}'s ${data.eventType ? data.eventType.toLowerCase() : 'event'} on ${data.date} 🌸`);
    rsvp.href = `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}?text=${encodedText}`;
  }

  const map = document.getElementById('action-map');
  if (map && data.venueName) {
    map.href = `https://maps.google.com/?q=${encodeURIComponent(data.venueName + ' ' + (data.city || ''))}`;
  }
  
  if (data.paymentRequired && data.upiId) {
    const pay = document.getElementById('action-pay');
    if (pay) {
      pay.href = `upi://pay?pa=${data.upiId}&pn=${encodeURIComponent(data.hostName || '')}&cu=INR&tn=${encodeURIComponent((data.eventType || '') + ' RSVP')}`;
      pay.classList.remove('hidden');
    }
  }
}

function getMotifSvg(type) {
  const t = type ? type.toLowerCase() : 'wedding';
  if (t === 'wedding') {
    return `<svg class="motif-icon" viewBox="0 0 100 100"><path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>`;
  }
  if (t === 'engagement') {
    return `<svg class="motif-icon" viewBox="0 0 100 100"><circle cx="40" cy="50" r="25" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="60" cy="50" r="25" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="50" cy="30" r="5" fill="var(--accent)"/></svg>`;
  }
  if (t === 'pooja') {
    // Diya
    return `<svg class="motif-icon" viewBox="0 0 100 100"><path d="M20 60 Q50 90 80 60 Z" fill="none" stroke="var(--accent)" stroke-width="2"/><path d="M50 30 Q60 45 50 60 Q40 45 50 30 Z" fill="var(--accent)"/></svg>`;
  }
  if (t === 'housewarming') {
    return `<svg class="motif-icon" viewBox="0 0 100 100"><path d="M20 60 L50 30 L80 60" fill="none" stroke="var(--accent)" stroke-width="2"/><rect x="35" y="60" width="30" height="25" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>`;
  }
  return `<svg class="motif-icon" viewBox="0 0 100 100"><path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>`;
}
