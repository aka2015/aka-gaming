function openDialog(speaker, text) {
    const dialogBox = document.getElementById('dialogBox');
    const speakerEl = document.getElementById('dialogSpeaker');
    const textEl = document.getElementById('dialogText');

    if (dialogBox) dialogBox.classList.remove('hidden');
    if (speakerEl) speakerEl.textContent = speaker;
    if (textEl) textEl.textContent = text;
}

function updateDialogText(text) {
    const textEl = document.getElementById('dialogText');
    if (textEl) textEl.textContent = text;
}

function closeDialog() {
    const dialogBox = document.getElementById('dialogBox');
    if (dialogBox) dialogBox.classList.add('hidden');
    gameState.npcDialog = null;
}

function showDialogChoice(choices) {
    const choicesEl = document.getElementById('dialogChoices');
    if (!choicesEl) return;

    choicesEl.innerHTML = '';
    choicesEl.classList.remove('hidden');

    for (const choice of choices) {
        const btn = document.createElement('button');
        btn.className = 'dialog-choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            choice.action();
            choicesEl.classList.add('hidden');
        });
        choicesEl.appendChild(btn);
    }
}
