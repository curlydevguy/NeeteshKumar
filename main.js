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
   News & Events auto-scroll (index.html "News & Events" box)
   ----------------------------------------------------------
   Replaces the old <marquee> tag. Auto-scrolls the box down
   (looping back to the top) on its own. While the mouse is
   hovering over the box, auto-scrolling PAUSES and the box is
   left as a normal scrollable element (it already has
   overflow-y: auto in CSS) so the visitor can scroll it by
   hand with the mouse wheel / trackpad. Moving the mouse away
   resumes auto-scrolling from wherever it was left.

   This only runs on pages that actually have the ticker
   (currently just index.html) - on every other page
   newsTicker is null and the block below simply does nothing.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const newsTicker = document.getElementById("newsTicker");
    if (!newsTicker) return;

    let isHovering = false;
    const SCROLL_STEP_PX = 0.6;   // how far it moves per tick - lower = slower/smoother
    const TICK_MS = 30;           // how often it moves

    const autoScrollTimer = setInterval(() => {
        if (isHovering) return; // paused while the user is hovering / manually scrolling

        const atBottom = newsTicker.scrollTop + newsTicker.clientHeight >= newsTicker.scrollHeight - 1;

        if (atBottom) {
            newsTicker.scrollTop = 0; // loop back to the top
        } else {
            newsTicker.scrollTop += SCROLL_STEP_PX;
        }
    }, TICK_MS);

    newsTicker.addEventListener("mouseenter", () => {
        isHovering = true;
    });

    newsTicker.addEventListener("mouseleave", () => {
        isHovering = false;
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    handleScroll(); // set correct initial state on load (e.g. page refreshed mid-scroll)

});

/* ==========================================================
   SITE-WIDE SCROLL-REVEAL ENGINE
   ----------------------------------------------------------
   Runs on every page (main.js is loaded everywhere). Finds the
   common repeating content blocks already used across the site
   (cards, team members, publication groups, experience rows,
   research info blocks, the slideshow, footer map panels, etc.)
   and tags them with the .reveal-up / .reveal-fade classes
   defined in style.css, then uses an IntersectionObserver to
   flip on .is-visible as each one scrolls into the viewport.
   Nothing here needs per-page markup - it just looks for the
   class names/selectors that already exist on the page and
   quietly no-ops for anything not found.
========================================================== */
document.addEventListener("DOMContentLoaded", () => {

    const REVEAL_SELECTORS = [
        ".team-card",
        ".flex-item-pro",
        ".flex-item",
        ".pub-year-group",
        ".experience-details-container",
        ".prototype-container .prototype-heading",
        ".proto-slideshow-wrapper",
        ".facgal-container .facgal-heading",
        ".facgal-wrapper",
        ".contact-container .section1",
        ".contact-container .section2",
        ".contact-container .section3"
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
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));

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
