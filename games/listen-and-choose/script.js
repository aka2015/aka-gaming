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
const reviewListEl = document.getElementById("review-list");

let questions = [];
let currentIndex = 0;
let score = 0;
let stars = 0;
let correctAnswers = 0;
let answerLocked = false;
let listenedOnce = false;
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
  return shuffle(WORD_BANK).slice(0, QUESTION_COUNT).map((entry) => {
    const distractors = shuffle(WORD_BANK.filter((item) => item.word !== entry.word)).slice(0, 3);
    return {
      ...entry,
      choices: shuffle([entry, ...distractors])
    };
  });
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

function speakCurrentWord() {
  const question = questions[currentIndex];
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
  const question = questions[currentIndex];
  answerLocked = false;
  listenedOnce = false;
  updateHud();
  topicLabelEl.textContent = question.topic;
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

  const question = questions[currentIndex];
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
    score += listenedOnce ? 15 : 10;
    stars += 1;
    correctAnswers += 1;
    button.classList.add("correct");
    feedbackBoxEl.textContent = `Benar. Kata yang didengar adalah "${question.word}".`;
    feedbackBoxEl.className = "feedback-box success";
  } else {
    button.classList.add("wrong");
    feedbackBoxEl.textContent = `Belum tepat. Jawaban yang benar adalah "${question.word}".`;
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
listenBtn.addEventListener("click", speakCurrentWord);
nextBtn.addEventListener("click", nextQuestion);
playAgainBtn.addEventListener("click", startGame);

bestScoreEl.textContent = String(loadBestScore());
