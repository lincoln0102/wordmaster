const API_KEY = 'e899c8606db642c6b16ce98ff43f983e';

const wordList = [
    { number: 1, word: "one", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=one` },
    { number: 2, word: "two", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=two` },
    { number: 3, word: "three", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=three` },
    { number: 4, word: "four", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=four` },
    { number: 5, word: "five", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=five` },
    { number: 6, word: "six", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=six` },
    { number: 7, word: "seven", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=seven` },
    { number: 8, word: "eight", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=eight` },
    { number: 9, word: "nine", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=nine` },
    { number: 10, word: "ten", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=ten` },
    { number: 11, word: "eleven", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=eleven` },
    { number: 12, word: "twelve", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=twelve` },
    { number: 13, word: "thirteen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=thirteen` },
    { number: 14, word: "fourteen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=fourteen` },
    { number: 15, word: "fifteen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=fifteen` },
    { number: 16, word: "sixteen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=sixteen` },
    { number: 17, word: "seventeen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=seventeen` },
    { number: 18, word: "eighteen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=eighteen` },
    { number: 19, word: "nineteen", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=nineteen` },
    { number: 20, word: "twenty", audio: `https://api.voicerss.org/?key=${API_KEY}&hl=en-us&v=Mary&src=twenty` }
];

let currentWord = null;
let score = 0;

// 替换在线音效为本地音效
const correctSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAYAAAAAAAAABWgqf0j/////');
const wrongSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAQAAAAAAAAABWiYxGL/////');

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function resetGame() {
    score = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('feedback').innerHTML = '';
    document.body.style.background = '#FFE6F2';
    newWord();
}

function newWord() {
    currentWord = wordList[Math.floor(Math.random()*wordList.length)];
    document.getElementById('currentNumber').textContent = currentWord.number;
    document.getElementById('feedback').innerHTML = '';
    document.body.style.background = '#FFE6F2';
    setupGame();
}

function setupGame() {
    const letters = currentWord.word.split('').sort(() => Math.random()-0.5);
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

function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.textContent); }

// 添加触摸支持
let touchElement = null;

function touchStart(event) {
    event.preventDefault();
    touchElement = event.target;
    event.target.style.opacity = '0.5';
}

function touchMove(event) {
    if (!touchElement) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    touchElement.style.position = 'fixed';
    touchElement.style.left = touch.pageX - 20 + 'px';
    touchElement.style.top = touch.pageY - 20 + 'px';
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

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const targetSlot = ev.target.classList.contains('slot') ? ev.target : ev.target.parentNode;
    
    if(targetSlot.children.length === 0) {
        targetSlot.innerHTML = `<div class="letter">${data}</div>`;
        checkAnswer();
    }
}

function playCurrentWord() {
    if (currentWord && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;  // 语速稍慢一些
        speechSynthesis.speak(utterance);
    }
}

function checkAnswer() {
    const slots = [...document.querySelectorAll('.slot')];
    const answer = slots.map(slot => 
        slot.children[0]?.textContent || ''
    ).join('');

    if(answer === currentWord.word) {
        document.getElementById('feedback').innerHTML = "🎉 正确！+5分";
        document.body.style.background = "#B9F6CA";
        updateScore(5);
        
        // 播放正确音效和语音
        correctSound.play();
        
        // 等待一小段时间后播放中文语音
        setTimeout(() => {
            // 创建中文语音
            const praise = new SpeechSynthesisUtterance("你真棒");
            praise.lang = 'zh-CN';
            praise.volume = 1;
            praise.pitch = 1;
            praise.rate = 0.9;
            
            // 创建英文语音
            const wordSpeak = new SpeechSynthesisUtterance(currentWord.word);
            wordSpeak.lang = 'en-US';
            wordSpeak.volume = 1;
            wordSpeak.rate = 0.8;
            
            // 先播放中文，再播放英文
            window.speechSynthesis.speak(praise);
            window.speechSynthesis.speak(wordSpeak);
        }, 500);
        
        setTimeout(newWord, 4000);
    } else if(slots.every(s => s.children.length > 0)) {
        document.getElementById('feedback').innerHTML = "❌ 再试试~";
        document.body.style.background = "#FFCDD2";
        
        // 播放错误音效和语音
        wrongSound.play();
        
        setTimeout(() => {
            const encouragement = new SpeechSynthesisUtterance("哦哦，再试一下");
            encouragement.lang = 'zh-CN';
            encouragement.volume = 1;
            encouragement.pitch = 1;
            encouragement.rate = 0.9;
            window.speechSynthesis.speak(encouragement);
        }, 500);
        
        setTimeout(() => slots.forEach(s => s.innerHTML = ""), 2000);
    }
}

// 页面加载完成后自动开始游戏
window.onload = newWord;