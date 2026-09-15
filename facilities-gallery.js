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
    src: "images/facilities/lab1.jpg",
    title: "ICCN Lab — Research Workspace",
    caption: "Active collaborative research space of the Intelligent Computing and Complex Networks Lab (ICCN Lab) at IIT Roorkee under Dr. Neetesh Kumar and Dr. Pardumen Pandey, equipped with high-end multi-display workstations and edge hardware testbenches."
  },
  {
    src: "images/facilities/server_rig1.jpg",
    title: "High-Performance GPU Computing Cluster",
    caption: "Dedicated multi-GPU rackmount and tower server cluster accelerating deep learning, reinforcement learning models, and complex vehicular network simulations."
  },
  {
    src: "images/facilities/agx1.jpg",
    title: "NVIDIA Jetson AGX Edge-AI Platform",
    caption: "Embedded edge-computing system running real-time LiDAR point-cloud processing, sensor fusion, and low-latency computer vision algorithms for autonomous mobility."
  },
  {
    src: "images/facilities/RSU_rig1.jpg",
    title: "C-V2X / DSRC Roadside Unit (RSU) Testbed",
    caption: "Unex C-V2X / DSRC transceiver hardware rig with high-gain dual antennas in a custom enclosure for Vehicle-to-Infrastructure (V2I) and Vehicle-to-Vehicle (V2V) field experiments."
  },
  {
    src: "images/facilities/drone_rig1.jpg",
    title: "Autonomous Depth-Sensing Research Drone",
    caption: "Custom heavy-lift quadcopter integrated with an Intel RealSense depth camera and companion computer for real-time 3D mapping and GPS-denied navigation."
  },
  {
    src: "images/facilities/drone_rig2.jpg",
    title: "Pixhawk Cube Autopilot Aerial Platform",
    caption: "S500 quadcopter airframe equipped with a Pixhawk Cube flight controller and telemetry unit for precise autonomous waypoint mission execution."
  },
  {
    src: "images/facilities/drone_rig3.jpg",
    title: "Heavy-Payload Industrial Hexacopter UAV",
    caption: "Heavy-duty multi-rotor aerial platform with Hobbywing X8 high-thrust propulsion systems for large sensor payloads and aerial surveillance experiments."
  },
  {
    src: "images/facilities/fpv_rig2.jpg",
    title: "High-Agility Custom FPV Research Quadcopter",
    caption: "Ultra-lightweight carbon-fiber multi-rotor racing platform engineered for agile maneuvering, rapid obstacle avoidance, and dynamic aerial tracking."
  },
  {
    src: "images/facilities/fpv_rig1.jpg",
    title: "Low-Latency FPV Pilot Station & Goggle Interface",
    caption: "First-Person View (FPV) pilot headset and remote telemetry controller enabling real-time low-latency video feed and manual flight validation."
  },
  {
    src: "images/facilities/3d_printer.jpg",
    title: "Bambu Lab 3D Rapid Prototyping Station",
    caption: "High-precision Bambu Lab 3D printer with multi-filament AMS for on-demand fabrication of custom drone mounts, sensor brackets, and robotic enclosures."
  }
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
  }

  // ---- Autoplay + progress bar ----
  function restartProgress() {
    clearTimeout(timer);
    timer = null;
    progressBar.classList.remove("animating");
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    if (facgalSlides.length <= 1 || paused) return;

    // Force reflow so the width reset above actually takes effect
    void progressBar.offsetWidth;

    progressBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    progressBar.classList.add("animating");
    requestAnimationFrame(() => {
      progressBar.style.width = "100%";
    });

    timer = setTimeout(() => goTo(current + 1, false), AUTOPLAY_MS);
  }

  function pause() {
    if (paused) return;
    paused = true;
    clearTimeout(timer);
    timer = null;

    // Freeze the progress bar visually at its exact current position
    const computedWidth = window.getComputedStyle(progressBar).width;
    progressBar.classList.remove("animating");
    progressBar.style.transition = "none";
    progressBar.style.width = computedWidth;

    wrapper.classList.add("is-paused");
  }

  function resume() {
    if (!paused) return;
    paused = false;
    wrapper.classList.remove("is-paused");
    restartProgress();
  }

  // Pause when cursor/pointer is over the gallery or dots, resume on leave
  wrapper.addEventListener("mouseenter", pause);
  wrapper.addEventListener("mouseleave", resume);
  wrapper.addEventListener("pointerenter", pause);
  wrapper.addEventListener("pointerleave", resume);
  wrapper.addEventListener("touchstart", pause, { passive: true });
  wrapper.addEventListener("touchend", resume);
  wrapper.addEventListener("focusin", pause);
  wrapper.addEventListener("focusout", resume);

  dotsContainer.addEventListener("mouseenter", pause);
  dotsContainer.addEventListener("mouseleave", resume);

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

  window.goToFacgalSlide = function (index) {
    goTo(index, true);
    wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  restartProgress();
})();

