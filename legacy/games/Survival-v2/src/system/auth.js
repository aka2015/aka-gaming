// ========================================
// FIREBASE AUTHENTICATION - User Login/Register
// ========================================

import { auth, db } from '../../../js/firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Current user state
let currentUser = null;
let currentUserData = null;

/**
 * Initialize auth state listener
 */
export function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserData(user.uid);
            console.log('✅ User logged in:', user.displayName || user.email);
        } else {
            currentUser = null;
            currentUserData = null;
            console.log('❌ User logged out');
        }
        updateAuthUI();
    });
}

/**
 * Load user data from Firestore
 */
async function loadUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            currentUserData = userDoc.data();
        } else {
            // Create new user document
            currentUserData = {
                displayName: currentUser.displayName || currentUser.email,
                email: currentUser.email,
                createdAt: new Date().toISOString(),
                totalGames: 0,
                highScore: 0,
                totalPlayTime: 0
            };
            await setDoc(doc(db, 'users', uid), currentUserData);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

/**
 * Register new user
 */
export async function registerUser(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        await updateProfile(user, { displayName });
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            displayName: displayName,
            email: email,
            createdAt: new Date().toISOString(),
            totalGames: 0,
            highScore: 0,
            totalPlayTime: 0
        });
        
        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
}

/**
 * Logout user
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Save game score to Firestore
 */
export async function saveGameScore(score, wave, level, survivalTime, character, enemiesKilled) {
    if (!currentUser) {
        console.error('No user logged in');
        return { success: false, error: 'Not logged in' };
    }

    try {
        const scoreData = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            score: score,
            wave: wave,
            level: level,
            survivalTime: survivalTime,
            character: character,
            enemiesKilled: enemiesKilled,
            timestamp: new Date().toISOString()
        };

        // Save to scores collection
        const scoresRef = collection(db, 'scores');
        const docRef = doc(scoresRef);
        await setDoc(docRef, scoreData);

        // Update user stats
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const newHighScore = score > (userData.highScore || 0);
            
            await updateDoc(userRef, {
                totalGames: (userData.totalGames || 0) + 1,
                highScore: newHighScore ? score : userData.highScore || 0,
                totalPlayTime: (userData.totalPlayTime || 0) + survivalTime,
                lastPlayed: new Date().toISOString()
            });
        }

        console.log('✅ Score saved:', scoreData);
        return { success: true, scoreId: docRef.id };
    } catch (error) {
        console.error('Error saving score:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get top scores from Firestore
 */
export async function getTopScores(gameLimit = 20) {
    try {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'), limit(gameLimit));
        const querySnapshot = await getDocs(q);
        
        const scores = [];
        querySnapshot.forEach((doc) => {
            scores.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, scores };
    } catch (error) {
        console.error('Error getting scores:', error);
        return { success: false, scores: [], error: error.message };
    }
}

/**
 * Get user's personal high score
 */
export async function getUserHighScore(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, highScore: userDoc.data().highScore || 0 };
        }
        return { success: true, highScore: 0 };
    } catch (error) {
        console.error('Error getting user high score:', error);
        return { success: false, highScore: 0, error: error.message };
    }
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Get current user data
 */
export function getCurrentUserData() {
    return currentUserData;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Update auth UI based on login state
 */
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userInfo) {
            userInfo.textContent = `👤 ${currentUser.displayName || currentUser.email}`;
            userInfo.style.display = 'block';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

/**
 * Get user-friendly error message
 */
function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Email sudah digunakan';
        case 'auth/invalid-email':
            return 'Email tidak valid';
        case 'auth/weak-password':
            return 'Password minimal 6 karakter';
        case 'auth/user-not-found':
            return 'User tidak ditemukan';
        case 'auth/wrong-password':
            return 'Password salah';
        case 'auth/too-many-requests':
            return 'Terlalu banyak percobaan, coba lagi nanti';
        default:
            return 'Terjadi kesalahan, coba lagi';
    }
}
