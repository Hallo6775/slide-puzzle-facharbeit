document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('test') === 'true' || sessionStorage.getItem('testMode') === 'true';
    
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    const unlockedLevels = JSON.parse(localStorage.getItem('unlockedLevels') || '{}');
    
    if (isTestMode) {
        const testModeBanner = document.getElementById('testModeBanner');
        if (testModeBanner) {
            testModeBanner.style.display = 'flex';
        }
        
        const modes = ['classic', 'pattern', 'image'];
        const difficulties = [3, 4, 5, 6, 7];
        
        modes.forEach(mode => {
            difficulties.forEach(difficulty => {
                const levelKey = `${mode}-${difficulty}`;
                unlockedLevels[levelKey] = true;
            });
        });
        
        localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
        localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
    } else {
        if (!unlockedLevels['classic-3']) {
            unlockedLevels['classic-3'] = true;
            localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
        }
    }
    

    updateUnlockedLevels();
    
    const exitTestModeBtn = document.getElementById('exitTestModeBtn');
    if (exitTestModeBtn) {
        exitTestModeBtn.addEventListener('click', () => {
            sessionStorage.removeItem('testMode');
            window.location.href = 'level-selection.html';
        });
    }
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('locked')) {
                const mode = button.dataset.mode;
                const difficulty = parseInt(button.dataset.difficulty);
                startGame(mode, difficulty);
            }
        });
    });
    
    backToMenuBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
    
    function updateUnlockedLevels() {
        difficultyButtons.forEach(button => {
            const mode = button.dataset.mode;
            const difficulty = parseInt(button.dataset.difficulty);
            const levelKey = `${mode}-${difficulty}`;
            
            if (unlockedLevels[levelKey] && (isTestMode || (mode === 'classic' && difficulty === 3) || unlockedLevels[levelKey] === true)) {
                button.classList.remove('locked');
                button.removeAttribute('disabled');
                const lockIcon = button.querySelector('.fa-lock');
                if (lockIcon) {
                    lockIcon.remove();
                }
            } else {
                button.classList.add('locked');
                button.setAttribute('disabled', 'disabled');
                if (!button.querySelector('.fa-lock')) {
                    const lockIcon = document.createElement('i');
                    lockIcon.className = 'fas fa-lock';
                    button.insertBefore(lockIcon, button.firstChild);
                }
            }
        });
    }
    
    function startGame(mode, difficulty) {
        localStorage.setItem('currentGame', JSON.stringify({
            mode,
            difficulty,
            startTime: Date.now()
        }));
        
        window.location.href = `game.html?mode=${mode}&difficulty=${difficulty}`;
    }
    
    window.unlockNextLevel = function(mode, currentDifficulty) {
        const nextDifficulty = currentDifficulty + 1;
        if (nextDifficulty > 5) {
            const modes = ['classic', 'pattern', 'image'];
            const currentModeIndex = modes.indexOf(mode);
            if (currentModeIndex < modes.length - 1) {
                const nextMode = modes[currentModeIndex + 1];
                unlockLevel(nextMode, 3);
            }
        } else {
            unlockLevel(mode, nextDifficulty);
        }
    };
    
    function unlockLevel(mode, difficulty) {
        const levelKey = `${mode}-${difficulty}`;
        if (!unlockedLevels[levelKey]) {
            unlockedLevels[levelKey] = true;
            localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
            
            if (window.location.pathname.endsWith('level-selection.html')) {
                updateUnlockedLevels();
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = `Neues Level freigeschaltet: ${getModeName(mode)} ${difficulty}x${difficulty}`;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
            }
        }
    }
    
    function getModeName(mode) {
        const modeNames = {
            'classic': 'Klassisch',
            'pattern': 'Muster',
            'image': 'Bilder'
        };
        return modeNames[mode] || mode;
    }
});

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideUp 0.5s ease-out;
        display: flex;
        align-items: center;
        font-weight: 500;
    }
    
    .notification::before {
        content: '🎉';
        margin-right: 8px;
        font-size: 1.2em;
    }
    
    .notification.fade-out {
        animation: fadeOut 0.5s ease-out forwards;
    }
    
    @keyframes slideUp {
        from { transform: translate(-50%, 100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(notificationStyles);
