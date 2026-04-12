// ============================================================
//  app.js  —  Main portal page logic
// ============================================================
import { auth, db }              from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, where, getCountFromServer, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ────────────────────────────────────────────────────────────
//  ELEMENTS
// ────────────────────────────────────────────────────────────
const btnLogin       = document.getElementById("btn-login");
const btnLoginHero   = document.getElementById("btn-login-hero");
const btnLoginPrompt = document.getElementById("btn-login-prompt");
const btnLogout      = document.getElementById("btn-logout");
const userMenu       = document.getElementById("user-menu");
const userAvatar     = document.getElementById("user-avatar");
const userName       = document.getElementById("user-name");
const heroCta        = document.getElementById("hero-cta");
const heroWelcome    = document.getElementById("hero-welcome");
const heroUsername   = document.getElementById("hero-username");
const gamesGrid      = document.getElementById("games-grid");
const gamesLoading   = document.getElementById("games-loading");
const gamesEmpty     = document.getElementById("games-empty");
const loginPrompt    = document.getElementById("login-prompt");
const searchInput    = document.getElementById("search-input");
const catBtns        = document.querySelectorAll(".cat-btn");

// ────────────────────────────────────────────────────────────
//  AUTH
// ────────────────────────────────────────────────────────────
const provider = new GoogleAuthProvider();
let pendingGameUrl = null;

async function loginWithGoogle() {
  try { await signInWithPopup(auth, provider); }
  catch (e) { console.error("Login error:", e); }
}

[btnLogin, btnLoginHero, btnLoginPrompt].forEach(btn => {
  if (btn) btn.addEventListener("click", loginWithGoogle);
});

if (btnLogout) btnLogout.addEventListener("click", () => signOut(auth));

// ────────────────────────────────────────────────────────────
//  AUTH STATE
// ────────────────────────────────────────────────────────────
let currentUser = null;
let gamesReady  = false;

onAuthStateChanged(auth, user => {
  currentUser = user;
  updateAuthUI(user);
  // Setelah login, redirect ke game yang dituju (jika ada)
  if (user && pendingGameUrl) {
    window.location.href = pendingGameUrl;
    return;
  }
  // Kalau game sudah diload, cukup render ulang (jangan reload dari awal)
  if (gamesReady) {
    renderGames();
  }
});

// Load game SEKALI saja saat halaman pertama kali dibuka
loadGames();

function updateAuthUI(user) {
  if (user) {
    if (btnLogin)     btnLogin.classList.add("hidden");
    if (userMenu)     userMenu.classList.remove("hidden");
    if (userAvatar)   userAvatar.src  = user.photoURL || "";
    if (userName)     userName.textContent = user.displayName?.split(" ")[0] || "Kamu";
    if (heroCta)      heroCta.classList.add("hidden");
    if (heroWelcome)  heroWelcome.classList.remove("hidden");
    if (heroUsername) heroUsername.textContent = user.displayName?.split(" ")[0] || "Kamu";
  } else {
    if (btnLogin)    btnLogin.classList.remove("hidden");
    if (userMenu)    userMenu.classList.add("hidden");
    if (heroCta)     heroCta.classList.remove("hidden");
    if (heroWelcome) heroWelcome.classList.add("hidden");
  }
}

// ────────────────────────────────────────────────────────────
//  GAMES DATA
// ────────────────────────────────────────────────────────────
let allGames = [];
let currentCat = "all";

async function loadGames() {
  showGamesState("loading");

  try {
    // Load manifest
    const indexRes = await fetch("games/index.json");
    if (!indexRes.ok) throw new Error("index.json not found");
    const gameIds = await indexRes.json();

    // Load each game's info.json
    const gameDataList = await Promise.all(
      gameIds.map(async id => {
        try {
          const res = await fetch(`games/${id}/info.json`);
          if (!res.ok) return null;
          return await res.json();
        } catch { return null; }
      })
    );

    // Filter null (gagal load) dan hitung komentar dari Firestore
    // Komentar bersifat opsional — kalau Firestore gagal, game tetap tampil
    allGames = await Promise.all(
      gameDataList.filter(Boolean).map(async game => {
        let commentsCount = 0;
        try {
          const commentsSnap = await getCountFromServer(
            query(collection(db, "comments"), where("gameId", "==", game.id))
          );
          commentsCount = commentsSnap.data().count;
        } catch { /* Firestore belum dikonfigurasi atau offline, abaikan */ }
        return {
          ...game,
          thumbnailUrl: `games/${game.id}/${game.thumbnail || "thumbnail.png"}`,
          commentsCount
        };
      })
    );

    gamesReady = true;
    renderGames();
    
    // Initialize player tracking
    initPlayerOnlineTracking();
  } catch (e) {
    console.error("Load games error:", e);
    gamesReady = true;
    showGamesState("empty");
    
    // Still try to init player tracking even if games failed to load
    initPlayerOnlineTracking();
  }
}

// ────────────────────────────────────────────────────────────
//  PLAYER ONLINE TRACKING
// ────────────────────────────────────────────────────────────
let unsubscribePlayerTracking = null;
let gamePlayersMap = {}; // Store player counts per game

async function initPlayerOnlineTracking() {
  try {
    // Subscribe to active sessions collection
    const sessionsRef = collection(db, "active_sessions");
    
    unsubscribePlayerTracking = onSnapshot(sessionsRef, async (snapshot) => {
      // Filter active sessions (last seen < 30 seconds)
      const now = new Date();
      const activeSessions = snapshot.docs.filter(doc => {
        const data = doc.data();
        const lastSeen = new Date(data.lastSeen);
        const diffSeconds = (now - lastSeen) / 1000;
        return diffSeconds < 30;
      });
      
      // Group by game
      gamePlayersMap = {};
      activeSessions.forEach(session => {
        const gameId = session.data().gameId;
        if (!gamePlayersMap[gameId]) {
          gamePlayersMap[gameId] = 0;
        }
        gamePlayersMap[gameId]++;
      });
      
      // Update all game cards with player counts
      updateGameCardPlayerCounts();
    }, (error) => {
      console.error("Error tracking players online:", error);
    });
  } catch (e) {
    console.error("Init player tracking error:", e);
  }
}

function updateGameCardPlayerCounts() {
  // Update all visible game cards
  document.querySelectorAll('.game-card').forEach(card => {
    const gameId = card.dataset.id;
    const playersEl = card.querySelector('.game-players-online');
    const countEl = card.querySelector('.players-count');
    
    if (playersEl && countEl && gameId) {
      const count = gamePlayersMap[gameId] || 0;
      countEl.textContent = count;
      playersEl.setAttribute('data-count', count);
    }
  });
}

function renderGames() {
  const search = (searchInput?.value || "").toLowerCase();
  const filtered = allGames.filter(g => {
    const matchCat  = currentCat === "all" || g.category === currentCat;
    const matchSearch = !search || g.name.toLowerCase().includes(search) || g.description?.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    showGamesState("empty");
    return;
  }

  showGamesState("grid");
  gamesGrid.innerHTML = "";
  filtered.forEach(game => gamesGrid.appendChild(buildGameCard(game)));
  
  // Update player counts after rendering
  updateGameCardPlayerCounts();
}

function buildGameCard(game) {
  const template = document.getElementById("game-card-template");
  const card     = template.content.cloneNode(true).querySelector(".game-card");

  card.dataset.id  = game.id;
  card.dataset.cat = game.category || "";

  const img   = card.querySelector(".game-img");
  img.src     = game.thumbnailUrl || "";
  img.alt     = game.name;
  img.onerror = () => { img.style.display = "none"; };

  card.querySelector(".game-title").textContent = game.name;
  card.querySelector(".game-desc").textContent  = game.description || "";

  const catTag = card.querySelector(".game-cat-tag");
  catTag.textContent = catLabel(game.category);
  catTag.className   = `game-cat-tag cat-${game.category || ""}`;

  card.querySelector(".game-comments-count").textContent =
    `💬 ${game.commentsCount || 0}`;

  const badge = card.querySelector(".game-badge");
  if (game.badge) {
    badge.textContent = badgeLabel(game.badge);
    badge.className   = `game-badge badge-${game.badge}`;
  } else {
    badge.remove();
  }

  // Add features if available
  const featuresContainer = card.querySelector(".game-features");
  if (game.features && Array.isArray(game.features)) {
    // Show max 3 features
    const featuresToShow = game.features.slice(0, 3);
    featuresContainer.innerHTML = featuresToShow.map(f => 
      `<span class="feature-tag">${f}</span>`
    ).join("");
  } else {
    // Default features based on category
    const defaultFeatures = {
      'action': ['⚔️ Combat', '🎯 Skill-based', '🏆 Challenge'],
      'puzzle': ['🧩 Logic', '🧠 Brain Teaser', '⭐ Fun'],
      'educational': ['📚 Learn', '🎓 Educational', '✨ Interactive'],
      'adventure': ['🗺️ Explore', '🎮 Adventure', '🌟 Story'],
      'sport': ['⚽ Sports', '🏅 Competition', '🎯 Skill']
    };
    const defaults = defaultFeatures[game.category] || ['🎮 Fun', '⭐ Enjoy', '🏆 Play'];
    featuresContainer.innerHTML = defaults.map(f => 
      `<span class="feature-tag">${f}</span>`
    ).join("");
  }

  // Click → go to game page (login required)
  card.addEventListener("click", () => {
    if (!currentUser) {
      showLoginModal(`game.html?id=${game.id}`);
      return;
    }
    window.location.href = `game.html?id=${game.id}`;
  });

  card.querySelector(".btn-play").addEventListener("click", e => {
    e.stopPropagation();
    if (!currentUser) {
      showLoginModal(`game.html?id=${game.id}`);
      return;
    }
    window.location.href = `game.html?id=${game.id}`;
  });

  return card;
}

function showGamesState(state) {
  gamesLoading.classList.toggle("hidden", state !== "loading");
  gamesGrid.classList.toggle("hidden",    state !== "grid");
  gamesEmpty.classList.toggle("hidden",   state !== "empty");
  // Login prompt tidak lagi menyembunyikan daftar game
  loginPrompt?.classList.add("hidden");
}

// ────────────────────────────────────────────────────────────
//  FILTER & SEARCH
// ────────────────────────────────────────────────────────────
catBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    catBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
    renderGames();
  });
});

let searchTimer;
searchInput?.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderGames, 250);
});

// ────────────────────────────────────────────────────────────
//  LOGIN MODAL
// ────────────────────────────────────────────────────────────
const loginModal    = document.getElementById("login-modal");
const btnLoginModal = document.getElementById("btn-login-modal");
const btnCloseModal = document.getElementById("btn-close-modal");

btnLoginModal?.addEventListener("click", loginWithGoogle);
btnCloseModal?.addEventListener("click", () => loginModal?.classList.add("hidden"));
loginModal?.addEventListener("click", e => { if (e.target === loginModal) loginModal.classList.add("hidden"); });

function showLoginModal(gameUrl = null) {
  pendingGameUrl = gameUrl;
  loginModal?.classList.remove("hidden");
}

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────
function catLabel(cat) {
  const map = { puzzle:"Puzzle", action:"Aksi", educational:"Edukasi", adventure:"Petualangan", sport:"Olahraga" };
  return map[cat] || cat || "Umum";
}

function badgeLabel(badge) {
  const map = { new:"🆕 Baru", hot:"🔥 Populer", featured:"⭐ Unggulan" };
  return map[badge] || badge;
}
