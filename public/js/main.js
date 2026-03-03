// Main Logic
document.addEventListener('DOMContentLoaded', () => {
    const slug = getSlugFromUrl();
    fetchInvitationData(slug);
    setupEventListeners();
});

// 1. Get Slug from URL
function getSlugFromUrl() {
    const path = window.location.pathname.substring(1); // remove leading slash
    return path || 'romeo-juliet'; // Default for demo if root
}

// 2. Fetch Data
async function fetchInvitationData(slug) {
    try {
        const response = await fetch(`/api/invitations/${slug}`);
        if (!response.ok) throw new Error('Invitation not found');
        
        const data = await response.json();
        populateUI(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback or show error
        alert('Undangan tidak ditemukan atau terjadi kesalahan.');
    }
}

// 3. Populate UI
function populateUI(data) {
    // Contract IDs
    const els = {
        coverNames: document.getElementById('cover-names'),
        coverDate: document.getElementById('cover-date'),
        guestDisplay: document.getElementById('guest-display'), // Logic for guest name query param?
        
        groomName: document.getElementById('groom-name-display'),
        brideName: document.getElementById('bride-name-display'),
        
        akadDate: document.getElementById('akad-date-display'),
        akadTime: document.getElementById('akad-time-display'),
        resepsiDate: document.getElementById('resepsi-date-display'),
        resepsiTime: document.getElementById('resepsi-time-display'),
        
        venueName: document.getElementById('venue-name-display'),
        venueAddress: document.getElementById('venue-address-display'),
        
        groomImg: document.getElementById('groom-img'),
        brideImg: document.getElementById('bride-img'),

        footerNames: document.getElementById('footer-names'),
    };

    // Helper date formatter
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Fill Data
    const coupleNames = `${data.groom_name} & ${data.bride_name}`;
    if (els.coverNames) els.coverNames.textContent = coupleNames;
    if (els.footerNames) els.footerNames.textContent = coupleNames;
    
    const formattedDate = formatDate(data.wedding_date);
    if (els.coverDate) els.coverDate.textContent = formattedDate;
    
    if (els.groomName) els.groomName.textContent = data.groom_name;
    if (els.brideName) els.brideName.textContent = data.bride_name;
    
    if (els.akadDate) els.akadDate.textContent = formattedDate;
    if (els.akadTime) els.akadTime.textContent = `${data.akad_time} WIB`;
    
    if (els.resepsiDate) els.resepsiDate.textContent = formattedDate;
    if (els.resepsiTime) els.resepsiTime.textContent = `${data.resepsi_time} WIB`;
    
    if (els.venueName) els.venueName.textContent = data.venue_name;
    if (els.venueAddress) els.venueAddress.textContent = data.venue_address;

    if (data.groom_image && els.groomImg) els.groomImg.src = data.groom_image;
    if (data.bride_image && els.brideImg) els.brideImg.src = data.bride_image;

    // Handle Guest Name from URL Query Param ?to=Name
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName && els.guestDisplay) {
        els.guestDisplay.textContent = guestName;
    }

    const groomParentsEl = document.querySelector('[data-groom-parents]');
    const brideParentsEl = document.querySelector('[data-bride-parents]');
    const mapLinkEl = document.getElementById('map-link');

    if (groomParentsEl) {
        groomParentsEl.textContent = data.groom_parents_text || 'Putra dari Bpk. Fulan & Ibu Fulanah';
    }

    if (brideParentsEl) {
        brideParentsEl.textContent = data.bride_parents_text || 'Putri dari Bpk. Fulan & Ibu Fulanah';
    }

    if (mapLinkEl) {
        if (data.maps_url) {
            mapLinkEl.href = data.maps_url;
        } else if (data.venue_address) {
            const query = encodeURIComponent(data.venue_address);
            mapLinkEl.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
        }
    }

    const giftBankEl = document.querySelector('#gift [data-gift-bank]');
    const giftNumberEl = document.querySelector('#gift [data-gift-account-number]');
    const giftNameEl = document.querySelector('#gift [data-gift-account-name]');
    const giftButton = document.querySelector('#gift button');

    const giftBank = data.gift_bank || 'BCA';
    const giftNumber = data.gift_account_number || '123 456 7890';
    const giftName = data.gift_account_name || `a.n ${data.groom_name || ''}`.trim();

    if (giftBankEl) giftBankEl.textContent = giftBank;
    if (giftNumberEl) giftNumberEl.textContent = giftNumber;
    if (giftNameEl) giftNameEl.textContent = giftName;

    if (giftButton && giftNumberEl) {
        giftButton.onclick = () => {
            const raw = giftNumberEl.textContent || '';
            const cleaned = raw.replace(/\s+/g, '');
            copyToClipboard(cleaned);
        };
    }

    // Populate Gallery if exists
    if (data.gallery && data.gallery.length > 0) {
        const galleryGrid = document.getElementById('gallery-grid');
        galleryGrid.innerHTML = data.gallery.map(img => `
            <div class="aspect-square bg-gray-200 rounded-2xl shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                <img src="${img.image_path}" alt="Gallery" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>
        `).join('');
    }

    // Setup Music
    const audio = document.getElementById('bg-music');
    if (audio && data.music_url) {
        audio.src = data.music_url;
        audio.load();
    }

    // Store invitation ID for RSVP
    document.getElementById('rsvp-form').dataset.invitationId = data.id;
}

// 4. Open Invitation Animation
function openInvitation() {
    const cover = document.getElementById('cover');
    const main = document.getElementById('main-content');
    const audio = document.getElementById('bg-music');
    const audioControl = document.getElementById('audio-control');
    const musicBtn = document.getElementById('musicBtn');
    
    // Slide up cover
    cover.style.transform = 'translateY(-100%)';
    
    // Show main content
    setTimeout(() => {
        main.classList.remove('opacity-0');
        // Play music if exists
        if(audio && audio.src) {
            audio.play().catch(e => console.log('Autoplay prevented', e));
            if(audioControl) {
                audioControl.classList.remove('hidden');
                // Check if playing to add animation
                if(!audio.paused && musicBtn) {
                    musicBtn.classList.add('animate-spin-slow');
                    musicBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path></svg>`; // Pause icon
                }
            }
        }
    }, 500);
}

// 5. Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Assume toast exists or create simple alert fallback
        // const toast = document.getElementById('toast');
        // if(toast) ...
        alert('Nomor rekening disalin!');
    });
}

// 6. Setup Listeners
function setupEventListeners() {
    // Music Control
    const musicBtn = document.getElementById('musicBtn');
    const audio = document.getElementById('bg-music');
    const musicIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>`;
    const pauseIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path></svg>`;

    if (musicBtn && audio) {
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                musicBtn.classList.add('animate-spin-slow');
                musicBtn.innerHTML = pauseIcon;
            } else {
                audio.pause();
                musicBtn.classList.remove('animate-spin-slow');
                musicBtn.innerHTML = musicIcon;
            }
        });
    }

    // RSVP Form
    const rsvpForm = document.getElementById('rsvp-form');
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const invitationId = rsvpForm.dataset.invitationId;
        if (!invitationId) return;

        const formData = new FormData(rsvpForm);
        const payload = {
            invitation_id: invitationId,
            guest_name: formData.get('guest_name'),
            attendance: formData.get('attendance'),
            total_guest: parseInt(formData.get('total_guest')),
            message: formData.get('message')
        };

        try {
            const btn = rsvpForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Mengirim...';
            btn.disabled = true;

            const res = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                rsvpForm.classList.add('hidden');
                document.getElementById('rsvp-success').classList.remove('hidden');
            } else {
                alert('Gagal mengirim RSVP. Silakan coba lagi.');
                btn.textContent = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan koneksi.');
        }
    });
}
