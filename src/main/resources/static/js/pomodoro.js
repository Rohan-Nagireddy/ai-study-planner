// Simple Pomodoro timer with start/pause/reset and interruption tracking
(function(){
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerEl = document.getElementById('timer');
    const interruptionsEl = document.getElementById('interruptions');

    let duration = 25 * 60; // 25 minutes
    let remaining = duration;
    let interval = null;
    let interruptions = 0;

    function formatTime(seconds){
        const m = Math.floor(seconds/60).toString().padStart(2,'0');
        const s = (seconds%60).toString().padStart(2,'0');
        return `${m}:${s}`;
    }

    function tick(){
        if(remaining <= 0){
            clearInterval(interval);
            interval = null;
            // TODO: save focus session to backend via fetch
            return;
        }
        remaining -= 1;
        timerEl.textContent = formatTime(remaining);
    }

    startBtn && startBtn.addEventListener('click', () => {
        if(!interval){
            interval = setInterval(tick, 1000);
        }
    });

    pauseBtn && pauseBtn.addEventListener('click', () => {
        if(interval){
            clearInterval(interval);
            interval = null;
        }
    });

    resetBtn && resetBtn.addEventListener('click', () => {
        if(interval){
            clearInterval(interval);
            interval = null;
        }
        remaining = duration;
        timerEl.textContent = formatTime(remaining);
        interruptions = 0;
        interruptionsEl.textContent = interruptions;
    });

    // Provide a global function to increment interruptions (called by inactivity detector)
    window.__incrementInterruption = function(){
        interruptions += 1;
        interruptionsEl.textContent = interruptions;
    }
})();
