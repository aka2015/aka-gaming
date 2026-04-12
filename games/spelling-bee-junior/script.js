const QUESTION_COUNT = 8;
const STORAGE_KEY = "aka_spelling_bee_junior_best_score";

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
  { word: "cat", emoji: "🐱", topic: "Animals" },
  { word: "dog", emoji: "🐶", topic: "Animals" },
  { word: "fish", emoji: "🐟", topic: "Animals" },
  { word: "bird", emoji: "🐦", topic: "Animals" },
  { word: "book", emoji: "📘", topic: "School Objects" },
  { word: "bag", emoji: "🎒", topic: "School Objects" },
  { word: "pencil", emoji: "✏️", topic: "School Objects" },
  { word: "apple", emoji: "🍎", topic: "Fruits" },
  { word: "banana", emoji: "🍌", topic: "Fruits" },
  { word: "orange", emoji: "🍊", topic: "Fruits" }
];

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const clearBtn = document.getElementById("clear-btn");
const hintBtn = document.getElementById("hint-btn");
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
const emojiCardEl = document.getElementById("emoji-card");
const answerSlotsEl = document.getElementById("answer-slots");
const lettersBankEl = document.getElementById("letters-bank");
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

let questions = [];
let activeQuestions = [];
let failedQuestions = [];
let currentIndex = 0;
let score = 0;
let stars = 0;
let streak = 0;
let correctAnswers = 0;
let answerLocked = false;
let usedHint = false;
let currentAnswer = [];
let isReviewMode = false;
let reviewRoundTotal = 0;
let reviewRoundFixed = 0;
let earnedReviewReward = false;
let reviewItems = [];
const topicProgress = new Map();
const earnedBadges = new Map();

const BADGE_RULES = {
  Animals: { label: "Animal Speller", target: 2 },
  Fruits: { label: "Fruit Speller", target: 2 },
  "School Objects": { label: "Classroom Speller", target: 2 }
};

function shuffle(items) {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function buildQuestion(entry) {
  return {
    ...entry,
    letters: shuffle(entry.word.toUpperCase().split(""))
  };
}

function pickQuestions() {
  return shuffle(WORD_BANK).slice(0, QUESTION_COUNT).map(buildQuestion);
}

function switchScreen(target) {
  [startScreen, gameScreen, resultScreen].forEach((screen) => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  target.classList.remove("hidden");
  target.classList.add("active");
}

function loadBestScore() {
  return Number(localStorage.getItem(STORAGE_KEY) || 0);
}

function saveBestScore(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

function updateHud() {
  questionCountEl.textContent = `${currentIndex + 1} / ${activeQuestions.length || QUESTION_COUNT}`;
  scoreCountEl.textContent = String(score);
  starCountEl.textContent = String(stars);
  streakCountEl.textContent = String(streak);
  comboLabelEl.textContent = streak >= 5 ? "Super Combo" : streak >= 3 ? "Combo Aktif" : "Belum ada";
  progressBarEl.style.width = `${((currentIndex + 1) / (activeQuestions.length || QUESTION_COUNT)) * 100}%`;
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

function renderSlots() {
  const question = activeQuestions[currentIndex];
  answerSlotsEl.innerHTML = "";

  for (let i = 0; i < question.word.length; i += 1) {
    const slot = document.createElement("div");
    slot.className = `slot${currentAnswer[i] ? " filled" : ""}`;
    slot.textContent = currentAnswer[i] || "";
    answerSlotsEl.appendChild(slot);
  }
}

function updateLettersState() {
  const buttons = [...lettersBankEl.querySelectorAll(".letter-btn")];
  buttons.forEach((button, index) => {
    button.disabled = answerLocked || currentAnswer.includes(`__USED_${index}__`);
  });
}

function renderLetters() {
  const question = activeQuestions[currentIndex];
  lettersBankEl.innerHTML = "";

  question.letters.forEach((letter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "letter-btn";
    button.textContent = letter;
    button.dataset.index = String(index);
    button.addEventListener("click", () => pickLetter(letter, index, button));
    lettersBankEl.appendChild(button);
  });
}

function resetAnswerState() {
  currentAnswer = [];
  const buttons = [...lettersBankEl.querySelectorAll(".letter-btn")];
  buttons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("used");
  });
  renderSlots();
}

function pickLetter(letter, index, button) {
  if (answerLocked || button.disabled) {
    return;
  }

  currentAnswer.push(letter);
  button.disabled = true;
  button.classList.add("used");
  renderSlots();

  if (currentAnswer.length === activeQuestions[currentIndex].word.length) {
    checkAnswer();
  }
}

function checkAnswer() {
  answerLocked = true;
  const question = activeQuestions[currentIndex];
  const attempt = currentAnswer.join("").toLowerCase();
  const isCorrect = attempt === question.word;

  if (isCorrect) {
    // Play correct sound
    playCorrectSound();
    
    streak += 1;
    const earnedScore = usedHint ? 10 : 15;
    score += earnedScore;
    stars += 1;
    correctAnswers += 1;
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
    feedbackBoxEl.textContent = `Benar. Kata yang tepat adalah "${question.word}".${bonusText}${badgeText}`;
    feedbackBoxEl.className = "feedback-box success";
  } else {
    // Play wrong sound
    playWrongSound();
    
    streak = 0;
    feedbackBoxEl.textContent = `Belum tepat. Ejaan yang benar adalah "${question.word}".`;
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
  nextBtn.textContent = currentIndex === QUESTION_COUNT - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  nextBtn.classList.remove("hidden");
}

function giveHint() {
  if (answerLocked) {
    return;
  }

  const question = activeQuestions[currentIndex];
  feedbackBoxEl.textContent = `Petunjuk: kata dimulai dengan huruf "${question.word[0].toUpperCase()}".`;
  feedbackBoxEl.className = "feedback-box";
  usedHint = true;
}

function renderQuestion() {
  const question = activeQuestions[currentIndex];
  answerLocked = false;
  usedHint = false;
  currentAnswer = [];
  updateHud();
  topicLabelEl.textContent = isReviewMode ? `${question.topic} • Review` : question.topic;
  reviewBannerEl.classList.toggle("hidden", !isReviewMode);
  emojiCardEl.textContent = question.emoji;
  feedbackBoxEl.textContent = "";
  feedbackBoxEl.className = "feedback-box";
  nextBtn.classList.add("hidden");
  renderLetters();
  renderSlots();
}

function resultMessage() {
  if (correctAnswers === QUESTION_COUNT) {
    return {
      title: "Amazing Spelling",
      summary: "Semua kata berhasil dieja dengan benar. Kemampuan spelling sudah sangat baik."
    };
  }

  if (correctAnswers >= 6) {
    return {
      title: "Great Spelling",
      summary: "Hasilnya kuat. Tinggal tambah latihan supaya makin cepat menyusun huruf."
    };
  }

  if (correctAnswers >= 4) {
    return {
      title: "Nice Practice",
      summary: "Dasarnya sudah ada. Coba main lagi untuk mengingat ejaan kata lebih baik."
    };
  }

  return {
    title: "Keep Practicing",
    summary: "Ulangi lagi dengan santai. Fokus pada urutan huruf setiap kata."
  };
}

function renderResults() {
  window.AkaScoreReporter?.report("spelling-bee-junior", score, {
    stars,
    correctAnswers,
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
  correctCountEl.textContent = `${correctAnswers} / ${QUESTION_COUNT}`;
  bestScoreEl.textContent = String(bestScore);
  if (reviewRoundTotal > 0) {
    reviewSummaryCardEl.classList.remove("hidden");
    reviewFixedCountEl.textContent = `${reviewRoundFixed} / ${reviewRoundTotal}`;
  } else {
    reviewSummaryCardEl.classList.add("hidden");
  }
  reviewRewardBannerEl.classList.toggle("hidden", !earnedReviewReward);
  renderBadges();

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

function startGame() {
  questions = pickQuestions();
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
  switchScreen(gameScreen);
  renderQuestion();
}

startBtn.addEventListener("click", startGame);
clearBtn.addEventListener("click", resetAnswerState);
hintBtn.addEventListener("click", giveHint);
nextBtn.addEventListener("click", nextQuestion);
playAgainBtn.addEventListener("click", startGame);

bestScoreEl.textContent = String(loadBestScore());
renderBadges();
