// Custom JavaScript for Enhanced Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initScrollToTop();
    initSmoothScrolling();
    initLazyLoading();
    initNumberCounters();
    initTooltips();
    initModal();
    initPropertySearch();
    initFormAnalytics();
});

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