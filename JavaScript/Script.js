var countdownInterval = null;
var moscowInterval = null;
var timeLeftMs = 0;
var originalDurationMs = 0;
var countdownStartTime = 0;
var isTimerRunning = false;

var clockElement = null;
var clockMsElement = null;
var dateElement = null;

function initElements() {
    clockElement = document.getElementById('Clock');
    clockMsElement = document.getElementById('Cloc-ms');
    dateElement = document.getElementById('Data');
    
    if (!clockElement || !clockMsElement || !dateElement) {
        console.error('Элементы времени не найдены!');
        return false;
    }
    return true;
}

function updateMoscowTime() {
    var now = new Date();
    var moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    var hours = String(moscowTime.getHours()).padStart(2, '0');
    var minutes = String(moscowTime.getMinutes()).padStart(2, '0');
    var seconds = String(moscowTime.getSeconds()).padStart(2, '0');
    var ms = String(moscowTime.getMilliseconds()).padStart(3, '0');
    
    var day = String(moscowTime.getDate()).padStart(2, '0');
    var month = String(moscowTime.getMonth() + 1).padStart(2, '0');
    var year = moscowTime.getFullYear();
    
    clockElement.textContent = hours + ':' + minutes + ':' + seconds;
    clockMsElement.textContent = ':' + ms;
    dateElement.textContent = day + '.' + month + '.' + year;
}

function startMoscowClock() {
    if (moscowInterval) {
        clearInterval(moscowInterval);
    }
    updateMoscowTime();
    moscowInterval = setInterval(updateMoscowTime, 10);
    
    var clockContainer = clockElement.parentElement;
    if (clockContainer) {
        clockContainer.className = 'Clock-Container';
    }
}

function stopMoscowClock() {
    if (moscowInterval) {
        clearInterval(moscowInterval);
        moscowInterval = null;
    }
}

function formatTimeWithMs(totalMs) {
    var totalSeconds = Math.floor(totalMs / 1000);
    var ms = totalMs % 1000;
    
    var hrs = Math.floor(totalSeconds / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;
    
    return {
        time: String(hrs).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0'),
        ms: ':' + String(ms).padStart(3, '0')
    };
}

function updateTimerColor(seconds) {
    var clockContainer = clockElement.parentElement;
    if (!clockContainer) return;
    

    clockContainer.classList.remove(
        'timer-color-1', 
        'timer-color-2', 
        'timer-color-3', 
        'timer-color-4', 
        'timer-color-5'
    );
    
    if (seconds <= 5) {
        clockContainer.classList.add('timer-color-1');
    } 
    else if (seconds <= 9) {
        clockContainer.classList.add('timer-color-2');
    } 
    else if (seconds <= 19) {
        clockContainer.classList.add('timer-color-3');
    } 
    else if (seconds <= 30) {

        clockContainer.classList.add('timer-color-4');
    } 
    else {

        clockContainer.classList.add('timer-color-5');
    }
}

function getBSODPath() {
    return 'images/bsod_win11.jpeg';
}

function showBSOD() {
    var bsodOverlay = document.getElementById('bsod-overlay');
    var bsodImage = document.getElementById('bsod-image');
    
    if (!bsodOverlay) {
        bsodOverlay = document.createElement('div');
        bsodOverlay.id = 'bsod-overlay';
        bsodOverlay.className = 'hidden';
        bsodOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0078d7;display:flex;justify-content:center;align-items:center;z-index:9999;margin:0;padding:0;';
        document.body.appendChild(bsodOverlay);
    }
    
    if (!bsodImage) {
        bsodImage = document.createElement('img');
        bsodImage.id = 'bsod-image';
        bsodImage.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;';
        bsodOverlay.appendChild(bsodImage);
    }
    
    bsodImage.src = getBSODPath();
    bsodOverlay.classList.remove('hidden');
    bsodOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    enterFullscreen();
}

function enterFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(function() {});
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(function() {});
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

// ===== ТАЙМЕР С МИЛЛИСЕКУНДАМИ =====
function startCountdown(totalSeconds) {
    if (countdownInterval) clearInterval(countdownInterval);
    if (moscowInterval) clearInterval(moscowInterval);
    
    if (totalSeconds <= 0) {
        alert('Введите время больше 0!');
        return;
    }
    
    stopMoscowClock();
    
    originalDurationMs = totalSeconds * 1000;
    timeLeftMs = originalDurationMs;
    countdownStartTime = Date.now();
    isTimerRunning = true;
    
    var formatted = formatTimeWithMs(timeLeftMs);
    clockElement.textContent = formatted.time;
    clockMsElement.textContent = formatted.ms;
    updateTimerColor(totalSeconds);
    dateElement.textContent = 'Обратный отсчёт';
    
    function updateTimer() {
        var elapsed = Date.now() - countdownStartTime;
        timeLeftMs = Math.max(0, originalDurationMs - elapsed);
        
        var formatted = formatTimeWithMs(timeLeftMs);
        clockElement.textContent = formatted.time;
        clockMsElement.textContent = formatted.ms;
        updateTimerColor(Math.floor(timeLeftMs / 1000));
        
        if (timeLeftMs <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            isTimerRunning = false;
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
    startMoscowClock();
}

window.startTimerFromModal = function(hours, minutes, seconds) {
    var total = hours * 3600 + minutes * 60 + seconds;
    if (countdownInterval) clearInterval(countdownInterval);
    startCountdown(total);
};

window.resetTimer = function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    var bsodOverlay = document.getElementById('bsod-overlay');
    if (bsodOverlay) {
        bsodOverlay.classList.add('hidden');
        bsodOverlay.style.display = 'none';
    }
    exitFullscreen();
    document.body.style.overflow = '';
    isTimerRunning = false;
    resetTimerUI();
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка страницы...');
    
    if (!initElements()) {
        console.error('Ошибка инициализации');
        return;
    }
    
    console.log('Элементы найдены');
    startMoscowClock();
    
    var btn10s = document.getElementById('test-10s');
    if (btn10s) {
        btn10s.addEventListener('click', function() {
            if (!isTimerRunning && confirm('Запустить тест на 10 секунд?')) {
                startCountdown(10);
            }
        });
        console.log('Кнопка #test-10s привязана');
    }
    
    var btn1min = document.getElementById('test-1min');
    if (btn1min) {
        btn1min.addEventListener('click', function() {
            if (!isTimerRunning && confirm('Запустить тест на 1 минуту?')) {
                startCountdown(60);
            }
        });
        console.log('Кнопка #test-1min привязана');
    }
    
    var btn10min = document.getElementById('test-10min');
    if (btn10min) {
        btn10min.addEventListener('click', function() {
            if (!isTimerRunning && confirm('Запустить тест на 10 минут?')) {
                startCountdown(600);
            }
        });
        console.log('Кнопка #test-10min привязана');
    }
});

document.addEventListener('keydown', function(e) {
    var bsodOverlay = document.getElementById('bsod-overlay');
    if (e.key === 'Escape' && bsodOverlay && !bsodOverlay.classList.contains('hidden')) {
        exitFullscreen();
        window.resetTimer();
    }
});