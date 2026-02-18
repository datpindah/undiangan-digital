let token = null
let myInvitations = []

const loginSection = document.getElementById('loginSection')
const dashboard = document.getElementById('dashboard')
const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const emailInput = document.getElementById('emailInput')
const passwordInput = document.getElementById('passwordInput')
const loginError = document.getElementById('loginError')

const refreshInvitationsBtn = document.getElementById('refreshInvitations')
const invitationList = document.getElementById('invitationList')

const createInvitationForm = document.getElementById('createInvitationForm')
const editInvitationForm = document.getElementById('editInvitationForm')
const editInvitationSelect = document.getElementById('editInvitationSelect')
const galleryInvitationSelect = document.getElementById('galleryInvitationSelect')
const rsvpInvitationSelect = document.getElementById('rsvpInvitationSelect')
const uploadForm = document.getElementById('uploadForm')
const imageInput = document.getElementById('imageInput')
const galleryList = document.getElementById('galleryList')
const loadRsvpBtn = document.getElementById('loadRsvpBtn')
const rsvpTableBody = document.getElementById('rsvpTableBody')
const guestInvitationSelect = document.getElementById('guestInvitationSelect')
const guestNameInput = document.getElementById('guestNameInput')
const addGuestBtn = document.getElementById('addGuestBtn')
const guestList = document.getElementById('guestList')

const uploadBulkGuestBtn = document.getElementById('uploadBulkGuestBtn')
const bulkGuestInput = document.getElementById('bulkGuestInput')
const uploadGroomPhotoBtn = document.getElementById('uploadGroomPhotoBtn')
const groomPhotoInput = document.getElementById('groomPhotoInput')
const uploadBridePhotoBtn = document.getElementById('uploadBridePhotoBtn')
const bridePhotoInput = document.getElementById('bridePhotoInput')

function setToken(t) {
  token = t
  localStorage.setItem('token', t)
  loginSection.classList.add('hidden')
  dashboard.classList.remove('hidden')
  logoutBtn.classList.remove('hidden')
  loadMyInvitations()
}

function clearToken() {
  token = null
  localStorage.removeItem('token')
  loginSection.classList.remove('hidden')
  dashboard.classList.add('hidden')
  logoutBtn.classList.add('hidden')
}

function init() {
  const saved = localStorage.getItem('token')
  if (saved) setToken(saved)
}

loginBtn.addEventListener('click', async () => {
  loginError.classList.add('hidden')
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()
  if (!email || !password) return
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (res.ok && data.token) {
      setToken(data.token)
    } else {
      loginError.classList.remove('hidden')
    }
  } catch {
    loginError.classList.remove('hidden')
  }
})

logoutBtn.addEventListener('click', () => {
  clearToken()
})

refreshInvitationsBtn.addEventListener('click', () => loadMyInvitations())

async function loadMyInvitations() {
  try {
    const res = await fetch('/api/invitations/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    myInvitations = await res.json()
    renderInvitationList()
    populateInvitationSelects()
    loadGalleryForSelected()
  } catch {}
}

function renderInvitationList() {
  invitationList.innerHTML = myInvitations.map(inv => {
    const url = `/${inv.slug}`
    return `<li class="flex items-center justify-between gap-2">
      <span>${inv.groom_name} & ${inv.bride_name} — <a class="text-primary underline" href="${url}" target="_blank">Buka</a></span>
      <div class="flex items-center gap-2">
        <button data-id="${inv.id}" class="px-2 py-1 text-xs bg-soft rounded hover:bg-accent hover:text-white transition">Edit</button>
        <button data-id="${inv.id}" data-del="1" class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">Hapus</button>
      </div>
    </li>`
  }).join('')
  invitationList.querySelectorAll('button').forEach(btn => {
    const id = btn.getAttribute('data-id')
    if (btn.getAttribute('data-del') === '1') {
      btn.addEventListener('click', async () => {
        if (!confirm('Hapus undangan ini?')) return
        try {
          const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            loadMyInvitations()
          } else {
            alert('Gagal menghapus undangan')
          }
        } catch {
          alert('Koneksi bermasalah')
        }
      })
    } else {
      btn.addEventListener('click', () => {
        const inv = myInvitations.find(i => String(i.id) === String(id))
        if (inv) fillEditForm(inv)
      })
    }
  })
}

function populateInvitationSelects() {
  const options = myInvitations.map(inv => `<option value="${inv.id}">${inv.slug} — ${inv.groom_name} & ${inv.bride_name}</option>`).join('')
  editInvitationSelect.innerHTML = `<option value="">Pilih undangan</option>` + options
  galleryInvitationSelect.innerHTML = options
  rsvpInvitationSelect.innerHTML = options
  guestInvitationSelect.innerHTML = options
}

function formToObject(form) {
  const fd = new FormData(form)
  const obj = {}
  fd.forEach((v, k) => { if (v) obj[k] = v })
  return obj
}

createInvitationForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const payload = formToObject(createInvitationForm)
  try {
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      createInvitationForm.reset()
      loadMyInvitations()
      alert('Undangan dibuat')
    } else {
      alert('Gagal membuat undangan')
    }
  } catch {
    alert('Koneksi bermasalah')
  }
})

editInvitationSelect.addEventListener('change', () => {
  const id = editInvitationSelect.value
  const inv = myInvitations.find(i => String(i.id) === String(id))
  if (inv) fillEditForm(inv)
})

function fillEditForm(inv) {
  editInvitationSelect.value = inv.id
  editInvitationForm.querySelector('input[name="groom_name"]').value = inv.groom_name || ''
  editInvitationForm.querySelector('input[name="bride_name"]').value = inv.bride_name || ''
  editInvitationForm.querySelector('input[name="groom_parents_text"]').value = inv.groom_parents_text || 'Putra dari Bpk. Fulan & Ibu Fulanah'
  editInvitationForm.querySelector('input[name="bride_parents_text"]').value = inv.bride_parents_text || 'Putri dari Bpk. Fulan & Ibu Fulanah'
  editInvitationForm.querySelector('input[name="wedding_date"]').value = inv.wedding_date || ''
  editInvitationForm.querySelector('input[name="akad_time"]').value = inv.akad_time || ''
  editInvitationForm.querySelector('input[name="resepsi_time"]').value = inv.resepsi_time || ''
  editInvitationForm.querySelector('input[name="venue_name"]').value = inv.venue_name || ''
  editInvitationForm.querySelector('input[name="venue_address"]').value = inv.venue_address || ''
  editInvitationForm.querySelector('input[name="primary_color"]').value = inv.primary_color || ''
  editInvitationForm.querySelector('input[name="gift_bank"]').value = inv.gift_bank || ''
  editInvitationForm.querySelector('input[name="gift_account_number"]').value = inv.gift_account_number || ''
  editInvitationForm.querySelector('input[name="gift_account_name"]').value = inv.gift_account_name || ''
  editInvitationForm.querySelector('input[name="maps_url"]').value = inv.maps_url || ''
}

uploadBulkGuestBtn.addEventListener('click', async () => {
  const invId = guestInvitationSelect.value
  const file = bulkGuestInput.files[0]
  
  if (!invId) return alert('Pilih undangan terlebih dahulu')
  if (!file) return alert('Pilih file Excel terlebih dahulu')

  const fd = new FormData()
  fd.append('invitation_id', invId)
  fd.append('file', file)

  try {
    const res = await fetch('/api/guests/bulk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
      bulkGuestInput.value = ''
      loadGuestList()
    } else {
      alert(data.message || 'Gagal upload')
    }
  } catch (e) {
    alert('Error upload file')
  }
})

async function uploadCouplePhoto(role, inputId) {
  const invId = editInvitationSelect.value
  const input = document.getElementById(inputId)
  const file = input.files[0]

  if (!invId) return alert('Pilih undangan untuk diedit')
  if (!file) return alert('Pilih foto terlebih dahulu')

  const fd = new FormData()
  fd.append('photo', file)
  fd.append('role', role) // groom or bride

  try {
    const res = await fetch(`/api/invitations/${invId}/couple-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
    const data = await res.json()
    if (res.ok) {
      alert(`Foto ${role === 'groom' ? 'Pria' : 'Wanita'} berhasil diupload`)
      input.value = ''
    } else {
      alert(data.message || 'Gagal upload foto')
    }
  } catch (e) {
    alert('Error upload foto')
  }
}

uploadGroomPhotoBtn.addEventListener('click', () => uploadCouplePhoto('groom', 'groomPhotoInput'))
uploadBridePhotoBtn.addEventListener('click', () => uploadCouplePhoto('bride', 'bridePhotoInput'))

editInvitationForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = editInvitationSelect.value
  if (!id) return
  const payload = formToObject(editInvitationForm)
  try {
    const res = await fetch(`/api/invitations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      loadMyInvitations()
      alert('Undangan diperbarui')
    } else {
      alert('Gagal memperbarui undangan')
    }
  } catch {
    alert('Koneksi bermasalah')
  }
})

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const invId = galleryInvitationSelect.value
  if (!invId || !imageInput.files[0]) return
  const fd = new FormData()
  fd.append('image', imageInput.files[0])
  fd.append('invitation_id', invId)
  try {
    const res = await fetch('/api/gallery/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
    if (res.ok) {
      imageInput.value = ''
      loadGalleryForSelected()
      alert('Foto diunggah')
    } else {
      alert('Gagal unggah foto')
    }
  } catch {
    alert('Koneksi bermasalah')
  }
})

async function loadGalleryForSelected() {
  const invId = galleryInvitationSelect.value || (myInvitations[0] && myInvitations[0].id)
  if (!invId) return
  try {
    const res = await fetch(`/api/gallery/${invId}`)
    const images = await res.json()
    galleryList.innerHTML = images.map(img => `
      <li class="flex items-center justify-between">
        <a href="${img.image_path}" target="_blank" class="text-primary underline">${img.image_path}</a>
        <button data-id="${img.id}" class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">Hapus</button>
      </li>
    `).join('')
    galleryList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id')
        const del = await fetch(`/api/gallery/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        if (del.ok) loadGalleryForSelected()
      })
    })
  } catch {}
}

addGuestBtn.addEventListener('click', async () => {
  const invId = guestInvitationSelect.value
  const name = (guestNameInput.value || '').trim()
  if (!invId || !name) return
  try {
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ invitation_id: invId, guest_name: name })
    })
    if (res.ok) {
      guestNameInput.value = ''
      loadGuestList()
    } else {
      alert('Gagal menambahkan tamu')
    }
  } catch {
    alert('Koneksi bermasalah')
  }
})

guestInvitationSelect.addEventListener('change', () => loadGuestList())

async function loadGuestList() {
  const invId = guestInvitationSelect.value || (myInvitations[0] && myInvitations[0].id)
  if (!invId) return
  try {
    const res = await fetch(`/api/guests/${invId}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const baseSlug = data.invitation_slug
    guestList.innerHTML = data.guests.map(g => {
      const link = `/${baseSlug}?to=${encodeURIComponent(g.guest_name)}`
      return `<li class="flex items-center justify-between">
        <span>${g.guest_name} — <a class="text-primary underline" href="${link}" target="_blank">${link}</a></span>
        <button data-id="${g.id}" class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">Hapus</button>
      </li>`
    }).join('')
    guestList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id')
        const del = await fetch(`/api/guests/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        if (del.ok) loadGuestList()
      })
    })
  } catch {}
}
loadRsvpBtn.addEventListener('click', async () => {
  const invId = rsvpInvitationSelect.value
  if (!invId) return
  try {
    const res = await fetch(`/api/rsvp/${invId}`, { headers: { Authorization: `Bearer ${token}` } })
    const rsvps = await res.json()
    rsvpTableBody.innerHTML = rsvps.map(r => `
      <tr class="border-b">
        <td class="py-2">${r.guest_name}</td>
        <td class="py-2 capitalize">${r.attendance}</td>
        <td class="py-2">${r.total_guest}</td>
        <td class="py-2">${r.message || ''}</td>
      </tr>
    `).join('')
  } catch {}
})

init()
