document.addEventListener('DOMContentLoaded', () => {

    const clockDiv = document.getElementById('Сlock');
    const dataDiv = document.getElementById('Data');
    const testBtn = document.querySelector('button');

    if (!clockDiv || !dataDiv) {
        console.error('Элементы #clock или #Data не найдены');
        return;
    }

    const controlPanel = document.createElement('div');
    controlPanel.style.margin = '20px 0';
    controlPanel.style.display = 'flex';
    controlPanel.style.gap = '10px';
    controlPanel.style.flexWrap = 'wrap';
    controlPanel.style.justifyContent = 'center';

    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.value = new Date(new Date().getFullYear() + 1, 0, 1, 0, 0).toISOString().slice(0, 16);

    const setDateBtn = document.createElement('button');
    setDateBtn.textContent = 'Установить дату';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Сброс (часы)';

    controlPanel.appendChild(dateInput);
    controlPanel.appendChild(setDateBtn);
    controlPanel.appendChild(resetBtn);
    document.querySelector('main').appendChild(controlPanel);

    // Переменные
    let targetTime = null;
    let timerInterval = null;
    let isTimerActive = false;

    const pad = (num) => num.toString().padStart(2, '0');

    function updateColorBySeconds(secondsLeft) {
        if (!clockDiv) return;
        let color = '';
        if (secondsLeft <= 5) {
            color = '#D32F2F';
        } else if (secondsLeft <= 9) {
            color = '#F57C00';
        } else if (secondsLeft <= 19) {
            color = '#ffb300';
        } else if (secondsLeft <= 30) {
            color = '#AED581';
        } else {
            color = '#388E3C';
        }
        clockDiv.style.color = color;
    }

    function updateTimer() {
        if (!targetTime) return;

        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {
            stopTimer();
            clockDiv.textContent = '00:00:00';
            updateColorBySeconds(0);
            dataDiv.textContent = '00.00.0000';
            alert('⏰ Время истекло!');
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        clockDiv.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        updateColorBySeconds(totalSeconds);
    }

    function startTimer() {
        stopTimer();
        if (!targetTime) return;
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        isTimerActive = true;
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isTimerActive = false;
    }

    function setTargetFromPicker() {
        const dateStr = dateInput.value;
        if (!dateStr) return;
        const newTarget = new Date(dateStr);
        if (isNaN(newTarget)) {
            alert('Некорректная дата');
            return;
        }
        targetTime = newTarget;
        const day = pad(targetTime.getDate());
        const month = pad(targetTime.getMonth() + 1);
        const year = targetTime.getFullYear();
        dataDiv.textContent = `${day}.${month}.${year}`;
        startTimer();
    }

    function test10Seconds() {
        targetTime = new Date(Date.now() + 10000);
        const day = pad(targetTime.getDate());
        const month = pad(targetTime.getMonth() + 1);
        const year = targetTime.getFullYear();
        dataDiv.textContent = `${day}.${month}.${year}`;
        startTimer();
        dateInput.value = targetTime.toISOString().slice(0, 16);
    }

    function resetToRealTime() {
        stopTimer();
        targetTime = null;
        isTimerActive = false;
        updateRealTime();
        if (!realTimeInterval) startRealTime();
        dataDiv.textContent = '--.--.----';
        clockDiv.style.color = '';
    }

    let realTimeInterval = null;
    function updateRealTime() {
        const now = new Date();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        clockDiv.textContent = `${hours}:${minutes}:${seconds}`;
        clockDiv.style.color = 'white';
    }
    function startRealTime() {
        if (realTimeInterval) clearInterval(realTimeInterval);
        updateRealTime();
        realTimeInterval = setInterval(updateRealTime, 1000);
    }
    function stopRealTime() {
        if (realTimeInterval) {
            clearInterval(realTimeInterval);
            realTimeInterval = null;
        }
    }

    startRealTime();


    if (testBtn) testBtn.addEventListener('click', test10Seconds);
    setDateBtn.addEventListener('click', setTargetFromPicker);
    resetBtn.addEventListener('click', resetToRealTime);
});