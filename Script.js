let countdownInterval = null;
let moscowInterval = null;
let timeLeftMs = 0;
let originalDurationMs = 0;
let isTimerActive = false;
let countdownStartTime = 0;

const clockElement = document.getElementById('Clock');
const dateElement = document.getElementById('Data');
const testBtn = document.getElementById('test-10s');
const ms = document.getElementById('Cloc-ms')

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
    moscowInterval = setInterval(updateMoscowTime, 10);
    isTimerActive = false;
    clockElement.className = 'Clock-Container timer-color-5';
    updateMoscowTime();
}

function stopMoscowClock() {
    if (moscowInterval) {
        clearInterval(moscowInterval);
        moscowInterval = null;
    }
    isTimerActive = true;
}

function formatTimeWithMs(totalMs) {
    const totalSeconds = Math.floor(totalMs / 1000);
    const ms = totalMs % 1000;
    
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;
}

function updateTimerColor(seconds) {
    clockElement.classList.remove(
        'timer-color-1', 'timer-color-2', 'timer-color-3', 
        'timer-color-4', 'timer-color-5'
    );
    
    if (seconds <= 5) {
        clockElement.classList.add('timer-color-1');
    } else if (seconds <= 9) {
        clockElement.classList.add('timer-color-2');
    } else if (seconds <= 19) {
        clockElement.classList.add('timer-color-3');
    } else if (seconds <= 30) {
        clockElement.classList.add('timer-color-4');
    } else {
        clockElement.classList.add('timer-color-5');
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
            width: 100vw;
            height: 100vh;
            background: #0078d7;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            margin: 0;
            padding: 0;
        `;
        document.body.appendChild(bsodOverlay);
    }
    
    if (!bsodImage) {
        bsodImage = document.createElement('img');
        bsodImage.id = 'bsod-image';
        bsodImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
        `;
        bsodOverlay.appendChild(bsodImage);
    }
    
    bsodImage.src = getBSODPath();
    bsodOverlay.classList.remove('hidden');
    bsodOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    enterFullscreen();
}

function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function startCountdown(totalSeconds) {
    if (countdownInterval) clearInterval(countdownInterval);
    if (moscowInterval) clearInterval(moscowInterval);
    
    if (totalSeconds <= 0) {
        alert('⚠️ Введите время больше 0!');
        return;
    }
    
    stopMoscowClock();
    
    originalDurationMs = totalSeconds * 1000;
    timeLeftMs = originalDurationMs;
    countdownStartTime = Date.now();
    
    testBtn.disabled = true;
    const btnTimer = document.getElementById('BtnTimer');
    if (btnTimer) btnTimer.disabled = true;
    
    updateTimerColor(totalSeconds);
    clockElement.textContent = formatTimeWithMs(timeLeftMs);
    dateElement.textContent = 'Обратный отсчёт';
    
    function updateTimer() {
        const elapsed = Date.now() - countdownStartTime;
        timeLeftMs = Math.max(0, originalDurationMs - elapsed);
        
        clockElement.textContent = formatTimeWithMs(timeLeftMs);
        updateTimerColor(Math.floor(timeLeftMs / 1000));
        
        if (timeLeftMs <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            dateElement.textContent = 'ВРЕМЯ ВЫШЛО!';
            setTimeout(showBSOD, 100);
            resetTimerUI();
            return;
        }
    }
    
    updateTimer();
    countdownInterval = setInterval(updateTimer, 10);
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
    exitFullscreen();
    document.body.style.overflow = '';
    resetTimerUI();
};

startMoscowClock();

testBtn.addEventListener('click', () => {
    if (confirm('Запустить тест на 10 секунд?')) {
        startCountdown(10);
    }
});

document.addEventListener('keydown', (e) => {
    const bsodOverlay = document.getElementById('bsod-overlay');
    if (e.key === 'Escape' && bsodOverlay && !bsodOverlay.classList.contains('hidden')) {
        exitFullscreen();
        window.resetTimer();
    }
});