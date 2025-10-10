// Custom JavaScript for Enhanced Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initBannerSlider();
    initMarqueeManagement();
    initCookieNotification();
    initScrollToTop();
    initSmoothScrolling();
    initLazyLoading();
    initNumberCounters();
    initTooltips();
    initModal();
    initPropertySearch();
    initFormAnalytics();
});

// Banner Slider Functionality
function initBannerSlider() {
    const slider = document.querySelector('.banner-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const indicators = slider.querySelectorAll('.indicator');
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    
    let currentSlide = 0;
    let slideInterval;
    
    // Auto-play functionality
    function startAutoPlay() {
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoPlay() {
        clearInterval(slideInterval);
    }
    
    function showSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }
    
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }
    
    // Indicator click handlers
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            stopAutoPlay();
            startAutoPlay();
        });
    });
    
    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoPlay();
    });
    
    slider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoPlay();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left - next slide
            } else {
                prevSlide(); // Swipe right - previous slide
            }
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        }
    });
    
    // Start auto-play
    startAutoPlay();
}

// Marquee Management Functionality
function initMarqueeManagement() {
    const marquee = document.querySelector('.top-marquee');
    if (!marquee) return;
    
    const marqueeContent = marquee.querySelector('.marquee-content');
    const speed = marquee.dataset.speed || 'normal';
    
    // Apply speed-based animation duration
    const speedMap = {
        'slow': '45s',
        'normal': '30s',
        'fast': '15s',
        'very-fast': '10s'
    };
    
    const duration = speedMap[speed] || '30s';
    marqueeContent.style.setProperty('--marquee-duration', duration);
    
    // Add click tracking for marquee links
    const marqueeLinks = marquee.querySelectorAll('.marquee-link');
    marqueeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Track marquee link clicks
            if (typeof gtag !== 'undefined') {
                gtag('event', 'marquee_link_click', {
                    'link_text': this.textContent.trim(),
                    'link_url': this.href
                });
            }
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Add pause on focus for accessibility
    marquee.addEventListener('focusin', function() {
        marqueeContent.style.animationPlayState = 'paused';
    });
    
    marquee.addEventListener('focusout', function() {
        marqueeContent.style.animationPlayState = 'running';
    });
    
    // Add keyboard control for marquee
    marquee.setAttribute('tabindex', '0');
    marquee.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (marqueeContent.style.animationPlayState === 'paused') {
                marqueeContent.style.animationPlayState = 'running';
            } else {
                marqueeContent.style.animationPlayState = 'paused';
            }
        }
    });
    
    // Add ARIA label for screen readers
    marquee.setAttribute('aria-label', 'Scrolling announcements and property updates');
    marquee.setAttribute('role', 'marquee');
}

// Cookie Notification Functionality
function initCookieNotification() {
    const cookieNotification = document.getElementById('cookie-notification');
    if (!cookieNotification) return;
    
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const settingsBtn = document.getElementById('cookie-settings');
    const declineBtn = document.getElementById('cookie-decline');
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieChoice');
    if (cookieChoice) {
        cookieNotification.style.display = 'none';
        return;
    }
    
    // Show notification after a short delay
    setTimeout(() => {
        cookieNotification.classList.add('show');
    }, 1000);
    
    // Accept All functionality
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', function() {
            acceptAllCookies();
            hideNotification();
        });
    }
    
    // Settings functionality
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            showCookieSettings();
        });
    }
    
    // Decline functionality
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            declineCookies();
            hideNotification();
        });
    }
    
    function acceptAllCookies() {
        // Set all cookie preferences
        localStorage.setItem('cookieChoice', 'accepted');
        localStorage.setItem('analyticsCookies', 'true');
        localStorage.setItem('marketingCookies', 'true');
        localStorage.setItem('functionalCookies', 'true');
        
        // Initialize analytics and other tracking
        initializeTracking();
        
        console.log('All cookies accepted');
    }
    
    function declineCookies() {
        // Set minimal cookie preferences
        localStorage.setItem('cookieChoice', 'declined');
        localStorage.setItem('analyticsCookies', 'false');
        localStorage.setItem('marketingCookies', 'false');
        localStorage.setItem('functionalCookies', 'false');
        
        console.log('Cookies declined');
    }
    
    function showCookieSettings() {
        // Create settings modal
        const settingsModal = document.createElement('div');
        settingsModal.className = 'cookie-settings-modal';
        settingsModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cookie Settings</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h4>Essential Cookies</h4>
                            <label class="toggle">
                                <input type="checkbox" checked disabled>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>These cookies are necessary for the website to function and cannot be switched off.</p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h4>Analytics Cookies</h4>
                            <label class="toggle">
                                <input type="checkbox" id="analytics-toggle">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>These cookies help us understand how visitors interact with our website.</p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h4>Marketing Cookies</h4>
                            <label class="toggle">
                                <input type="checkbox" id="marketing-toggle">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>These cookies are used to track visitors across websites for marketing purposes.</p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h4>Functional Cookies</h4>
                            <label class="toggle">
                                <input type="checkbox" id="functional-toggle">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>These cookies enable enhanced functionality and personalization.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="save-settings">Save Settings</button>
                    <button class="btn btn-primary" id="accept-all-settings">Accept All</button>
                </div>
            </div>
        `;
        
        // Add styles
        settingsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(settingsModal);
        
        // Add event listeners
        settingsModal.querySelector('.modal-close').addEventListener('click', () => {
            settingsModal.remove();
        });
        
        settingsModal.querySelector('.modal-overlay').addEventListener('click', () => {
            settingsModal.remove();
        });
        
        settingsModal.querySelector('#save-settings').addEventListener('click', () => {
            saveCookieSettings();
            settingsModal.remove();
            hideNotification();
        });
        
        settingsModal.querySelector('#accept-all-settings').addEventListener('click', () => {
            acceptAllCookies();
            settingsModal.remove();
            hideNotification();
        });
    }
    
    function saveCookieSettings() {
        const analytics = document.getElementById('analytics-toggle').checked;
        const marketing = document.getElementById('marketing-toggle').checked;
        const functional = document.getElementById('functional-toggle').checked;
        
        localStorage.setItem('cookieChoice', 'customized');
        localStorage.setItem('analyticsCookies', analytics.toString());
        localStorage.setItem('marketingCookies', marketing.toString());
        localStorage.setItem('functionalCookies', functional.toString());
        
        if (analytics) {
            initializeTracking();
        }
        
        console.log('Cookie settings saved');
    }
    
    function hideNotification() {
        cookieNotification.classList.remove('show');
        setTimeout(() => {
            cookieNotification.style.display = 'none';
        }, 300);
    }
    
    function initializeTracking() {
        // Initialize Google Analytics or other tracking
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }
    }
}

// Scroll to Top Button
function initScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        font-size: 20px;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
}

// Enhanced Smooth Scrolling
function initSmoothScrolling() {
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Number Counter Animation
function initNumberCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = parseInt(counter.dataset.duration) || 2000;
                
                animateCounter(counter, 0, target, duration);
                counterObserver.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.innerHTML = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Tooltip Functionality
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(this, this.dataset.tooltip);
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Modal Functionality
function initModal() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalClose = document.querySelectorAll('.modal-close');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    modalClose.forEach(close => {
        close.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Enhanced Property Search
function initPropertySearch() {
    const searchInputs = document.querySelectorAll('.property-search');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const propertyCards = document.querySelectorAll('.property-card');
            
            propertyCards.forEach(card => {
                const title = card.querySelector('.property-title')?.textContent.toLowerCase() || '';
                const location = card.querySelector('.property-location')?.textContent.toLowerCase() || '';
                const type = card.dataset.type?.toLowerCase() || '';
                
                if (title.includes(searchTerm) || location.includes(searchTerm) || type.includes(searchTerm)) {
                    card.style.display = 'block';
                    highlightSearchTerm(card, searchTerm);
                } else {
                    card.style.display = 'none';
                }
            });
        }, 300));
    });
}

function highlightSearchTerm(card, term) {
    if (!term) return;
    
    const textElements = card.querySelectorAll('.property-title, .property-location');
    textElements.forEach(element => {
        const text = element.textContent;
        const highlightedText = text.replace(new RegExp(term, 'gi'), '<mark>$&</mark>');
        element.innerHTML = highlightedText;
    });
}

// Form Analytics
function initFormAnalytics() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Track form submissions
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'form_name': this.className || this.id || 'unknown_form'
                });
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
            }
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Message';
                }
            }, 2000);
        });
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Property Image Gallery Enhancement
function initPropertyGallery() {
    const galleries = document.querySelectorAll('.property-gallery');
    
    galleries.forEach(gallery => {
        const mainImage = gallery.querySelector('.main-image img');
        const thumbnails = gallery.querySelectorAll('.thumbnail');
        
        if (thumbnails.length > 0) {
            // Create lightbox
            const lightbox = createLightbox();
            gallery.appendChild(lightbox);
            
            // Add click handlers
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener('click', function() {
                    mainImage.src = this.src;
                    thumbnails.forEach(thumb => thumb.classList.remove('active'));
                    this.classList.add('active');
                });
                
                thumbnail.addEventListener('click', function() {
                    openLightbox(this.src, gallery.querySelectorAll('.thumbnail'));
                });
            });
        }
    });
}

function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <img src="" alt="" />
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
        </div>
    `;
    
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    `;
    
    return lightbox;
}

function openLightbox(src, thumbnails) {
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('img');
    
    lightboxImg.src = src;
    lightbox.style.opacity = '1';
    lightbox.style.visibility = 'visible';
    
    // Add event listeners for lightbox controls
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    lightbox.style.opacity = '0';
    lightbox.style.visibility = 'hidden';
}