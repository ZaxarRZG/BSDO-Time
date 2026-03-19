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
            alert('пошёл нахуй');
            return;
        }
        if (bsodActive) {
            hideBSOD();
        }
        startTimer();
    }

