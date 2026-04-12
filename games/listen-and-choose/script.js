const QUESTION_COUNT = 8;
const STORAGE_KEY = "aka_listen_choose_best_score";

const WORD_BANK = [
  { word: "cat", emoji: "🐱", topic: "Animals" },
  { word: "dog", emoji: "🐶", topic: "Animals" },
  { word: "bird", emoji: "🐦", topic: "Animals" },
  { word: "fish", emoji: "🐟", topic: "Animals" },
  { word: "apple", emoji: "🍎", topic: "Fruits" },
  { word: "banana", emoji: "🍌", topic: "Fruits" },
  { word: "orange", emoji: "🍊", topic: "Fruits" },
  { word: "book", emoji: "📘", topic: "School Objects" },
  { word: "pencil", emoji: "✏️", topic: "School Objects" },
  { word: "bag", emoji: "🎒", topic: "School Objects" },
  { word: "chair", emoji: "🪑", topic: "School Objects" },
  { word: "red", emoji: "🟥", topic: "Colors" },
  { word: "blue", emoji: "🟦", topic: "Colors" },
  { word: "green", emoji: "🟩", topic: "Colors" }
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
let isReviewMode = false;
let reviewRoundTotal = 0;
let reviewRoundFixed = 0;
let earnedReviewReward = false;
let reviewItems = [];
const topicProgress = new Map();
const earnedBadges = new Map();

const BADGE_RULES = {
  Animals: { label: "Animal Listener", target: 2 },
  Fruits: { label: "Fruit Listener", target: 2 },
  "School Objects": { label: "Classroom Listener", target: 2 },
  Colors: { label: "Color Listener", target: 2 }
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
  const distractors = shuffle(WORD_BANK.filter((item) => item.word !== entry.word)).slice(0, 3);
  return {
    ...entry,
    choices: shuffle([entry, ...distractors])
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

function speakCurrentWord() {
  const question = activeQuestions[currentIndex];
  if (!question) {
    return;
  }

  heardWordEl.textContent = `Kata diputar. Dengarkan baik-baik.`;
  listenedOnce = true;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.word);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
    return;
  }

  heardWordEl.textContent = `Browser tidak mendukung audio. Kata target: ${question.word}`;
}

function renderQuestion() {
  const question = activeQuestions[currentIndex];
  answerLocked = false;
  listenedOnce = false;
  updateHud();
  topicLabelEl.textContent = isReviewMode ? `${question.topic} • Review` : question.topic;
  reviewBannerEl.classList.toggle("hidden", !isReviewMode);
  heardWordEl.textContent = "Klik speaker untuk mendengar kata";
  feedbackBoxEl.textContent = "";
  feedbackBoxEl.className = "feedback-box";
  nextBtn.classList.add("hidden");
  choicesEl.innerHTML = "";

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

function selectAnswer(choice, button) {
  if (answerLocked) {
    return;
  }

  const question = activeQuestions[currentIndex];
  answerLocked = true;
  const buttons = [...document.querySelectorAll(".choice-btn")];
  const isCorrect = choice.word === question.word;

  buttons.forEach((itemButton) => {
    itemButton.disabled = true;
    const text = itemButton.querySelector(".choice-word")?.textContent;
    if (text === question.word) {
      itemButton.classList.add("correct");
    }
  });

  if (isCorrect) {
    streak += 1;
    score += listenedOnce ? 15 : 10;
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
  nextBtn.textContent = currentIndex === QUESTION_COUNT - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  nextBtn.classList.remove("hidden");
}

function resultMessage() {
  if (correctAnswers === QUESTION_COUNT) {
    return {
      title: "Amazing Listening",
      summary: "Semua jawaban benar. Kemampuan listening sudah sangat kuat."
    };
  }

  if (correctAnswers >= 6) {
    return {
      title: "Great Listening",
      summary: "Hasilnya bagus. Tinggal sedikit latihan agar makin cepat mengenali kata."
    };
  }

  if (correctAnswers >= 4) {
    return {
      title: "Nice Practice",
      summary: "Pemahaman dasar sudah ada. Ulangi lagi sambil dengarkan speaker beberapa kali."
    };
  }

  return {
    title: "Keep Trying",
    summary: "Coba lagi pelan-pelan. Fokus ke bunyi kata dan gambar yang muncul."
  };
}

function renderResults() {
  window.AkaScoreReporter?.report("listen-and-choose", score, {
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
listenBtn.addEventListener("click", speakCurrentWord);
nextBtn.addEventListener("click", nextQuestion);
playAgainBtn.addEventListener("click", startGame);

bestScoreEl.textContent = String(loadBestScore());
renderBadges();
