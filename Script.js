document.addEventListener('DOMContentLoaded', () => {

    const realTimeDiv = document.getElementById('real-time');
    const targetDateInput = document.getElementById('target-date');
    const setTargetBtn = document.getElementById('set-target');
    const test10sBtn = document.getElementById('test-10s');
    const resetTimerBtn = document.getElementById('reset-timer');
    const countdownDiv = document.getElementById('countdown');
    const targetDateDisplay = document.getElementById('target-date-display');
    const bsodOverlay = document.getElementById('bsod-overlay');


    let targetTime = null;
    let countdownInterval = null;
    let realTimeInterval = null;


    const pad = (num) => num.toString().padStart(2, '0');

    function updateRealTime() {
        const now = new Date();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        realTimeDiv.textContent = `${hours}:${minutes}:${seconds}`;
    }


    function startRealTime() {
        updateRealTime();
        if (realTimeInterval) clearInterval(realTimeInterval);
        realTimeInterval = setInterval(updateRealTime, 1000);
    }


    function updateColorBySeconds(secondsLeft) {
        if (!countdownDiv) return;
        let colorVar = '';
        if (secondsLeft <= 5) {
            colorVar = 'var(--strength-1)'; // красный
        } else if (secondsLeft <= 9) {
            colorVar = 'var(--strength-2)'; // оранжевый
        } else if (secondsLeft <= 19) {
            colorVar = 'var(--strength-3)'; // жёлтый
        } else if (secondsLeft <= 30) {
            colorVar = 'var(--strength-4)'; // салатовый
        } else {
            colorVar = 'var(--strength-5)'; // зелёный
        }
        countdownDiv.style.color = colorVar;
    }

    function updateCountdown() {
        if (!targetTime) {
            countdownDiv.textContent = '-- : -- : -- : --';
            targetDateDisplay.textContent = '';
            return;
        }

        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {
            stopCountdown();
            showBSOD();
            countdownDiv.textContent = '00 : 00 : 00 : 00';
            updateColorBySeconds(0);
            targetDateDisplay.textContent = '';
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownDiv.textContent = `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
        updateColorBySeconds(totalSeconds);
    }

    function startCountdown() {
        stopCountdown();
        if (!targetTime) return;
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    function setTargetFromPicker() {
        const dateStr = targetDateInput.value;
        if (!dateStr) return;
        const newTarget = new Date(dateStr);
        if (isNaN(newTarget)) {
            alert('Пожалуйста, выберите корректную дату и время');
            return;
        }
        targetTime = newTarget;

        const formattedDate = targetTime.toLocaleString('ru-RU');
        targetDateDisplay.textContent = `Цель: ${formattedDate}`;
        startCountdown();

        hideBSOD();
    }


    function setTest10s() {
        targetTime = new Date(Date.now() + 10000);
        targetDateDisplay.textContent = `Цель: через 10 секунд (${targetTime.toLocaleString('ru-RU')})`;
        startCountdown();
        hideBSOD();
  
        targetDateInput.value = targetTime.toISOString().slice(0, 16);
    }

   
    function resetTimer() {
        targetTime = null;
        stopCountdown();
        countdownDiv.textContent = '-- : -- : -- : --';
        updateColorBySeconds(0);
        targetDateDisplay.textContent = '';
        targetDateInput.value = '';
        hideBSOD();
    }


    function showBSOD() {
        if (bsodOverlay) {
            bsodOverlay.classList.remove('hidden');
        }
    }

    function hideBSOD() {
        if (bsodOverlay) {
            bsodOverlay.classList.add('hidden');
        }
    }


    setTargetBtn.addEventListener('click', setTargetFromPicker);
    test10sBtn.addEventListener('click', setTest10s);
    resetTimerBtn.addEventListener('click', resetTimer);

    bsodOverlay.addEventListener('click', hideBSOD);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bsodOverlay && !bsodOverlay.classList.contains('hidden')) {
            hideBSOD();
        }
    });


    startRealTime();

    
    resetTimer();
});