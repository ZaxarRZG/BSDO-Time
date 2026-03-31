let countdownInterval = null;
let moscowInterval = null;
let timeLeft = 0;
let originalDuration = 0;
let isTimerActive = false;

const clockElement = document.getElementById('Clock');
const dateElement = document.getElementById('Data');
const testBtn = document.getElementById('test-10s');
const bsodOverlay = document.getElementById('bsod-overlay');
const bsodImage = document.getElementById('bsod-image');

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

function getBSODPath() {
    return 'images/bsod-win11.png';
}

function showBSOD() {
    bsodImage.src = getBSODPath();
    bsodOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}


function startCountdown(totalSeconds) {

    if (countdownInterval) clearInterval(countdownInterval);
    
    if (totalSeconds <= 0) {
        alert('⚠️ Введите время больше 0!');
        return;
    }
    
    
    stopMoscowClock();
    
    originalDuration = totalSeconds;
    timeLeft = totalSeconds;
    
    testBtn.disabled = true;
    const btnTimer = document.getElementById('BtnTimer');
    if (btnTimer) btnTimer.disabled = true;
    
    clockElement.textContent = formatTimerTime(timeLeft);
    dateElement.textContent = 'Обратный отсчёт';
    
    function tick() {
        clockElement.textContent = formatTimerTime(timeLeft);
        
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
    bsodOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    resetTimerUI();
};

startMoscowClock();

testBtn.addEventListener('click', () => {
    if (confirm('Запустить тест на 10 секунд?')) {
        startCountdown(10);
    }
});