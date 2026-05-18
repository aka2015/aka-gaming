// ============================================================
//  player-tracker.js  —  Track online players with Firestore
// ============================================================
import { db } from "./firebase.js";
import {
  doc, setDoc, deleteDoc, onSnapshot, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Current session data
let sessionId = null;
let gameSessionRef = null;
let presenceInterval = null;
let currentUser = null;

/**
 * Initialize player presence tracking
 * Called when user is authenticated and game page is loaded
 */
export function initPlayerTracking(userId, gameId) {
  sessionId = `${userId}_${gameId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  currentUser = userId;
  
  const sessionData = {
    userId: userId,
    gameId: gameId,
    sessionId: sessionId,
    lastSeen: new Date().toISOString(),
    joinedAt: new Date().toISOString(),
    status: 'playing'
  };

  // Create session document
  gameSessionRef = doc(db, 'active_sessions', sessionId);
  
  setDoc(gameSessionRef, sessionData)
    .then(() => {
      console.log('✅ Player session created:', sessionId);
      
      // Update presence every 10 seconds
      presenceInterval = setInterval(() => {
        updatePresence();
      }, 10000);
      
      // Cleanup on page unload
      window.addEventListener('beforeunload', cleanupSession);
      window.addEventListener('pagehide', cleanupSession);
    })
    .catch(err => {
      console.error('❌ Failed to create player session:', err);
    });
}

/**
 * Update player presence timestamp
 */
function updatePresence() {
  if (gameSessionRef) {
    setDoc(gameSessionRef, {
      lastSeen: new Date().toISOString(),
      status: 'playing'
    }, { merge: true })
    .catch(err => {
      console.error('❌ Failed to update presence:', err);
    });
  }
}

/**
 * Remove session when user leaves
 */
function cleanupSession() {
  if (gameSessionRef) {
    deleteDoc(gameSessionRef)
      .then(() => {
        console.log('✅ Player session removed:', sessionId);
      })
      .catch(err => {
        console.error('❌ Failed to remove session:', err);
      });
  }
  
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
}

/**
 * Listen to active players count for a specific game
 * @param {string} gameId - The game ID to track
 * @param {function} callback - Callback function with player count
 * @returns {function} Unsubscribe function
 */
export function subscribeToPlayerCount(gameId, callback) {
  const sessionsRef = collection(db, 'active_sessions');
  const q = query(sessionsRef, where('gameId', '==', gameId));
  
  return onSnapshot(q, (snapshot) => {
    // Filter out stale sessions (lastSeen > 30 seconds ago)
    const now = new Date();
    const activePlayers = snapshot.docs.filter(doc => {
      const data = doc.data();
      const lastSeen = new Date(data.lastSeen);
      const diffSeconds = (now - lastSeen) / 1000;
      return diffSeconds < 30; // Consider active if seen in last 30 seconds
    });
    
    callback(activePlayers.length);
  }, (error) => {
    console.error('❌ Error subscribing to player count:', error);
    callback(0);
  });
}

/**
 * Get current player count (one-time read)
 * @param {string} gameId - The game ID
 * @returns {Promise<number>}
 */
export async function getPlayerCount(gameId) {
  try {
    const sessionsRef = collection(db, 'active_sessions');
    const q = query(sessionsRef, where('gameId', '==', gameId));
    const snapshot = await getDocs(q);
    
    const now = new Date();
    const activePlayers = snapshot.docs.filter(doc => {
      const data = doc.data();
      const lastSeen = new Date(data.lastSeen);
      const diffSeconds = (now - lastSeen) / 1000;
      return diffSeconds < 30;
    });
    
    return activePlayers.length;
  } catch (error) {
    console.error('❌ Error getting player count:', error);
    return 0;
  }
}

/**
 * Cleanup all stale sessions (run periodically or on admin page)
 * Removes sessions older than 60 seconds
 */
export async function cleanupStaleSessions() {
  try {
    const sessionsRef = collection(db, 'active_sessions');
    const snapshot = await getDocs(sessionsRef);
    
    const now = new Date();
    const staleSessions = snapshot.docs.filter(doc => {
      const data = doc.data();
      const lastSeen = new Date(data.lastSeen);
      const diffSeconds = (now - lastSeen) / 1000;
      return diffSeconds > 60; // Remove if last seen > 60 seconds ago
    });
    
    console.log(`🧹 Found ${staleSessions.length} stale sessions to clean`);
    
    // Delete stale sessions
    for (const session of staleSessions) {
      await deleteDoc(doc(db, 'active_sessions', session.id));
    }
    
    console.log(`✅ Cleaned ${staleSessions.length} stale sessions`);
    return staleSessions.length;
  } catch (error) {
    console.error('❌ Error cleaning stale sessions:', error);
    return 0;
  }
}
