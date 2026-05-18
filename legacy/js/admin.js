// ============================================================
//  admin.js  —  Admin panel logic
// ============================================================
import { auth, db, storage }  from "./firebase.js";
import {
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
  getCountFromServer, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ────────────────────────────────────────────────────────────
//  ELEMENTS
// ────────────────────────────────────────────────────────────
const loginRequired    = document.getElementById("admin-login-required");
const notAuthorized    = document.getElementById("admin-not-authorized");
const adminContent     = document.getElementById("admin-content");
const btnLoginAdmin    = document.getElementById("btn-login-admin");
const btnLogoutAdmin   = document.getElementById("btn-logout-admin");
const btnLogoutNoauth  = document.getElementById("btn-logout-noauth");
const adminAvatar      = document.getElementById("admin-avatar");
const adminName        = document.getElementById("admin-name");
const adminUserInfo    = document.getElementById("admin-user-info");
const pageTitle        = document.getElementById("page-title");
const notAuthorizedText= document.getElementById("admin-not-authorized-text");

// Sidebar nav
const sidebarLinks = document.querySelectorAll(".sidebar-link[data-page]");

// Pages
const pages = {
  dashboard: document.getElementById("page-dashboard"),
  upload:    document.getElementById("page-upload"),
  manage:    document.getElementById("page-manage"),
  comments:  document.getElementById("page-comments"),
};

// ────────────────────────────────────────────────────────────
//  AUTH
// ────────────────────────────────────────────────────────────
const provider = new GoogleAuthProvider();
let currentUser = null;
let isAdminUser = false;

if (btnLoginAdmin)   btnLoginAdmin.addEventListener("click",  () => signInWithPopup(auth, provider).catch(console.error));
if (btnLogoutAdmin)  btnLogoutAdmin.addEventListener("click",  () => signOut(auth));
if (btnLogoutNoauth) btnLogoutNoauth.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async user => {
  currentUser = user;
  isAdminUser = false;

  if (!user) {
    showView("login");
    return;
  }

  try {
    const tokenResult = await getIdTokenResult(user, true);
    isAdminUser = tokenResult.claims?.admin === true;
  } catch (e) {
    console.error("Admin claim check error:", e);
  }

  if (!isAdminUser) {
    if (notAuthorizedText) {
      notAuthorizedText.textContent = "Akun kamu belum memiliki custom claim admin. Hubungi administrator untuk mengaktifkan akses.";
    }
    showView("not-auth");
    return;
  }

  showView("admin");
  updateAdminUI(user);
  loadDashboard();
});

function showView(view) {
  loginRequired.classList.toggle("hidden",  view !== "login");
  notAuthorized.classList.toggle("hidden",  view !== "not-auth");
  adminContent.classList.toggle("hidden",   view !== "admin");
}

function updateAdminUI(user) {
  if (adminAvatar)   { adminAvatar.src = user.photoURL || ""; adminAvatar.alt = user.displayName; }
  if (adminName)     adminName.textContent  = user.displayName || user.email;
  if (adminUserInfo) adminUserInfo.classList.remove("hidden");
}

function requireAdminAccess() {
  if (!currentUser || !isAdminUser) {
    showView(currentUser ? "not-auth" : "login");
    throw new Error("Admin access required");
  }
}

// ────────────────────────────────────────────────────────────
//  NAVIGATION
// ────────────────────────────────────────────────────────────
sidebarLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const page = link.dataset.page;
    navigateTo(page);
  });
});

function navigateTo(page) {
  try {
    requireAdminAccess();
  } catch {
    return;
  }

  sidebarLinks.forEach(l => l.classList.toggle("active", l.dataset.page === page));
  Object.entries(pages).forEach(([key, el]) => {
    if (el) el.classList.toggle("hidden", key !== page);
  });
  const titles = { dashboard:"Dashboard", upload:"Upload Game", manage:"Kelola Game", comments:"Moderasi Komentar" };
  if (pageTitle) pageTitle.textContent = titles[page] || "Admin";

  if (page === "manage")   loadManageGames();
  if (page === "comments") loadModComments();
}

// ────────────────────────────────────────────────────────────
//  DASHBOARD
// ────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    requireAdminAccess();
    const [gamesSnap, commentsSnap, recentSnap] = await Promise.all([
      getCountFromServer(collection(db, "games")),
      getCountFromServer(collection(db, "comments")),
      getDocs(query(collection(db, "games"), orderBy("createdAt","desc"))),
    ]);

    const totalGames = gamesSnap.data().count;
    const totalComments = commentsSnap.data().count;

    const elGames    = document.getElementById("stat-total-games");
    const elComments = document.getElementById("stat-total-comments");
    const elStorage  = document.getElementById("stat-storage");

    if (elGames)    elGames.textContent    = totalGames;
    if (elComments) elComments.textContent = totalComments;
    if (elStorage)  elStorage.textContent  = `${totalGames} file`;

    const list = document.getElementById("recent-games-list");
    if (list) {
      list.innerHTML = "";
      recentSnap.docs.slice(0, 5).forEach(d => {
        list.appendChild(buildAdminGameRow(d.id, d.data(), false));
      });
      if (recentSnap.empty) {
        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Belum ada game.</p>';
      }
    }
  } catch(e) {
    console.error("Dashboard error:", e);
  }
}

// ────────────────────────────────────────────────────────────
//  UPLOAD GAME
// ────────────────────────────────────────────────────────────
let thumbFile = null;
let gameFile  = null;

setupFileDrop("thumb-drop", "thumb-input", handleThumb);
setupFileDrop("game-drop",  "game-file-input", handleGameFile);

function setupFileDrop(dropId, inputId, handler) {
  const drop  = document.getElementById(dropId);
  const input = document.getElementById(inputId);
  if (!drop || !input) return;

  drop.addEventListener("click", () => input.click());
  input.addEventListener("change", () => { if (input.files[0]) handler(input.files[0]); });

  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("drag-over"); });
  drop.addEventListener("dragleave", ()=> drop.classList.remove("drag-over"));
  drop.addEventListener("drop", e => {
    e.preventDefault();
    drop.classList.remove("drag-over");
    if (e.dataTransfer.files[0]) handler(e.dataTransfer.files[0]);
  });
}

function handleThumb(file) {
  if (!file.type.startsWith("image/")) { showAlert("upload-alert", "File thumbnail harus berupa gambar!", "error"); return; }
  if (file.size > 2 * 1024 * 1024)    { showAlert("upload-alert", "Gambar thumbnail maks 2MB.", "error"); return; }
  thumbFile = file;

  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById("thumb-preview");
    const content = document.getElementById("thumb-drop-content");
    if (preview) { preview.src = e.target.result; preview.classList.remove("hidden"); }
    if (content) content.classList.add("hidden");
  };
  reader.readAsDataURL(file);
}

function handleGameFile(file) {
  const ok = file.name.endsWith(".html") || file.name.endsWith(".htm");
  if (!ok) { showAlert("upload-alert", "Hanya file HTML yang diperbolehkan.", "error"); return; }
  if (file.size > 20 * 1024 * 1024) { showAlert("upload-alert", "File game maks 20MB.", "error"); return; }
  gameFile = file;

  const content  = document.getElementById("game-drop-content");
  const chosen   = document.getElementById("game-file-chosen");
  const fileName = document.getElementById("game-file-name");
  if (content)  content.classList.add("hidden");
  if (chosen)   chosen.classList.remove("hidden");
  if (fileName) fileName.textContent = file.name;
}

document.getElementById("btn-remove-game-file")?.addEventListener("click", () => {
  gameFile = null;
  const input   = document.getElementById("game-file-input");
  const content = document.getElementById("game-drop-content");
  const chosen  = document.getElementById("game-file-chosen");
  if (input)   input.value = "";
  if (content) content.classList.remove("hidden");
  if (chosen)  chosen.classList.add("hidden");
});

document.getElementById("btn-reset-form")?.addEventListener("click", resetUploadForm);

document.getElementById("upload-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const name  = document.getElementById("game-name")?.value.trim();
  const desc  = document.getElementById("game-desc-input")?.value.trim();
  const cat   = document.getElementById("game-category")?.value;
  const badge = document.getElementById("game-badge")?.value;

  // Validate
  if (!name)      { showAlert("upload-alert", "Nama game harus diisi!", "error"); return; }
  if (!desc)      { showAlert("upload-alert", "Deskripsi harus diisi!", "error"); return; }
  if (!cat)       { showAlert("upload-alert", "Pilih kategori game!", "error"); return; }
  if (!thumbFile) { showAlert("upload-alert", "Upload thumbnail dulu!", "error"); return; }
  if (!gameFile)  { showAlert("upload-alert", "Upload file game HTML dulu!", "error"); return; }

  await uploadGame({ name, desc, cat, badge });
});

async function uploadGame({ name, desc, cat, badge }) {
  requireAdminAccess();
  const submitBtn  = document.getElementById("btn-upload-submit");
  const btnText    = document.getElementById("upload-btn-text");
  const progressArea = document.getElementById("upload-progress-area");
  const progressBar  = document.getElementById("progress-bar");
  const progressPct  = document.getElementById("progress-percent");
  const progressLbl  = document.getElementById("progress-label");

  submitBtn.disabled = true;
  progressArea?.classList.remove("hidden");
  hideAlert("upload-alert");

  const gameId = `game_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

  try {
    // 1. Upload thumbnail
    if (progressLbl) progressLbl.textContent = "Upload thumbnail...";
    const thumbRef  = ref(storage, `thumbnails/${gameId}_thumb`);
    await uploadFile(thumbRef, thumbFile, pct => {
      if (progressBar) progressBar.style.width = `${pct * 0.4}%`;
      if (progressPct) progressPct.textContent = `${Math.round(pct * 0.4)}%`;
    });
    const thumbnailUrl = await getDownloadURL(thumbRef);

    // 2. Upload game file
    if (progressLbl) progressLbl.textContent = "Upload file game...";
    const gameRef = ref(storage, `games/${gameId}.html`);
    await uploadFile(gameRef, gameFile, pct => {
      if (progressBar) progressBar.style.width = `${40 + pct * 0.5}%`;
      if (progressPct) progressPct.textContent = `${Math.round(40 + pct * 0.5)}%`;
    });
    const gameUrl = await getDownloadURL(gameRef);

    // 3. Save to Firestore
    if (progressLbl) progressLbl.textContent = "Menyimpan data...";
    if (progressBar) progressBar.style.width = "95%";
    if (progressPct) progressPct.textContent = "95%";

    await addDoc(collection(db, "games"), {
      name,
      description: desc,
      category:    cat,
      badge:       badge || null,
      thumbnailUrl,
      gameUrl,
      storagePaths: {
        thumb: `thumbnails/${gameId}_thumb`,
        game:  `games/${gameId}.html`,
      },
      uploadedBy:  currentUser.uid,
      createdAt:   serverTimestamp(),
    });

    if (progressBar) progressBar.style.width = "100%";
    if (progressPct) progressPct.textContent = "100%";

    showAlert("upload-alert", "🎉 Game berhasil diupload!", "success");
    resetUploadForm();
    loadDashboard();

  } catch(e) {
    console.error("Upload error:", e);
    showAlert("upload-alert", `Upload gagal: ${e.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = "⬆️ Upload Game";
    setTimeout(() => progressArea?.classList.add("hidden"), 2000);
  }
}

function uploadFile(storageRef, file, onProgress) {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on("state_changed",
      snap => onProgress(snap.bytesTransferred / snap.totalBytes * 100),
      reject,
      () => resolve()
    );
  });
}

function resetUploadForm() {
  document.getElementById("upload-form")?.reset();
  thumbFile = null;
  gameFile  = null;
  const thumbPreview = document.getElementById("thumb-preview");
  const thumbContent = document.getElementById("thumb-drop-content");
  const gameChosen   = document.getElementById("game-file-chosen");
  const gameContent  = document.getElementById("game-drop-content");
  if (thumbPreview) { thumbPreview.src = ""; thumbPreview.classList.add("hidden"); }
  if (thumbContent)   thumbContent.classList.remove("hidden");
  if (gameChosen)     gameChosen.classList.add("hidden");
  if (gameContent)    gameContent.classList.remove("hidden");
  hideAlert("upload-alert");
}

// ────────────────────────────────────────────────────────────
//  MANAGE GAMES
// ────────────────────────────────────────────────────────────
let manageGames = [];

async function loadManageGames() {
  requireAdminAccess();
  const loading = document.getElementById("manage-loading");
  const table   = document.getElementById("manage-games-table");
  const empty   = document.getElementById("manage-empty");

  loading?.classList.remove("hidden");
  table?.classList.add("hidden");
  empty?.classList.add("hidden");

  try {
    const snap = await getDocs(query(collection(db, "games"), orderBy("createdAt","desc")));
    manageGames = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderManageTable(manageGames);
  } catch(e) {
    console.error("Load manage error:", e);
  } finally {
    loading?.classList.add("hidden");
  }
}

function renderManageTable(games) {
  const table = document.getElementById("manage-games-table");
  const empty = document.getElementById("manage-empty");
  if (!table) return;

  if (games.length === 0) {
    table.classList.add("hidden");
    empty?.classList.remove("hidden");
    return;
  }

  table.classList.remove("hidden");
  empty?.classList.add("hidden");
  table.innerHTML = `
    <div class="admin-table-header">
      <span>Thumb</span>
      <span>Nama Game</span>
      <span>Kategori</span>
      <span>Badge</span>
      <span>Aksi</span>
    </div>`;

  games.forEach(game => {
    table.appendChild(buildAdminGameRow(game.id, game, true));
  });
}

// Search & filter on manage page
document.getElementById("manage-search")?.addEventListener("input", function() {
  const val = this.value.toLowerCase();
  const cat = document.getElementById("manage-filter-cat")?.value || "all";
  filterManage(val, cat);
});

document.getElementById("manage-filter-cat")?.addEventListener("change", function() {
  const val = document.getElementById("manage-search")?.value.toLowerCase() || "";
  filterManage(val, this.value);
});

function filterManage(search, cat) {
  const filtered = manageGames.filter(g => {
    const matchCat    = cat === "all" || g.category === cat;
    const matchSearch = !search || g.name.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
  renderManageTable(filtered);
}

// ────────────────────────────────────────────────────────────
//  DELETE GAME
// ────────────────────────────────────────────────────────────
let pendingDeleteId   = null;
let pendingDeletePaths = null;

const modalDelete     = document.getElementById("modal-delete");
const btnModalCancel  = document.getElementById("btn-modal-cancel");
const btnModalConfirm = document.getElementById("btn-modal-confirm");
const modalDeleteName = document.getElementById("modal-delete-name");

function openDeleteModal(gameId, gameName, storagePaths) {
  pendingDeleteId    = gameId;
  pendingDeletePaths = storagePaths;
  if (modalDeleteName) modalDeleteName.textContent = gameName;
  modalDelete?.classList.remove("hidden");
}

btnModalCancel?.addEventListener("click", () => {
  modalDelete?.classList.add("hidden");
  pendingDeleteId    = null;
  pendingDeletePaths = null;
});

btnModalConfirm?.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  requireAdminAccess();
  btnModalConfirm.textContent = "Menghapus...";
  btnModalConfirm.disabled    = true;

  try {
    // Delete Firestore doc
    await deleteDoc(doc(db, "games", pendingDeleteId));

    // Delete Storage files
    if (pendingDeletePaths) {
      const delPromises = Object.values(pendingDeletePaths).map(path =>
        deleteObject(ref(storage, path)).catch(() => {})
      );
      await Promise.all(delPromises);
    }

    // Delete all comments for this game
    const commentsSnap = await getDocs(
      query(collection(db, "comments"), where("gameId", "==", pendingDeleteId))
    );
    await Promise.all(commentsSnap.docs.map(d => deleteDoc(d.ref)));

    modalDelete?.classList.add("hidden");
    loadManageGames();
    loadDashboard();

  } catch(e) {
    console.error("Delete error:", e);
    alert("Gagal menghapus game. Coba lagi.");
  } finally {
    btnModalConfirm.textContent = "Ya, Hapus!";
    btnModalConfirm.disabled    = false;
    pendingDeleteId = null;
    pendingDeletePaths = null;
  }
});

// Close modal on overlay click
modalDelete?.addEventListener("click", e => {
  if (e.target === modalDelete) btnModalCancel?.click();
});

// ────────────────────────────────────────────────────────────
//  MODERATION — Comments
// ────────────────────────────────────────────────────────────
async function loadModComments() {
  requireAdminAccess();
  const loading = document.getElementById("mod-loading");
  const list    = document.getElementById("mod-comments-list");
  const empty   = document.getElementById("mod-empty");

  loading?.classList.remove("hidden");
  list?.classList.add("hidden");
  empty?.classList.add("hidden");

  try {
    const snap = await getDocs(
      query(collection(db, "comments"), orderBy("createdAt", "desc"))
    );

    loading?.classList.add("hidden");

    if (snap.empty) {
      empty?.classList.remove("hidden");
      return;
    }

    list.innerHTML = "";
    list.classList.remove("hidden");
    snap.docs.forEach(d => list.appendChild(buildModCommentEl(d.id, d.data())));

  } catch(e) {
    console.error("Load mod comments error:", e);
    loading?.classList.add("hidden");
  }
}

function buildModCommentEl(commentId, data) {
  const el = document.createElement("div");
  el.className = "mod-comment-item";
  el.dataset.id = commentId;
  el.innerHTML = `
    <img class="comment-avatar" src="${data.userAvatar || ''}" alt="${data.userName || ''}"
         onerror="this.style.display='none'" />
    <div class="mod-comment-content">
      <div class="mod-comment-meta">
        <strong>${escHtml(data.userName || 'Anonim')}</strong>
        <a href="game.html?id=${data.gameId}" target="_blank" class="mod-game-link">Lihat Game</a>
        <span class="comment-time">${formatTime(data.createdAt)}</span>
      </div>
      <p class="mod-comment-text">${escHtml(data.text)}</p>
    </div>
    <div class="mod-comment-actions">
      <button class="btn-danger btn-sm btn-delete-comment" data-id="${commentId}">🗑️ Hapus</button>
    </div>`;

  el.querySelector(".btn-delete-comment").addEventListener("click", async () => {
    if (!confirm("Hapus komentar ini?")) return;
    try {
      requireAdminAccess();
      await deleteDoc(doc(db, "comments", commentId));
      el.remove();
    } catch(e) {
      alert("Gagal menghapus komentar.");
    }
  });

  return el;
}

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────
function buildAdminGameRow(gameId, game, isTable) {
  const el = document.createElement("div");
  el.className = isTable ? "admin-table-row" : "admin-game-row";

  el.innerHTML = `
    <img class="admin-game-thumb"
         src="${game.thumbnailUrl || ''}"
         alt="${escHtml(game.name)}"
         onerror="this.style.background='var(--primary-lt)';this.src=''" />
    <div class="${isTable ? 'table-cell-name' : 'admin-game-info'}">
      <div class="admin-game-name game-title">${escHtml(game.name)}</div>
      ${isTable ? `<div class="admin-game-meta">${escHtml(game.description || '').slice(0,60)}...</div>` : ''}
    </div>
    ${isTable ? `<span class="game-cat-tag cat-${game.category}">${catLabel(game.category)}</span>` : ''}
    ${isTable ? `<span class="game-cat-tag">${game.badge ? badgeLabel(game.badge) : '—'}</span>` : ''}
    <div class="${isTable ? 'table-actions' : 'admin-game-actions'}">
      <a href="game.html?id=${gameId}" target="_blank" class="btn-icon-sm" title="Lihat Game">👁️</a>
      <button class="btn-icon-sm btn-icon-danger btn-delete-game" data-id="${gameId}"
              data-name="${escHtml(game.name)}" title="Hapus">🗑️</button>
    </div>`;

  el.querySelector(".btn-delete-game").addEventListener("click", () => {
    openDeleteModal(gameId, game.name, game.storagePaths);
  });

  return el;
}

function showAlert(elId, msg, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent  = msg;
  el.className    = `alert alert-${type}`;
  el.classList.remove("hidden");
  if (type === "success") setTimeout(() => hideAlert(elId), 5000);
}

function hideAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add("hidden");
}

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date();
  return date.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

function catLabel(cat) {
  const map = { puzzle:"Puzzle", action:"Aksi", educational:"Edukasi", adventure:"Petualangan", sport:"Olahraga" };
  return map[cat] || cat || "Umum";
}

function badgeLabel(badge) {
  const map = { new:"🆕 Baru", hot:"🔥 Populer", featured:"⭐ Unggulan" };
  return map[badge] || badge;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}
