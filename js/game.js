// ============================================================
//  game.js  —  Game player + comments page
// ============================================================
import { auth, db }   from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc,
  collection, addDoc, getDocs, deleteDoc,
  query, orderBy, limit, startAfter, serverTimestamp, where, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ────────────────────────────────────────────────────────────
//  PARAMS
// ────────────────────────────────────────────────────────────
const params = new URLSearchParams(location.search);
const gameId = params.get("id");

if (!gameId) {
  window.location.href = "index.html";
}

// ────────────────────────────────────────────────────────────
//  ELEMENTS
// ────────────────────────────────────────────────────────────
const btnLogout         = document.getElementById("btn-logout");
const userMenu          = document.getElementById("user-menu");
const userAvatar        = document.getElementById("user-avatar");
const userName          = document.getElementById("user-name");
const gameTitleDisplay  = document.getElementById("game-title-display");
const gameCatDisplay    = document.getElementById("game-cat-display");
const gameIframe        = document.getElementById("game-iframe");
const gameLoading       = document.getElementById("game-loading");
const gameError         = document.getElementById("game-error");
const gameLoginOverlay  = document.getElementById("game-login-overlay");
const btnLoginOverlay   = document.getElementById("btn-login-overlay");
const btnFullscreen     = document.getElementById("btn-fullscreen");
const commentInput      = document.getElementById("comment-input");
const commentAvatar     = document.getElementById("comment-avatar");
const commentCharCount  = document.getElementById("comment-char-count");
const btnSubmitComment  = document.getElementById("btn-submit-comment");
const commentFormArea   = document.getElementById("comment-form-area");
const commentLoginPrompt= document.getElementById("comment-login-prompt");
const btnLoginComment   = document.getElementById("btn-login-comment");
const commentsLoading   = document.getElementById("comments-loading");
const commentsList      = document.getElementById("comments-list");
const commentsEmpty     = document.getElementById("comments-empty");
const loadMoreArea      = document.getElementById("load-more-area");
const btnLoadMore       = document.getElementById("btn-load-more");

// ────────────────────────────────────────────────────────────
//  AUTH
// ────────────────────────────────────────────────────────────
const provider = new GoogleAuthProvider();
let currentUser = null;

async function loginWithGoogle() {
  try { await signInWithPopup(auth, provider); }
  catch(e) { console.error("Login error:", e); }
}

[btnLoginOverlay, btnLoginComment].forEach(btn => {
  if (btn) btn.addEventListener("click", loginWithGoogle);
});

if (btnLogout) btnLogout.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  currentUser = user;
  updateAuthUI(user);
  if (user) {
    // Show game
    if (gameLoginOverlay) gameLoginOverlay.classList.add("hidden");
  } else {
    // Show login overlay over game
    if (gameLoginOverlay) gameLoginOverlay.classList.remove("hidden");
  }
});

function updateAuthUI(user) {
  if (user) {
    if (userMenu)   userMenu.classList.remove("hidden");
    if (userAvatar) userAvatar.src = user.photoURL || "";
    if (userName)   userName.textContent = user.displayName?.split(" ")[0] || "";
    if (commentAvatar) commentAvatar.src = user.photoURL || "";
    if (commentFormArea)    commentFormArea.classList.remove("hidden");
    if (commentLoginPrompt) commentLoginPrompt.classList.add("hidden");
  } else {
    if (userMenu)           userMenu.classList.add("hidden");
    if (commentFormArea)    commentFormArea.classList.add("hidden");
    if (commentLoginPrompt) commentLoginPrompt.classList.remove("hidden");
  }
}

// ────────────────────────────────────────────────────────────
//  LOAD GAME DATA
// ────────────────────────────────────────────────────────────
async function loadGame() {
  try {
    const snap = await getDoc(doc(db, "games", gameId));
    if (!snap.exists()) {
      showGameError();
      return;
    }
    const game = snap.data();
    document.title = `${game.name} - AKA GAMING`;
    if (gameTitleDisplay) gameTitleDisplay.textContent = game.name;

    if (gameCatDisplay) {
      gameCatDisplay.textContent = catLabel(game.category);
      gameCatDisplay.className   = `game-cat-tag cat-${game.category || ""}`;
    }

    // Load iframe
    if (game.gameUrl) {
      loadGameIframe(game.gameUrl);
    } else {
      showGameError();
    }
  } catch(e) {
    console.error("Load game error:", e);
    showGameError();
  }
}

function loadGameIframe(url) {
  gameIframe.onload = () => {
    if (gameLoading) gameLoading.classList.add("hidden");
    gameIframe.classList.remove("hidden");
  };
  gameIframe.onerror = showGameError;
  gameIframe.src = url;
}

function showGameError() {
  if (gameLoading) gameLoading.classList.add("hidden");
  if (gameError)   gameError.classList.remove("hidden");
}

// ────────────────────────────────────────────────────────────
//  FULLSCREEN
// ────────────────────────────────────────────────────────────
if (btnFullscreen) {
  btnFullscreen.addEventListener("click", () => {
    const wrapper = document.getElementById("game-frame-wrapper");
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.() || wrapper.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
}

// ────────────────────────────────────────────────────────────
//  COMMENTS
// ────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
let lastCommentDoc = null;
let loadingComments = false;
let allLoaded = false;

// Character counter
commentInput?.addEventListener("input", () => {
  const len = commentInput.value.length;
  if (commentCharCount) commentCharCount.textContent = `${len}/300`;
  commentCharCount.style.color = len > 280 ? "var(--danger)" : "";
});

// Submit
btnSubmitComment?.addEventListener("click", submitComment);
commentInput?.addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitComment();
});

async function submitComment() {
  if (!currentUser) return;
  const text = (commentInput?.value || "").trim();
  if (!text) return;
  if (text.length > 300) return;

  btnSubmitComment.disabled = true;
  btnSubmitComment.textContent = "Mengirim...";

  try {
    const newComment = {
      gameId,
      userId:     currentUser.uid,
      userName:   currentUser.displayName || "Anonim",
      userAvatar: currentUser.photoURL || "",
      text,
      createdAt: serverTimestamp()
    };

    const ref = await addDoc(collection(db, "comments"), newComment);

    // Prepend to UI
    const fakeDoc = { id: ref.id, data: () => ({ ...newComment, createdAt: { toDate: () => new Date() } }) };
    prependComment(fakeDoc);

    commentInput.value = "";
    if (commentCharCount) commentCharCount.textContent = "0/300";
    commentsEmpty?.classList.add("hidden");

  } catch(e) {
    console.error("Submit comment error:", e);
    alert("Gagal mengirim komentar. Coba lagi.");
  } finally {
    btnSubmitComment.disabled = false;
    btnSubmitComment.innerHTML = "Kirim 💬";
  }
}

async function loadComments(append = false) {
  if (loadingComments || allLoaded) return;
  loadingComments = true;

  if (!append) {
    commentsLoading?.classList.remove("hidden");
    commentsList?.classList.add("hidden");
    commentsEmpty?.classList.add("hidden");
  }

  try {
    let q = query(
      collection(db, "comments"),
      where("gameId", "==", gameId),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    if (append && lastCommentDoc) {
      q = query(
        collection(db, "comments"),
        where("gameId", "==", gameId),
        orderBy("createdAt", "desc"),
        startAfter(lastCommentDoc),
        limit(PAGE_SIZE)
      );
    }

    const snap = await getDocs(q);

    if (!append) {
      commentsList.innerHTML = "";
    }

    if (snap.empty && !append) {
      commentsEmpty?.classList.remove("hidden");
      loadMoreArea?.classList.add("hidden");
    } else {
      commentsEmpty?.classList.add("hidden");
      snap.docs.forEach(d => commentsList.appendChild(buildCommentEl(d)));
      lastCommentDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < PAGE_SIZE) {
        allLoaded = true;
        loadMoreArea?.classList.add("hidden");
      } else {
        loadMoreArea?.classList.remove("hidden");
      }
    }

    commentsLoading?.classList.add("hidden");
    commentsList?.classList.remove("hidden");

  } catch(e) {
    console.error("Load comments error:", e);
    commentsLoading?.classList.add("hidden");
  } finally {
    loadingComments = false;
  }
}

function prependComment(docSnap) {
  const el = buildCommentEl(docSnap);
  commentsList?.insertBefore(el, commentsList.firstChild);
  commentsList?.classList.remove("hidden");
}

function buildCommentEl(docSnap) {
  const template = document.getElementById("comment-template");
  const el       = template.content.cloneNode(true).querySelector(".comment-item");
  const data     = docSnap.data();

  const avatar = el.querySelector(".comment-avatar");
  avatar.src     = data.userAvatar || "";
  avatar.alt     = data.userName;
  avatar.onerror = () => { avatar.src = ""; avatar.style.background = "#EDE9FE"; };

  el.querySelector(".comment-author").textContent = data.userName || "Anonim";
  el.querySelector(".comment-time").textContent   = formatTime(data.createdAt);
  el.querySelector(".comment-text").textContent   = data.text;

  return el;
}

btnLoadMore?.addEventListener("click", () => loadComments(true));

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────
function formatTime(ts) {
  if (!ts) return "Baru saja";
  const date = ts.toDate ? ts.toDate() : new Date();
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
  if (diff < 86400)return `${Math.floor(diff/3600)} jam lalu`;
  return date.toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
}

function catLabel(cat) {
  const map = { puzzle:"Puzzle", action:"Aksi", educational:"Edukasi", adventure:"Petualangan", sport:"Olahraga" };
  return map[cat] || cat || "Umum";
}

// ────────────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────────────
loadGame();
loadComments();
