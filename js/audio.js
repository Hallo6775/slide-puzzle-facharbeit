const MUSIC_STORAGE_KEY = 'slidePuzzleMusicState';
const VOLUME_STORAGE_KEY = 'slidePuzzleMusicVolume';
const DEFAULT_MUSIC_STATE = 'muted';

const AudioManager = {
    bgMusic: null,
    isMusicPlaying: false,
    isInitialized: false,
    volume: 0.5,
    audioPath: 'hs.mp3',
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.bgMusic = new Audio();
            this.bgMusic.src = this.audioPath;
            this.bgMusic.loop = true;
            this.bgMusic.volume = this.volume;
            this.bgMusic.preload = 'auto';
            
            this.bgMusic.addEventListener('error', (e) => {});
            
            this.bgMusic.addEventListener('canplaythrough', () => {});
            
            this.bgMusic.addEventListener('loadedmetadata', () => {});
            
            this.bgMusic.load();
            
            const playPromise = this.bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isMusicPlaying = true;
                }).catch(error => {
                    this.isMusicPlaying = false;
                    this.showPlayMessage();
                });
            }
            
            this.isInitialized = true;
        } catch (error) {

        }
    },
    

        showPlayMessage() {
        const message = document.createElement('div');
        message.id = 'audio-message';
        message.style.position = 'fixed';
        message.style.bottom = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = 'rgba(0,0,0,0.8)';
        message.style.color = 'white';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '20px';
        message.style.zIndex = '1000';
        message.style.cursor = 'pointer';
        message.textContent = 'Klicke hier, um die Musik zu starten';
        message.addEventListener('click', () => {
            this.playMusic();
            message.remove();
        });
        document.body.appendChild(message);
    },
    
    toggleMusic() {
        if (!this.bgMusic) return;
        
        if (this.isMusicPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    },
    
    playMusic() {
        if (!this.bgMusic) return;
        
        const playPromise = this.bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isMusicPlaying = true;
                this.bgMusic.muted = false;
                localStorage.setItem(MUSIC_STORAGE_KEY, 'playing');
            }).catch(error => {

            });
        }
    },
    
    pauseMusic() {
        if (!this.bgMusic) return;
        
        this.bgMusic.pause();
        this.isMusicPlaying = false;
        this.bgMusic.muted = true;
        localStorage.setItem(MUSIC_STORAGE_KEY, 'muted');
    },
    
    setVolume(volume) {
        if (!this.bgMusic) return;
        
        this.volume = Math.max(0, Math.min(1, volume));
        this.bgMusic.volume = this.volume;
        localStorage.setItem(VOLUME_STORAGE_KEY, this.volume);
    },
    
    getVolume() {
        return this.volume;
    },
    
    initMusicToggle() {
        const musicToggleBtn = document.getElementById('musicToggleBtn');
        if (musicToggleBtn) {
            // Load saved music state
            const savedState = localStorage.getItem(MUSIC_STORAGE_KEY);
            const savedVolume = parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY) || '0.5');
            
            // Set initial state
            this.setVolume(savedVolume);
            
            // Initialize icon elements
            const iconElement = musicToggleBtn.querySelector('.music-icon i');
            
            const updateButtonState = (isMuted) => {
                if (isMuted) {
                    musicToggleBtn.classList.add('muted');
                    iconElement.classList.remove('fa-volume-up');
                    iconElement.classList.add('fa-volume-mute');
                } else {
                    musicToggleBtn.classList.remove('muted');
                    iconElement.classList.add('fa-volume-up');
                    iconElement.classList.remove('fa-volume-mute');
                }
            };
            
            // Set initial button state
            if (savedState === 'muted') {
                this.pauseMusic();
                updateButtonState(true);
            } else {
                this.playMusic();
                updateButtonState(false);
            }
            
            // Toggle music on button click
            musicToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wasMuted = musicToggleBtn.classList.contains('muted');
                
                if (wasMuted) {
                    this.playMusic();
                } else {
                    this.pauseMusic();
                }
                
                updateButtonState(!wasMuted);
                
                // Save state
                localStorage.setItem(
                    MUSIC_STORAGE_KEY, 
                    !wasMuted ? 'muted' : 'playing'
                );
            });
            
            // Show the button
            musicToggleBtn.style.display = 'flex';
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
    AudioManager.initMusicToggle();
});
