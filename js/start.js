// Password for test mode 
const TEST_MODE_PASSWORD = 'test123';

document.addEventListener('DOMContentLoaded', () => {

    const playBtn = document.getElementById('playBtn');
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const testModeBtn = document.getElementById('testModeBtn');
    

    const testModeModal = document.createElement('div');
    testModeModal.id = 'testModeModal';
    testModeModal.className = 'test-mode-modal';
    testModeModal.innerHTML = `
        <div class="test-mode-content">
            <h3>Testmodus</h3>
            <p>Bitte Passwort eingeben:</p>
            <input type="password" id="testPassword" class="test-password-input" placeholder="Passwort">
            <p id="testModeError" class="error-message"></p>
            <div class="test-mode-buttons">
                <button id="testModeCancel" class="btn secondary">Abbrechen</button>
                <button id="testModeSubmit" class="btn primary">Bestätigen</button>
            </div>
        </div>
    `;
    document.body.appendChild(testModeModal);
    

    const testPassword = document.getElementById('testPassword');
    const testModeError = document.getElementById('testModeError');
    const testModeCancel = document.getElementById('testModeCancel');
    const testModeSubmit = document.getElementById('testModeSubmit');
    

    const showTestModeModal = () => {
        testModeModal.style.display = 'flex';
        testPassword.focus();
    };
    

    const hideTestModeModal = () => {
        testModeModal.style.display = 'none';
        testPassword.value = '';
        testModeError.textContent = '';
    };
    

    const handleTestModeSubmit = () => {
        if (testPassword.value === TEST_MODE_PASSWORD) {

            sessionStorage.setItem('testMode', 'true');

            window.location.href = 'level-selection.html?test=true';
        } else {
            testModeError.textContent = 'Falsches Passwort!';
        }
    };
    

    testModeBtn.addEventListener('click', showTestModeModal);
    testModeCancel.addEventListener('click', hideTestModeModal);
    testModeSubmit.addEventListener('click', handleTestModeSubmit);
    

    testPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleTestModeSubmit();
        }
    });
    

    playBtn.addEventListener('click', () => {
        window.location.href = 'level-selection.html';
    });
    
    howToPlayBtn.addEventListener('click', () => {
        window.location.href = 'how-to-play.html';
    });
    

    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            window.location.href = 'level-selection.html';
        } else if (e.key === 'h' || e.key === 'H') {
            window.location.href = 'how-to-play.html';
        }
    });
    

    testModeBtn.style.display = 'block';
    

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 't') {
            testModeBtn.style.display = 'flex';
            setTimeout(() => {
                testModeBtn.style.display = 'none';
            }, 3000);
        }
    });
    

    testPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleTestModeSubmit();
        }
    });
});
