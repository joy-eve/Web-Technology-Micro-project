let db, currentPage = 'overview', currentFilter = 'Animation';
let previewURL = '';
let galleryURLs = [];
let tasks = JSON.parse(localStorage.getItem('artelierTasks') || '[]');

const openDB = indexedDB.open('ArtelierLocal', 1);
openDB.onupgradeneeded = function () {
  if (!openDB.result.objectStoreNames.contains('artworks')) openDB.result.createObjectStore('artworks', { keyPath: 'id' });
};
openDB.onsuccess = function () { db = openDB.result; showArtworks(); refreshSummary(); };
openDB.onerror = function () { document.getElementById('artworkGrid').textContent = 'Browser storage is unavailable.'; };

function getArtworks(done) {
  if (!db) return done([]);
  const request = db.transaction('artworks').objectStore('artworks').getAll();
  request.onsuccess = () => done(request.result);
}

function saveArtwork(item) {
  const transaction = db.transaction('artworks', 'readwrite');
  transaction.objectStore('artworks').put(item);
  transaction.oncomplete = function () { showArtworks(); refreshSummary(); };
  transaction.onerror = () => alert('Could not save this file.');
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function updateSummary(items) {
  const count = (list, status) => list.filter(item => item.status === status).length;
  let title = 'At a glance', label = 'WORKSPACE SUMMARY', rows = [];

  if (currentPage === 'gallery') {
    const selected = items.filter(item => item.section === currentFilter);
    title = currentFilter + ' at a glance'; label = 'GALLERY SUMMARY';
    rows = [['Saved artworks', selected.length], ['Practice', count(selected, 'Practice')], ['Finished', count(selected, 'Finished')], ['50% Rule', count(selected, '50% Rule')]];
    if (currentFilter === 'Animation') rows.push(['Videos', selected.filter(item => item.file.type.startsWith('video/')).length], ['Keyframes', selected.filter(item => item.file.type.startsWith('image/')).length]);
  } else if (currentPage === 'practice') {
    const done = tasks.filter(task => task.done).length;
    title = 'Daily practice'; label = 'PRACTICE SUMMARY';
    rows = [['Total tasks', tasks.length], ['Completed', done], ['Remaining', tasks.length - done]];
  } else if (currentPage === 'calculator') {
    title = 'Calculator'; label = 'QUICK TOOL'; rows = [['Operations', 4], ['Available', '+  −  ×  ÷']];
  } else {
    title = 'At a glance'; label = 'WORKSPACE SUMMARY';
    rows = [['Saved artworks', items.length], ['Practice completed', tasks.filter(task => task.done).length + ' / ' + tasks.length]];
  }

  document.getElementById('summaryHeading').textContent = title;
  document.getElementById('summaryEyebrow').textContent = label;
  document.getElementById('summaryRows').innerHTML = rows.map(row => '<div class="summary-row"><span>' + row[0] + '</span><strong>' + row[1] + '</strong></div>').join('');
  document.getElementById('artCount').textContent = items.length;
  document.getElementById('taskCount').textContent = tasks.filter(task => task.done).length;
}

function refreshSummary() { getArtworks(updateSummary); }

function showArtworks() {
  getArtworks(function (items) {
    const grid = document.getElementById('artworkGrid');
    galleryURLs.forEach(URL.revokeObjectURL); galleryURLs = [];
    const visible = items.filter(item => item.section === currentFilter);
    grid.innerHTML = visible.map(function (item) {
      const url = URL.createObjectURL(item.file); galleryURLs.push(url);
      const video = item.file.type.startsWith('video/');
      const media = video
        ? '<video class="art-preview art-video" controls src="' + url + '"></video>'
        : '<img class="art-preview" data-preview="' + item.id + '" src="' + url + '" alt="' + escapeHTML(item.title) + '">';
      const status = ['Practice', 'Finished', '50% Rule'].map(value => '<option ' + (item.status === value ? 'selected' : '') + '>' + value + '</option>').join('');
      const sections = ['Animation', 'Digital Art', 'Traditional Art'].map(value => '<option ' + (item.section === value ? 'selected' : '') + '>' + value + '</option>').join('');
      return '<article class="art-card">' + media + '<div class="art-info"><b class="art-name">' + escapeHTML(item.title) + '</b><p class="art-file">' + escapeHTML(item.file.name) + '</p><div class="art-edit-controls"><label>Status<select data-edit="status" data-id="' + item.id + '">' + status + '</select></label><label>Move to<select data-edit="section" data-id="' + item.id + '">' + sections + '</select></label></div>' + '<button class="delete-art" data-delete="' + item.id + '" type="button">Delete file</button></div></article>';
    }).join('') || '<p class="empty-state">No artwork here yet. Add a file above.</p>';
    updateSummary(items);
  });
}

document.getElementById('artworkGrid').addEventListener('change', function (event) {
  const select = event.target.closest('[data-edit]');
  if (!select) return;
  const id = Number(select.dataset.id), field = select.dataset.edit, value = select.value;
  getArtworks(items => {
    const item = items.find(file => file.id === id);
    if (!item) return;
    item[field] = value;
    saveArtwork(item);
  });
});

document.getElementById('artworkGrid').addEventListener('click', function (event) {
  const remove = event.target.closest('[data-delete]');
  if (remove) {
    const id = Number(remove.dataset.delete);
    if (!confirm('Delete this saved file from Artelier? Your original computer file will not be deleted.')) return;
    const transaction = db.transaction('artworks', 'readwrite');
    transaction.objectStore('artworks').delete(id);
    transaction.oncomplete = function () { showArtworks(); refreshSummary(); };
    return;
  }
  const image = event.target.closest('[data-preview]');
  if (image) openPreview(Number(image.dataset.preview));
});

function openPreview(id) {
  getArtworks(function (items) {
    const item = items.find(file => file.id === id);
    if (!item) return;
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = URL.createObjectURL(item.file);
    document.getElementById('mediaView').innerHTML = '<img src="' + previewURL + '" alt="' + escapeHTML(item.title) + '">';
    document.getElementById('mediaCaption').textContent = item.title + ' - ' + item.file.name;
    document.getElementById('mediaDialog').showModal();
  });
}

function closePreview() { document.getElementById('mediaDialog').close(); }
document.getElementById('closeDialog').addEventListener('click', closePreview);
document.getElementById('mediaDialog').addEventListener('close', function () {
  document.getElementById('mediaView').innerHTML = '';
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = '';
});

function setFilter(section) {
  currentFilter = section;
  document.getElementById('artSection').value = section;
  document.getElementById('galleryHeading').textContent = section + ' gallery';
  document.getElementById('galleryDescription').textContent = section === 'Animation' ? 'Add animation videos and keyframe images.' : 'Add your ' + section.toLowerCase() + ' drawings and practice work.';
  document.getElementById('artFile').accept = section === 'Animation' ? 'image/*,video/*' : 'image/*';
  showArtworks();
}

function closeDrawer() {
  document.getElementById('dashboardSidebar').classList.remove('drawer-open');
  document.getElementById('drawerShade').classList.remove('show');
}

function showPage(page, section) {
  currentPage = page;
  document.querySelectorAll('.workspace-page').forEach(panel => panel.hidden = panel.id !== 'page-' + page);
  if (page === 'gallery') setFilter(section || currentFilter);
  document.querySelectorAll('.side-link').forEach(link => link.classList.toggle('active', link.dataset.page === page && (page !== 'gallery' || link.dataset.category === currentFilter)));
  refreshSummary(); closeDrawer();
}

document.querySelectorAll('[data-page]').forEach(link => link.addEventListener('click', () => showPage(link.dataset.page, link.dataset.category)));
document.getElementById('artSection').addEventListener('change', function () { showPage('gallery', this.value); });

document.getElementById('artworkForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const file = document.getElementById('artFile').files[0], section = document.getElementById('artSection').value;
  if (!file) return;
  if (section !== 'Animation' && !file.type.startsWith('image/')) return alert('Digital and Traditional Art only accept images.');
  if (section === 'Animation' && !file.type.startsWith('image/') && !file.type.startsWith('video/')) return alert('Choose an image or video file.');
  const title = document.getElementById('artTitle').value.trim();
  if (!title) return;
  saveArtwork({ id: Date.now(), title, section, status: document.getElementById('artStatus').value, file });
  this.reset(); document.getElementById('artSection').value = currentFilter;
});

function showTasks() {
  const done = tasks.filter(task => task.done).length;
  document.getElementById('taskList').innerHTML = tasks.map(task => '<li class="' + (task.done ? 'done' : '') + '"><input type="checkbox" data-task="' + task.id + '" ' + (task.done ? 'checked' : '') + '><span>' + escapeHTML(task.name) + '</span><small class="task-category">' + escapeHTML(task.category) + '</small><button class="delete-task" data-remove-task="' + task.id + '" type="button">Delete</button></li>').join('') || '<li class="empty-task">No practice tasks yet.</li>';
  document.getElementById('taskCount').textContent = done;
  document.getElementById('taskProgress').textContent = done + ' of ' + tasks.length + ' completed';
  refreshSummary();
}

function saveTasks() {
  localStorage.setItem('artelierTasks', JSON.stringify(tasks)); showTasks();
}
document.getElementById('taskForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const input = document.getElementById('taskInput');
  if (input.value.trim()) tasks.push({ id: Date.now(), name: input.value.trim(), category: document.getElementById('taskCategory').value, done: false });
  input.value = ''; saveTasks();
});
document.getElementById('taskList').addEventListener('change', function (event) {
  if (!event.target.dataset.task) return;
  const task = tasks.find(item => item.id === Number(event.target.dataset.task));
  if (task) { task.done = event.target.checked; saveTasks(); }
});
document.getElementById('taskList').addEventListener('click', function (event) {
  if (!event.target.dataset.removeTask) return;
  tasks = tasks.filter(task => task.id !== Number(event.target.dataset.removeTask)); saveTasks();
});

showTasks();

document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('dashboardSidebar').classList.toggle('drawer-open');
  document.getElementById('drawerShade').classList.toggle('show');
});
document.getElementById('drawerShade').addEventListener('click', closeDrawer);

const start = location.hash.slice(1);
if (start === 'animation') showPage('gallery', 'Animation');
else if (start === 'digital') showPage('gallery', 'Digital Art');
else if (start === 'traditional') showPage('gallery', 'Traditional Art');
else if (['practice', 'calculator'].includes(start)) showPage(start);
else showPage('overview');
