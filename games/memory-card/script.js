const EMOJI_SETS = [
  { emoji: "\u{1F431}", name: "Kucing" },
  { emoji: "\u{1F436}", name: "Anjing" },
  { emoji: "\u{1F430}", name: "Kelinci" },
  { emoji: "\u{1F43B}", name: "Beruang" },
  { emoji: "\u{1F438}", name: "Katak" },
  { emoji: "\u{1F981}", name: "Singa" },
  { emoji: "\u{1F418}", name: "Gajah" },
  { emoji: "\u{1F42F}", name: "Harimau" },
  { emoji: "\u{1F427}", name: "Penguin" },
  { emoji: "\u{1F984}", name: "Unicorn" },
  { emoji: "\u{1F43C}", name: "Panda" },
  { emoji: "\u{1F98B}", name: "Kupu-kupu" }
];

const DIFFICULTY = {
  easy: { pairs: 6, gridClass: "grid-6" },
  medium: { pairs: 8, gridClass: "grid-8" },
  hard: { pairs: 12, gridClass: "grid-12" }
};

const STAR_THRESHOLDS = {
  6: { 3: 3, 4: 2, 5: 1 },
  8: { 4: 3, 6: 2, 8: 1 },
  12: { 6: 3, 10: 2, 14: 1 }
};

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playFlipSound() {
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.setValueAtTime(500, now + 0.05);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.start(now);
  osc.stop(now + 0.1);
}

function playMatchSound() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0.2, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.15);
  });
}

function playMismatchSound() {
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'triangle';
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.setValueAtTime(250, now + 0.1);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  osc.start(now);
  osc.stop(now + 0.2);
}

function playWinSound() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(0.18, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.15);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.15);
  });
}

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const quitBtn = document.getElementById("quit-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const matchCountEl = document.getElementById("match-count");
const moveCountEl = document.getElementById("move-count");
const timerCountEl = document.getElementById("timer-count");
const gameBoardEl = document.getElementById("game-board");
const resultTitleEl = document.getElementById("result-title");
const resultSummaryEl = document.getElementById("result-summary");
const finalStarsEl = document.getElementById("final-stars");
const finalMovesEl = document.getElementById("final-moves");
const finalTimeEl = document.getElementById("final-time");
const finalScoreEl = document.getElementById("final-score");
const diffBtns = document.querySelectorAll(".diff-btn");

let currentDifficulty = "easy";
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let isLocked = false;
let timerInterval = null;
let seconds = 0;
let gameStarted = false;

function shuffle(items) {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function formatTime(s) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function switchScreen(target) {
  [startScreen, gameScreen, resultScreen].forEach((screen) => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });
  target.classList.remove("hidden");
  target.classList.add("active");
}

function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds += 1;
    timerCountEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateHud() {
  matchCountEl.textContent = `${matchedPairs} / ${totalPairs}`;
  moveCountEl.textContent = String(moves);
}

function createCardElement(emoji, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.emoji = emoji;
  card.dataset.index = String(index);
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">${emoji}</div>
      <div class="card-back"></div>
    </div>
  `;
  card.addEventListener("click", () => flipCard(card));
  return card;
}

function flipCard(card) {
  if (isLocked) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  if (flippedCards.length >= 2) return;

  playFlipSound();
  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves += 1;
    updateHud();
    startTimer();
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flippedCards;
  if (a.dataset.emoji === b.dataset.emoji) {
    a.classList.add("matched");
    b.classList.add("matched");
    playMatchSound();
    matchedPairs += 1;
    updateHud();
    flippedCards = [];

    if (matchedPairs === totalPairs) {
      setTimeout(endGame, 500);
    }
  } else {
    isLocked = true;
    playMismatchSound();
    setTimeout(() => {
      a.classList.add("shake");
      b.classList.add("shake");
      setTimeout(() => {
        a.classList.remove("flipped", "shake");
        b.classList.remove("flipped", "shake");
        flippedCards = [];
        isLocked = false;
      }, 400);
    }, 400);
  }
}

function calculateStars() {
  const thresholds = STAR_THRESHOLDS[totalPairs];
  if (!thresholds) return 1;
  if (moves <= thresholds[3]) return 3;
  if (moves <= thresholds[2]) return 2;
  if (moves <= thresholds[1]) return 1;
  return 1;
}

function calculateScore() {
  const base = totalPairs * 100;
  const starBonus = calculateStars() * 50;
  const timeBonus = Math.max(0, 300 - seconds * 2);
  const movePenalty = moves * 5;
  return Math.max(100, base + starBonus + timeBonus - movePenalty);
}

function endGame() {
  stopTimer();
  const stars = calculateStars();
  const score = calculateScore();

  playWinSound();

  window.AkaScoreReporter?.report("memory-card", score, {
    stars,
    moves,
    time: seconds,
    difficulty: currentDifficulty
  });

  if (stars === 3) {
    resultTitleEl.textContent = "Sempurna!";
    resultSummaryEl.textContent = "Kamu mencocokkan semua pasangan dengan sangat efisien!";
  } else if (stars === 2) {
    resultTitleEl.textContent = "Hebat!";
    resultSummaryEl.textContent = "Hasil yang bagus! Coba lagi untuk mendapatkan 3 bintang.";
  } else {
    resultTitleEl.textContent = "Bagus!";
    resultSummaryEl.textContent = "Semua pasangan berhasil ditemukan. Terus latihan!";
  }

  finalStarsEl.textContent = String(stars).padStart(1, "\u2B50").padEnd(stars, "\u2B50") || "0";
  finalStarsEl.textContent = stars > 0 ? "\u2B50".repeat(stars) : "0";
  finalMovesEl.textContent = String(moves);
  finalTimeEl.textContent = formatTime(seconds);
  finalScoreEl.textContent = String(score);

  switchScreen(resultScreen);
}

function setupBoard() {
  const config = DIFFICULTY[currentDifficulty];
  totalPairs = config.pairs;
  matchedPairs = 0;
  moves = 0;
  seconds = 0;
  gameStarted = false;
  flippedCards = [];
  isLocked = false;
  stopTimer();

  const selected = shuffle(EMOJI_SETS).slice(0, totalPairs);
  const pairs = selected.flatMap((item) => [item.emoji, item.emoji]);
  cards = shuffle(pairs);

  gameBoardEl.className = `game-board ${config.gridClass}`;
  gameBoardEl.innerHTML = "";
  cards.forEach((emoji, index) => {
    gameBoardEl.appendChild(createCardElement(emoji, index));
  });

  updateHud();
  timerCountEl.textContent = "0:00";
}

function startGame() {
  setupBoard();
  switchScreen(gameScreen);
}

diffBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    diffBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.diff;
  });
});

startBtn.addEventListener("click", startGame);
quitBtn.addEventListener("click", () => {
  stopTimer();
  switchScreen(startScreen);
});
playAgainBtn.addEventListener("click", startGame);
