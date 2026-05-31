let questions = [];
let currentStep = 0;

const topicTag = document.getElementById("topicTag");
const progressText = document.getElementById("progressText");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const analysisBox = document.getElementById("analysisBox");
const answerText = document.getElementById("answerText");
const explanationText = document.getElementById("explanationText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const overviewBtn = document.getElementById("overviewBtn");
const closeOverviewBtn = document.getElementById("closeOverviewBtn");
const overviewPanel = document.getElementById("overviewPanel");
const overviewGrid = document.getElementById("overviewGrid");

function maxQuestionStep() {
    return questions.length * 2 - 1;
}

function isCompletionStep() {
    return currentStep > maxQuestionStep();
}

function getCurrentQuestionIndex() {
    return Math.floor(currentStep / 2);
}

function isAnswerStep() {
    return currentStep % 2 === 1;
}

function indexToOptionLabel(index) {
    let n = index + 1;
    let label = "";

    while (n > 0) {
        const remainder = (n - 1) % 26;
        label = String.fromCharCode(65 + remainder) + label;
        n = Math.floor((n - 1) / 26);
    }

    return label;
}

function normalizeAnswerIndices(item) {
    const optionsLength = Array.isArray(item.options) ? item.options.length : 0;

    if (Array.isArray(item.answerIndices)) {
        return [...new Set(item.answerIndices)]
            .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < optionsLength)
            .sort((a, b) => a - b);
    }

    if (Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < optionsLength) {
        return [item.answerIndex];
    }

    return [];
}

function updateNavState() {
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = questions.length === 0 || isCompletionStep();
}

function closeOverview() {
    overviewPanel.classList.add("hidden");
}

function openOverview() {
    renderOverview();
    overviewPanel.classList.remove("hidden");
}

function jumpToQuestion(index) {
    if (index < 0 || index >= questions.length) {
        return;
    }
    currentStep = index * 2;
    renderByStep();
    closeOverview();
}

function renderOverview() {
    const currentQuestionIndex = Math.min(getCurrentQuestionIndex(), questions.length - 1);
    const completedQuestionIndex = Math.floor((Math.min(currentStep, maxQuestionStep())) / 2);
    const completedAll = isCompletionStep();

    overviewGrid.innerHTML = "";
    questions.forEach((_, idx) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "overview-item";
        button.textContent = String(idx + 1);

        if (idx === currentQuestionIndex && !isCompletionStep()) {
            button.classList.add("current");
        }

        if (completedAll || idx < completedQuestionIndex || (idx === completedQuestionIndex && currentStep % 2 === 1)) {
            button.classList.add("done");
        }

        button.addEventListener("click", () => jumpToQuestion(idx));
        overviewGrid.appendChild(button);
    });
}

async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        if (!response.ok) {
            throw new Error("無法讀取題庫 JSON");
        }
        questions = await response.json();

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("題庫資料為空");
        }

        questions = questions.map((item) => ({
            ...item,
            answerIndices: normalizeAnswerIndices(item)
        }));

        currentStep = 0;
        renderByStep();
    } catch (error) {
        questionText.textContent = `載入失敗：${error.message}`;
        optionsList.innerHTML = "";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        overviewBtn.disabled = true;
    }
}

function renderQuestion(showAnswer) {
    const currentIndex = getCurrentQuestionIndex();
    const item = questions[currentIndex];
    const answerIndices = item.answerIndices || [];
    const answerIndexSet = new Set(answerIndices);

    topicTag.textContent = item.topic || "QUESTION";
    progressText.textContent = `${currentIndex + 1} / ${questions.length}`;
    questionText.textContent = item.question;

    optionsList.innerHTML = "";
    item.options.forEach((option, idx) => {
        const li = document.createElement("li");
        li.className = "option-item";
        li.dataset.index = idx;
        li.textContent = `${indexToOptionLabel(idx)}. ${option}`;
        if (showAnswer && answerIndexSet.has(idx)) {
            li.classList.add("correct");
        }
        optionsList.appendChild(li);
    });

    if (showAnswer) {
        explanationText.textContent = item.explanation;
        analysisBox.classList.remove("hidden");
    } else {
        analysisBox.classList.add("hidden");
        answerText.textContent = "";
        explanationText.textContent = "";
    }
}

function renderCompletion() {
    topicTag.textContent = "FINISH";
    progressText.textContent = `${questions.length} / ${questions.length}`;
    questionText.textContent = "已完成所有題目";
    optionsList.innerHTML = "";
    analysisBox.classList.add("hidden");
    answerText.textContent = "";
    explanationText.textContent = "";
}

function renderByStep() {
    if (questions.length === 0) {
        return;
    }

    if (isCompletionStep()) {
        renderCompletion();
    } else {
        renderQuestion(isAnswerStep());
    }

    updateNavState();
    renderOverview();
}

function handleNext() {
    if (questions.length === 0 || isCompletionStep()) {
        return;
    }

    currentStep += 1;
    renderByStep();
}

function handlePrev() {
    if (questions.length === 0 || currentStep === 0) {
        return;
    }

    currentStep -= 1;
    renderByStep();
}

prevBtn.addEventListener("click", handlePrev);
nextBtn.addEventListener("click", handleNext);
overviewBtn.addEventListener("click", openOverview);
closeOverviewBtn.addEventListener("click", closeOverview);
loadQuestions();
