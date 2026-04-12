const QUESTION_COUNT = 8;
const STORAGE_KEY = "aka_spelling_bee_junior_best_score";

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
const reviewListEl = document.getElementById("review-list");

let questions = [];
let currentIndex = 0;
let score = 0;
let stars = 0;
let correctAnswers = 0;
let answerLocked = false;
let usedHint = false;
let currentAnswer = [];
let reviewItems = [];

function shuffle(items) {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function pickQuestions() {
  return shuffle(WORD_BANK).slice(0, QUESTION_COUNT).map((entry) => ({
    ...entry,
    letters: shuffle(entry.word.toUpperCase().split(""))
  }));
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
  questionCountEl.textContent = `${currentIndex + 1} / ${QUESTION_COUNT}`;
  scoreCountEl.textContent = String(score);
  starCountEl.textContent = String(stars);
  progressBarEl.style.width = `${((currentIndex + 1) / QUESTION_COUNT) * 100}%`;
}

function renderSlots() {
  const question = questions[currentIndex];
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
  const question = questions[currentIndex];
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

  if (currentAnswer.length === questions[currentIndex].word.length) {
    checkAnswer();
  }
}

function checkAnswer() {
  answerLocked = true;
  const question = questions[currentIndex];
  const attempt = currentAnswer.join("").toLowerCase();
  const isCorrect = attempt === question.word;

  if (isCorrect) {
    const earnedScore = usedHint ? 10 : 15;
    score += earnedScore;
    stars += 1;
    correctAnswers += 1;
    feedbackBoxEl.textContent = `Benar. Kata yang tepat adalah "${question.word}".`;
    feedbackBoxEl.className = "feedback-box success";
  } else {
    feedbackBoxEl.textContent = `Belum tepat. Ejaan yang benar adalah "${question.word}".`;
    feedbackBoxEl.className = "feedback-box error";
  }

  reviewItems.push({
    emoji: question.emoji,
    word: question.word,
    topic: question.topic,
    success: isCorrect
  });

  scoreCountEl.textContent = String(score);
  starCountEl.textContent = String(stars);
  nextBtn.textContent = currentIndex === QUESTION_COUNT - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  nextBtn.classList.remove("hidden");
}

function giveHint() {
  if (answerLocked) {
    return;
  }

  const question = questions[currentIndex];
  feedbackBoxEl.textContent = `Petunjuk: kata dimulai dengan huruf "${question.word[0].toUpperCase()}".`;
  feedbackBoxEl.className = "feedback-box";
  usedHint = true;
}

function renderQuestion() {
  const question = questions[currentIndex];
  answerLocked = false;
  usedHint = false;
  currentAnswer = [];
  updateHud();
  topicLabelEl.textContent = question.topic;
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
  const bestScore = Math.max(loadBestScore(), score);
  saveBestScore(bestScore);

  const message = resultMessage();
  resultTitleEl.textContent = message.title;
  resultSummaryEl.textContent = message.summary;
  finalScoreEl.textContent = String(score);
  finalStarsEl.textContent = String(stars);
  correctCountEl.textContent = `${correctAnswers} / ${QUESTION_COUNT}`;
  bestScoreEl.textContent = String(bestScore);

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

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= QUESTION_COUNT) {
    renderResults();
    return;
  }

  renderQuestion();
}

function startGame() {
  questions = pickQuestions();
  currentIndex = 0;
  score = 0;
  stars = 0;
  correctAnswers = 0;
  reviewItems = [];
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
