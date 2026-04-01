let countdownInterval = null;
let moscowInterval = null;
let timeLeft = 0;
let originalDuration = 0;
let isTimerActive = false;

const clockElement = document.getElementById('Clock');
const dateElement = document.getElementById('Data');
const testBtn = document.getElementById('test-10s');

function updateMoscowTime() {
    const now = new Date();
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    const hours = String(moscowTime.getHours()).padStart(2, '0');
    const minutes = String(moscowTime.getMinutes()).padStart(2, '0');
    const seconds = String(moscowTime.getSeconds()).padStart(2, '0');
    const ms = String(moscowTime.getMilliseconds()).padStart(3, '0');
    
    const day = String(moscowTime.getDate()).padStart(2, '0');
    const month = String(moscowTime.getMonth() + 1).padStart(2, '0');
    const year = moscowTime.getFullYear();
    
    clockElement.textContent = `${hours}:${minutes}:${seconds}:${ms}`;
    dateElement.textContent = `${day}.${month}.${year}`;
}

function startMoscowClock() {
    if (moscowInterval) clearInterval(moscowInterval);
    updateMoscowTime();
    moscowInterval = setInterval(updateMoscowTime, 10);
    isTimerActive = false;
    
    clockElement.className = 'Clock-Container timer-color-5';
}

function stopMoscowClock() {
    if (moscowInterval) {
        clearInterval(moscowInterval);
        moscowInterval = null;
    }
    isTimerActive = true;
}

function formatTimerTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerColor(seconds) {
    clockElement.classList.remove(
        'timer-color-1', 
        'timer-color-2', 
        'timer-color-3', 
        'timer-color-4', 
        'timer-color-5'
    );
    
    if (seconds <= 5) {
        clockElement.classList.add('timer-color-1');  // Красный
    } else if (seconds <= 9) {
        clockElement.classList.add('timer-color-2');  // Оранжевый
    } else if (seconds <= 19) {
        clockElement.classList.add('timer-color-3');  // Жёлтый
    } else if (seconds <= 30) {
        clockElement.classList.add('timer-color-4');  // Светло-зелёный
    } else {
        clockElement.classList.add('timer-color-5');  // Зелёный
    }
}

function getBSODPath() {
    return 'images/bsod_win11.jpeg';
}

function showBSOD() {
    let bsodOverlay = document.getElementById('bsod-overlay');
    let bsodImage = document.getElementById('bsod-image');
    
    if (!bsodOverlay) {
        bsodOverlay = document.createElement('div');
        bsodOverlay.id = 'bsod-overlay';
        bsodOverlay.className = 'hidden';
        bsodOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0078d7;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(bsodOverlay);
    }
    
    if (!bsodImage) {
        bsodImage = document.createElement('img');
        bsodImage.id = 'bsod-image';
        bsodImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #0078d7;
        `;
        bsodOverlay.appendChild(bsodImage);
    }
    
    bsodImage.src = getBSODPath();
    bsodOverlay.classList.remove('hidden');
    bsodOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function startCountdown(totalSeconds) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    if (totalSeconds <= 0) {
        alert('Введите время больше 0!');
        return;
    }
    
    stopMoscowClock();
    
    originalDuration = totalSeconds;
    timeLeft = totalSeconds;
    
    testBtn.disabled = true;
    const btnTimer = document.getElementById('BtnTimer');
    if (btnTimer) btnTimer.disabled = true;
    
    updateTimerColor(timeLeft);
    clockElement.textContent = formatTimerTime(timeLeft);
    dateElement.textContent = 'Обратный отсчёт';
    
    function tick() {
        clockElement.textContent = formatTimerTime(timeLeft);
        
        updateTimerColor(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            dateElement.textContent = 'ВРЕМЯ ВЫШЛО!';
            setTimeout(showBSOD, 300);
            resetTimerUI();
            return;
        }
        
        timeLeft--;
    }
    
    tick();
    countdownInterval = setInterval(tick, 1000);
}

function resetTimerUI() {
    testBtn.disabled = false;
    const btnTimer = document.getElementById('BtnTimer');
    if (btnTimer) btnTimer.disabled = false;
    
    startMoscowClock();
}

window.startTimerFromModal = function(hours, minutes, seconds) {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (countdownInterval) clearInterval(countdownInterval);
    startCountdown(total);
};

window.resetTimer = function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const bsodOverlay = document.getElementById('bsod-overlay');
    if (bsodOverlay) {
        bsodOverlay.classList.add('hidden');
        bsodOverlay.style.display = 'none';
    }
    document.body.style.overflow = '';
    resetTimerUI();
};


startMoscowClock();

testBtn.addEventListener('click', () => {
    if (confirm('Запустить тест на 10 секунд?')) {
        startCountdown(10);
    }
});