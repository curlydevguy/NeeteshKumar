/* ==========================================================================
   RESEARCH FACILITIES - PHOTO GALLERY ENGINE
   --------------------------------------------------------------------------
   Only runs on research_facilities.html (no-ops everywhere else since it
   looks for #facgalWrapper first). Auto-advances on a timer, pauses while
   the mouse/finger/keyboard focus is on the gallery, and resumes after.
   No arrow buttons: clicking the left or right portion of the photo
   itself (see .facgal-hit-left / .facgal-hit-right in the CSS) moves
   prev/next instead.

   TO ADD / EDIT PHOTOS: just edit the facgalSlides array below.
   "src" can point at a local file (images/facilities/yourphoto.jpg) or
   any normal image URL. "title" is the bold line, "caption" is the
   sentence under it.
   ========================================================================== */

const facgalSlides = [
  {
    src: "images/facilities/placeholder-server.svg",
    title: "Server Rack",
    caption: "Replace with a photo of the lab's server rack — swap the file at images/facilities/placeholder-server.svg (or point this slide's \"src\" at a new file)."
  },
  {
    src: "images/facilities/placeholder-drone.svg",
    title: "Drone Test Rig",
    caption: "Replace with a photo of the drone platform used for GPS-denied navigation testing."
  },
  {
    src: "images/facilities/placeholder-orin.svg",
    title: "Jetson Orin Nano",
    caption: "Replace with a photo of the Orin Nano edge-compute unit."
  },
  {
    src: "images/facilities/placeholder-machine.svg",
    title: "Lab Equipment",
    caption: "Replace with a photo of any other machine or piece of lab equipment — duplicate this object in the array for each additional item."
  }
  // Add more facilities here, following the same { src, title, caption } shape.
];

(function initFacilitiesGallery() {
  const wrapper = document.getElementById("facgalWrapper");
  if (!wrapper || !facgalSlides.length) return;

  const track = document.getElementById("facgalTrack");
  const dotsContainer = document.getElementById("facgalDots");
  const progressBar = document.getElementById("facgalProgressBar");

  const AUTOPLAY_MS = 4200; // how long each slide stays before auto-advancing

  let current = 0;
  let timer = null;
  let progressStart = null;
  let paused = false;

  // ---- Build slides ----
  facgalSlides.forEach((slide, i) => {
    const slideEl = document.createElement("div");
    slideEl.className = "facgal-slide" + (i === 0 ? " is-active" : "");

    const img = document.createElement("img");
    img.src = slide.src;
    img.alt = slide.title;
    img.loading = i === 0 ? "eager" : "lazy";
    slideEl.appendChild(img);

    const hitLeft = document.createElement("div");
    hitLeft.className = "facgal-hit facgal-hit-left";
    hitLeft.setAttribute("role", "button");
    hitLeft.setAttribute("tabindex", "0");
    hitLeft.setAttribute("aria-label", "Previous photo");
    hitLeft.addEventListener("click", () => goTo(current - 1, true));

    const hitRight = document.createElement("div");
    hitRight.className = "facgal-hit facgal-hit-right";
    hitRight.setAttribute("role", "button");
    hitRight.setAttribute("tabindex", "0");
    hitRight.setAttribute("aria-label", "Next photo");
    hitRight.addEventListener("click", () => goTo(current + 1, true));

    slideEl.appendChild(hitLeft);
    slideEl.appendChild(hitRight);
    track.appendChild(slideEl);
  });

  // ---- Caption (single caption block below the photo, swapped on change) ----
  const captionEl = document.getElementById("facgalCaption");
  function renderCaption(index) {
    const slide = facgalSlides[index];
    captionEl.innerHTML = "";
    const h3 = document.createElement("h3");
    h3.textContent = slide.title;
    const p = document.createElement("p");
    p.textContent = slide.caption;
    captionEl.appendChild(h3);
    captionEl.appendChild(p);
  }
  renderCaption(0);

  // ---- Dots ----
  facgalSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "facgal-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsContainer.appendChild(dot);
  });

  // ---- Navigation ----
  function goTo(index, userInitiated) {
    const slideEls = track.querySelectorAll(".facgal-slide");
    slideEls[current] && slideEls[current].classList.remove("is-active");

    current = (index + facgalSlides.length) % facgalSlides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    slideEls[current] && slideEls[current].classList.add("is-active");

    dotsContainer.querySelectorAll(".facgal-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });

    renderCaption(current);
    restartProgress();

    if (userInitiated) {
      // give the user a beat of full-speed viewing before auto-advancing again
      restartProgress();
    }
  }

  // ---- Autoplay + progress bar ----
  function restartProgress() {
    clearTimeout(timer);
    progressBar.classList.remove("animating");
    progressBar.style.width = "0%";

    if (facgalSlides.length <= 1 || paused) return;

    // Force reflow so the width reset above actually takes effect before
    // we re-enable the transition and animate to 100%.
    void progressBar.offsetWidth;

    progressBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    progressBar.classList.add("animating");
    requestAnimationFrame(() => {
      progressBar.style.width = "100%";
    });

    timer = setTimeout(() => goTo(current + 1, false), AUTOPLAY_MS);
  }

  function pause() {
    paused = true;
    clearTimeout(timer);
    progressBar.classList.remove("animating");
  }

  function resume() {
    if (!paused) return;
    paused = false;
    restartProgress();
  }

  wrapper.addEventListener("mouseenter", pause);
  wrapper.addEventListener("mouseleave", resume);
  wrapper.addEventListener("touchstart", pause, { passive: true });
  wrapper.addEventListener("touchend", resume);
  wrapper.addEventListener("focusin", pause);
  wrapper.addEventListener("focusout", resume);

  // Keyboard support on the hit zones (Enter / Space)
  wrapper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target.classList.contains("facgal-hit-left")) goTo(current - 1, true);
      if (e.target.classList.contains("facgal-hit-right")) goTo(current + 1, true);
    }
    if (e.key === "ArrowLeft") goTo(current - 1, true);
    if (e.key === "ArrowRight") goTo(current + 1, true);
  });

  if (facgalSlides.length <= 1) {
    wrapper.querySelectorAll(".facgal-hit").forEach((h) => (h.style.display = "none"));
  }

  restartProgress();
})();
