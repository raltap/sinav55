// HTML checkbox value'ları ile JSON dosya yolları ve JSON içindeki 'file' alanının uzun değerlerinin eşleşmesi
const fileMappings = {
    // Eski Medu Dosyaları
    "Medu-3": { filePath: "medu3.json", jsonFileValue: "DN4-CERRAHİ BİLİMLER 2. DÖNGÜ (3.GRUP) SINAVI" },
    "Medu-4": { filePath: "medu4.json", jsonFileValue: "DN4-CERRAHİ BİLİMLER 1. DÖNGÜ (4.GRUP) SINAVI" },
    "Medu-9": { filePath: "medu9.json", jsonFileValue: "DN4-CERRAHİ BİLİMLER 3. DÖNGÜ (1.GRUP) SINAVI" },
    // Yeni Aday Memur Sınavları
    "Ataturk-Tarih": { filePath: "ataturk_tarih.json", jsonFileValue: "ATATÜRK İLKELERİ ve İNKILAP TARİHİ SORULARI" },
    "TC-Anayasasi": { filePath: "tc_anayasasi.json", jsonFileValue: "T.C. ANAYASASI SORULARI" },
    "Devlet-Teskilati": { filePath: "devlet_teskilati.json", jsonFileValue: "GENEL OLARAK DEVLET TEŞKİLATI SORULARI" },
    "DMK-657": { filePath: "dmk_657.json", jsonFileValue: "657 SAYILI DEVLET MEMURLARI KANUNU SORULARI" },
    "Yazisma-Dosyalama": { filePath: "yazisma_dosyalama.json", jsonFileValue: "YAZIŞMA - DOSYALAMA USULLERİ SORULARI" },
    "Devlet-Mali": { filePath: "devlet_mali.json", jsonFileValue: "DEVLET MALINI KORUMA ve TASARRUF TEDBİRLERİ SORULARI" },
    "Halkla-Iliskiler": { filePath: "halkla_iliskiler.json", jsonFileValue: "HALKLA İLİŞKİLER SORULARI" },
    "Gizlilik": { filePath: "gizlilik.json", jsonFileValue: "GİZLİLİK ve GİZLİLİĞİN ÖNEMİ SORULARI" },
    "Milli-Guvenlik": { filePath: "milli_guvenlik.json", jsonFileValue: "MİLLÎ GÜVENLİK BİLGİLERİ SORULARI" },
    "Haberlesme": { filePath: "haberlesme.json", jsonFileValue: "HABERLEŞME SORULARI" },
    "Turkce-Dil": { filePath: "turkce_dil.json", jsonFileValue: "TÜRKÇE DİL BİLGİSİ KURALLARI SORULARI" },
    "Insan-Haklari": { filePath: "insan_haklari.json", jsonFileValue: "İNSAN HAKLARI SORULARI" }
};

// HTML elementlerini seçme
const mainMenu = document.getElementById('main-menu');
const quizArea = document.getElementById('quiz-area');
const endScreen = document.getElementById('end-screen');
const fileCheckboxes = document.querySelectorAll('.file-checkbox');
const rangeRadios = document.querySelectorAll('input[name="question-range"]');
const modeRadios = document.querySelectorAll('input[name="quiz-mode"]');
const startQuizBtn = document.getElementById('start-quiz-btn');
const reviewWrongBtn = document.getElementById('review-wrong-btn');
const wrongAnswersSummary = document.getElementById('wrong-answers-summary');
const wrongAnswersList = document.getElementById('wrong-answers-list');
const wrongCountSpan = document.getElementById('wrong-count');
const clearWrongBtn = document.getElementById('clear-wrong-btn');
const questionCounter = document.getElementById('question-counter');
const currentQSpan = document.getElementById('current-q');
const totalQSpan = document.getElementById('total-q');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackDiv = document.getElementById('feedback');
const explanationDiv = document.getElementById('explanation');
const nextQuestionBtn = document.getElementById('next-question-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const finalScorePara = document.getElementById('final-score');

let allQuestions = [];
let quizPool = [];
let currentLoopQuestions = [];
let currentQuestionIndex = 0;
let correctCountInCurrentQuiz = 0;
let wrongAnswerIds = JSON.parse(localStorage.getItem('wrongAnswerIds') || '[]');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveWrongAnswers() {
    const uniqueWrongIds = [...new Set(wrongAnswerIds)];
    localStorage.setItem('wrongAnswerIds', JSON.stringify(uniqueWrongIds));
    updateWrongAnswersList();
}

function loadWrongAnswers() {
    wrongAnswerIds = JSON.parse(localStorage.getItem('wrongAnswerIds') || '[]');
    updateWrongAnswersList();
}

function updateWrongAnswersList() {
    wrongAnswersList.innerHTML = '';
    const uniqueWrongIds = [...new Set(wrongAnswerIds)];
    wrongCountSpan.textContent = uniqueWrongIds.length;

    if (uniqueWrongIds.length === 0) {
        wrongAnswersSummary.style.display = 'none';
        reviewWrongBtn.style.display = 'none';
        clearWrongBtn.style.display = 'none';
        return;
    }

    wrongAnswersSummary.style.display = 'block';
    reviewWrongBtn.style.display = 'block';
    clearWrongBtn.style.display = 'inline-block';

    uniqueWrongIds.forEach(qId => {
        const question = allQuestions.find(q => q.id === qId);
        if (question) {
            const listItem = document.createElement('li');
            const displayQuestionText = question.question.length > 100 ?
                                        question.question.substring(0, 100) + '...' :
                                        question.question;
            const fileKey = Object.keys(fileMappings).find(key => fileMappings[key].jsonFileValue === question.file);
            const fileDisplay = fileKey ? fileKey : question.file;
            listItem.textContent = `${displayQuestionText} [${fileDisplay}]`;
            wrongAnswersList.appendChild(listItem);
        }
    });
}

function clearWrongAnswers() {
     wrongAnswerIds = [];
     saveWrongAnswers();
     alert('Yanlış yapılan sorular temizlendi.');
}

function showMainMenu() {
    mainMenu.style.display = 'block';
    quizArea.style.display = 'none';
    endScreen.style.display = 'none';
    feedbackDiv.textContent = '';
    explanationDiv.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    optionsContainer.innerHTML = '';
    questionText.textContent = '';
    currentQuestionIndex = 0;
    correctCountInCurrentQuiz = 0;
    loadWrongAnswers();
}

function showQuizArea() {
    mainMenu.style.display = 'none';
    endScreen.style.display = 'none';
    quizArea.style.display = 'block';
}

function showEndScreen(correctCount, totalCount) {
     mainMenu.style.display = 'none';
     quizArea.style.display = 'none';
     endScreen.style.display = 'block';
     const selectedMode = document.querySelector('input[name="quiz-mode"]:checked').value;

     if (selectedMode === 'infinite') {
         finalScorePara.textContent = `Bir tur tamamlandı! Bu turda ${totalCount} soru çözdünüz, ${correctCount} doğru cevapladınız. Yanlış yaptığınız soruları ana menüdeki listeden görebilirsiniz. Devam etmek için Yeni Quize Başla'ya basabilirsiniz.`;
     } else {
        finalScorePara.textContent = `Quiz Tamamlandı! Toplam ${totalCount} sorudan ${correctCount} tanesini doğru cevapladınız. Yanlış yaptığınız soruları ana menüdeki listeden görebilirsiniz.`;
     }

     document.getElementById('restart-from-end-btn').onclick = () => {
        if (selectedMode === 'infinite') {
             initializeQuiz(false);
        } else {
             showMainMenu();
        }
     }
     document.getElementById('back-to-menu-from-end-btn').onclick = showMainMenu;
}

function getQuestionNumberFromId(id) {
    const parts = id.split('_q');
    if (parts.length > 1) {
        return parseInt(parts[parts.length - 1], 10);
    }
    return NaN;
}

async function initializeQuiz(isReviewingWrong = false) {
    if (allQuestions.length === 0) {
        await loadQuestions();
        if (allQuestions.length === 0) return;
    }

    const selectedFilesShortNames = Array.from(fileCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    const selectedFilesJsonValues = selectedFilesShortNames.map(shortName => fileMappings[shortName].jsonFileValue);

    if (selectedFilesShortNames.length === 0 && !isReviewingWrong) {
        alert('Lütfen quiz yapmak istediğiniz en az bir konu seçin.');
        return;
    }

    const selectedMode = document.querySelector('input[name="quiz-mode"]:checked').value;
    const selectedRange = document.querySelector('input[name="question-range"]:checked').value;
    
    let filteredByFiles = allQuestions;
    if (!isReviewingWrong || (isReviewingWrong && selectedFilesShortNames.length > 0) ) {
        if (selectedFilesShortNames.length > 0) {
           filteredByFiles = allQuestions.filter(q => selectedFilesJsonValues.includes(q.file));
        }
    }

    let filteredByRange = filteredByFiles;
    if (selectedRange !== 'all' && !isReviewingWrong) {
         filteredByRange = filteredByFiles.filter(q => {
            const qNumber = getQuestionNumberFromId(q.id);
            if (isNaN(qNumber)) return false;
            if (selectedRange === '1-25') return qNumber >= 1 && qNumber <= 25;
            if (selectedRange === '26-50') return qNumber >= 26 && qNumber <= 50;
            if (selectedRange === '51-75') return qNumber >= 51 && qNumber <= 75;
            if (selectedRange === '76+') return qNumber >= 76;
            return false;
         });
    }

    if (isReviewingWrong) {
         quizPool = filteredByRange.filter(q => wrongAnswerIds.includes(q.id));
         if (quizPool.length === 0) {
             alert('Tekrar çözmek için (seçili kriterlere uyan) yanlış yaptığınız soru bulunmamaktadır.');
             showMainMenu();
             return;
         }
    } else {
        quizPool = filteredByRange;
    }

    if (quizPool.length === 0) {
         alert('Seçtiğiniz kriterlere uygun soru bulunamadı.');
         showMainMenu();
         return;
    }
    
    currentLoopQuestions = [...quizPool];
    shuffleArray(currentLoopQuestions);
    currentQuestionIndex = 0;
    correctCountInCurrentQuiz = 0;

    showQuizArea();
    displayCurrentQuestion();
}

function displayCurrentQuestion() {
    const selectedMode = document.querySelector('input[name="quiz-mode"]:checked').value;
    const isReviewingWrong = quizArea.dataset.isReviewingWrong === 'true';

    if (currentLoopQuestions.length === 0) {
        if (selectedMode === 'infinite' && !isReviewingWrong) {
            currentLoopQuestions = [...quizPool];
            shuffleArray(currentLoopQuestions);
            currentQuestionIndex = 0;
            correctCountInCurrentQuiz = 0;
            console.log("Sonsuz mod: Yeni tur başladı!");
        } else {
            endQuiz();
            return;
        }
    }

    const question = currentLoopQuestions.shift();
    
    if (selectedMode === 'infinite' && !isReviewingWrong) {
        questionCounter.textContent = `Soru: ${currentQuestionIndex + 1}`;
    } else {
        currentQSpan.textContent = currentQuestionIndex + 1;
        totalQSpan.textContent = quizPool.length;
        questionCounter.textContent = `Soru: ${currentQuestionIndex + 1} / ${quizPool.length}`;
    }

    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    feedbackDiv.textContent = '';
    explanationDiv.style.display = 'none';
    nextQuestionBtn.style.display = 'none';

    const optionsArray = Object.keys(question.options).map(key => ({
        key: key,
        text: question.options[key]
    }));

    const shuffledOptions = shuffleArray(optionsArray);
    const newLabels = ['A', 'B', 'C', 'D', 'E'];

    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-button');
        button.textContent = `${newLabels[index]}) ${option.text}`;
        button.dataset.originalKey = option.key;
        button.dataset.questionId = question.id;
        button.addEventListener('click', handleAnswerClick);
        optionsContainer.appendChild(button);
    });
}

function handleAnswerClick(event) {
    const selectedButton = event.target;
    const selectedOriginalKey = selectedButton.dataset.originalKey;
    const questionId = selectedButton.dataset.questionId;
    const currentQuestion = allQuestions.find(q => q.id === questionId);

    if (!currentQuestion) {
         console.error("Soru bulunamadı:", questionId);
         return;
    }

    const correctAnswerKey = currentQuestion.correct_answer;

    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    if (selectedOriginalKey === correctAnswerKey) {
        selectedButton.classList.add('correct');
        feedbackDiv.textContent = 'Doğru!';
        feedbackDiv.style.color = 'green';
        correctCountInCurrentQuiz++;
        wrongAnswerIds = wrongAnswerIds.filter(id => id !== questionId);
        saveWrongAnswers();
    } else {
        selectedButton.classList.add('wrong');
        feedbackDiv.textContent = 'Yanlış.';
        feedbackDiv.style.color = 'red';

        Array.from(optionsContainer.children).forEach(button => {
            if (button.dataset.originalKey === correctAnswerKey) {
                button.classList.add('correct');
            }
        });
        
        wrongAnswerIds.push(questionId);
        saveWrongAnswers();
    }

    if (currentQuestion.explanation) {
        explanationDiv.textContent = 'Açıklama: ' + currentQuestion.explanation;
        explanationDiv.style.display = 'block';
    } else {
         explanationDiv.style.display = 'none';
    }

    nextQuestionBtn.style.display = 'block';
}

function nextQuestion() {
     currentQuestionIndex++;
     displayCurrentQuestion();
}

function endQuiz() {
     const totalCount = quizPool.length;
     showEndScreen(correctCountInCurrentQuiz, totalCount);
     quizArea.dataset.isReviewingWrong = 'false';
}

async function loadQuestions() {
    const fetchPromises = Object.values(fileMappings).map(async fileInfo => {
        try {
            const response = await fetch(fileInfo.filePath);
            if (!response.ok) {
                console.error(`Dosya yüklenirken HTTP hatası: ${fileInfo.filePath}, status: ${response.status}`);
                alert(`Hata: '${fileInfo.filePath}' yüklenirken bir HTTP hatası oluştu (Status: ${response.status}).`);
                return [];
            }
            const questions = await response.json();

            if (!Array.isArray(questions)) {
                 console.error(`JSON format hatası: ${fileInfo.filePath} bir dizi değil.`);
                 alert(`Hata: '${fileInfo.filePath}' dosyasının formatı hatalı (dizi olmalı).`);
                 return [];
            }
            
            const validQuestions = questions.filter(q =>
                 typeof q === 'object' && q !== null &&
                 typeof q.id === 'string' && q.id.length > 0 &&
                 typeof q.file === 'string' && q.file.length > 0 &&
                 typeof q.question === 'string' && q.question.length > 0 &&
                 typeof q.options === 'object' && q.options !== null && Object.keys(q.options).length >= 4 &&
                 typeof q.correct_answer === 'string' && q.correct_answer.length === 1 && ['A','B','C','D','E'].includes(q.correct_answer)
             );

             if (validQuestions.length !== questions.length) {
                  console.warn(`Dikkat: '${fileInfo.filePath}' dosyasındaki bazı sorular beklenen formatta değil. Toplam: ${questions.length}, Geçerli: ${validQuestions.length}`);
             }

            console.log(`Yüklendi: ${fileInfo.filePath}, ${validQuestions.length} geçerli soru.`);
            return validQuestions;

        } catch (error) {
            console.error(`Dosya yüklenirken veya işlenirken hata oluştu: ${fileInfo.filePath}`, error);
            alert(`Dosya yüklenirken veya işlenirken bir hata oluştu: ${fileInfo.filePath}. Konsolu kontrol edin.`);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    allQuestions = results.flat();
    console.log('Toplam geçerli yüklü soru:', allQuestions.length);

    if (allQuestions.length === 0) {
         alert('Hiç geçerli soru yüklenemedi. Lütfen JSON dosyalarını ve formatlarını kontrol edin.');
         startQuizBtn.disabled = true;
         reviewWrongBtn.style.display = 'none';
         clearWrongBtn.style.display = 'none';
    } else {
         startQuizBtn.disabled = false;
         updateWrongAnswersList();
    }
}

startQuizBtn.addEventListener('click', () => initializeQuiz(false));
nextQuestionBtn.addEventListener('click', nextQuestion);
backToMenuBtn.addEventListener('click', showMainMenu);
clearWrongBtn.addEventListener('click', clearWrongAnswers);
reviewWrongBtn.addEventListener('click', () => initializeQuiz(true));

document.addEventListener('DOMContentLoaded', () => {
    loadWrongAnswers();
    showMainMenu();
    loadQuestions();
    quizArea.dataset.isReviewingWrong = 'false';
});