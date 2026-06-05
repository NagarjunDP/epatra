document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('creator-form');
  const paymentRequired = document.getElementById('paymentRequired');
  const upiIdInput = document.getElementById('upiId');
  const formView = document.getElementById('form-view');
  const successView = document.getElementById('success-view');
  const submitBtn = document.getElementById('submitBtn');
  
  // Live Preview Elements
  const hostInput = document.getElementById('hostName');
  const eventRadios = document.getElementsByName('eventType');
  const themeRadios = document.getElementsByName('theme');
  const previewHost = document.getElementById('preview-host');
  const previewEvent = document.getElementById('preview-event');
  const previewCard = document.getElementById('live-preview-card');
  const previewMotif = document.getElementById('preview-motif');
  
  // Mobile Modal Elements
  const mobilePreviewBtn = document.getElementById('mobilePreviewBtn');
  const mobilePreviewModal = document.getElementById('mobilePreviewModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const mobilePreviewWrapper = document.getElementById('mobile-preview-wrapper');
  
  let currentInviteUrl = '';

  // Update Live Preview
  function updatePreview() {
    previewHost.textContent = hostInput.value || 'Sharma Family';
    
    let selectedEvent = 'Wedding';
    for(let r of eventRadios) {
      if (r.checked) { selectedEvent = r.value; break; }
    }
    previewEvent.textContent = selectedEvent.toUpperCase() + ' INVITATION';
    
    let selectedTheme = 'ivory';
    for(let r of themeRadios) {
      if (r.checked) { selectedTheme = r.value; break; }
    }
    
    previewCard.className = 'mini-card';
    if (selectedTheme !== 'ivory') {
      previewCard.classList.add(`theme-${selectedTheme}`);
    }
    
    // Update Motif
    const t = selectedEvent.toLowerCase();
    if (t === 'wedding') {
      previewMotif.innerHTML = '<path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="none"/>';
    } else if (t === 'engagement') {
      previewMotif.innerHTML = '<circle cx="40" cy="50" r="25" fill="none"/><circle cx="60" cy="50" r="25" fill="none"/><circle cx="50" cy="30" r="5" fill="currentColor"/>';
    } else if (t === 'pooja') {
      previewMotif.innerHTML = '<path d="M20 60 Q50 90 80 60 Z" fill="none"/><path d="M50 30 Q60 45 50 60 Q40 45 50 30 Z" fill="currentColor"/>';
    } else if (t === 'housewarming') {
      previewMotif.innerHTML = '<path d="M20 60 L50 30 L80 60" fill="none"/><rect x="35" y="60" width="30" height="25" fill="none"/>';
    } else {
      previewMotif.innerHTML = '<path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none"/>';
    }
  }

  // Event Listeners for Live Preview
  hostInput.addEventListener('input', updatePreview);
  for(let r of eventRadios) r.addEventListener('change', updatePreview);
  for(let r of themeRadios) r.addEventListener('change', updatePreview);

  // Mobile Preview Logic
  mobilePreviewBtn.addEventListener('click', () => {
    mobilePreviewWrapper.appendChild(previewCard);
    mobilePreviewModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    document.querySelector('.preview-column .preview-container').appendChild(previewCard);
    mobilePreviewModal.classList.remove('active');
  });

  // Toggle UPI ID input
  paymentRequired.addEventListener('change', (e) => {
    upiIdInput.style.display = e.target.checked ? 'block' : 'none';
    if (e.target.checked) {
      upiIdInput.setAttribute('required', 'true');
    } else {
      upiIdInput.removeAttribute('required');
      upiIdInput.value = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    data.paymentRequired = formData.get('paymentRequired') === 'on';

    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        let code = result.code;
        let queryString = '';
        if (result.mock) {
          code = 'local';
          queryString = '?d=' + btoa(encodeURIComponent(JSON.stringify(data)));
        }
        showSuccess(code, queryString);
      } else {
        alert('Error: ' + result.error);
        submitBtn.textContent = 'Create Digital Card';
        submitBtn.disabled = false;
      }
    } catch (err) {
      alert('Network error. Please try again.');
      submitBtn.textContent = 'Create Digital Card';
      submitBtn.disabled = false;
    }
  });

  function showSuccess(code, queryString = '') {
    formView.classList.add('hidden');
    successView.classList.remove('hidden');
    
    // Hide mobile preview button on success
    mobilePreviewBtn.style.display = 'none';
    
    const origin = window.location.origin;
    currentInviteUrl = `${origin}/i/${code}${queryString}`;
  }
  
  document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(currentInviteUrl).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy Invite Link', 2000);
    });
  });
  
  document.getElementById('waBtn').addEventListener('click', () => {
    const text = encodeURIComponent(`You're invited 🌸\nTap to open the card:\n${currentInviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  });

  // Init
  updatePreview();
});
