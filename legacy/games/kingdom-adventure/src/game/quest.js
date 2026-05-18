function updateQuests() {
    for (const [questKey, questState] of Object.entries(gameState.quests)) {
        if (questState.completed) continue;

        const questDef = QUEST_DATA[questKey];
        if (!questDef) continue;

        if (questState.progress >= questDef.target) {
            questState.completed = true;
            addXP(questDef.reward.xp);
            addGold(questDef.reward.gold);
            showNotification(`Quest Complete: ${questDef.title}!`);
        }
    }
}

function openQuestLog() {
    const questList = document.getElementById('questList');
    if (!questList) return;

    questList.innerHTML = '';

    const allQuests = [...Object.keys(QUEST_DATA)];
    if (allQuests.length === 0) {
        questList.innerHTML = '<p class="no-quests">Belum ada quest tersedia.</p>';
        return;
    }

    for (const questKey of allQuests) {
        const questDef = QUEST_DATA[questKey];
        const questState = gameState.quests[questKey] || { progress: 0, completed: false };

        const questEl = document.createElement('div');
        questEl.className = `quest-item ${questState.completed ? 'completed' : ''}`;
        
        questEl.innerHTML = `
            <h3>${questDef.title} ${questState.completed ? '✅' : ''}</h3>
            <p>${questDef.description}</p>
            <div class="quest-progress">
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${Math.min(100, (questState.progress / questDef.target) * 100)}%"></div>
                </div>
                <span>${questState.progress}/${questDef.target}</span>
            </div>
            <div class="quest-reward">
                <span>💰 ${questDef.reward.gold}</span>
                <span>⭐ ${questDef.reward.xp} XP</span>
            </div>
        `;

        questList.appendChild(questEl);
    }

    changeState(GameStates.QUEST);
}

function closeQuest() {
    changeState(GameStates.PLAYING);
}
