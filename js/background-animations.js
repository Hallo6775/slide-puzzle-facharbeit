document.addEventListener('DOMContentLoaded', () => {
    // Create background container if it doesn't exist
    let background = document.querySelector('.puzzle-background');
    if (!background) {
        background = document.createElement('div');
        background.className = 'puzzle-background';
        document.body.prepend(background);
    }

    // Number of puzzle pieces
    const pieceCount = 15;

    // Create puzzle pieces
    for (let i = 0; i < pieceCount; i++) {
        createPuzzlePiece(background);
    }

    // Add some pieces periodically
    setInterval(() => {
        // Remove any pieces that are out of view
        const pieces = document.querySelectorAll('.puzzle-piece');
        if (pieces.length < pieceCount * 1.5) { // Keep a reasonable number of pieces
            createPuzzlePiece(background);
        }
    }, 3000);

    // Handle window resize
    window.addEventListener('resize', () => {
        const pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => {
            if (isOutOfView(piece)) {
                piece.remove();
                createPuzzlePiece(background);
            }
        });
    });
});

function createPuzzlePiece(container) {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    
    // Random position at the bottom of the screen
    const posX = Math.random() * window.innerWidth;
    const posY = window.innerHeight + 50;
    
    // Random animation duration between 15-25s
    const duration = 15 + Math.random() * 10;
    
    // Random delay up to 15s
    const delay = -1 * Math.random() * 15;
    
    // Apply styles
    piece.style.left = `${posX}px`;
    piece.style.top = `${posY}px`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;
    
    // Random rotation
    const rotation = Math.random() * 360;
    piece.style.transform = `rotate(${rotation}deg)`;
    
    // Add hover effect
    piece.addEventListener('mouseenter', () => {
        piece.style.opacity = '0.7';
        piece.style.transform = `rotate(${rotation}deg) scale(1.1)`;
    });
    
    piece.addEventListener('mouseleave', () => {
        piece.style.opacity = '0.5';
        piece.style.transform = `rotate(${rotation}deg) scale(1)`;
    });
    
    // Remove piece when animation completes
    piece.addEventListener('animationend', () => {
        piece.remove();
    });
    
    container.appendChild(piece);
}

function isOutOfView(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.bottom < 0 ||
        rect.right < 0 ||
        rect.left > window.innerWidth ||
        rect.top > window.innerHeight
    );
}
