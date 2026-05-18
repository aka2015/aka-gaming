const STORAGE_KEY = "aka_listen_choose_best_score";
const LEVEL_STORAGE_KEY = "aka_listen_choose_levels";

// Level configurations
const LEVELS = {
  1: {
    name: "Beginner",
    emoji: "🌱",
    questionCount: 5,
    choicesCount: 3,
    speechRate: 0.7,
    categories: ["Animals", "Fruits"],
    pointsPerCorrect: 10,
    listenRequired: 1
  },
  2: {
    name: "Elementary",
    emoji: "🌿",
    questionCount: 8,
    choicesCount: 4,
    speechRate: 0.82,
    categories: ["Animals", "Fruits", "Colors"],
    pointsPerCorrect: 15,
    listenRequired: 1
  },
  3: {
    name: "Intermediate",
    emoji: "🌳",
    questionCount: 10,
    choicesCount: 4,
    speechRate: 0.9,
    categories: ["Animals", "Fruits", "School Objects", "Colors"],
    pointsPerCorrect: 20,
    listenRequired: 1
  },
  4: {
    name: "Advanced",
    emoji: "⭐",
    questionCount: 12,
    choicesCount: 5,
    speechRate: 1.0,
    categories: ["Animals", "Fruits", "School Objects", "Colors", "Body Parts"],
    pointsPerCorrect: 25,
    listenRequired: 1,
    timeLimit: 15
  },
  5: {
    name: "Expert",
    emoji: "🏆",
    questionCount: 15,
    choicesCount: 5,
    speechRate: 1.1,
    categories: ["Animals", "Fruits", "School Objects", "Colors", "Body Parts", "Clothes"],
    pointsPerCorrect: 30,
    listenRequired: 2,
    timeLimit: 12
  }
};

// Audio feedback system
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playCorrectSound() {
  initAudio();
  if (!audioCtx) return;

  // Play a pleasant ascending tone (success sound)
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.type = 'sine';
  
  // Ascending melody: C5 → E5 → G5
  const now = audioCtx.currentTime;
  oscillator.frequency.setValueAtTime(523.25, now); // C5
  oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
  oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
  
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  oscillator.start(now);
  oscillator.stop(now + 0.4);
}

function playWrongSound() {
  initAudio();
  if (!audioCtx) return;

  // Play a descending tone (error sound)
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.type = 'sawtooth';
  
  // Descending tone: G3 → E3
  const now = audioCtx.currentTime;
  oscillator.frequency.setValueAtTime(196.00, now); // G3
  oscillator.frequency.setValueAtTime(164.81, now + 0.15); // E3
  
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

const WORD_BANK = [
  // Animals
  { word: "cat", emoji: "🐱", topic: "Animals" },
  { word: "dog", emoji: "🐶", topic: "Animals" },
  { word: "bird", emoji: "🐦", topic: "Animals" },
  { word: "fish", emoji: "🐟", topic: "Animals" },
  { word: "rabbit", emoji: "🐰", topic: "Animals" },
  { word: "turtle", emoji: "🐢", topic: "Animals" },
  { word: "lion", emoji: "🦁", topic: "Animals" },
  { word: "monkey", emoji: "🐵", topic: "Animals" },
  
  // Fruits
  { word: "apple", emoji: "🍎", topic: "Fruits" },
  { word: "banana", emoji: "🍌", topic: "Fruits" },
  { word: "orange", emoji: "🍊", topic: "Fruits" },
  { word: "grape", emoji: "🍇", topic: "Fruits" },
  { word: "strawberry", emoji: "🍓", topic: "Fruits" },
  { word: "watermelon", emoji: "🍉", topic: "Fruits" },
  
  // School Objects
  { word: "book", emoji: "📘", topic: "School Objects" },
  { word: "pencil", emoji: "✏️", topic: "School Objects" },
  { word: "bag", emoji: "🎒", topic: "School Objects" },
  { word: "chair", emoji: "🪑", topic: "School Objects" },
  { word: "ruler", emoji: "📏", topic: "School Objects" },
  { word: "eraser", emoji: "🧼", topic: "School Objects" },
  
  // Colors
  { word: "red", emoji: "🟥", topic: "Colors" },
  { word: "blue", emoji: "🟦", topic: "Colors" },
  { word: "green", emoji: "🟩", topic: "Colors" },
  { word: "yellow", emoji: "🟨", topic: "Colors" },
  { word: "purple", emoji: "🟪", topic: "Colors" },
  { word: "orange", emoji: "🟧", topic: "Colors" },
  
  // Body Parts
  { word: "head", emoji: "🗣️", topic: "Body Parts" },
  { word: "hand", emoji: "✋", topic: "Body Parts" },
  { word: "eye", emoji: "👁️", topic: "Body Parts" },
  { word: "ear", emoji: "👂", topic: "Body Parts" },
  { word: "mouth", emoji: "👄", topic: "Body Parts" },
  { word: "nose", emoji: "👃", topic: "Body Parts" },
  
  // Clothes
  { word: "shirt", emoji: "👕", topic: "Clothes" },
  { word: "shoes", emoji: "👟", topic: "Clothes" },
  { word: "hat", emoji: "🎩", topic: "Clothes" },
  { word: "dress", emoji: "👗", topic: "Clothes" },
  { word: "pants", emoji: "👖", topic: "Clothes" },
  { word: "socks", emoji: "🧦", topic: "Clothes" }
];

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const listenBtn = document.getElementById("listen-btn");
const nextBtn = document.getElementById("next-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const questionCountEl = document.getElementById("question-count");
const scoreCountEl = document.getElementById("score-count");
const starCountEl = document.getElementById("star-count");
const streakCountEl = document.getElementById("streak-count");
const comboLabelEl = document.getElementById("combo-label");
const reviewBannerEl = document.getElementById("review-banner");
const progressBarEl = document.getElementById("progress-bar");
const topicLabelEl = document.getElementById("topic-label");
const heardWordEl = document.getElementById("heard-word");
const choicesEl = document.getElementById("choices");
const feedbackBoxEl = document.getElementById("feedback-box");
const resultTitleEl = document.getElementById("result-title");
const resultSummaryEl = document.getElementById("result-summary");
const finalScoreEl = document.getElementById("final-score");
const finalStarsEl = document.getElementById("final-stars");
const correctCountEl = document.getElementById("correct-count");
const bestScoreEl = document.getElementById("best-score");
const reviewSummaryCardEl = document.getElementById("review-summary-card");
const reviewFixedCountEl = document.getElementById("review-fixed-count");
const reviewRewardBannerEl = document.getElementById("review-reward-banner");
const badgeListEl = document.getElementById("badge-list");
const reviewListEl = document.getElementById("review-list");
const levelSelectBtn = document.getElementById("level-select-btn");
const levelSelectionEl = document.getElementById("level-selection");
const levelButtons = document.querySelectorAll(".level-btn");
const currentLevelEl = document.getElementById("current-level");
const timerEl = document.getElementById("timer");

let questions = [];
let activeQuestions = [];
let failedQuestions = [];
let currentIndex = 0;
let score = 0;
let stars = 0;
let streak = 0;
let correctAnswers = 0;
let answerLocked = false;
let listenedOnce = false;
let listenedCount = 0;
let isReviewMode = false;
let reviewRoundTotal = 0;
let reviewRoundFixed = 0;
let earnedReviewReward = false;
let reviewItems = [];
let currentLevel = 2; // Default level
let unlockedLevels = [1, 2]; // Start with levels 1 and 2 unlocked
let topicProgress = new Map();
let earnedBadges = new Map();
let timerInterval = null;
let timeRemaining = 0;

const BADGE_RULES = {
  Animals: { label: "Animal Listener", target: 2 },
  Fruits: { label: "Fruit Listener", target: 2 },
  "School Objects": { label: "Classroom Listener", target: 2 },
  Colors: { label: "Color Listener", target: 2 },
  "Body Parts": { label: "Body Expert", target: 2 },
  Clothes: { label: "Fashion Master", target: 2 }
};

function shuffle(items) {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function buildQuestion(entry, levelConfig) {
  const choicesCount = levelConfig.choicesCount || 4;
  const distractors = shuffle(WORD_BANK.filter((item) => item.word !== entry.word)).slice(0, choicesCount - 1);
  return {
    ...entry,
    choices: shuffle([entry, ...distractors])
  };
}

function getFilteredWordBank(levelConfig) {
  return WORD_BANK.filter(item => levelConfig.categories.includes(item.topic));
}

function pickQuestions(levelConfig) {
  const filteredBank = getFilteredWordBank(levelConfig);
  const questionCount = Math.min(levelConfig.questionCount, filteredBank.length);
  return shuffle(filteredBank).slice(0, questionCount).map(entry => buildQuestion(entry, levelConfig));
}

function switchScreen(target) {
  [startScreen, gameScreen, resultScreen].forEach((screen) => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  target.classList.remove("hidden");
  target.classList.add("active");
}

function loadUnlockedLevels() {
  try {
    const saved = localStorage.getItem(LEVEL_STORAGE_KEY);
    if (saved) {
      unlockedLevels = JSON.parse(saved);
    }
  } catch (e) {
    // Ignore errors, use default
  }
}

function saveUnlockedLevels() {
  try {
    localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(unlockedLevels));
  } catch (e) {
    // Ignore errors
  }
}

function unlockLevel(level) {
  if (!unlockedLevels.includes(level)) {
    unlockedLevels.push(level);
    saveUnlockedLevels();
    return true;
  }
  return false;
}

function loadBestScore() {
  return Number(localStorage.getItem(STORAGE_KEY) || 0);
}

function saveBestScore(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

function updateHud() {
  const levelConfig = LEVELS[currentLevel];
  const totalQuestions = activeQuestions.length || levelConfig.questionCount;
  questionCountEl.textContent = `${currentIndex + 1} / ${totalQuestions}`;
  scoreCountEl.textContent = String(score);
  starCountEl.textContent = String(stars);
  streakCountEl.textContent = String(streak);
  comboLabelEl.textContent = streak >= 5 ? "Super Combo" : streak >= 3 ? "Combo Aktif" : "Belum ada";
  progressBarEl.style.width = `${((currentIndex + 1) / totalQuestions) * 100}%`;
  if (currentLevelEl) {
    currentLevelEl.textContent = `${levelConfig.emoji} Level ${currentLevel}: ${levelConfig.name}`;
  }
  
  // Update timer if applicable
  if (levelConfig.timeLimit) {
    if (timerEl) {
      timerEl.parentElement.classList.remove("hidden");
      timerEl.textContent = `${timeRemaining}s`;
      if (timeRemaining <= 5) {
        timerEl.style.color = "#e74c3c";
      } else {
        timerEl.style.color = "#17324a";
      }
    }
  } else {
    if (timerEl) {
      timerEl.parentElement.classList.add("hidden");
    }
  }
}

function updateTopicProgress(topic, isCorrect) {
  if (!isCorrect) return null;
  const nextValue = (topicProgress.get(topic) || 0) + 1;
  topicProgress.set(topic, nextValue);

  const badgeRule = BADGE_RULES[topic];
  if (!badgeRule || earnedBadges.has(topic) || nextValue < badgeRule.target) {
    return null;
  }

  earnedBadges.set(topic, badgeRule.label);
  return badgeRule.label;
}

function renderBadges() {
  badgeListEl.innerHTML = "";
  if (earnedBadges.size === 0) {
    badgeListEl.innerHTML = '<article class="badge-item"><strong>Belum ada badge</strong><span>Dapatkan 2 jawaban benar pada topik yang sama.</span></article>';
    return;
  }

  [...earnedBadges.entries()].forEach(([topic, label]) => {
    const card = document.createElement("article");
    card.className = "badge-item";
    card.innerHTML = `<strong>${label}</strong><span>${topic}</span>`;
    badgeListEl.appendChild(card);
  });
}

function speakCurrentWord() {
  const question = activeQuestions[currentIndex];
  if (!question) {
    return;
  }

  const levelConfig = LEVELS[currentLevel];
  listenedCount += 1;
  
  if (listenedCount >= levelConfig.listenRequired) {
    heardWordEl.textContent = `Kata: "${question.word}"`;
  } else {
    heardWordEl.textContent = `Kata diputar (${listenedCount}/${levelConfig.listenRequired}). Dengarkan baik-baik.`;
  }
  listenedOnce = true;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.word);
    utterance.lang = "en-US";
    utterance.rate = levelConfig.speechRate;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    return;
  }

  heardWordEl.textContent = `Browser tidak mendukung audio. Kata target: ${question.word}`;
}

function renderQuestion() {
  const question = activeQuestions[currentIndex];
  answerLocked = false;
  listenedOnce = false;
  listenedCount = 0;
  updateHud();
  topicLabelEl.textContent = isReviewMode ? `${question.topic} • Review` : question.topic;
  reviewBannerEl.classList.toggle("hidden", !isReviewMode);
  heardWordEl.textContent = "Klik speaker untuk mendengar kata";
  feedbackBoxEl.textContent = "";
  feedbackBoxEl.className = "feedback-box";
  nextBtn.classList.add("hidden");
  choicesEl.innerHTML = "";

  // Start timer if applicable
  stopTimer();
  const levelConfig = LEVELS[currentLevel];
  if (levelConfig.timeLimit && !isReviewMode) {
    startTimer(levelConfig.timeLimit);
  }

  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.innerHTML = `
      <span class="choice-emoji">${choice.emoji}</span>
      <span class="choice-word">${choice.word}</span>
    `;
    button.addEventListener("click", () => selectAnswer(choice, button));
    choicesEl.appendChild(button);
  });
}

function startTimer(seconds) {
  timeRemaining = seconds;
  if (timerEl) {
    timerEl.textContent = `${timeRemaining}s`;
  }
  
  timerInterval = setInterval(() => {
    timeRemaining -= 1;
    if (timerEl) {
      timerEl.textContent = `${timeRemaining}s`;
      if (timeRemaining <= 5) {
        timerEl.style.color = "#e74c3c";
      } else {
        timerEl.style.color = "#17324a";
      }
    }
    
    if (timeRemaining <= 0) {
      stopTimer();
      // Auto-select wrong if time runs out
      if (!answerLocked) {
        handleTimeUp();
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleTimeUp() {
  const question = activeQuestions[currentIndex];
  answerLocked = true;
  playWrongSound();
  streak = 0;
  
  const buttons = [...document.querySelectorAll(".choice-btn")];
  buttons.forEach((itemButton) => {
    itemButton.disabled = true;
    const text = itemButton.querySelector(".choice-word")?.textContent;
    if (text === question.word) {
      itemButton.classList.add("correct");
    }
  });
  
  feedbackBoxEl.textContent = `Waktu habis! Jawaban yang benar adalah "${question.word}".`;
  feedbackBoxEl.className = "feedback-box error";
  
  if (!isReviewMode) {
    failedQuestions.push(question);
  }
  
  reviewItems.push({
    emoji: question.emoji,
    word: question.word,
    topic: question.topic,
    success: false
  });
  
  streakCountEl.textContent = String(streak);
  nextBtn.textContent = currentIndex === activeQuestions.length - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  nextBtn.classList.remove("hidden");
}

function selectAnswer(choice, button) {
  if (answerLocked) {
    return;
  }

  const question = activeQuestions[currentIndex];
  answerLocked = true;
  stopTimer(); // Stop timer if running
  
  const buttons = [...document.querySelectorAll(".choice-btn")];
  const isCorrect = choice.word === question.word;
  const levelConfig = LEVELS[currentLevel];

  buttons.forEach((itemButton) => {
    itemButton.disabled = true;
    const text = itemButton.querySelector(".choice-word")?.textContent;
    if (text === question.word) {
      itemButton.classList.add("correct");
    }
  });

  if (isCorrect) {
    // Play correct sound
    playCorrectSound();

    streak += 1;
    // Base points from level + bonus for listening
    const basePoints = levelConfig.pointsPerCorrect || 15;
    const listenBonus = listenedCount === 0 ? 5 : 0; // Bonus for not listening
    score += basePoints + listenBonus;
    stars += 1;
    correctAnswers += 1;
    button.classList.add("correct");
    let bonusText = "";
    if (streak === 3) {
      stars += 1;
      bonusText = " Combo 3x: bonus 1 bintang.";
    } else if (streak === 5) {
      score += 10;
      bonusText = " Super Combo 5x: bonus 10 skor.";
    }
    const badgeLabel = updateTopicProgress(question.topic, true);
    const badgeText = badgeLabel ? ` Badge baru: ${badgeLabel}.` : "";
    if (isReviewMode) {
      reviewRoundFixed += 1;
    }
    feedbackBoxEl.textContent = `Benar. Kata yang didengar adalah "${question.word}".${bonusText}${badgeText}`;
    feedbackBoxEl.className = "feedback-box success";
  } else {
    // Play wrong sound
    playWrongSound();

    streak = 0;
    button.classList.add("wrong");
    feedbackBoxEl.textContent = `Belum tepat. Jawaban yang benar adalah "${question.word}".`;
    feedbackBoxEl.className = "feedback-box error";
    if (!isReviewMode) {
      failedQuestions.push(question);
    }
  }

  reviewItems.push({
    emoji: question.emoji,
    word: question.word,
    topic: question.topic,
    success: isCorrect
  });

  scoreCountEl.textContent = String(score);
  starCountEl.textContent = String(stars);
  streakCountEl.textContent = String(streak);
  comboLabelEl.textContent = streak >= 5 ? "Super Combo" : streak >= 3 ? "Combo Aktif" : "Belum ada";
  nextBtn.textContent = currentIndex === activeQuestions.length - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  nextBtn.classList.remove("hidden");
}

function resultMessage() {
  const levelConfig = LEVELS[currentLevel];
  const totalQuestions = activeQuestions.length;
  const percentage = correctAnswers / totalQuestions;

  if (correctAnswers === totalQuestions) {
    return {
      title: "Perfect! 🎉",
      summary: `Level ${currentLevel} (${levelConfig.name}) selesai dengan sempurna! Kemampuan listening luar biasa.`,
      unlockNext: true
    };
  }

  if (percentage >= 0.8) {
    return {
      title: "Excellent! ⭐",
      summary: `Hasil sangat bagus di level ${levelConfig.name}. Tinggal sedikit lagi untuk sempurna!`,
      unlockNext: percentage >= 0.9
    };
  }

  if (percentage >= 0.6) {
    return {
      title: "Good Job! 👍",
      summary: `Pemahaman dasar di level ${levelConfig.name} sudah kuat. Latihan lagi untuk hasil lebih baik.`,
      unlockNext: false
    };
  }

  return {
    title: "Keep Practicing 💪",
    summary: `Level ${levelConfig.name} masih perlu latihan. Coba lagi dan dengarkan baik-baik!`,
    unlockNext: false
  };
}

function renderResults() {
  stopTimer();
  
  window.AkaScoreReporter?.report("listen-and-choose", score, {
    stars,
    correctAnswers,
    level: currentLevel,
    reviewFixed: reviewRoundFixed,
    reviewTotal: reviewRoundTotal
  });

  const bestScore = Math.max(loadBestScore(), score);
  saveBestScore(bestScore);

  const message = resultMessage();
  resultTitleEl.textContent = message.title;
  resultSummaryEl.textContent = message.summary;
  finalScoreEl.textContent = String(score);
  finalStarsEl.textContent = String(stars);
  correctCountEl.textContent = `${correctAnswers} / ${activeQuestions.length}`;
  bestScoreEl.textContent = String(bestScore);
  
  if (reviewRoundTotal > 0) {
    reviewSummaryCardEl.classList.remove("hidden");
    reviewFixedCountEl.textContent = `${reviewRoundFixed} / ${reviewRoundTotal}`;
  } else {
    reviewSummaryCardEl.classList.add("hidden");
  }
  reviewRewardBannerEl.classList.toggle("hidden", !earnedReviewReward);
  renderBadges();

  // Show level completion and unlock next level
  if (message.unlockNext && currentLevel < 5) {
    const nextLevel = currentLevel + 1;
    const unlocked = unlockLevel(nextLevel);
    if (unlocked) {
      const nextLevelConfig = LEVELS[nextLevel];
      resultSummaryEl.textContent += ` Level ${nextLevel} (${nextLevelConfig.name}) terbuka!`;
    }
  }

  reviewListEl.innerHTML = "";
  reviewItems.slice(-6).forEach((item) => {
    const card = document.createElement("article");
    card.className = "review-item";
    card.innerHTML = `
      <strong>${item.emoji} ${item.word}</strong>
      <span>${item.topic} • ${item.success ? "Benar" : "Perlu latihan"}</span>
    `;
    reviewListEl.appendChild(card);
  });

  switchScreen(resultScreen);
}

function startReviewRound() {
  isReviewMode = true;
  currentIndex = 0;
  streak = 0;
  listenedOnce = false;
  activeQuestions = failedQuestions.map(buildQuestion);
  reviewRoundTotal = activeQuestions.length;
  reviewRoundFixed = 0;
  earnedReviewReward = false;
  failedQuestions = [];
  renderQuestion();
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= activeQuestions.length) {
    if (!isReviewMode && failedQuestions.length > 0) {
      startReviewRound();
      return;
    }
    if (isReviewMode && reviewRoundTotal > 0 && reviewRoundFixed === reviewRoundTotal && !earnedReviewReward) {
      stars += 1;
      earnedReviewReward = true;
    }
    renderResults();
    return;
  }

  renderQuestion();
}

function startGame(level) {
  currentLevel = level || currentLevel;
  const levelConfig = LEVELS[currentLevel];
  
  questions = pickQuestions(levelConfig);
  activeQuestions = questions;
  failedQuestions = [];
  currentIndex = 0;
  score = 0;
  stars = 0;
  streak = 0;
  correctAnswers = 0;
  reviewItems = [];
  isReviewMode = false;
  reviewRoundTotal = 0;
  reviewRoundFixed = 0;
  earnedReviewReward = false;
  reviewBannerEl.classList.add("hidden");
  reviewSummaryCardEl.classList.add("hidden");
  reviewRewardBannerEl.classList.add("hidden");
  topicProgress.clear();
  earnedBadges.clear();
  renderBadges();
  bestScoreEl.textContent = String(loadBestScore());
  stopTimer();
  switchScreen(gameScreen);
  renderQuestion();
}

startBtn.addEventListener("click", () => {
  initAudio();
  startGame(currentLevel);
});

listenBtn.addEventListener("click", speakCurrentWord);
nextBtn.addEventListener("click", nextQuestion);
playAgainBtn.addEventListener("click", () => {
  switchScreen(startScreen);
});

// Level selection
if (levelSelectBtn) {
  levelSelectBtn.addEventListener("click", () => {
    levelSelectionEl.classList.toggle("hidden");
  });
}

levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const level = parseInt(btn.dataset.level);
    if (unlockedLevels.includes(level)) {
      currentLevel = level;
      levelSelectionEl.classList.add("hidden");
      // Update UI to show selected level
      levelButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      if (currentLevelEl) {
        const levelConfig = LEVELS[level];
        currentLevelEl.textContent = `${levelConfig.emoji} Level ${level}: ${levelConfig.name}`;
      }
    }
  });
});

// Load unlocked levels on startup
loadUnlockedLevels();

bestScoreEl.textContent = String(loadBestScore());
renderBadges();
