const QUESTION_COUNT = 10;
const STORAGE_KEY = "aka_word_match_best_score";

const WORD_BANK = [
  { word: "cat", emoji: "🐱", topic: "Animals" },
  { word: "dog", emoji: "🐶", topic: "Animals" },
  { word: "bird", emoji: "🐦", topic: "Animals" },
  { word: "fish", emoji: "🐟", topic: "Animals" },
  { word: "apple", emoji: "🍎", topic: "Fruits" },
  { word: "banana", emoji: "🍌", topic: "Fruits" },
  { word: "orange", emoji: "🍊", topic: "Fruits" },
  { word: "grapes", emoji: "🍇", topic: "Fruits" },
  { word: "red", emoji: "🟥", topic: "Colors" },
  { word: "blue", emoji: "🟦", topic: "Colors" },
  { word: "green", emoji: "🟩", topic: "Colors" },
  { word: "yellow", emoji: "🟨", topic: "Colors" },
  { word: "one", emoji: "1️⃣", topic: "Numbers" },
  { word: "two", emoji: "2️⃣", topic: "Numbers" },
  { word: "three", emoji: "3️⃣", topic: "Numbers" },
  { word: "book", emoji: "📘", topic: "School Objects" },
  { word: "pencil", emoji: "✏️", topic: "School Objects" },
  { word: "bag", emoji: "🎒", topic: "School Objects" },
  { word: "chair", emoji: "🪑", topic: "School Objects" }
];

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const speakBtn = document.getElementById("speak-btn");
const nextBtn = document.getElementById("next-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const questionCountEl = document.getElementById("question-count");
const scoreCountEl = document.getElementById("score-count");
const starCountEl = document.getElementById("star-count");
const streakCountEl = document.getElementById("streak-count");
const comboLabelEl = document.getElementById("combo-label");
const reviewBannerEl = document.getElementById("review-banner");
const topicLabelEl = document.getElementById("topic-label");
const emojiCardEl = document.getElementById("emoji-card");
const choicesEl = document.getElementById("choices");
const feedbackBoxEl = document.getElementById("feedback-box");
const progressBarEl = document.getElementById("progress-bar");
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
let isReviewMode = false;
let reviewRoundTotal = 0;
let reviewRoundFixed = 0;
let earnedReviewReward = false;
let reviewItems = [];
const topicProgress = new Map();
const earnedBadges = new Map();

const BADGE_RULES = {
  Animals: { label: "Animal Explorer", target: 2 },
  Fruits: { label: "Fruit Finder", target: 2 },
  Colors: { label: "Color Captain", target: 2 },
  Numbers: { label: "Number Ranger", target: 2 },
  "School Objects": { label: "Classroom Star", target: 2 }
};

function shuffle(items) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function buildQuestion(entry) {
  const distractors = shuffle(
    WORD_BANK
      .filter((item) => item.word !== entry.word)
      .map((item) => item.word)
  ).slice(0, 3);

  return {
    ...entry,
    choices: shuffle([entry.word, ...distractors])
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
    badgeListEl.innerHTML = '<article class="badge-item"><strong>Belum ada badge</strong><span>Selesaikan 2 soal benar pada topik yang sama.</span></article>';
    return;
  }

  [...earnedBadges.entries()].forEach(([topic, label]) => {
    const card = document.createElement("article");
    card.className = "badge-item";
    card.innerHTML = `<strong>${label}</strong><span>${topic}</span>`;
    badgeListEl.appendChild(card);
  });
}

function renderQuestion() {
  const question = activeQuestions[currentIndex];
  answerLocked = false;
  updateHud();
  topicLabelEl.textContent = isReviewMode ? `${question.topic} • Review` : question.topic;
  reviewBannerEl.classList.toggle("hidden", !isReviewMode);
  emojiCardEl.textContent = question.emoji;
  feedbackBoxEl.textContent = "";
  feedbackBoxEl.className = "feedback-box";
  nextBtn.classList.add("hidden");
  choicesEl.innerHTML = "";

  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choice;
    button.addEventListener("click", () => selectAnswer(choice, button));
    choicesEl.appendChild(button);
  });
}

function speakWord() {
  const question = activeQuestions[currentIndex];
  if (!question || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(question.word);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function selectAnswer(choice, button) {
  if (answerLocked) {
    return;
  }

  answerLocked = true;
  const question = activeQuestions[currentIndex];
  const choiceButtons = [...document.querySelectorAll(".choice-btn")];
  const isCorrect = choice === question.word;

  choiceButtons.forEach((choiceButton) => {
    choiceButton.disabled = true;

    if (choiceButton.textContent === question.word) {
      choiceButton.classList.add("correct");
    }
  });

  if (isCorrect) {
    streak += 1;
    score += 10;
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
    feedbackBoxEl.textContent = `Benar! Ini adalah "${question.word}".${bonusText}${badgeText}`;
    feedbackBoxEl.className = "feedback-box success";
  } else {
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
    topic: question.topic,
    word: question.word,
    success: isCorrect
  });

  scoreCountEl.textContent = String(score);
  starCountEl.textContent = String(stars);
  streakCountEl.textContent = String(streak);
  comboLabelEl.textContent = streak >= 5 ? "Super Combo" : streak >= 3 ? "Combo Aktif" : "Belum ada";
  nextBtn.textContent = currentIndex === QUESTION_COUNT - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  nextBtn.classList.remove("hidden");
}

function resultMessage() {
  if (correctAnswers === QUESTION_COUNT) {
    return {
      title: "Perfect Explorer",
      summary: "Semua jawaban benar. Anak sudah sangat siap untuk naik level berikutnya."
    };
  }

  if (correctAnswers >= 8) {
    return {
      title: "Great Job",
      summary: "Hasilnya sangat bagus. Tinggal sedikit lagi untuk skor sempurna."
    };
  }

  if (correctAnswers >= 5) {
    return {
      title: "Nice Try",
      summary: "Dasarnya sudah bagus. Coba main lagi untuk mengingat lebih banyak kata."
    };
  }

  return {
    title: "Keep Learning",
    summary: "Ulangi lagi pelan-pelan. Fokus pada kata yang masih salah tadi."
  };
}

function renderResults() {
  window.AkaScoreReporter?.report("word-match-adventure", score, {
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
  feedbackBoxEl.textContent = "";
  renderQuestion();
}

function goToNextQuestion() {
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
playAgainBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", goToNextQuestion);
speakBtn.addEventListener("click", speakWord);

bestScoreEl.textContent = String(loadBestScore());
renderBadges();
