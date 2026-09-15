/* ==========================================================
   LENIS INERTIA SMOOTH SCROLLING (Workshop-Style)
   ----------------------------------------------------------
   Provides buttery smooth inertia scrolling matching
   curlydevguy/Workshop_website, using duration: 1.15 and
   exponential deceleration. Automatically disabled when user
   requests reduced motion, and keeps touch scrolling native (1:1)
   on mobile devices for maximum responsiveness.
========================================================== */
function initLenis() {
    if (window._lenisInitialized) return;
    if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window._lenisInitialized = true;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 1,
        });

        window.lenisInstance = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
}

if (typeof window !== "undefined") {
    if (window.Lenis) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initLenis);
        } else {
            initLenis();
        }
    } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const lenisScript = document.createElement("script");
        lenisScript.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js";
        lenisScript.async = true;
        lenisScript.onload = () => {
            initLenis();
        };
        document.head.appendChild(lenisScript);
    }
}

/* ==========================================================
                RESEARCH TEAM (Read More Modal)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const overlay = document.getElementById("teamModalOverlay");

    // Only runs on pages that include the modal skeleton (team.html)
    if (!overlay) return;

    const modalBody = document.getElementById("teamModalBody");
    const closeBtn = document.getElementById("teamModalClose");

    function openModal(card) {
        const heading = card.querySelector(".card-heading");
        const detail = card.querySelector(".card-detils");
        const hidden = card.querySelector(".card-hidden");

        modalBody.innerHTML = "";

        if (heading) modalBody.appendChild(heading.cloneNode(true));
        if (detail) modalBody.appendChild(detail.cloneNode(true));

        if (hidden) {
            const hiddenClone = hidden.cloneNode(true);
            hiddenClone.style.display = "block";
            modalBody.appendChild(hiddenClone);
        }

        overlay.classList.add("open");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        overlay.classList.remove("open");
        document.body.classList.remove("modal-open");
    }

    document.querySelectorAll(".read-btn").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".team-card");
            if (card) openModal(card);
        });
    });

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

});

/* ==========================================================
   Mobile Navigation & Smooth In-Page Scrolling
   ----------------------------------------------------------
   - Automatically closes the mobile menu when any nav link is tapped
   - Toggles the hamburger icon between bars and times (close)
   - Smoothly scrolls to target anchor links without obscuring headers
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const navBtn = document.getElementById("btn");
    const navIconSpan = document.querySelector(".main-nav .icon span");

    if (navBtn) {
        // Auto-close menu when tapping any navigation link
        document.querySelectorAll(".main-nav ul li a").forEach((link) => {
            link.addEventListener("click", () => {
                if (navBtn.checked) {
                    navBtn.checked = false;
                    if (navIconSpan) {
                        navIconSpan.classList.remove("fa-times");
                        navIconSpan.classList.add("fa-bars");
                    }
                    // Collapse any open submenus
                    document.querySelectorAll('.main-nav [id^="btn-"]').forEach((sub) => {
                        sub.checked = false;
                    });
                }
            });
        });

        // Sync hamburger icon state
        navBtn.addEventListener("change", () => {
            if (!navIconSpan) return;
            if (navBtn.checked) {
                navIconSpan.classList.remove("fa-bars");
                navIconSpan.classList.add("fa-times");
            } else {
                navIconSpan.classList.remove("fa-times");
                navIconSpan.classList.add("fa-bars");
            }
        });
    }

    // Smooth scrolling for internal anchor links (#about, #contact, etc.)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const hash = this.getAttribute("href");
            if (!hash || hash === "#") return;

            const target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                if (window.lenisInstance) {
                    window.lenisInstance.scrollTo(target, { offset: -20, duration: 1.15 });
                } else {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                if (window.history.pushState) {
                    window.history.pushState(null, "", hash);
                }
            }
        });
    });
});

/* ==========================================================
   Back-to-top button
   Shows once the user scrolls down, smooth-scrolls to top on
   click. Normally sits fixed bottom-right, but once the footer
   comes into view we shift the button's "bottom" offset so it
   comes to rest just above the footer instead of floating over
   it or drifting somewhere else once the page is scrolled all
   the way down. No-ops if the button markup isn't on the page.
========================================================== */
document.addEventListener("DOMContentLoaded", () => {

    const backToTopBtn = document.getElementById("backToTopBtn");
    if (!backToTopBtn) return;

    const footer = document.querySelector(".footer-section");
    const SHOW_AFTER_PX = 300;   // how far down before the button appears
    const FOOTER_GAP_PX = 20;    // space kept between the button and the footer's top edge

    function updatePosition() {
        if (!footer) return;
        const footerTop = footer.getBoundingClientRect().top;
        const overlap = window.innerHeight - footerTop;
        if (overlap > 0) {
            // footer has scrolled into view - pin the button just above it
            backToTopBtn.style.bottom = (overlap + FOOTER_GAP_PX) + "px";
        } else {
            // footer not in view yet - fall back to the default CSS position
            backToTopBtn.style.bottom = "";
        }
    }

    function handleScroll() {
        if (window.scrollY > SHOW_AFTER_PX) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
        updatePosition();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updatePosition);

    backToTopBtn.addEventListener("click", () => {
        if (window.lenisInstance) {
            window.lenisInstance.scrollTo(0, { duration: 1.15 });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    handleScroll(); // set correct initial state on load (e.g. page refreshed mid-scroll)

});

/* ==========================================================
   SITE-WIDE SCROLL-REVEAL ENGINE
   ----------------------------------------------------------
   Runs on every page (main.js is loaded everywhere). Finds the
   common repeating content blocks across the site:
   cards, team members, publication groups, experience rows,
   teaching cards, book cards, research areas, etc.
   and tags them with the .reveal-up / .reveal-fade classes
   defined in style.css, then uses an IntersectionObserver to
   flip on .is-visible as each one scrolls into the viewport.
========================================================== */
document.addEventListener("DOMContentLoaded", () => {

    const REVEAL_SELECTORS = [
        ".reveal",
        ".image-container",
        ".work-container",
        ".team-card",
        ".flex-item-pro",
        ".flex-item",
        ".pub-year-group",
        ".experience-details-container",
        ".prototype-container .prototype-heading",
        ".proto-slideshow-wrapper",
        ".facgal-container .facgal-heading",
        ".facgal-subheading",
        ".facgal-wrapper",
        ".facgal-dots-container",
        ".fac-grid-heading",
        ".fac-grid-subheading",
        ".fac-card",
        ".contact-container .section1",
        ".contact-container .section2",
        ".contact-container .section3",
        ".rarea-card",
        ".edu-card",
        ".teach-card",
        ".book-card",
        ".pubx-card",
        ".info-card",
        ".details",
        ".postdoc-position__content",
        ".postdoc-position__information",
        ".bio-box"
    ];

    const targets = [];
    REVEAL_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => targets.push(el));
    });

    if (!targets.length) return;

    targets.forEach((el, i) => {
        el.classList.add("reveal-up");
        // Stagger only within small groups (siblings) so long pages don't
        // end up with a huge, sluggish delay by the time you scroll down -
        // the delay resets per group of 5 based on position among siblings.
        const siblingIndex = Array.prototype.indexOf.call(
            el.parentElement ? el.parentElement.children : [],
            el
        );
        const delayStep = (siblingIndex % 5) + 1;
        el.setAttribute("data-delay", String(delayStep));
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                } else {
                    entry.target.classList.remove("is-visible");
                }
            });
        },
        { threshold: 0.06, rootMargin: "0px 0px -25px 0px" }
    );

    targets.forEach((el) => {
        observer.observe(el);
    });

});

/* ==========================================================
   Subtle parallax drift for the header illustration on scroll.
   Lightweight - throttled with requestAnimationFrame, only
   moves a few pixels so it reads as "smooth" rather than
   distracting. No-ops if the header photo isn't on the page.
========================================================== */
document.addEventListener("DOMContentLoaded", () => {

    const headerPhoto = document.querySelector(".site-header__photo img");
    if (!headerPhoto) return;

    let ticking = false;

    function updateParallax() {
        const offset = Math.min(window.scrollY * 0.08, 24);
        headerPhoto.style.transform = `translateY(${offset}px)`;
        ticking = false;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        },
        { passive: true }
    );

});

/* ==========================================================
   Smooth Page Navigation Transitions (Workshop-Style)
   ----------------------------------------------------------
   Applies a gentle fade-out when clicking internal navigation
   links for a cohesive, modern app-like experience.
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("javascript:") || href.startsWith("#")) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            try {
                const targetUrl = new URL(link.href, window.location.origin);
                if (targetUrl.origin === window.location.origin) {
                    e.preventDefault();
                    document.body.classList.add("is-leaving");
                    setTimeout(() => {
                        window.location.href = href;
                    }, 220);
                }
            } catch (_) {}
        });
    });

    window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
            document.body.classList.remove("is-leaving");
        }
    });
});

