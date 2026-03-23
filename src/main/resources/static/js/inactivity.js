// Detect tab switching and user inactivity. Notify the Pomodoro timer by calling window.__incrementInterruption()
(function(){
    let lastActivity = Date.now();
    const idleThreshold = 60 * 1000; // 60s

    function activity(){
        lastActivity = Date.now();
    }

    ['mousemove','keydown','scroll','touchstart'].forEach(evt => window.addEventListener(evt, activity));

    // Visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
        if(document.hidden){
            // Tab switched away — count as interruption
            if(window.__incrementInterruption) window.__incrementInterruption();
        }
    });

    // Idle polling
    setInterval(() => {
        if(Date.now() - lastActivity > idleThreshold){
            // user idle
            if(window.__incrementInterruption) window.__incrementInterruption();
            lastActivity = Date.now();
        }
    }, 5000);
})();
