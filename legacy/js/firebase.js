// ============================================================
//  Firebase Initialization (shared module)
//  Import this in every page JS file
// ============================================================
import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, getRedirectResult }           from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }                         from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage }                           from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import firebaseConfig                           from "../firebase-config.js";

const app     = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Konsumsi redirect result jika ada (mencegah redirect loop)
getRedirectResult(auth).catch(() => {});

export default app;
