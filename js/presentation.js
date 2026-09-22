/**
 * presentation.js
 * Master Deck Controller: navigation, keyboard, wheel, touch gestures,
 * presentation mode, and custom hooks.
 */

class PresentationDeck {
  constructor() {
    this.currentSlide = 1;
    this.totalSlides = 16;
    this.isPresentationMode = false;
    this.wheelTimeout = null;
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length || 16;

    this.init();
  }

  init() {
    this.bindKeyboard();
    this.bindWheel();
    this.bindTouch();
    this.bindButtons();
    this.bindShortcutsModal();
    this.goToSlide(1);
  }

  goToSlide(slideNumber) {
    if (slideNumber < 1 || slideNumber > this.totalSlides) return;

    const prevSlide = this.currentSlide;
    this.currentSlide = slideNumber;

    // Update active class on slides
    this.slides.forEach((slide, idx) => {
      const num = idx + 1;
      slide.classList.toggle('active', num === this.currentSlide);
    });

    // Update Counter & Progress Bar
    const counterCur = document.querySelector('#slide-counter .current');
    const counterTot = document.querySelector('#slide-counter .total');
    if (counterCur) counterCur.textContent = String(this.currentSlide).padStart(2, '0');
    if (counterTot) counterTot.textContent = String(this.totalSlides).padStart(2, '0');

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      const pct = ((this.currentSlide - 1) / (this.totalSlides - 1)) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Dispatch global custom event
    const event = new CustomEvent('slideChange', {
      detail: { slideNumber: this.currentSlide, prevSlide }
    });
    window.dispatchEvent(event);
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  prevSlide() {
    if (this.currentSlide > 1) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  togglePresentationMode() {
    this.isPresentationMode = !this.isPresentationMode;
    document.body.classList.toggle('presentation-mode', this.isPresentationMode);

    if (this.isPresentationMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept if inside an input/slider
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.nextSlide();
          break;

        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.prevSlide();
          break;

        case 'Home':
          e.preventDefault();
          this.goToSlide(1);
          break;

        case 'End':
          e.preventDefault();
          this.goToSlide(this.totalSlides);
          break;

        case 'p':
        case 'P':
        case 'f':
        case 'F':
          e.preventDefault();
          this.togglePresentationMode();
          break;

        case 'Escape':
          if (this.isPresentationMode) {
            this.togglePresentationMode();
          }
          break;

        case '?':
          const shortcutsModal = document.getElementById('shortcuts-modal');
          if (shortcutsModal) shortcutsModal.classList.toggle('open');
          break;
      }
    });
  }

  bindWheel() {
    window.addEventListener('wheel', (e) => {
      if (this.wheelTimeout) return;
      if (Math.abs(e.deltaY) < 30) return;

      if (e.deltaY > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }

      this.wheelTimeout = setTimeout(() => {
        this.wheelTimeout = null;
      }, 500);
    }, { passive: true });
  }

  bindTouch() {
    window.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].clientX - this.touchStartX;
      const diffY = e.changedTouches[0].clientY - this.touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) this.nextSlide();
        else this.prevSlide();
      }
    }, { passive: true });
  }

  bindButtons() {
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    const presBtn = document.getElementById('presentation-mode-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    if (presBtn) presBtn.addEventListener('click', () => this.togglePresentationMode());
  }

  bindShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    const closeBtn = document.getElementById('shortcuts-close');
    const helpBtn = document.getElementById('shortcuts-help-btn');

    if (helpBtn && modal) {
      helpBtn.addEventListener('click', () => modal.classList.add('open'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.presentationDeck = new PresentationDeck();
});
