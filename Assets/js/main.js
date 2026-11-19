/**
 * LycheMD - Main Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('siteHeader');

    // =========================================================================
    // GSAP & LENIS SMOOTH SCROLL INITIALIZATION
    // =========================================================================
    let lenis = null;

    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false, // Maintain native touch momentum on mobile touch devices
            touchMultiplier: 1.5,
            wheelMultiplier: 1,
            infinite: false,
        });

        window.lenis = lenis;

        // Register & Synchronize with GSAP
        if (typeof gsap !== 'undefined') {
            if (typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                lenis.on('scroll', ScrollTrigger.update);
            }
            if (typeof ScrollToPlugin !== 'undefined') {
                gsap.registerPlugin(ScrollToPlugin);
            }

            // Drive Lenis through GSAP ticker for synchronized 60/120fps rendering
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);
        } else {
            // Standalone RAF loop if GSAP is not present
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        // Prevent smooth scroll interception on horizontal sliders and modal/offcanvas bodies
        document.querySelectorAll('.focus-slider-wrapper, .popular-treatments-slider, .accordion-collapse, .modal-body, .offcanvas-body').forEach(el => {
            el.setAttribute('data-lenis-prevent', '');
        });

        // Pause Lenis when offcanvas or modal is visible to prevent background scrolling
        const mobileMenuEl = document.getElementById('mobileMenu');
        if (mobileMenuEl) {
            mobileMenuEl.addEventListener('show.bs.offcanvas', () => {
                if (lenis) lenis.stop();
            });
            mobileMenuEl.addEventListener('hidden.bs.offcanvas', () => {
                if (lenis) lenis.start();
            });
        }

        document.querySelectorAll('.modal').forEach(modalEl => {
            modalEl.addEventListener('show.bs.modal', () => {
                if (lenis) lenis.stop();
            });
            modalEl.addEventListener('hidden.bs.modal', () => {
                if (lenis) lenis.start();
            });
        });
    } else if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        if (typeof ScrollToPlugin !== 'undefined') {
            gsap.registerPlugin(ScrollToPlugin);
        }
    }

    // Section navigation aliases mapping
    const navAliases = {
        '#treatments': '#focus-areas',
        '#focus-areas': '#focus-areas',
        '#how-it-works': '#wellnessStepsSection',
        '#wellness-steps': '#wellnessStepsSection',
        '#wellnessStepsSection': '#wellnessStepsSection',
        '#expert-care': '#expertCareSection',
        '#expertCareSection': '#expertCareSection',
        '#about-us': '#expertCareSection',
        '#about': '#expertCareSection',
        '#care-options': '#careOptionsSection',
        '#careOptionsSection': '#careOptionsSection',
        '#benefits': '#careOptionsSection',
        '#whyLycheMDSection': '#whyLycheMDSection',
        '#why-lychemd': '#whyLycheMDSection',
        '#aboutTreatment': '#aboutTreatment',
        '#faqs': '#faqSection',
        '#faq': '#faqSection',
        '#faqSection': '#faqSection',
        '#reviews': '#testimonialsSection',
        '#review': '#testimonialsSection',
        '#testimonials': '#testimonialsSection',
        '#testimonialsSection': '#testimonialsSection',
        '#home': '#hero',
        '#hero': '#hero'
    };

    // Helper: Scroll to element with header offset and smooth GSAP/Lenis transition
    function scrollToTarget(targetSelector, immediate = false) {
        const resolved = navAliases[targetSelector] || targetSelector;

        if (resolved === '#hero' || resolved === '#home') {
            document.body.style.overflow = '';
            if (lenis) {
                if (lenis.isStopped) lenis.start();
                lenis.scrollTo(0, { duration: immediate ? 0 : 1.2, immediate: immediate });
            } else if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined' && !immediate) {
                gsap.to(window, { duration: 1.2, scrollTo: 0, ease: 'power2.inOut' });
            } else {
                window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
            }
            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, targetSelector);
            }
            return true;
        }

        const targetElement = document.querySelector(resolved);
        if (!targetElement) return false;

        // Ensure scrolling is enabled if anything had paused it (e.g. loader/modals)
        document.body.style.overflow = '';
        if (lenis && lenis.isStopped) {
            lenis.start();
        }

        const headerH = header ? header.offsetHeight : 80;
        const offset = -(headerH + 15);

        if (lenis) {
            lenis.scrollTo(targetElement, {
                offset: offset,
                duration: immediate ? 0 : 1.2,
                immediate: immediate,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined' && !immediate) {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: targetElement, offsetY: headerH + 15 },
                ease: 'power2.inOut'
            });
        } else {
            const rect = targetElement.getBoundingClientRect();
            const topPos = rect.top + window.pageYOffset - headerH - 15;
            window.scrollTo({
                top: Math.max(0, topPos),
                behavior: immediate ? 'auto' : 'smooth'
            });
        }

        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, targetSelector);
        }
        return true;
    }

    // Helper: Redirect to Login Page
    function openLoginModal() {
        window.location.href = 'login.html';
    }

    // Smooth scrolling & smart cross-page navigation for all anchor links
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const rawHref = this.getAttribute('href');
            if (!rawHref || rawHref === '#') return;

            // Extract the target hash, e.g. from "index.html#careOptionsSection" -> "#careOptionsSection"
            const hashIndex = rawHref.indexOf('#');
            if (hashIndex === -1) return;
            const targetId = rawHref.substring(hashIndex);
            if (!targetId || targetId === '#') return;

            if (targetId === '#login') {
                e.preventDefault();
                openLoginModal();
                return;
            }

            // Let Bootstrap handle modal toggles (e.g. #safetyModal, #qualifyModal)
            if (this.hasAttribute('data-bs-toggle') && this.getAttribute('data-bs-toggle') === 'modal') {
                return;
            }

            const isOffcanvas = this.hasAttribute('data-bs-dismiss') || this.closest('.offcanvas');
            const resolved = navAliases[targetId] || targetId;
            const targetElement = document.querySelector(resolved);

            if (targetElement) {
                // Target element exists on the CURRENT page: scroll smoothly right here!
                e.preventDefault();
                if (isOffcanvas) {
                    if (lenis) lenis.start();
                    setTimeout(() => {
                        scrollToTarget(targetId);
                    }, 250);
                } else {
                    scrollToTarget(targetId);
                }
                return;
            }

            // Target element does NOT exist on current page:
            // Navigate to index.html with the target hash
            const path = window.location.pathname;
            const isIndexPage = path.endsWith('index.html') || path.endsWith('/') || path === '';
            if (!isIndexPage) {
                e.preventDefault();
                window.location.href = `index.html${targetId}`;
            }
        });
    });

    // Handle deep-linking to hash sections on page load
    function handleInitialHashScroll() {
        if (window.location.hash) {
            const hash = window.location.hash;
            if (hash === '#login') {
                setTimeout(openLoginModal, 300);
            } else if (hash !== '#' && hash !== '#hero' && hash !== '#home') {
                const loader = document.getElementById('pageLoader');
                if (loader) {
                    loader.style.display = 'none';
                    document.body.style.overflow = '';
                    if (lenis) lenis.start();
                }
                setTimeout(() => {
                    scrollToTarget(hash, true);
                }, 100);
                setTimeout(() => {
                    scrollToTarget(hash, true);
                }, 450);
            }
        }
    }

    handleInitialHashScroll();
    window.addEventListener('load', handleInitialHashScroll);
    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            scrollToTarget(window.location.hash, false);
        }
    });

    // Active Navigation Highlight on Scroll (Scrollspy)
    const trackedSections = [
        { id: '#focus-areas', selector: 'a[href="#focus-areas"]' },
        { id: '#expertCareSection', selector: 'a[href="#expertCareSection"]' },
        { id: '#wellnessStepsSection', selector: 'a[href="#wellnessStepsSection"]' },
        { id: '#careOptionsSection', selector: 'a[href="#careOptionsSection"]' },
        { id: '#testimonialsSection', selector: 'a[href="#testimonialsSection"]' },
        { id: '#faqSection', selector: 'a[href="#faqSection"]' }
    ];

    function updateActiveNav(currentScrollY) {
        const scrollPosition = (typeof currentScrollY === 'number' ? currentScrollY : window.scrollY) + (header ? header.offsetHeight : 80) + 100;
        let currentSectionId = null;

        for (const item of trackedSections) {
            const el = document.querySelector(item.id);
            if (el) {
                const top = el.offsetTop;
                const height = el.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                    currentSectionId = item.id;
                    break;
                }
            }
        }

        document.querySelectorAll('.site-header .nav-link-custom').forEach(link => {
            const href = link.getAttribute('href');
            if (currentSectionId && href === currentSectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Sync header styling and active navigation on scroll
    function onScrollProgress(scrollY) {
        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        updateActiveNav(scrollY);
    }

    if (lenis) {
        lenis.on('scroll', (e) => {
            onScrollProgress(e.scroll);
        });
    } else {
        window.addEventListener('scroll', () => {
            onScrollProgress(window.scrollY);
        }, { passive: true });
    }

    // Initial check
    onScrollProgress(window.scrollY || 0);

    // =========================================================================
    // GSAP HEADING FADE-UP ANIMATIONS (SCROLLTRIGGER)
    // =========================================================================
    function initHeadingAnimations() {
        if (typeof gsap === 'undefined') return;

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Respect user accessibility preference
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Select all SECTION and PAGE headings across the template
        const headingSelectors = [
            'h1:not(.offcanvas-title):not(.brand-title)',
            'h2:not(.modal-title)',
            '.hero-title',
            '.category-hero-title',
            '.sema-title',
            '.section-heading',
            '.auth-title',
            '.order-alert-title',
            '.order-intake-title'
        ].join(', ');

        const allCandidateHeadings = document.querySelectorAll(headingSelectors);

        // Filter out modals, offcanvas, non-active tabs, and card/product labels (which must always stay visible)
        const headings = Array.from(new Set(allCandidateHeadings)).filter(el => {
            if (el.closest('.offcanvas') || el.closest('.modal')) {
                return false;
            }
            if (el.closest('.cat-tab-pane:not(.active)') || el.closest('.intake-panel:not(.active)')) {
                return false;
            }
            // Exclude micro-components, card items, sliders, carousels, and footer navigation
            if (
                el.closest('.popular-slider-outer') ||
                el.closest('.popular-card') ||
                el.closest('.focus-slider-outer') ||
                el.closest('.focus-card') ||
                el.closest('.testimonials-marquee-track') ||
                el.closest('.cat-product-card') ||
                el.closest('.site-footer') ||
                el.classList.contains('popular-card-title') ||
                el.classList.contains('cat-product-title') ||
                el.classList.contains('focus-card-title') ||
                el.classList.contains('footer-col-title') ||
                el.classList.contains('testimonial-name') ||
                el.classList.contains('step-title')
            ) {
                return false;
            }
            return true;
        });

        const pageLoader = document.getElementById('pageLoader');
        const isLoaderActive = pageLoader && window.getComputedStyle(pageLoader).display !== 'none';

        headings.forEach(heading => {
            const isHeroHeading = heading.classList.contains('hero-title') || heading.closest('.hero-section');
            if (isHeroHeading && isLoaderActive) {
                // Handled gracefully by the page loader reveal timeline
                return;
            }

            const rect = heading.getBoundingClientRect();
            const isShortPage = document.documentElement.scrollHeight <= window.innerHeight * 1.35;
            const isInInitialView = (rect.top < window.innerHeight && rect.bottom > 0) || isShortPage;

            if (isInInitialView) {
                // Immediate smooth entrance for hero / above-the-fold or funnel headings
                gsap.fromTo(heading,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: 'power3.out',
                        delay: 0.15,
                        clearProps: 'transform'
                    }
                );
            } else if (typeof ScrollTrigger !== 'undefined') {
                // Set initial hidden state below the fold
                gsap.set(heading, { opacity: 0, y: 35 });

                // Scroll-triggered fade-up when entering viewport
                gsap.to(heading, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: heading,
                        start: 'top 92%',
                        once: true,
                        invalidateOnRefresh: true
                    },
                    clearProps: 'transform'
                });
            }
        });
    }

    initHeadingAnimations();

    // =========================================================================
    // LUXURY PAGE LOADER ORCHESTRATION (INDEX PAGE)
    // =========================================================================
    function initPageLoader() {
        const loader = document.getElementById('pageLoader');
        if (!loader) return;

        // If user navigated directly to a specific section with a hash, skip loader and jump straight to section
        const initialHash = window.location.hash;
        if (initialHash && initialHash !== '#hero' && initialHash !== '#home' && initialHash !== '#') {
            loader.style.display = 'none';
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            setTimeout(() => {
                scrollToTarget(initialHash, true);
            }, 100);
            return;
        }

        // Immediately pause page scrolling while loader is active
        if (lenis) lenis.stop();
        document.body.style.overflow = 'hidden';

        const crest = loader.querySelector('.loader-crest');
        const brand = loader.querySelector('.loader-brand');
        const tagline = loader.querySelector('.loader-tagline');
        const progressFill = document.getElementById('loaderProgressFill');
        const counter = document.getElementById('loaderCounter');
        const statusText = loader.querySelector('.loader-status-text');
        const loaderContent = loader.querySelector('.loader-content');

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || typeof gsap === 'undefined') {
            loader.style.display = 'none';
            document.body.style.overflow = '';
            if (lenis) lenis.start();
            return;
        }

        // Set initial states for elements
        gsap.set(crest, { opacity: 0, scale: 0.75, filter: 'blur(6px)' });
        gsap.set(brand, { opacity: 0, y: 35, filter: 'blur(8px)' });
        gsap.set(tagline, { opacity: 0, y: 15, letterSpacing: '0.18em' });
        gsap.set('.loader-progress-wrap', { opacity: 0, y: 20 });

        // Hide site header and hero elements initially so they reveal after loader lifts
        const siteHeader = document.getElementById('siteHeader');
        const heroTitle = document.querySelector('.hero-title');
        const heroDesc = document.querySelector('.hero-description');
        const heroCta = document.querySelector('.btn-hero-cta');

        if (siteHeader) gsap.set(siteHeader, { opacity: 0, y: -25 });
        if (heroTitle) gsap.set(heroTitle, { opacity: 0, y: 40 });
        if (heroDesc) gsap.set(heroDesc, { opacity: 0, y: 25 });
        if (heroCta) gsap.set(heroCta, { opacity: 0, y: 25 });

        // Progress counter object
        const progressObj = { value: 0 };

        // Master Timeline
        const tl = gsap.timeline();

        // 1. Entrance choreography
        tl.to(crest, {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: 'power3.out'
        }, 0.1)
        .to(brand, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.85,
            ease: 'power3.out'
        }, 0.25)
        .to(tagline, {
            opacity: 0.85,
            y: 0,
            letterSpacing: '0.36em',
            duration: 0.75,
            ease: 'power2.out'
        }, 0.4)
        .to('.loader-progress-wrap', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, 0.5);

        // 2. Fluid Progress Simulation & Tracking
        tl.to(progressObj, {
            value: 100,
            duration: 1.35,
            ease: 'power2.inOut',
            onUpdate: function () {
                const current = Math.round(progressObj.value);
                if (progressFill) progressFill.style.width = current + '%';
                if (counter) counter.textContent = current + '%';

                if (current > 80 && statusText) {
                    statusText.textContent = 'READY';
                } else if (current > 35 && statusText) {
                    statusText.textContent = 'PREPARING';
                }
            }
        }, 0.5);

        // 3. Elegant Exit Curtain Lift & Hero Unveil
        tl.to(loaderContent, {
            opacity: 0,
            y: -30,
            filter: 'blur(8px)',
            duration: 0.5,
            ease: 'power2.in'
        }, '+=0.1')
        .to(loader, {
            yPercent: -100,
            duration: 1.05,
            ease: 'power4.inOut',
            onComplete: function () {
                loader.style.display = 'none';
                document.body.style.overflow = '';
                if (lenis) lenis.start();
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                if (window.location.hash && window.location.hash !== '#hero' && window.location.hash !== '#home' && window.location.hash !== '#') {
                    scrollToTarget(window.location.hash, false);
                }
            }
        }, '-=0.15')
        // Orchestrated Hero entrance as curtain clears
        .to(siteHeader, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'transform'
        }, '-=0.65')
        .to(heroTitle, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power3.out',
            clearProps: 'transform'
        }, '-=0.65')
        .to([heroDesc, heroCta], {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform'
        }, '-=0.7');
    }

    initPageLoader();

    /* -------------------------------------------------------------
       FOCUS AREAS SLIDER INITIALIZATION
       - At the beginning: Card 1 starts under the Bootstrap container left edge
       - After that: transitions continue sliding from the display edge (full viewport width)
       - Auto-scrolls every 3 seconds
       - Pause on mouse hover (desktop)
       - Touch & mouse drag support
       - Prev / Next navigation buttons
       ------------------------------------------------------------- */
    function initFocusSlider() {
        const wrapper = document.getElementById('focusSliderWrapper');
        const track = document.getElementById('focusSliderTrack');
        const prevBtn = document.getElementById('focusPrevBtn');
        const nextBtn = document.getElementById('focusNextBtn');
        const controls = document.querySelector('.focus-slider-controls');

        if (!wrapper || !track) return;

        // Ensure spacer element exists at the beginning of track
        let spacer = document.getElementById('focusSliderSpacer');
        if (!spacer) {
            spacer = document.createElement('div');
            spacer.id = 'focusSliderSpacer';
            spacer.className = 'focus-slider-spacer';
            spacer.setAttribute('aria-hidden', 'true');
            track.prepend(spacer);
        }

        // Clone cards to enable seamless infinite wrapping
        const originalCards = Array.from(track.querySelectorAll('.focus-card'));
        const cardCount = originalCards.length;
        if (cardCount === 0) return;

        // Create 2 additional sets of clones (Set A, Set B, Set C)
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        let singleSetWidth = 0;
        let cardStep = 0;
        let initialOffset = 0;
        let prevInitialOffset = 0;

        function updateDimensions() {
            const firstCard = track.querySelector('.focus-card');
            if (!firstCard) return;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 16;
            const cardWidth = firstCard.offsetWidth;
            cardStep = cardWidth + gap;
            singleSetWidth = cardCount * cardStep;
        }

        function updateSpacer() {
            const container = document.querySelector('.focus-areas-section .container') ||
                document.querySelector('.site-header .container') ||
                document.querySelector('.container');
            if (container && spacer) {
                const rect = container.getBoundingClientRect();
                const style = window.getComputedStyle(container);
                const paddingLeft = parseFloat(style.paddingLeft) || 0;
                const containerLeft = rect.left + paddingLeft;
                const trackStyle = window.getComputedStyle(track);
                const gap = parseFloat(trackStyle.gap) || 16;
                const spacerWidth = Math.max(0, containerLeft - gap);

                spacer.style.width = `${spacerWidth}px`;
                spacer.style.flex = `0 0 ${spacerWidth}px`;
                document.documentElement.style.setProperty('--container-left-offset', `${Math.max(15, containerLeft)}px`);

                if (prevInitialOffset > 0 && Math.abs(containerLeft - prevInitialOffset) > 0.5) {
                    if (wrapper.scrollLeft > 15) {
                        wrapper.scrollLeft += (containerLeft - prevInitialOffset);
                    }
                }
                prevInitialOffset = containerLeft;
                initialOffset = containerLeft;
            }
        }

        updateDimensions();
        updateSpacer();

        window.addEventListener('resize', () => {
            updateDimensions();
            updateSpacer();
        }, { passive: true });

        // Start scroll at the beginning (Card 1 aligned under the container left edge)
        wrapper.scrollLeft = 0;

        // Auto-transition state (Every 3 seconds)
        const SLIDE_INTERVAL = 3000;
        let isPaused = false;
        let isInteracting = false;
        let autoSlideTimer = null;

        function goToNextSlide() {
            updateDimensions();
            updateSpacer();

            // At the beginning (under container), first slide transitions to display edge
            if (wrapper.scrollLeft < 10) {
                wrapper.scrollTo({ left: initialOffset + cardStep, behavior: 'smooth' });
            } else {
                // Seamlessly wrap within clone sets if scrolled far out
                if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 1.8) {
                    wrapper.scrollLeft -= singleSetWidth;
                }
                wrapper.scrollBy({ left: cardStep, behavior: 'smooth' });
            }
        }

        function goToPrevSlide() {
            updateDimensions();
            updateSpacer();

            // If at Card 2 (near initialOffset + cardStep), smooth scroll back to initial under container
            if (wrapper.scrollLeft <= initialOffset + cardStep + 15 && wrapper.scrollLeft > 15) {
                wrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (wrapper.scrollLeft <= 15) {
                // At beginning, wrap to previous set at display edge
                wrapper.scrollLeft = initialOffset + singleSetWidth;
                wrapper.scrollBy({ left: -cardStep, behavior: 'smooth' });
            } else {
                wrapper.scrollBy({ left: -cardStep, behavior: 'smooth' });
            }
        }

        // Keep scroll position within infinite loop bounds on manual scroll
        wrapper.addEventListener('scroll', () => {
            if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 2) {
                wrapper.scrollLeft -= singleSetWidth;
            } else if (wrapper.scrollLeft < 0) {
                wrapper.scrollLeft += singleSetWidth;
            }
        }, { passive: true });

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                if (!isPaused && !isInteracting && !isMouseDown && !isTouching) {
                    goToNextSlide();
                }
            }, SLIDE_INTERVAL);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        function resetAutoSlideTimer() {
            stopAutoSlide();
            startAutoSlide();
        }

        // Pause on mouse hover (desktop)
        wrapper.addEventListener('mouseenter', () => { isPaused = true; });
        wrapper.addEventListener('mouseleave', () => {
            isPaused = false;
            resetAutoSlideTimer();
        });

        if (controls) {
            controls.addEventListener('mouseenter', () => { isPaused = true; });
            controls.addEventListener('mouseleave', () => {
                isPaused = false;
                resetAutoSlideTimer();
            });
        }

        // Manual Navigation: Previous Button
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                isInteracting = true;
                goToPrevSlide();
                resetAutoSlideTimer();
                setTimeout(() => { isInteracting = false; }, 600);
            });
        }

        // Manual Navigation: Next Button
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                isInteracting = true;
                goToNextSlide();
                resetAutoSlideTimer();
                setTimeout(() => { isInteracting = false; }, 600);
            });
        }

        // Touch & Swipe navigation (Mobile / Tablets)
        let isTouching = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let hasTouchDragged = false;
        let isSuppressingClick = false;

        wrapper.addEventListener('touchstart', (e) => {
            isTouching = true;
            isInteracting = true;
            hasTouchDragged = false;
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
            stopAutoSlide();
        }, { passive: true });

        wrapper.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;
                if (Math.hypot(dx, dy) > 8) {
                    hasTouchDragged = true;
                }
            }
            if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 2.1) {
                wrapper.scrollLeft -= singleSetWidth;
            }
        }, { passive: true });

        wrapper.addEventListener('touchend', () => {
            isTouching = false;
            isInteracting = false;
            resetAutoSlideTimer();
            if (hasTouchDragged) {
                isSuppressingClick = true;
                setTimeout(() => {
                    isSuppressingClick = false;
                    hasTouchDragged = false;
                }, 120);
            }
        }, { passive: true });

        // Mouse Drag to Pan (Desktop)
        let isMouseDown = false;
        let startX = 0;
        let startScrollLeft = 0;
        let hasMouseDragged = false;

        wrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isMouseDown = true;
            isInteracting = true;
            hasMouseDragged = false;
            stopAutoSlide();
            wrapper.classList.add('is-dragging');
            startX = e.pageX - wrapper.offsetLeft;
            startScrollLeft = wrapper.scrollLeft;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.2;
            if (Math.abs(walk) > 6) {
                hasMouseDragged = true;
                e.preventDefault();
            }
            wrapper.scrollLeft = startScrollLeft - walk;

            if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 2) {
                wrapper.scrollLeft -= singleSetWidth;
                startScrollLeft -= singleSetWidth;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                isInteracting = false;
                wrapper.classList.remove('is-dragging');
                resetAutoSlideTimer();
                if (hasMouseDragged) {
                    isSuppressingClick = true;
                    setTimeout(() => {
                        isSuppressingClick = false;
                        hasMouseDragged = false;
                    }, 120);
                }
            }
        });

        // Click delegation on focus slider track to navigate to category.html with selected category
        track.addEventListener('click', (e) => {
            if (isSuppressingClick || hasMouseDragged || hasTouchDragged) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            const card = e.target.closest('.focus-card');
            if (!card) return;

            const link = card.querySelector('.focus-card-btn') || card.querySelector('a');
            const category = card.getAttribute('data-category');

            if (link && link.getAttribute('href')) {
                e.preventDefault();
                window.location.href = link.getAttribute('href');
            } else if (category) {
                e.preventDefault();
                window.location.href = `category.html?category=${encodeURIComponent(category)}`;
            }
        });

        // Initialize 3-second automatic transition
        startAutoSlide();
    }

    /* -------------------------------------------------------------
       MOST POPULAR TREATMENTS SLIDER INITIALIZATION
       - Identical slider behavior to Focus Areas section:
         * At the beginning: Card 1 starts under the Bootstrap container left edge
         * After that: transitions continue sliding from display edge (full viewport width)
         * Auto-scrolls every 3 seconds
         * Pause on mouse hover
         * Touch & mouse drag support
         * Prev / Next navigation chevron buttons
       ------------------------------------------------------------- */
    function initPopularTreatmentsSlider() {
        const wrapper = document.getElementById('popularSliderWrapper');
        const track = document.getElementById('popularSliderTrack');
        const prevBtn = document.getElementById('popularPrevBtn');
        const nextBtn = document.getElementById('popularNextBtn');
        const controls = document.querySelector('.popular-slider-controls');

        if (!wrapper || !track) return;

        // Ensure spacer element exists at the beginning of track
        let spacer = document.getElementById('popularSliderSpacer');
        if (!spacer) {
            spacer = document.createElement('div');
            spacer.id = 'popularSliderSpacer';
            spacer.className = 'popular-slider-spacer';
            spacer.setAttribute('aria-hidden', 'true');
            track.prepend(spacer);
        }

        // Ensure original card titles, prices, and badges are visible and clean of any hiding styles
        track.querySelectorAll('.popular-card-title, .popular-card-price, .popular-card-badge').forEach(el => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.transform = 'none';
        });

        // Clone cards to enable seamless infinite wrapping
        const originalCards = Array.from(track.querySelectorAll('.popular-card'));
        const cardCount = originalCards.length;
        if (cardCount === 0) return;

        // Create 2 additional sets of clones (Set A, Set B, Set C)
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            // Ensure clone content is fully visible
            clone.querySelectorAll('.popular-card-title, .popular-card-price, .popular-card-badge').forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.transform = 'none';
            });
            track.appendChild(clone);
        });
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            // Ensure clone content is fully visible
            clone.querySelectorAll('.popular-card-title, .popular-card-price, .popular-card-badge').forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.transform = 'none';
            });
            track.appendChild(clone);
        });

        let singleSetWidth = 0;
        let cardStep = 0;
        let initialOffset = 0;
        let prevInitialOffset = 0;

        function updateDimensions() {
            const firstCard = track.querySelector('.popular-card');
            if (!firstCard) return;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 16;
            const cardWidth = firstCard.offsetWidth;
            cardStep = cardWidth + gap;
            singleSetWidth = cardCount * cardStep;
        }

        function updateSpacer() {
            const container = document.querySelector('.popular-treatments-section .container') ||
                document.querySelector('.site-header .container') ||
                document.querySelector('.container');
            if (container && spacer) {
                const rect = container.getBoundingClientRect();
                const style = window.getComputedStyle(container);
                const paddingLeft = parseFloat(style.paddingLeft) || 0;
                const containerLeft = rect.left + paddingLeft;
                const trackStyle = window.getComputedStyle(track);
                const gap = parseFloat(trackStyle.gap) || 16;
                const spacerWidth = Math.max(0, containerLeft - gap);

                spacer.style.width = `${spacerWidth}px`;
                spacer.style.flex = `0 0 ${spacerWidth}px`;

                if (prevInitialOffset > 0 && Math.abs(containerLeft - prevInitialOffset) > 0.5) {
                    if (wrapper.scrollLeft > 15) {
                        wrapper.scrollLeft += (containerLeft - prevInitialOffset);
                    }
                }
                prevInitialOffset = containerLeft;
                initialOffset = containerLeft;
            }
        }

        updateDimensions();
        updateSpacer();

        window.addEventListener('resize', () => {
            updateDimensions();
            updateSpacer();
        }, { passive: true });

        // Start scroll at the beginning (Card 1 aligned under the container left edge)
        wrapper.scrollLeft = 0;

        // Auto-transition state (Every 3 seconds)
        const SLIDE_INTERVAL = 3000;
        let isPaused = false;
        let isInteracting = false;
        let autoSlideTimer = null;

        function goToNextSlide() {
            updateDimensions();
            updateSpacer();

            // At the beginning (under container), first slide transitions to display edge
            if (wrapper.scrollLeft < 10) {
                wrapper.scrollTo({ left: initialOffset + cardStep, behavior: 'smooth' });
            } else {
                // Seamlessly wrap within clone sets if scrolled far out
                if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 1.8) {
                    wrapper.scrollLeft -= singleSetWidth;
                }
                wrapper.scrollBy({ left: cardStep, behavior: 'smooth' });
            }
        }

        function goToPrevSlide() {
            updateDimensions();
            updateSpacer();

            // If at Card 2 (near initialOffset + cardStep), smooth scroll back to initial under container
            if (wrapper.scrollLeft <= initialOffset + cardStep + 15 && wrapper.scrollLeft > 15) {
                wrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (wrapper.scrollLeft <= 15) {
                // At beginning, wrap to previous set at display edge
                wrapper.scrollLeft = initialOffset + singleSetWidth;
                wrapper.scrollBy({ left: -cardStep, behavior: 'smooth' });
            } else {
                wrapper.scrollBy({ left: -cardStep, behavior: 'smooth' });
            }
        }

        // Keep scroll position within infinite loop bounds on manual scroll
        wrapper.addEventListener('scroll', () => {
            if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 2) {
                wrapper.scrollLeft -= singleSetWidth;
            } else if (wrapper.scrollLeft < 0) {
                wrapper.scrollLeft += singleSetWidth;
            }
        }, { passive: true });

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                if (!isPaused && !isInteracting && !isMouseDown && !isTouching) {
                    goToNextSlide();
                }
            }, SLIDE_INTERVAL);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        function resetAutoSlideTimer() {
            stopAutoSlide();
            startAutoSlide();
        }

        // Pause on mouse hover (desktop)
        wrapper.addEventListener('mouseenter', () => { isPaused = true; });
        wrapper.addEventListener('mouseleave', () => {
            isPaused = false;
            resetAutoSlideTimer();
        });

        if (controls) {
            controls.addEventListener('mouseenter', () => { isPaused = true; });
            controls.addEventListener('mouseleave', () => {
                isPaused = false;
                resetAutoSlideTimer();
            });
        }

        // Manual Navigation: Previous Button
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                isInteracting = true;
                goToPrevSlide();
                resetAutoSlideTimer();
                setTimeout(() => { isInteracting = false; }, 600);
            });
        }

        // Manual Navigation: Next Button
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                isInteracting = true;
                goToNextSlide();
                resetAutoSlideTimer();
                setTimeout(() => { isInteracting = false; }, 600);
            });
        }

        // Touch & Swipe navigation (Mobile / Tablets)
        let isTouching = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let hasTouchDragged = false;
        let isSuppressingClick = false;

        wrapper.addEventListener('touchstart', (e) => {
            isTouching = true;
            isInteracting = true;
            hasTouchDragged = false;
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
            stopAutoSlide();
        }, { passive: true });

        wrapper.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;
                if (Math.hypot(dx, dy) > 8) {
                    hasTouchDragged = true;
                }
            }
            if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 2.1) {
                wrapper.scrollLeft -= singleSetWidth;
            }
        }, { passive: true });

        wrapper.addEventListener('touchend', () => {
            isTouching = false;
            isInteracting = false;
            resetAutoSlideTimer();
            if (hasTouchDragged) {
                isSuppressingClick = true;
                setTimeout(() => {
                    isSuppressingClick = false;
                    hasTouchDragged = false;
                }, 120);
            }
        }, { passive: true });

        // Mouse Drag to Pan (Desktop)
        let isMouseDown = false;
        let startX = 0;
        let startScrollLeft = 0;
        let hasMouseDragged = false;

        wrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isMouseDown = true;
            isInteracting = true;
            hasMouseDragged = false;
            stopAutoSlide();
            wrapper.classList.add('is-dragging');
            startX = e.pageX - wrapper.offsetLeft;
            startScrollLeft = wrapper.scrollLeft;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            const x = e.pageX - wrapper.offsetLeft;
            const walk = (x - startX) * 1.2;
            if (Math.abs(walk) > 6) {
                hasMouseDragged = true;
                e.preventDefault();
            }
            wrapper.scrollLeft = startScrollLeft - walk;

            if (wrapper.scrollLeft >= initialOffset + singleSetWidth * 2) {
                wrapper.scrollLeft -= singleSetWidth;
                startScrollLeft -= singleSetWidth;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                isInteracting = false;
                wrapper.classList.remove('is-dragging');
                resetAutoSlideTimer();
                if (hasMouseDragged) {
                    isSuppressingClick = true;
                    setTimeout(() => {
                        isSuppressingClick = false;
                        hasMouseDragged = false;
                    }, 120);
                }
            }
        });

        // Suppress click events when user was dragging the popular slider
        track.addEventListener('click', (e) => {
            if (isSuppressingClick || hasMouseDragged || hasTouchDragged) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Initialize 3-second automatic transition
        startAutoSlide();
    }

    function initTestimonialsSlider() {
        const rows = document.querySelectorAll('.testimonials-slider-row');
        rows.forEach(row => {
            const track = row.querySelector('.testimonials-slider-track');
            if (!track) return;

            let isDown = false;
            let startX = 0;
            let initialTransform = 0;

            row.addEventListener('mousedown', (e) => {
                isDown = true;
                row.classList.add('is-dragging');
                startX = e.pageX;

                try {
                    const style = window.getComputedStyle(track);
                    const matrix = new DOMMatrixReadOnly(style.transform);
                    initialTransform = matrix.m41;
                    track.style.animation = 'none';
                    track.style.transform = `translateX(${initialTransform}px)`;
                } catch (err) {
                    // Fallback
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const delta = e.pageX - startX;
                track.style.transform = `translateX(${initialTransform + delta}px)`;
            });

            window.addEventListener('mouseup', () => {
                if (isDown) {
                    isDown = false;
                    row.classList.remove('is-dragging');
                    track.style.animation = '';
                    track.style.transform = '';
                }
            });
        });
    }

    /**
     * ==========================================
     * FAQ ACCORDION INTERACTIVITY
     * ==========================================
     */
    function initFaqAccordion() {
        const accordion = document.getElementById('faqAccordion');
        if (!accordion) return;

        const items = accordion.querySelectorAll('.faq-item');

        items.forEach((item) => {
            const trigger = item.querySelector('.faq-trigger');
            if (!trigger) return;

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const isCurrentlyActive = item.classList.contains('is-active');

                // Close all other accordion items
                items.forEach((otherItem) => {
                    if (otherItem !== item && otherItem.classList.contains('is-active')) {
                        otherItem.classList.remove('is-active');
                        const otherBtn = otherItem.querySelector('.faq-trigger');
                        if (otherBtn) {
                            otherBtn.setAttribute('aria-expanded', 'false');
                        }
                    }
                });

                // Toggle current item
                if (isCurrentlyActive) {
                    item.classList.remove('is-active');
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('is-active');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    initFocusSlider();
    initPopularTreatmentsSlider();
    initTestimonialsSlider();
    initFaqAccordion();
    initCategoryPageTabsAndSliders();

    /**
     * ==========================================
     * CATEGORY PAGE TABS & ALL TREATMENTS PAGINATION
     * ==========================================
     */
    function initCategoryPageTabsAndSliders() {
        const tabsNav = document.querySelector('.cat-tabs-nav');
        if (!tabsNav) return;

        const tabButtons = Array.from(tabsNav.querySelectorAll('.cat-tab-btn'));
        const tabPanes = Array.from(document.querySelectorAll('.cat-tab-pane'));

        // Category aliases mapping to internal canonical keys
        const categoryMap = {
            'all': 'all',
            'all-treatments': 'all',
            'alltreatments': 'all',
            'treatments': 'all',
            'weight-loss': 'weight-loss',
            'weightloss': 'weight-loss',
            'weight': 'weight-loss',
            'hormone-health': 'hormone-health',
            'hormone': 'hormone-health',
            'menopause': 'hormone-health',
            'sexual-health': 'sexual-health',
            'sexual': 'sexual-health',
            'longevity': 'longevity',
            'sleep': 'longevity',
            'skin-hair': 'skin-hair',
            'hair-skin': 'skin-hair',
            'hair': 'skin-hair',
            'skin': 'skin-hair'
        };

        // Scroll helper to smoothly scroll to the category showcase section
        function scrollToCategorySection() {
            const targetEl = document.getElementById('categoryProducts') || tabsNav;
            if (targetEl) {
                const header = document.querySelector('.site-header');
                const headerH = header ? header.offsetHeight : 80;
                const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - (headerH + 20);
                window.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: 'smooth'
                });
            }
        }

        // Activates category tab button and pane
        function activateCategory(catRaw, shouldScroll = false) {
            if (!catRaw) return;
            const normalizedKey = String(catRaw).trim().toLowerCase();
            const resolvedCat = categoryMap[normalizedKey] || normalizedKey;

            // Find matching tab button by data-category or aria-controls
            let targetBtn = tabButtons.find(b => {
                const bCat = (b.getAttribute('data-category') || '').toLowerCase();
                const bControls = (b.getAttribute('aria-controls') || '').toLowerCase();
                return bCat === resolvedCat || bControls === `pane${resolvedCat.replace(/-/g, '')}` || bControls === resolvedCat;
            });

            if (!targetBtn) {
                // Fallback to first tab
                targetBtn = tabButtons[0];
            }

            const targetPaneId = targetBtn ? targetBtn.getAttribute('aria-controls') : 'paneAll';
            const targetPane = document.getElementById(targetPaneId);

            // Update active state on tab buttons
            tabButtons.forEach(b => {
                const isTarget = (b === targetBtn);
                b.classList.toggle('active', isTarget);
                b.setAttribute('aria-selected', isTarget ? 'true' : 'false');
            });

            // Update active state on tab panes
            tabPanes.forEach(pane => {
                const isTarget = (pane.id === targetPaneId);
                pane.classList.toggle('active', isTarget);
            });

            // Animate product cards in newly activated pane
            if (typeof gsap !== 'undefined' && targetPane) {
                const visibleCards = targetPane.querySelectorAll('.cat-product-card:not([style*="display: none"])');
                if (visibleCards.length) {
                    gsap.fromTo(visibleCards,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            stagger: 0.05,
                            ease: 'power2.out',
                            clearProps: 'transform'
                        }
                    );
                }
            }

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }

            if (shouldScroll) {
                scrollToCategorySection();
            }
        }

        // Click listeners on tab buttons
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = btn.getAttribute('data-category');
                activateCategory(cat, false);

                // Update browser URL query parameter without page reload
                if (window.history && window.history.replaceState) {
                    const newUrl = cat === 'all'
                        ? window.location.pathname
                        : `${window.location.pathname}?category=${encodeURIComponent(cat)}`;
                    window.history.replaceState(null, '', newUrl);
                }
            });
        });

        // Intercept dropdown links on category.html so navigation switches tabs dynamically
        document.querySelectorAll('a[href*="category.html?category="], a[href*="?category="]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const match = href.match(/[?&]category=([^&#]+)/);
                if (match && match[1]) {
                    e.preventDefault();
                    const catParam = decodeURIComponent(match[1]);
                    activateCategory(catParam, true);

                    if (window.history && window.history.pushState) {
                        window.history.pushState(null, '', `category.html?category=${encodeURIComponent(catParam)}`);
                    }
                }
            });
        });

        // Helper to extract category parameter from URL (search query or hash)
        function getCategoryFromUrl() {
            const params = new URLSearchParams(window.location.search);
            const catQuery = params.get('category') || params.get('cat');
            if (catQuery) return catQuery;

            if (window.location.hash) {
                const hash = window.location.hash.replace('#', '').toLowerCase();
                if (categoryMap[hash]) return hash;
                const matchedPane = tabPanes.find(p => p.id.toLowerCase() === hash || p.id.toLowerCase() === `pane${hash}`);
                if (matchedPane) {
                    const matchedBtn = tabButtons.find(b => b.getAttribute('aria-controls') === matchedPane.id);
                    if (matchedBtn) return matchedBtn.getAttribute('data-category');
                }
            }
            return null;
        }

        // Initialize from URL on page load
        const initialCategory = getCategoryFromUrl();
        if (initialCategory) {
            activateCategory(initialCategory, false);
            // Smoothly scroll down to the category products section after page elements settle
            setTimeout(() => {
                scrollToCategorySection();
            }, 300);
        } else {
            activateCategory('all', false);
        }

        // Support browser Back and Forward buttons
        window.addEventListener('popstate', () => {
            const cat = getCategoryFromUrl() || 'all';
            activateCategory(cat, false);
        });

        // Initialize All Treatments Pagination
        initAllTreatmentsPagination();
    }

    /**
     * ==========================================
     * ALL TREATMENTS 2-ROW PAGINATION
     * ==========================================
     */
    function initAllTreatmentsPagination() {
        const grid = document.getElementById('allProductsGrid');
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll('.cat-product-card'));
        const prevBtn = document.getElementById('catPrevPage');
        const nextBtn = document.getElementById('catNextPage');
        const pageNumBtns = Array.from(document.querySelectorAll('#catPageNumbers .cat-page-num'));
        const infoText = document.getElementById('catPaginationInfo');

        const TOTAL_PRODUCTS = cards.length || 20;
        const ITEMS_PER_PAGE = 8; // 4 columns x 2 rows = 8 products per page
        const TOTAL_PAGES = Math.ceil(TOTAL_PRODUCTS / ITEMS_PER_PAGE) || 3;
        let currentPage = 1;

        function renderPage(page, animate = true) {
            if (page < 1) page = 1;
            if (page > TOTAL_PAGES) page = TOTAL_PAGES;
            currentPage = page;

            // Set data attribute on grid container for CSS styling
            grid.setAttribute('data-current-page', String(currentPage));

            // Show cards for the current page, hide cards for other pages
            const visibleCards = [];
            cards.forEach(card => {
                const cardPage = parseInt(card.getAttribute('data-cat-page'), 10);
                if (cardPage === currentPage) {
                    card.style.display = '';
                    visibleCards.push(card);
                } else {
                    card.style.display = 'none';
                }
            });

            // Update Prev / Next button disabled state
            if (prevBtn) {
                prevBtn.disabled = (currentPage === 1);
                prevBtn.setAttribute('aria-disabled', currentPage === 1 ? 'true' : 'false');
            }
            if (nextBtn) {
                nextBtn.disabled = (currentPage === TOTAL_PAGES);
                nextBtn.setAttribute('aria-disabled', currentPage === TOTAL_PAGES ? 'true' : 'false');
            }

            // Update page number buttons
            pageNumBtns.forEach(btn => {
                const btnPage = parseInt(btn.getAttribute('data-page'), 10);
                const isActive = (btnPage === currentPage);
                btn.classList.toggle('active', isActive);
                if (isActive) {
                    btn.setAttribute('aria-current', 'page');
                } else {
                    btn.removeAttribute('aria-current');
                }
            });

            // Update pagination summary text
            const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
            const endItem = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_PRODUCTS);
            if (infoText) {
                infoText.innerHTML = `Showing <strong>${startItem}–${endItem}</strong> of <strong>${TOTAL_PRODUCTS}</strong> treatments`;
            }

            // Animate newly visible cards
            if (animate && typeof gsap !== 'undefined' && visibleCards.length) {
                gsap.fromTo(visibleCards,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.45,
                        stagger: 0.04,
                        ease: 'power2.out',
                        clearProps: 'transform'
                    }
                );
            }

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }

        // Smooth scroll to top of grid when page changes
        function scrollToGridTop() {
            const header = document.querySelector('.site-header');
            const headerH = header ? header.offsetHeight : 80;
            const targetTop = grid.getBoundingClientRect().top + window.pageYOffset - (headerH + 25);
            window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth'
            });
        }

        // Prev Button Click
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) {
                    renderPage(currentPage - 1, true);
                    scrollToGridTop();
                }
            });
        }

        // Next Button Click
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < TOTAL_PAGES) {
                    renderPage(currentPage + 1, true);
                    scrollToGridTop();
                }
            });
        }

        // Page Number Buttons Click
        pageNumBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = parseInt(btn.getAttribute('data-page'), 10);
                if (targetPage && targetPage !== currentPage) {
                    renderPage(targetPage, true);
                    scrollToGridTop();
                }
            });
        });

        // Initialize Page 1
        renderPage(1, false);
    }

    /**
     * ==========================================
     * SEMAGLUTIDE PRODUCT PAGE: THUMBNAIL SLIDER & ACCORDION
     * ==========================================
     */
    function initSemaglutidePage() {
        const mainImg = document.getElementById('semaMainImg');
        const thumbTrack = document.getElementById('semaThumbTrack');
        const prevBtn = document.getElementById('semaThumbPrev');
        const nextBtn = document.getElementById('semaThumbNext');

        if (mainImg && thumbTrack) {
            const thumbItems = Array.from(thumbTrack.querySelectorAll('.sema-thumb-item'));
            const galleryWrap = document.querySelector('.sema-gallery-wrap');
            let currentIndex = 0;
            let autoSlideTimer = null;
            const AUTO_SLIDE_INTERVAL = 3500; // Auto-slide every 3.5 seconds

            function setActiveThumbnail(index) {
                if (index < 0) index = thumbItems.length - 1;
                if (index >= thumbItems.length) index = 0;
                currentIndex = index;

                thumbItems.forEach((item, idx) => {
                    const isActive = idx === currentIndex;
                    item.classList.toggle('active', isActive);
                    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                const targetImg = thumbItems[currentIndex].getAttribute('data-img');
                if (targetImg && mainImg.getAttribute('src') !== targetImg) {
                    mainImg.classList.add('fading');
                    setTimeout(() => {
                        mainImg.src = targetImg;
                        mainImg.onload = () => {
                            mainImg.classList.remove('fading');
                        };
                        setTimeout(() => mainImg.classList.remove('fading'), 200);
                    }, 100);
                }
            }

            function startAutoSlide() {
                stopAutoSlide();
                autoSlideTimer = setInterval(() => {
                    setActiveThumbnail(currentIndex + 1);
                }, AUTO_SLIDE_INTERVAL);
            }

            function stopAutoSlide() {
                if (autoSlideTimer) {
                    clearInterval(autoSlideTimer);
                    autoSlideTimer = null;
                }
            }

            function resetAutoSlide() {
                startAutoSlide();
            }

            thumbItems.forEach((btn, idx) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setActiveThumbnail(idx);
                    resetAutoSlide();
                });
            });

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setActiveThumbnail(currentIndex - 1);
                    resetAutoSlide();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setActiveThumbnail(currentIndex + 1);
                    resetAutoSlide();
                });
            }

            // Pause auto-sliding on hover
            if (galleryWrap) {
                galleryWrap.addEventListener('mouseenter', stopAutoSlide);
                galleryWrap.addEventListener('mouseleave', startAutoSlide);
            }

            // Pause when tab/window is hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoSlide();
                } else {
                    startAutoSlide();
                }
            });

            // Start auto sliding immediately
            startAutoSlide();
        }

        // Interactive Accordions (Single-open with smooth transition)
        const accordionGroup = document.getElementById('semaAccordion');
        if (accordionGroup) {
            const cards = accordionGroup.querySelectorAll('.sema-accordion-card');
            cards.forEach(card => {
                const header = card.querySelector('.sema-accordion-header');

                if (header) {
                    header.addEventListener('click', (e) => {
                        e.preventDefault();
                        const isCurrentlyOpen = card.classList.contains('open');

                        // Close all other accordion cards in this group
                        cards.forEach(otherCard => {
                            if (otherCard !== card && otherCard.classList.contains('open')) {
                                otherCard.classList.remove('open');
                                const otherHeader = otherCard.querySelector('.sema-accordion-header');
                                if (otherHeader) {
                                    otherHeader.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });

                        // Toggle clicked card
                        if (isCurrentlyOpen) {
                            card.classList.remove('open');
                            header.setAttribute('aria-expanded', 'false');
                        } else {
                            card.classList.add('open');
                            header.setAttribute('aria-expanded', 'true');
                        }
                    });
                }
            });
        }
    }

    initSemaglutidePage();

    // Ensure background videos autoplay smoothly
    const footerVideo = document.querySelector('.footer-video');
    if (footerVideo) {
        footerVideo.muted = true;
        const playPromise = footerVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => { });
        }
    }
});

