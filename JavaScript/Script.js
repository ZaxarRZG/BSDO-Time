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
    clockMsElement = document.getElementById('ClocMs');
    dateElement = document.getElementById('Data');
    
    if (!clockElement || !clockMsElement || !dateElement) {
        console.error('Элементы времени не найдены!');
        return false;
    }
    return true;
}

function updateMoscowTime() {
    var now = new Date();
    
    var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    var moscowTime = new Date(utc + (3600000 * 3));
    
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
    
    //  console.log('МС:', ms);
     
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

// ===== ОПРЕДЕЛЕНИЕ ВЕРСИИ WINDOWS =====
function detectWindowsVersion() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    console.log('🔍 User Agent:', userAgent);
    
    // Windows 11 (NT 10.0 + Win64)
    if (/Windows NT 10\.0/.test(userAgent)) {
        if (/Win64/.test(userAgent) || /WOW64/.test(userAgent)) {
            console.log('🪟 Обнаружена Windows 10/11 (64-bit)');
            // Дополнительные проверки для Win11
            if (navigator.userAgentData && navigator.userAgentData.platformVersion) {
                var platformVersion = navigator.userAgentData.platformVersion;
                if (parseFloat(platformVersion) >= 13) {
                    console.log('✅ Windows 11 подтверждена');
                    return 'win11';
                }
            }
            // По умолчанию считаем Win11 для 64-bit систем
            return 'win11';
        }
        console.log('✅ Windows 10 подтверждена');
        return 'win10';
    }
    
    // Старые версии Windows
    if (/Windows NT 6\.[1-3]/.test(userAgent)) {
        console.log('🪟 Старая версия Windows');
        return 'win10'; // Используем win10.html
    }
    
    // Не Windows
    console.log('❌ Не Windows или не определено');
    return 'win10'; // По умолчанию
}

// ===== ПОЛУЧЕНИЕ ПУТИ К BSOD =====
function getBSODPath() {
    var os = detectWindowsVersion();
    var path = 'BSOD/' + os + '.html';
    console.log('📁 Путь к BSOD:', path);
    return path;
}
// ===== ПОКАЗ BSOD =====
function showBSOD() {
    console.log('💥 Показ BSOD...');
    
    var bsodOverlay = document.getElementById('bsod-overlay');
    
    // Создаём overlay если нет
    if (!bsodOverlay) {
        bsodOverlay = document.createElement('div');
        bsodOverlay.id = 'bsod-overlay';
        bsodOverlay.className = 'hidden';
        bsodOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999;margin:0;padding:0;overflow:hidden;';
        document.body.appendChild(bsodOverlay);
    }
    
    // Очищаем содержимое
    bsodOverlay.innerHTML = '';
    
    // Создаём iframe для загрузки HTML файла
    var iframe = document.createElement('iframe');
    iframe.src = getBSODPath();
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.id = 'bsod-iframe';
    iframe.allowFullscreen = true;
    
    bsodOverlay.appendChild(iframe);
    
    // Показываем overlay
    bsodOverlay.classList.remove('hidden');
    bsodOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Включаем полный экран
    setTimeout(function() {
        enterFullscreen();
    }, 100);
    
    console.log('✅ BSOD показан');
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
                                closeModal();
                startCountdown(10);
            }
        });
        console.log('Кнопка #test-10s привязана');
    }
    
    var btn1min = document.getElementById('test-1min');
    if (btn1min) {
        btn1min.addEventListener('click', function() {
            if (!isTimerRunning && confirm('Запустить тест на 1 минуту?')) {
                                closeModal();
                startCountdown(60);
            }
        });
        console.log('Кнопка #test-1min привязана');
    }
    
    var btn10min = document.getElementById('test-10min');
    if (btn10min) {
        btn10min.addEventListener('click', function() {
            if (!isTimerRunning && confirm('Запустить тест на 10 минут?')) {
                                closeModal();
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

function closeModal() {
    var modal = document.getElementById('ModalOverlay');
    if (modal) {
        modal.classList.remove('active');

    }
}



// const clockEl = document.getElementById('clock');

// function updateClock() {
//   const now = new Date();
  
//   // Форматируем: ЧЧ:ММ:СС.мс
//   const timeStr = now.toLocaleTimeString('ru-RU', {
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

//   // Обновляем DOM только если текст реально изменился
//   if (clockEl.textContent !== timeStr) {
//     clockEl.textContent = timeStr;
//   }
// }

// // Обновляем каждые 10мс (достаточно для плавного отображения мс)
// setInterval(updateClock, 10);
// updateClock(); // Первый вызов сразу