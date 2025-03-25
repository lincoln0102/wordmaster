let currentWord = null;
let score = 0;
let streak = 0;
let mistakesList = [];

// 音效
const correctSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAYAAAAAAAAABWgqf0j/////');
const wrongSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAQAAAAAAAAABWiYxGL/////');

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function updateStreak(correct) {
    if (correct) {
        streak++;
    } else {
        streak = 0;
    }
    document.getElementById('streak').textContent = streak;
}

function newWord() {
    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    document.getElementById('currentWord').textContent = '?????';
    document.getElementById('phonetic').textContent = currentWord.phonetic;
    document.getElementById('meaning').textContent = currentWord.meaning;
    document.getElementById('memoryTip').textContent = currentWord.memoryTip;
    document.getElementById('feedback').innerHTML = '';
    setupGame();
}

function setupGame() {
    const letters = currentWord.word.split('').sort(() => Math.random() - 0.5);
    const slots = document.getElementById('slots');
    const letterContainer = document.getElementById('letters');
    
    slots.innerHTML = letters.map(() => 
        `<div class="slot" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`
    ).join('');
    
    letterContainer.innerHTML = letters.map(letter => 
        `<div class="letter" draggable="true" ondragstart="drag(event)" 
              ontouchstart="touchStart(event)" ontouchmove="touchMove(event)" 
              ontouchend="touchEnd(event)">${letter}</div>`
    ).join('');
}

function playCurrentWord() {
    if (currentWord && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function showHint() {
    document.getElementById('currentWord').textContent = currentWord.word;
    setTimeout(() => {
        document.getElementById('currentWord').textContent = '?????';
    }, 1000);
}

function reviewMistakes() {
    if (mistakesList.length > 0) {
        currentWord = mistakesList.shift();
        document.getElementById('currentWord').textContent = '?????';
        document.getElementById('phonetic').textContent = currentWord.phonetic;
        document.getElementById('meaning').textContent = currentWord.meaning;
        document.getElementById('memoryTip').textContent = currentWord.memoryTip;
        document.getElementById('feedback').innerHTML = '复习模式';
        setupGame();
    } else {
        document.getElementById('feedback').innerHTML = '没有需要复习的单词';
    }
}

// 触摸支持
let touchElement = null;

function touchStart(event) {
    event.preventDefault();
    touchElement = event.target;
    touchElement.style.opacity = '0.5';
}

function touchMove(event) {
    if (!touchElement) return;
    event.preventDefault();
    const touch = event.touches[0];
    touchElement.style.position = 'fixed';
    touchElement.style.left = touch.pageX - 25 + 'px';
    touchElement.style.top = touch.pageY - 25 + 'px';
    touchElement.style.zIndex = '1000';
}

function touchEnd(event) {
    if (!touchElement) return;
    
    const slots = document.querySelectorAll('.slot');
    const touch = event.changedTouches[0];
    let dropped = false;
    
    slots.forEach(slot => {
        const rect = slot.getBoundingClientRect();
        if (touch.pageX >= rect.left && touch.pageX <= rect.right &&
            touch.pageY >= rect.top && touch.pageY <= rect.bottom &&
            slot.children.length === 0) {
            slot.innerHTML = `<div class="letter">${touchElement.textContent}</div>`;
            touchElement.remove();
            dropped = true;
            checkAnswer();
        }
    });
    
    if (!dropped) {
        touchElement.style.position = '';
        touchElement.style.opacity = '1';
    }
    touchElement = null;
}

function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.textContent); }

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const targetSlot = ev.target.classList.contains('slot') ? ev.target : ev.target.parentNode;
    
    if(targetSlot.children.length === 0) {
        targetSlot.innerHTML = `<div class="letter">${data}</div>`;
        checkAnswer();
    }
}

// 在文件开头添加新的状态变量
let statistics = {
    totalLearned: 0,
    correctRate: 0,
    totalAttempts: 0,
    successfulAttempts: 0,
    learnedWords: [],
    lastStudyDate: null
};

let reviewSchedule = {
    intervals: [1, 2, 4, 7, 15, 30],
    words: {}
};

// 加载保存的进度
window.addEventListener('load', () => {
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        score = progress.score || 0;
        streak = progress.streak || 0;
        mistakesList = progress.mistakesList || [];
        statistics = progress.statistics || statistics;
        reviewSchedule = progress.reviewSchedule || reviewSchedule;
        
        // 更新显示
        document.getElementById('score').textContent = score;
        document.getElementById('streak').textContent = streak;
        document.getElementById('totalLearned').textContent = statistics.totalLearned;
        document.getElementById('correctRate').textContent = statistics.correctRate + '%';
    }
    
    // 每小时检查一次需要复习的单词
    setInterval(checkReviewWords, 60 * 60 * 1000);
    checkReviewWords(); // 立即检查一次
});

// 保存进度
function saveProgress() {
    const progress = {
        score,
        streak,
        mistakesList,
        statistics,
        reviewSchedule
    };
    localStorage.setItem('learningProgress', JSON.stringify(progress));
}

// 检查需要复习的单词
function checkReviewWords() {
    const now = new Date().getTime();
    const wordsToReview = [];
    
    for (let word in reviewSchedule.words) {
        if (now >= reviewSchedule.words[word].nextReview) {
            wordsToReview.push(word);
        }
    }
    
    if (wordsToReview.length > 0) {
        document.getElementById('reviewMistakes').textContent = 
            `复习(${wordsToReview.length})`;
    }
}

// 修改 checkAnswer 函数
function checkAnswer() {
    const slots = [...document.querySelectorAll('.slot')];
    const answer = slots.map(slot => 
        slot.children[0]?.textContent || ''
    ).join('');

    statistics.totalAttempts++;
    
    if(answer === currentWord.word) {
        // 更新统计
        statistics.successfulAttempts++;
        statistics.correctRate = (statistics.successfulAttempts / statistics.totalAttempts * 100).toFixed(1);
        if (!statistics.learnedWords.includes(currentWord.word)) {
            statistics.totalLearned++;
            statistics.learnedWords.push(currentWord.word);
        }
        
        // 更新复习计划
        const now = new Date().getTime();
        const wordSchedule = reviewSchedule.words[currentWord.word] || { stage: 0 };
        const nextStage = Math.min(wordSchedule.stage + 1, reviewSchedule.intervals.length - 1);
        reviewSchedule.words[currentWord.word] = {
            nextReview: now + reviewSchedule.intervals[nextStage] * 24 * 60 * 60 * 1000,
            stage: nextStage
        };
        
        // 更新显示
        document.getElementById('totalLearned').textContent = statistics.totalLearned;
        document.getElementById('correctRate').textContent = statistics.correctRate + '%';
        
        // 保存进度
        saveProgress();
        
        // 原有的正确答案处理代码
        document.getElementById('feedback').innerHTML = "🎉 太棒了！";
        document.getElementById('currentWord').textContent = currentWord.word;
        
        correctSound.play()
            .then(() => {
                const praise = new SpeechSynthesisUtterance("你真棒");
                praise.lang = 'zh-CN';
                praise.volume = 1;
                praise.rate = 1;
                speechSynthesis.speak(praise);
                
                setTimeout(() => {
                    const wordSpeak = new SpeechSynthesisUtterance(currentWord.word);
                    wordSpeak.lang = 'en-US';
                    wordSpeak.rate = 0.8;
                    speechSynthesis.speak(wordSpeak);
                }, 1000);
            });
            
        updateScore(5 * currentWord.difficulty);
        updateStreak(true);
        setTimeout(newWord, 3000);
    } else if(slots.every(s => s.children.length > 0)) {
        // 原有的错误答案处理代码保持不变
        document.getElementById('feedback').innerHTML = "❌ 再试试~";
        wrongSound.play()
            .then(() => {
                const encouragement = new SpeechSynthesisUtterance("加油，再试一次");
                encouragement.lang = 'zh-CN';
                encouragement.rate = 1;
                speechSynthesis.speak(encouragement);
            });
        
        if (!mistakesList.includes(currentWord)) {
            mistakesList.push(currentWord);
        }
        updateStreak(false);
        setTimeout(() => slots.forEach(s => s.innerHTML = ""), 1500);
    }
}

// 修改 reviewMistakes 函数
function reviewMistakes() {
    const now = new Date().getTime();
    const wordsToReview = [];
    
    // 合并错误单词和需要复习的单词
    for (let word in reviewSchedule.words) {
        if (now >= reviewSchedule.words[word].nextReview) {
            const wordData = wordList.find(w => w.word === word);
            if (wordData) wordsToReview.push(wordData);
        }
    }
    wordsToReview.push(...mistakesList);
    
    if (wordsToReview.length > 0) {
        currentWord = wordsToReview[0];
        document.getElementById('currentWord').textContent = '?????';
        document.getElementById('phonetic').textContent = currentWord.phonetic;
        document.getElementById('meaning').textContent = currentWord.meaning;
        document.getElementById('memoryTip').textContent = currentWord.memoryTip;
        document.getElementById('feedback').innerHTML = '复习模式';
        setupGame();
    } else {
        document.getElementById('feedback').innerHTML = '没有需要复习的单词';
    }
}

// 页面加载完成后自动开始游戏
window.onload = newWord;

// 在文件开头添加
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('hide');
    }, 2000);
});


function showImportDialog() {
    document.getElementById('importDialog').style.display = 'block';
}

function closeImportDialog() {
    document.getElementById('importDialog').style.display = 'none';
}

// 百度翻译 API 配置
const BAIDU_APP_ID = '20250325002314365';
const BAIDU_KEY = 'OUQbS1aNR0HQFYWilaAH';

// 生成百度翻译 API 签名
function generateSign(query, salt) {
    const str = BAIDU_APP_ID + query + salt + BAIDU_KEY;
    return CryptoJS.MD5(str).toString();
}

// 修改百度翻译 API 的请求地址和参数
// 修改翻译函数
async function translateToZh(text) {
    const salt = Date.now().toString();
    const sign = generateSign(text, salt);
    
    try {
        const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `q=${encodeURIComponent(text)}&from=en&to=zh&appid=${BAIDU_APP_ID}&salt=${salt}&sign=${sign}`
        });
        
        const data = await response.json();
        console.log('百度翻译结果:', data);
        
        if (data.error_code) {
            console.error('翻译错误:', data.error_msg);
            return text;
        }
        
        return data.trans_result?.[0]?.dst || text;
    } catch (e) {
        console.error('翻译请求失败:', e);
        return text;
    }
}

// 修改获取单词信息的函数
async function fetchWordInfo(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        
        if (data && data[0]) {
            const wordInfo = data[0];
            const englishMeaning = wordInfo.meanings[0]?.definitions[0]?.definition || '';
            
            // 确保英文释义不为空再进行翻译
            let chineseMeaning = '';
            if (englishMeaning) {
                chineseMeaning = await translateToZh(englishMeaning);
                console.log('英文释义:', englishMeaning);
                console.log('中文翻译:', chineseMeaning);
            }
            
            return {
                word: word,
                phonetic: wordInfo.phonetic || wordInfo.phonetics[0]?.text || '',
                meaning: chineseMeaning || englishMeaning,
                memoryTip: `记忆提示：${word} - ${chineseMeaning || englishMeaning}`,
                difficulty: Math.min(Math.ceil(word.length / 3), 5)
            };
        }
    } catch (e) {
        console.error('获取单词信息失败:', word, e);
    }
    return null;
}

// 修改导入函数
// 删除重复的 importWords 函数，只保留这一个版本
async function importWords() {
    const input = document.getElementById('wordInput').value;
    const words = input.split('\n')
        .filter(line => line.trim())
        .map(line => line.split(',')[0].trim().toLowerCase());

    document.getElementById('feedback').innerHTML = '正在获取单词信息...';
    
    const newWords = [];
    for (const word of words) {
        document.getElementById('feedback').innerHTML = 
            `正在处理：${word}（${newWords.length + 1}/${words.length}）`;
        const wordInfo = await fetchWordInfo(word);
        if (wordInfo) {
            newWords.push(wordInfo);
        }
    }

    // 更新全局 wordList
    newWords.forEach(word => {
        if (!wordList.some(w => w.word === word.word)) {
            wordList.push(word);
        }
    });

    // 保存到 localStorage
    localStorage.setItem('customWords', JSON.stringify(wordList));
    
    // 关闭弹窗并显示提示
    closeImportDialog();
    document.getElementById('feedback').innerHTML = 
        `✅ 成功导入 ${newWords.length} 个单词`;
    
    // 清空输入框
    document.getElementById('wordInput').value = '';
}

// 修改加载逻辑
window.addEventListener('load', async () => {
    // 先加载默认词库
    try {
        const response = await fetch('wordlist.js');
        const text = await response.text();
        const match = text.match(/const\s+wordList\s*=\s*(\[[\s\S]*\])/);
        if (match) {
            wordList = JSON.parse(match[1]);
        }
    } catch (e) {
        console.error('加载默认词库失败:', e);
        wordList = [];
    }

    // 加载自定义单词
    const savedWords = localStorage.getItem('customWords');
    if (savedWords) {
        const customWords = JSON.parse(savedWords);
        // 合并单词列表，避免重复
        customWords.forEach(word => {
            if (!wordList.some(w => w.word === word.word)) {
                wordList.push(word);
            }
        });
    }

    // 加载其他保存的进度
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        score = progress.score || 0;
        streak = progress.streak || 0;
        mistakesList = progress.mistakesList || [];
        statistics = progress.statistics || statistics;
        reviewSchedule = progress.reviewSchedule || reviewSchedule;
        
        // 更新显示
        document.getElementById('score').textContent = score;
        document.getElementById('streak').textContent = streak;
        document.getElementById('totalLearned').textContent = statistics.totalLearned;
        document.getElementById('correctRate').textContent = statistics.correctRate + '%';
    }
    
    // 开始游戏
    newWord();
});


// 有道翻译 API 配置
const YOUDAO_APP_KEY = 'rUZqTMQ8wmxQOu021d1HY6piWxsWa2M4';

// 修改翻译函数
async function translateToZh(text) {
    try {
        const response = await fetch(`https://openapi.youdao.com/api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                q: text,
                from: 'en',
                to: 'zh-CHS',
                appKey: YOUDAO_APP_KEY,
                salt: Date.now(),
                sign: generateSign(text, YOUDAO_APP_KEY),
                signType: 'v3'
            })
        });
        
        const data = await response.json();
        console.log('有道翻译结果:', data);
        
        if (data.errorCode === '0' && data.translation && data.translation[0]) {
            return data.translation[0];
        } else {
            console.error('翻译错误:', data.errorCode);
            return text;
        }
    } catch (e) {
        console.error('翻译请求失败:', e);
        return text;
    }
}

// 生成有道翻译 API 签名
function generateSign(text, appKey) {
    const input = text.length <= 20 ? text : text.substring(0, 10) + text.length + text.substring(text.length - 10);
    const salt = Date.now();
    const curtime = Math.round(salt / 1000);
    const str = appKey + input + salt + curtime;
    return CryptoJS.SHA256(str).toString();
}