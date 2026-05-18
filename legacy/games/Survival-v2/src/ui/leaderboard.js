// ========================================
// LEADERBOARD - Display and manage scores
// ========================================

import { getTopScores, getCurrentUser, isLoggedIn } from './auth.js';

/**
 * Display leaderboard in the high scores screen
 */
export async function displayLeaderboard() {
    const scoresList = document.getElementById('scoresList');
    if (!scoresList) return;

    scoresList.innerHTML = '<p class="loading">Loading leaderboard...</p>';

    try {
        const result = await getTopScores(50);
        
        if (!result.success) {
            scoresList.innerHTML = '<p class="error">Failed to load scores</p>';
            return;
        }

        if (result.scores.length === 0) {
            scoresList.innerHTML = '<p class="no-scores">Belum ada skor. Jadilah yang pertama! 🎮</p>';
            return;
        }

        const currentUser = getCurrentUser();
        let html = '<div class="leaderboard-table">';
        html += '<div class="leaderboard-header">';
        html += '<div class="lb-rank">#</div>';
        html += '<div class="lb-player">Player</div>';
        html += '<div class="lb-score">Score</div>';
        html += '<div class="lb-details">Wave / Level</div>';
        html += '<div class="lb-time">Time</div>';
        html += '</div>';

        result.scores.forEach((score, index) => {
            const isCurrentUser = currentUser && score.userId === currentUser.uid;
            const rank = index + 1;
            let rankIcon = '';
            
            if (rank === 1) rankIcon = '🥇';
            else if (rank === 2) rankIcon = '🥈';
            else if (rank === 3) rankIcon = '🥉';
            else rankIcon = rank;

            const survivalTime = formatTime(score.survivalTime || 0);
            const characterIcon = getCharacterIcon(score.character);

            html += `<div class="leaderboard-row ${isCurrentUser ? 'current-user' : ''}">`;
            html += `<div class="lb-rank">${rankIcon}</div>`;
            html += `<div class="lb-player">${characterIcon} ${escapeHtml(score.userName || 'Anonymous')}</div>`;
            html += `<div class="lb-score">${score.score.toLocaleString()}</div>`;
            html += `<div class="lb-details">Wave ${score.wave} / Lv.${score.level}</div>`;
            html += `<div class="lb-time">${survivalTime}</div>`;
            html += '</div>';
        });

        html += '</div>';
        scoresList.innerHTML = html;
    } catch (error) {
        console.error('Error displaying leaderboard:', error);
        scoresList.innerHTML = '<p class="error">Error loading leaderboard</p>';
    }
}

/**
 * Format time in MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get character icon
 */
function getCharacterIcon(character) {
    switch (character) {
        case 'warrior': return '⚔️';
        case 'mage': return '🔮';
        case 'ranger': return '🏹';
        case 'orc': return '👹';
        default: return '🎮';
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
