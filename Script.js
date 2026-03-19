document.addEventListener('DOMcontentLoaded', function() {

const DateTimerPicker = document.getElementById('datetime-picker');
const SetTimerBtn = document.getElementById('set-timer');
const Test10sBtn = document.getElementById('test-10s');
const ResetBsodBtn = document.getElementById('reset-bsod');
const BsodScreen = document.getElementById('bsod-screen');

const DaysSpan = document.getElementById('days');
const HoursSpan = document.getElementById('hours');
const MinuteSpan = document.getElementById('minute');
const SecondSpan = document.getElementById('seconds');

let TargetTime = null;
let TimerInterval = null;
let BsodActive = false;

const Now = new Date();
const NextYear = now.getFullYear() + 1;
const NewYear = new Date (nextYear, 0, 0, 0, 0);
DetetimePicker.value = newYear

function UpdateTimer() {
    if (!TargetTime) return; 
document.addEventListener('DOMContentLoaded', function() {

    const datetimePicker = document.getElementById('datetime-picker'); 
    const setTimerBtn = document.getElementById('set-timer');
    const test10sBtn = document.getElementById('test-10s');
    const resetBsodBtn = document.getElementById('reset-bsod');
    const bsodScreen = document.getElementById('bsod-screen');
    
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');


    let targetTime = null;
    let timerInterval = null;
    let bsodActive = false;

   
    const now = new Date();
    const nextYear = now.getFullYear() + 1;
    const newYear = new Date(nextYear, 0, 1, 0, 0); 
    datetimePicker.value = newYear.toISOString().slice(0, 16);


    function updateTimer() {
        if (!targetTime) return;
        
        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {

            stopTimer();
            showBSOD();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysSpan.textContent = days.toString().padStart(2, '0');
        hoursSpan.textContent = hours.toString().padStart(2, '0');
        minutesSpan.textContent = minutes.toString().padStart(2, '0');
        secondsSpan.textContent = seconds.toString().padStart(2, '0');
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer() {
        stopTimer();
        if (targetTime && targetTime > new Date()) {
            timerInterval = setInterval(updateTimer, 1000);
            updateTimer();
        } else if (targetTime && targetTime <= new Date()) {
            showBSOD();
        }
    }

    function showBSOD() {
        if (bsodActive) return;
        bsodActive = true;
        bsodScreen.classList.remove('hidden');
        stopTimer();
    }

    function hideBSOD() {
        bsodActive = false;
        bsodScreen.classList.add('hidden');

        if (targetTime && targetTime > new Date()) {
            startTimer();
        } else {

            daysSpan.textContent = '00';
            hoursSpan.textContent = '00';
            minutesSpan.textContent = '00';
            secondsSpan.textContent = '00';
        }
    }


    function setTimerFromPicker() {
        const dateStr = datetimePicker.value;
        if (!dateStr) return;
        targetTime = new Date(dateStr);
        if (isNaN(targetTime)) {
            alert('Пожалуйста, выберите корректную дату и время');
            return;
        }
        if (bsodActive) {
            hideBSOD();
        }
        startTimer();
    }



    function resetBSOD() {
        if (bsodActive) {
            hideBSOD();
        } else {
            const now = new Date();
            const nextYear = now.getFullYear() + 1;
            const newYear = new Date(nextYear, 0, 1, 0, 0);
            targetTime = newYear;
            datetimePicker.value = newYear.toISOString().slice(0, 16);
            startTimer();
        }
    }


    setTimerBtn.addEventListener('click', setTimerFromPicker);
    test10sBtn.addEventListener('click', setTest10s);
    resetBsodBtn.addEventListener('click', resetBSOD);


    bsodScreen.addEventListener('click', function() {
        hideBSOD();
    });


    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bsodActive) {
            hideBSOD();
        }
    });


    setTimerFromPicker();
});

    const now = new Date();
    const diff = TargetTime - now;

    if (diff <= 0) {

        stopTimer();
        showBSOD();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysSpan.textcontent = days.toString().padStart(2, '0');
    hoursSpan.textcontent = hours.toString().padStart(2, '0');
    minutes.textcontent = minutes.toString().padStart(2, '0');
    seconds.textcontent = seconds.toString().padStart(2, '0');
}

function stopTimer() {
    if (TimerInterval) {
        clearInterval(TimerInterval);
        TimerInterval = null;
    }
}
function startTimer() {
    stopTimer();
    if (targetTime && targetTime > new Date()) {
        timerInterval = setInterval(UpdateTimer, 1000);
        updateTimer();
    }
}

function showBSOD() {
    if (BsodActive) return;
    BsodActive = true;
    BsodScreen.classList.remove('hidden')
    stopTimer()
}

 function hideBSOD() {
        bsodActive = false;
        bsodScreen.classList.add('hidden');

        if (targetTime && targetTime > new Date()) {
            startTimer();
        } else {

            daysSpan.textContent = '00';
            hoursSpan.textContent = '00';
            minutesSpan.textContent = '00';
            secondsSpan.textContent = '00';
        }
    }

        function setTimerFromPicker() {
        const dateStr = datetimePicker.value;
        if (!dateStr) return;
        targetTime = new Date(dateStr);
        if (isNaN(targetTime)) {
            alert('выберите корректную дату и время');
            return;
        }
        if (bsodActive) {
            hideBSOD();
        }
        startTimer();
    }
 function setTest10s() {
        const now = new Date();
        targetTime = new Date(now.getTime() + 10000);
        if (bsodActive) {
            hideBSOD();
        }
        startTimer();
    }


    function resetBSOD() {
        if (bsodActive) {
            hideBSOD();
        } else {
            const now = new Date();
            const nextYear = now.getFullYear() + 1;
            const newYear = new Date(nextYear, 0, 1, 0, 0);
            targetTime = newYear;
            datetimePicker.value = newYear.toISOString().slice(0, 16);
            startTimer();
        }
    }


    setTimerBtn.addEventListener('click', setTimerFromPicker);
    test10sBtn.addEventListener('click', setTest10s);
    resetBsodBtn.addEventListener('click', resetBSOD);


    bsodScreen.addEventListener('click', function() {
        hideBSOD();
    });


    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bsodActive) {
            hideBSOD();
        }
    });


    setTimerFromPicker();
});
