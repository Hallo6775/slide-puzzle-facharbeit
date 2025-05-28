document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.src = 'js/game.js';
    script.onload = function() {
        if (typeof initializeGame === 'function') {
            initializeGame();
        }
    };
    script.onerror = function() {};
    document.head.appendChild(script);
});
