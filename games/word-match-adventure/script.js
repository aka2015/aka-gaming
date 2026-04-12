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
const reviewListEl = document.getElementById("review-list");

let questions = [];
let currentIndex = 0;
let score = 0;
let stars = 0;
let correctAnswers = 0;
let answerLocked = false;
let reviewItems = [];

function shuffle(items) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function pickQuestions() {
  return shuffle(WORD_BANK).slice(0, QUESTION_COUNT).map((entry) => {
    const distractors = shuffle(
      WORD_BANK
        .filter((item) => item.word !== entry.word)
        .map((item) => item.word)
    ).slice(0, 3);

    return {
      ...entry,
      choices: shuffle([entry.word, ...distractors])
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

function renderQuestion() {
  const question = questions[currentIndex];
  answerLocked = false;
  updateHud();
  topicLabelEl.textContent = question.topic;
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
  const question = questions[currentIndex];
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
  const question = questions[currentIndex];
  const choiceButtons = [...document.querySelectorAll(".choice-btn")];
  const isCorrect = choice === question.word;

  choiceButtons.forEach((choiceButton) => {
    choiceButton.disabled = true;

    if (choiceButton.textContent === question.word) {
      choiceButton.classList.add("correct");
    }
  });

  if (isCorrect) {
    score += 10;
    stars += 1;
    correctAnswers += 1;
    button.classList.add("correct");
    feedbackBoxEl.textContent = `Benar! Ini adalah "${question.word}".`;
    feedbackBoxEl.className = "feedback-box success";
  } else {
    button.classList.add("wrong");
    feedbackBoxEl.textContent = `Belum tepat. Jawaban yang benar adalah "${question.word}".`;
    feedbackBoxEl.className = "feedback-box error";
  }

  reviewItems.push({
    emoji: question.emoji,
    topic: question.topic,
    word: question.word,
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

function goToNextQuestion() {
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
playAgainBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", goToNextQuestion);
speakBtn.addEventListener("click", speakWord);

bestScoreEl.textContent = String(loadBestScore());
