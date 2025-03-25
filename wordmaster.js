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

function checkAnswer() {
    const slots = [...document.querySelectorAll('.slot')];
    const answer = slots.map(slot => 
        slot.children[0]?.textContent || ''
    ).join('');

    if(answer === currentWord.word) {
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

// 页面加载完成后自动开始游戏
window.onload = newWord;

// 在文件开头添加
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('hide');
    }, 2000);
});