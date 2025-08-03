class EncryptedMessage {
    constructor() {
        this.charTable = [
            "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", "~",
            ".", "/", ":", ";", "<", "=", ">", "?", "[", "\\", "]", "_", "{", "}",
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
            "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "Ç", "ü", "é", "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï",
            "î", "ì", "Ä", "Å", "É", "æ", "Æ", "ô", "ö", "ò", "û", "ù",
            "ÿ", "Ö", "Ü", "¢", "£", "¥", "ƒ", "á", "í", "ó", "ú", "ñ",
            "Ñ", "ª", "º", "¿", "¬", "½", "¼", "¡", "«", "»", "α", "ß",
            "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "φ", "ε",
            "±", "÷", "°", "·", "²", "¶", "⌐", "₧", "▒", "▓",
            "│", "┤", "╡", "╢", "╖", "╕", "╣", "║", "╗", "╝", "╜", "╛",
            "┐", "└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩",
            "╦", "╠", "═", "╬", "╧", "╨", "╤", "╥", "╙", "╘", "╒", "╓",
            "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐", "▀"
        ];
        
        this.menuElement = null;
        this.scrollIndicator = null;
        this.originalText = '';
        this.messageText = '';
        this.artText = '';
        this.encryptedDisplayText = '';
        this.promptText = '\n\nHit Enter To Decrypt...';
        this.isDecrypting = false;
        this.intervals = [];
        
        this.init();
        this.handleResize = this.handleResize.bind(this);
        this.preventScroll = this.preventScroll.bind(this);
    }

    handleResize() {
        const mobileEnterBtn = document.getElementById('mobileEnterBtn');
        if (mobileEnterBtn && !this.isDecrypting) {
            if (window.innerWidth <= 768) {
                // Only show if we're in the prompt phase and not decrypting
                if (this.encryptedDisplayText && !mobileEnterBtn.classList.contains('hidden')) {
                    mobileEnterBtn.classList.remove('hidden');
                    // Ensure button is visible after resize
                    setTimeout(() => this.scrollToShowMobileButton(), 100);
                }
            } else {
                mobileEnterBtn.classList.add('hidden');
            }
        }
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.menuElement = document.getElementById('menu');
        this.scrollIndicator = document.getElementById('scrollIndicator');
        const menuNormalElement = document.getElementById('menuNormal');
        
        if (!this.menuElement || !menuNormalElement) {
            console.error('Required elements not found');
            return;
        }
        
        this.originalText = menuNormalElement.textContent.trim();
        this.separateMessageAndArt();
        this.setupScrollManagement();
        
        // Add resize event listener
        window.addEventListener('resize', this.handleResize);
        
        // Setup horizontal scroll hint (disabled on mobile ≤768px)
        this.setupHorizontalScrollHint();
        
        setTimeout(() => this.displayTerminal(), 2000);
    }

    setupHorizontalScrollHint() {
        // Disable horizontal scroll hint ONLY for mobile devices (≤768px)
        if (window.innerWidth <= 768) {
            return;
        }
        
        const handleScroll = (element) => {
            const scrollHandler = () => {
                if (element.scrollLeft > 0) {
                    const style = document.createElement('style');
                    style.textContent = `
                        #menu::before, #menuNormal::before {
                            display: none !important;
                        }
                    `;
                    document.head.appendChild(style);
                    element.removeEventListener('scroll', scrollHandler);
                }
            };
            element.addEventListener('scroll', scrollHandler);
        };

        // Apply to both menu elements
        const menuElement = document.getElementById('menu');
        const menuNormalElement = document.getElementById('menuNormal');
        
        if (menuElement) handleScroll(menuElement);
        if (menuNormalElement) handleScroll(menuNormalElement);
    }

    setupScrollManagement() {
        this.checkContentOverflow();
        
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        window.addEventListener('resize', () => {
            this.checkContentOverflow();
        });
        
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardScroll(event);
        });
        
        // Disable scroll on mobile devices
        if (window.innerWidth <= 768) {
            this.disableMobileScroll();
        }
    }

    checkContentOverflow() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (documentHeight > windowHeight) {
            document.body.classList.add('show-scroll-indicator');
        } else {
            document.body.classList.remove('show-scroll-indicator');
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollTop + windowHeight >= documentHeight - 50) {
            if (this.scrollIndicator) {
                this.scrollIndicator.style.opacity = '0';
            }
        } else {
            if (this.scrollIndicator) {
                this.scrollIndicator.style.opacity = '0.8';
            }
        }
    }

    handleKeyboardScroll(event) {
        if (this.isDecrypting || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Disable keyboard scroll on mobile
        if (window.innerWidth <= 768) {
            return;
        }

        const scrollAmount = 100;
        
        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                window.scrollBy(0, scrollAmount);
                break;
            case 'ArrowUp':
                event.preventDefault();
                window.scrollBy(0, -scrollAmount);
                break;
            case 'PageDown':
                event.preventDefault();
                window.scrollBy(0, window.innerHeight * 0.8);
                break;
            case 'PageUp':
                event.preventDefault();
                window.scrollBy(0, -window.innerHeight * 0.8);
                break;
            case 'Home':
                event.preventDefault();
                window.scrollTo(0, 0);
                break;
            case 'End':
                event.preventDefault();
                window.scrollTo(0, document.documentElement.scrollHeight);
                break;
        }
    }

    disableMobileScroll() {
        // Prevent scroll but allow button interactions on mobile
        document.addEventListener('touchmove', this.preventScroll, { passive: false });
        document.addEventListener('wheel', this.preventScroll, { passive: false });
        
        // Don't prevent touchstart as it's needed for button clicks
        // Prevent scroll by setting overflow hidden
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    preventScroll(e) {
        // Only prevent scroll on mobile devices, but allow button interactions
        if (window.innerWidth <= 768) {
            // Allow interactions with mobile enter button
            if (e.target && e.target.classList.contains('mobile-enter-btn')) {
                return; // Don't prevent button clicks
            }
            
            // Prevent scroll events but not button clicks
            if (e.type === 'touchmove' || e.type === 'wheel') {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    separateMessageAndArt() {
        const lines = this.originalText.split('\n');
        const artStartIndex = lines.findIndex(line => line.includes('⠀'));
        
        if (artStartIndex !== -1) {
            this.messageText = lines.slice(0, artStartIndex).join('\n').trim();
            this.artText = lines.slice(artStartIndex).join('\n');
        } else {
            this.messageText = this.originalText;
            this.artText = '';
        }
    }

    getRandomChar() {
        return this.charTable[Math.floor(Math.random() * this.charTable.length)];
    }

    encryptText(text) {
        return text.split('').map(char => {
            if (char === ' ' || char === '\n') {
                return char;
            } else if (char === '⠀' || char.match(/^[\u2800-\u28FF]$/)) {
                return this.getRandomChar();
            } else {
                return this.getRandomChar();
            }
        }).join('');
    }

    showMenu() {
        if (this.menuElement) {
            this.menuElement.classList.remove('hidden');
            this.menuElement.classList.add('visible');
            setTimeout(() => this.checkContentOverflow(), 100);
        }
    }

    hideMenu() {
        if (this.menuElement) {
            this.menuElement.classList.add('hidden');
            this.menuElement.classList.remove('visible');
        }
    }

    displayCharacter(menuText, currentIndex = 0, decryptedText = '') {
        if (currentIndex >= menuText.length) {
            this.showDecryptPrompt(decryptedText);
            return;
        }

        this.menuElement.innerHTML = decryptedText + '<span class="cursor"></span>';
        decryptedText += menuText[currentIndex];
        currentIndex++;

        if (currentIndex % 50 === 0) {
            this.autoScrollIfNeeded();
        }

        setTimeout(() => {
            this.displayCharacter(menuText, currentIndex, decryptedText);
        }, 10);
    }

    autoScrollIfNeeded() {
        // Disable auto scroll ONLY for mobile devices (≤768px)
        if (window.innerWidth <= 768) {
            return;
        }
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop + windowHeight >= documentHeight - 200) {
            window.scrollTo({
                top: documentHeight,
                behavior: 'smooth'
            });
        }
    }

    showDecryptPrompt(encryptedText) {
        this.encryptedDisplayText = encryptedText;
        const promptIndex = 0;
        this.typePrompt(encryptedText, this.promptText, promptIndex);
    }

    typePrompt(baseText, promptText, currentIndex) {
        if (currentIndex >= promptText.length) {
            this.menuElement.innerHTML = baseText + promptText + '<span class="cursor"></span>';
            this.setupDecryptionListener();
            return;
        }

        const currentPrompt = promptText.substring(0, currentIndex + 1);
        this.menuElement.innerHTML = baseText + currentPrompt + '<span class="cursor"></span>';
        
        // Check if we need to scroll to show mobile button when prompt is nearly complete
        if (currentIndex === promptText.length - 1 && window.innerWidth <= 768) {
            setTimeout(() => this.scrollToShowMobileButton(), 200);
        }
        
        setTimeout(() => {
            this.typePrompt(baseText, promptText, currentIndex + 1);
        }, 50);
    }

    setupDecryptionListener() {
        const mobileEnterBtn = document.getElementById('mobileEnterBtn');
        
        const handleDecryption = () => {
            if (!this.isDecrypting) {
                this.isDecrypting = true;
                this.menuElement.textContent = this.encryptedDisplayText;
                this.randomizeText();
                document.removeEventListener('keydown', handleKeyDown);
                if (mobileEnterBtn) {
                    mobileEnterBtn.removeEventListener('click', handleDecryption);
                    mobileEnterBtn.classList.add('hidden');
                }
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Enter") {
                handleDecryption();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        // Show mobile button and add click listener on mobile devices
        if (mobileEnterBtn && window.innerWidth <= 768) {
            mobileEnterBtn.classList.remove('hidden');
            mobileEnterBtn.addEventListener('click', handleDecryption);
            
            // Ensure mobile button is visible by scrolling to show it
            this.scrollToShowMobileButton();
        }
    }

    randomizeText() {
        let randomizeCount = 0;
        const maxRandomizations = 100; // Back to original value
        
        const randomizeInterval = setInterval(() => {
            if (randomizeCount >= maxRandomizations) {
                clearInterval(randomizeInterval);
                this.startDecryption();
                return;
            }
            
            this.menuElement.textContent = this.encryptText(this.originalText);
            randomizeCount++;
        }, 10); // Back to original 10ms

        this.intervals.push(randomizeInterval);

        setTimeout(() => {
            clearInterval(randomizeInterval);
            this.startDecryption();
        }, 1000); // Back to original 1000ms
    }

    startDecryption() {
        let isArtRevealed = false;
        
        const decryptChar = () => {
            const currentText = this.menuElement.textContent;
            
            if (currentText === this.originalText) {
                this.scrollToShowCompleteContent();
                return;
            }

            const mismatchedIndices = [];
            
            if (!isArtRevealed) {
                for (let i = 0; i < this.messageText.length; i++) {
                    if (currentText[i] !== this.originalText[i]) {
                        mismatchedIndices.push(i);
                    }
                }
                
                if (mismatchedIndices.length === 0) {
                    isArtRevealed = true;
                }
            } else {
                for (let i = this.messageText.length; i < this.originalText.length; i++) {
                    if (currentText[i] !== this.originalText[i]) {
                        mismatchedIndices.push(i);
                    }
                }
            }

            if (mismatchedIndices.length > 0) {
                const randomIndex = mismatchedIndices[Math.floor(Math.random() * mismatchedIndices.length)];
                const newText = currentText.substring(0, randomIndex) +
                    this.originalText[randomIndex] +
                    currentText.substring(randomIndex + 1);
                this.menuElement.textContent = newText;
            }

            if (currentText !== this.originalText) {
                setTimeout(decryptChar, isArtRevealed ? 3 : 2); // Keep ASCII art faster (3ms) but message back to 2ms
            }
        };

        decryptChar();
    }

    scrollToShowCompleteContent() {
        // Disable auto scroll ONLY for mobile devices (≤768px)
        if (window.innerWidth <= 768) {
            return;
        }
        
        setTimeout(() => {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }, 500);
    }

    scrollToShowMobileButton() {
        // Function specifically for mobile to ensure Enter button is visible
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const mobileEnterBtn = document.getElementById('mobileEnterBtn');
                if (mobileEnterBtn && !mobileEnterBtn.classList.contains('hidden')) {
                    // Scroll to show the button with some padding
                    const buttonRect = mobileEnterBtn.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    
                    // If button is not visible or too close to bottom edge
                    if (buttonRect.bottom > windowHeight - 50 || buttonRect.top < 0) {
                        const menuElement = document.getElementById('menu');
                        if (menuElement) {
                            const menuRect = menuElement.getBoundingClientRect();
                            const scrollTarget = window.pageYOffset + menuRect.bottom - windowHeight + 120;
                            
                            window.scrollTo({
                                top: Math.max(0, scrollTarget),
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            }, 100);
        }
    }

    displayTerminal() {
        const encryptedText = this.encryptText(this.originalText);
        this.showMenu();
        this.displayCharacter(encryptedText);
    }

    destroy() {
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('resize', this.checkContentOverflow);
    }
}

const encryptedMessage = new EncryptedMessage();

window.addEventListener('beforeunload', () => {
    if (encryptedMessage) {
        encryptedMessage.destroy();
    }
});