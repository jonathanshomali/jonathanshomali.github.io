class SpeedyRunner {
    constructor() {
        this.character = document.getElementById('character');
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.contentSections = document.querySelectorAll('.content-section');
        this.controlKeys = document.querySelectorAll('.control-key');
        this.speedFill = document.getElementById('speed-fill');
        
        this.position = { x: 100, y: 100 };
        this.velocity = { x: 0, y: 0 };
        this.speed = 0;
        this.maxSpeed = 8;
        this.jumpPower = 25;
        this.gravity = 1.2;
        this.friction = 0.85;
        this.groundLevel = 100;
        
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        this.isJumping = false;
        this.isCrouching = false;
        this.facingLeft = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
        this.showSection('home');
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
        
        // Tab click events (backup navigation)
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.getAttribute('data-section');
                this.showSection(section);
            });
        });
        
        // Form submission
        const form = document.querySelector('.contact-form form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Message sent! Thanks for reaching out! 🚀');
                form.reset();
            });
        }
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
            this.updateControlKeyVisual(key, true);
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
            this.updateControlKeyVisual(key, false);
        }
    }
    
    updateControlKeyVisual(key, isActive) {
        const keyMap = { w: 0, a: 1, s: 2, d: 3 };
        const keyIndex = keyMap[key];
        if (keyIndex !== undefined && this.controlKeys[keyIndex]) {
            if (isActive) {
                this.controlKeys[keyIndex].classList.add('active');
            } else {
                this.controlKeys[keyIndex].classList.remove('active');
            }
        }
    }
    
    update() {
        // Handle input
        if (this.keys.a) {
            this.velocity.x = Math.max(this.velocity.x - 1, -this.maxSpeed);
            this.facingLeft = true;
        }
        if (this.keys.d) {
            this.velocity.x = Math.min(this.velocity.x + 1, this.maxSpeed);
            this.facingLeft = false;
        }
        if (this.keys.w && !this.isJumping) {
            this.velocity.y = this.jumpPower;
            this.isJumping = true;
        }
        
        // Handle crouching
        this.isCrouching = this.keys.s && !this.isJumping;
        
        // Apply physics
        this.velocity.x *= this.friction;
        this.velocity.y -= this.gravity;
        
        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // Boundary checks
        const maxX = window.innerWidth - 40;
        this.position.x = Math.max(0, Math.min(this.position.x, maxX));
        
        // Ground collision
        if (this.position.y <= this.groundLevel) {
            this.position.y = this.groundLevel;
            this.velocity.y = 0;
            this.isJumping = false;
        }
        
        // Calculate speed for display
        this.speed = Math.abs(this.velocity.x);
        
        // Update character visual
        this.updateCharacterVisual();
        
        // Check for tab collisions
        this.checkTabCollisions();
        
        // Update speed indicator
        this.updateSpeedIndicator();
    }
    
    updateCharacterVisual() {
        // Update position
        this.character.style.left = this.position.x + 'px';
        this.character.style.bottom = this.position.y + 'px';
        
        // Update classes
        this.character.classList.toggle('running', this.speed > 1);
        this.character.classList.toggle('jumping', this.isJumping);
        this.character.classList.toggle('crouching', this.isCrouching);
        this.character.classList.toggle('moving-left', this.facingLeft);
    }
    
    updateSpeedIndicator() {
        const speedPercentage = (this.speed / this.maxSpeed) * 100;
        this.speedFill.style.width = speedPercentage + '%';
    }
    
    checkTabCollisions() {
        const characterRect = this.character.getBoundingClientRect();
        
        this.navTabs.forEach(tab => {
            const tabRect = tab.getBoundingClientRect();
            
            // Check if character is colliding with tab
            if (this.isColliding(characterRect, tabRect)) {
                const section = tab.getAttribute('data-section');
                this.showSection(section);
                
                // Add visual feedback
                tab.classList.add('active');
                
                // Create particle effect
                this.createParticleEffect(this.position.x + 20, window.innerHeight - this.position.y - 30);
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    showSection(sectionId) {
        // Hide all sections
        this.contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update nav tab states
        this.navTabs.forEach(tab => {
            if (tab.getAttribute('data-section') === sectionId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    createParticleEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: linear-gradient(45deg, #4facfe, #00f2fe);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
            `;
            
            document.body.appendChild(particle);
            
            // Animate particle
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }
    
    gameLoop() {
        this.update();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeedyRunner();
});

// Add some interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Floating background elements
    function createFloatingElement() {
        const element = document.createElement('div');
        element.style.cssText = `
            position: fixed;
            width: ${Math.random() * 20 + 10}px;
            height: ${Math.random() * 20 + 10}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            left: ${Math.random() * 100}vw;
            top: 100vh;
            pointer-events: none;
            z-index: 1;
        `;
        
        document.body.appendChild(element);
        
        // Animate upward
        element.animate([
            { transform: 'translateY(0px)', opacity: 0.7 },
            { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
        ], {
            duration: Math.random() * 10000 + 5000,
            easing: 'linear'
        }).onfinish = () => {
            element.remove();
        };
    }
    
    // Create floating elements periodically
    setInterval(createFloatingElement, 2000);
    
    // Add keyboard shortcuts info
    const keyboardInfo = document.createElement('div');
    keyboardInfo.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-size: 12px;
            z-index: 1000;
            backdrop-filter: blur(10px);
        ">
            <div style="font-weight: bold; margin-bottom: 5px;">Controls:</div>
            <div>W - Jump</div>
            <div>A - Move Left</div>
            <div>S - Crouch</div>
            <div>D - Move Right</div>
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        keyboardInfo.style.opacity = '0.3';
        keyboardInfo.style.transition = 'opacity 1s ease';
    }, 5000);
    
    document.body.appendChild(keyboardInfo);
});
