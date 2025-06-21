// =============================================================================
// GLOBAL VARIABLES & DOM ELEMENTS
// =============================================================================

// Get DOM elements
const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("nav-links");
const menuToggle = document.getElementById("menu-toggle");
const scrollToTopBtn = document.getElementById("scroll-to-top");
const sections = document.querySelectorAll("section[id]");
const navLinksArray = document.querySelectorAll('.nav-links a[href^="#"]');

// Variables for scroll tracking
let lastScrollY = window.scrollY;
let ticking = false;
let isProgrammaticScroll = false;
let currentActiveSection = null;
let scrollTimeout;
let underlineScrollTimeout = null;

// Configuration
const NAV_CONFIG = {
  offset: 100, // Match your header height
  specialSections: ["contactForm"], // Sections with unique styling
  scrollEndDelay: 300, // Time to wait after scroll completes
};

// --- Nav Underline Animation ---
const navLinksList = document.getElementById("nav-links");
const navUnderline = navLinksList?.querySelector(".nav-underline");
const navLinksAll = navLinksList?.querySelectorAll("a");

// =============================================================================
// NAVBAR FUNCTIONALITY
// =============================================================================

function updateNavbarBackground() {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

// Helper to move the underline to a given link
function moveUnderlineTo(link) {
  if (!link || !navUnderline) {
    if (navUnderline) {
      navUnderline.style.opacity = "0";
      navUnderline.style.width = "0";
    }
    return;
  }
  const linkRect = link.getBoundingClientRect();
  const parentRect = navLinksList.getBoundingClientRect();
  navUnderline.style.width = linkRect.width + "px"; // or +4 for a little extra
  navUnderline.style.left = linkRect.left - parentRect.left + "px";
  navUnderline.style.opacity = "1";
}

// Only move underline to the active link, or hide if none
function moveUnderlineToActiveOrHide() {
  if (!navLinksList || !navUnderline) return;
  const active = navLinksList.querySelector("a.active");
  if (active) {
    moveUnderlineTo(active);
  } else {
    navUnderline.style.opacity = "0";
    navUnderline.style.width = "0";
  }
}

// Enforce single bold navigation link
function enforceSingleBoldNav() {
  navLinksAll.forEach((link) => {
    if (!link.classList.contains("active") && !link.matches(":hover")) {
      link.style.fontWeight = "500";
      link.style.color = "var(--primary-text, #222)";
    } else if (link.classList.contains("active")) {
      link.style.fontWeight = "700";
      link.style.color = "var(--primary-blue)";
    }
    // If hovered, let CSS handle the bold and color
  });
}

function setActiveNavItem(sectionId) {
  currentActiveSection = sectionId;
  navLinksAll.forEach((link) => {
    link.classList.remove("active");
  });
  navLinksAll.forEach((link) => {
    const linkSection = link.getAttribute("href").substring(1);
    if (linkSection === sectionId) {
      link.classList.add("active");
    }
  });
  moveUnderlineToActiveOrHide();
  enforceSingleBoldNav();
}

// =============================================================================
// SECTION HIGHLIGHTING & NAVIGATION
// =============================================================================

function highlightCurrentSection() {
  if (isProgrammaticScroll) return;

  const navbarHeight = getNavbarOffset();
  const bottomGlassHeight = getBottomGlassOffset();
  const scrollY = window.scrollY;
  let activeSectionId = null;
  let minDistance = Infinity;

  // Calculate the "true" visible viewport (excluding navbar and bottom glass)
  const visibleTop = scrollY + navbarHeight;
  const visibleBottom = scrollY + window.innerHeight - bottomGlassHeight;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + scrollY;
    const sectionBottom = sectionTop + section.offsetHeight;

    // Section is visible if any part is within the visible viewport (not hidden by navbar or bottom glass)
    if (sectionBottom > visibleTop && sectionTop < visibleBottom) {
      // Find the section whose top is closest to the visibleTop
      const distance = Math.abs(sectionTop - visibleTop);
      if (distance < minDistance) {
        minDistance = distance;
        activeSectionId = section.getAttribute("id");
      }
    }
  });

  if (activeSectionId && activeSectionId !== currentActiveSection) {
    setActiveNavItem(activeSectionId);
  }
  if (!activeSectionId) {
    navLinksAll.forEach((link) => link.classList.remove("active"));
    moveUnderlineToActiveOrHide();
  }
}

function clearAllNavEffects() {
  navLinksArray.forEach((link) => {
    // Remove focus from the clicked link
    link.blur();

    // Force remove any hover/focus styles
    link.style.pointerEvents = "none";

    // Trigger reflow to ensure style changes are applied
    void link.offsetWidth;

    // Restore pointer events
    link.style.pointerEvents = "";

    // Remove any temporary classes
    link.classList.remove("no-hover", "hover");
  });
}

function scrollToSection(sectionId) {
  // Clear any pending scroll events
  clearTimeout(scrollTimeout);

  // Set programmatic scroll flag
  isProgrammaticScroll = true;

  const section = document.getElementById(sectionId);

  if (section) {
    // Clear all nav effects first
    clearAllNavEffects();

    // Immediately update active state
    setActiveNavItem(sectionId);

    // Perform smooth scroll
    window.scrollTo({
      top: section.offsetTop - getNavbarOffset(),
      behavior: "smooth",
    });

    // Set timeout to detect when scroll completes
    scrollTimeout = setTimeout(() => {
      isProgrammaticScroll = false;
      // Re-detect current section after scroll completes
      highlightCurrentSection();
    }, NAV_CONFIG.scrollEndDelay);
  }
}

function getNavbarOffset() {
  // Dynamically get the navbar height (including padding/border)
  const navbarEl = document.getElementById("navbar");
  return navbarEl ? navbarEl.offsetHeight : 0;
}

function getBottomGlassOffset() {
  const glass = document.querySelector(".bottom-glass");
  return glass ? glass.offsetHeight : 0;
}

// =============================================================================
// SMOOTH SCROLLING & MOBILE MENU
// =============================================================================

function initSmoothScrolling() {
  navLinksAll.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetSection = href.substring(1);

        // Always remove .active from all links before adding to the clicked link
        navLinksAll.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
        moveUnderlineTo(this);
        enforceSingleBoldNav();

        isProgrammaticScroll = true;

        window.scrollTo({
          top:
            document.getElementById(targetSection).offsetTop -
            getNavbarOffset(),
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (window.innerWidth <= 768) {
          navLinks?.classList.remove("active");
          menuToggle?.classList.remove("active");
          document.body.style.overflow = "";
        }

        // Wait for scroll to finish, then resume tracking after 1 second
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
          highlightCurrentSection(); // Resume normal tracking
        }, 1000); // 1 second delay
      }
    });
  });
}

function initMobileMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isActive = navLinks.classList.contains("active");

    // Toggle menu visibility
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");

    // Add/remove body scroll lock when menu is open
    if (!isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
  menuToggle.addEventListener("click", function () {
    const isActive = menuToggle.classList.contains("active");
    const lines = document.querySelectorAll(".hamburger-line");

    // Define the different animations for each line
    const animations = [
      "waveMotion1 2s infinite ease-in-out",
      "waveMotion2 2.5s infinite ease-in-out",
      "waveMotion3 1.8s infinite ease-in-out",
    ];

    lines.forEach((line, index) => {
      if (isActive) {
        // Stop animation when menu is active
        line.style.animation = "none";
      } else {
        // Restart with individual animations
        line.style.animation = "none";
        // Force reflow to ensure animation restarts
        line.offsetHeight;
        // Apply the specific animation for this line
        line.style.animation = animations[index];
      }
    });
  });

  // Close menu when clicking on a link (mobile)
  navLinksArray.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  });

  // Close menu when clicking outside (mobile)
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      if (
        !navbar?.contains(e.target) &&
        navLinks.classList.contains("active")
      ) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// =============================================================================
// SCROLL TO TOP & GLASS EFFECT
// =============================================================================

function initScrollToTop() {
  if (!scrollToTopBtn) return;

  scrollToTopBtn.addEventListener("click", function () {
    // Clear all nav effects when scrolling to top
    clearAllNavEffects();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// PREMIUM SCROLL HANDLER - Glass Effect
if (!window.premiumScrollHandlerInitialized) {
  // Config
  const config = {
    blur: {
      max: 24, // Max blur intensity (px)
      height: 120, // Fixed height (no growing)
    },
    activateAt: 80, // Scroll threshold (px)
    bottomThreshold: 150, // Distance from bottom where blur hides (px)
  };

  let lastScrollY = 0;
  let ticking = false;

  function updateGlassEffect() {
    const currentScrollY = window.scrollY;
    const isScrolledUp = currentScrollY < config.activateAt;
    const isAtBottom =
      window.innerHeight + currentScrollY >=
      document.documentElement.scrollHeight - config.bottomThreshold;
    const isActive = !isScrolledUp && !isAtBottom;
    const scrollRatio = Math.min(1, (currentScrollY - config.activateAt) / 100);

    // Bottom Glass
    const glass = document.querySelector(".bottom-glass");
    if (glass) {
      if (isActive) {
        const blurAmount = scrollRatio * config.blur.max;
        glass.style.cssText = `
          opacity: 1;
          backdrop-filter: blur(${blurAmount}px) brightness(${
          1.1 - scrollRatio * 0.15
        });
        `;
      } else {
        glass.style.cssText = "opacity: 0; backdrop-filter: none;";
      }
    }

    // Scroll-to-Top Button
    const topButton = document.querySelector(".scroll-to-top");
    if (topButton) {
      topButton.classList.toggle("visible", !isScrolledUp);
    }

    lastScrollY = currentScrollY;
  }

  // Create elements only once
  if (!document.querySelector(".bottom-glass")) {
    // Glass Element
    const glass = document.createElement("div");
    glass.className = "bottom-glass";
    document.body.appendChild(glass);

    // Create scroll-to-top button if it doesn't exist
    if (!document.querySelector(".scroll-to-top")) {
      const button = document.createElement("button");
      button.className = "scroll-to-top";
      button.innerHTML = "↑";
      document.body.appendChild(button);

      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  // Handle scroll and resize
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateGlassEffect();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateGlassEffect);
  window.premiumScrollHandlerInitialized = true;
  updateGlassEffect(); // Initialize
}

// =============================================================================
// ANIMATIONS & VISUAL EFFECTS
// =============================================================================

function initBlurRevealAnimation() {
  const observerOptions = {
    threshold: [0.1, 0.5, 0.9],
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        entry.target.classList.add("revealed");
      }
    });
  }, observerOptions);

  // Observe all sections and content elements
  const elementsToAnimate = document.querySelectorAll(
    "section, .content-block, .card, .project-item"
  );
  elementsToAnimate.forEach((el) => {
    el.classList.add("blur-reveal");
    observer.observe(el);
  });
}

function initTypingAnimation() {
  const part1 = "A";
  const part2 = " SOFTWARE ENGINEER";
  const part3 = " SPECIALIZING IN FRONT-END AND BACK-END DEVELOPMENT";
  const typedText = part1 + part2 + part3;
  const typedDescription =
    "I'm Yehia Ibrahim, a passionate Software Engineer with a Bachelor's degree in Computer Science. I proudly hold a dual degree from the Arab Academy for Science and Technology in Alexandria, Egypt, and the University of Northampton in London, United Kingdom. As a dedicated software developer, I thrive on building impactful projects that solve real-world problems.";

  const typedTextElement = document.getElementById("typed-text");
  const typedDescriptionElement = document.getElementById("typed-description");

  if (!typedTextElement || !typedDescriptionElement) {
    console.warn("Typing animation elements not found");
    return;
  }

  let textIndex = 0;
  let descriptionIndex = 0;
  let currentText = "";
  let currentDescription = "";

  function type() {
    if (textIndex < typedText.length) {
      let currentChar = typedText.charAt(textIndex);
      currentText += currentChar;

      // Apply blue highlight to specific sections while keeping animation
      const formattedText = currentText
        .replace(
          /SOFTWARE ENGINEER/g,
          "<span class='highlight'>SOFTWARE ENGINEER</span>"
        )
        .replace(/FRONT-END/g, "<span class='highlight'>FRONT-END</span>")
        .replace(/BACK-END/g, "<span class='highlight'>BACK-END</span>");

      typedTextElement.innerHTML = formattedText;
      textIndex++;
      setTimeout(type, 65);
    } else {
      setTimeout(typeDescription, 500);
    }
  }

  function typeDescription() {
    if (descriptionIndex < typedDescription.length) {
      let currentChar = typedDescription.charAt(descriptionIndex);
      currentDescription += currentChar;

      // Highlight specific parts while keeping animation
      const formattedDescription = currentDescription
        .replace(
          /Yehia Ibrahim/g,
          "<span class='highlight'>Yehia Ibrahim</span>"
        )
        .replace(
          /Arab Academy for Science and Technology/g,
          "<span class='highlight'>Arab Academy for Science and Technology</span>"
        )
        .replace(
          /University of Northampton/g,
          "<span class='highlight'>University of Northampton</span>"
        )
        .replace(
          /real-world problems/g,
          "<span class='highlight'>real-world problems</span>"
        );

      typedDescriptionElement.innerHTML = formattedDescription;
      descriptionIndex++;
      setTimeout(typeDescription, 15);
    }
  }

  // Start typing animation
  type();
}

// =============================================================================
// ABOUT SECTION ANIMATIONS
// =============================================================================

function animateWords(card) {
  const p = card.querySelector("p");
  if (!p) return;
  const html = p.innerHTML;
  // Split by words, keep tags
  const words = html.split(/(\s+|<[^>]+>)/g).filter(Boolean);
  p.innerHTML = "";
  words.forEach((word, i) => {
    if (word.match(/^<[^>]+>$/)) {
      p.innerHTML += word;
    } else {
      const span = document.createElement("span");
      span.textContent = word;
      span.style.opacity = 0;
      span.style.display = "inline-block";
      span.style.transform = "translateY(20px) scale(0.95)";
      span.style.transition =
        "opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1)";
      span.style.transitionDelay = `${i * 0.045}s`;
      p.appendChild(span);
    }
  });
  setTimeout(() => {
    p.querySelectorAll("span").forEach((span) => {
      span.style.opacity = 1;
      span.style.transform = "translateY(0) scale(1.08)";
      setTimeout(() => {
        span.style.transform = "translateY(0) scale(1)";
      }, 350);
    });
  }, 100);
}

function initAboutAnimations() {
  const cards = document.querySelectorAll(".about-card, .about-cta");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(
            () => {
              entry.target.classList.add("revealed");
              // Animate words if needed
              if (entry.target.dataset.animate === "words") {
                animateWords(entry.target);
              }
            },
            entry.target.dataset.delay ? Number(entry.target.dataset.delay) : 0
          );
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach((el, i) => {
    el.dataset.delay = i * 180;
    observer.observe(el);
  });
}

function aboutSectionEnterAnimation() {
  const aboutSection = document.getElementById("about");
  if (!aboutSection) return;

  function checkAboutInView() {
    const rect = aboutSection.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    // Trigger when top is in lower 80% of viewport and bottom is below top
    if (rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.1) {
      aboutSection.classList.add("section-visible");
    } else {
      aboutSection.classList.remove("section-visible");
    }
  }

  window.addEventListener("scroll", checkAboutInView, { passive: true });
  window.addEventListener("resize", checkAboutInView, { passive: true });
  setTimeout(checkAboutInView, 100);
}

// =============================================================================
// SERVICES SECTION ANIMATIONS
// =============================================================================

function servicesSectionEnterAnimation() {
  const servicesSection = document.getElementById("services");
  if (!servicesSection) return;

  // Optionally select the individual service cards if you need staggered effects via class
  const serviceCards = servicesSection.querySelectorAll(".service");

  function checkServicesInView() {
    const rect = servicesSection.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;

    // Trigger when the top is within the lower 80% and bottom is above 10% of viewport height
    if (rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.1) {
      servicesSection.classList.add("section-visible");
      // Optionally add a class to cards as well for additional styling
      serviceCards.forEach((card, index) => {
        card.classList.add("section-visible");
      });
    } else {
      servicesSection.classList.remove("section-visible");
      serviceCards.forEach((card) => {
        card.classList.remove("section-visible");
      });
    }
  }

  window.addEventListener("scroll", checkServicesInView, { passive: true });
  window.addEventListener("resize", checkServicesInView, { passive: true });
  // Call it once after a short delay in case the section is already in view on load
  setTimeout(checkServicesInView, 100);
}

// =============================================================================
// PROJECT MODAL FUNCTIONALITY
// =============================================================================

// Modal logic for project cards
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("project-modal");
  const modalImg = modal?.querySelector(".modal-image img");
  const modalTitle = modal?.querySelector(".modal-title");
  const modalDesc = modal?.querySelector(".modal-description");
  const modalDetails = modal?.querySelector(".modal-details");
  const modalGithub = modal?.querySelector(".modal-github");
  const carouselWrapper = modal?.querySelector(".carousel-wrapper");
  const leftArrow = modal?.querySelector(".carousel-arrow.left");
  const rightArrow = modal?.querySelector(".carousel-arrow.right");
  const indicators = modal?.querySelector(".carousel-indicators");

  if (!modal) return;

  const modalClose = document.createElement("button");
  modalClose.className = "modal-close";
  modalClose.innerHTML = "×";
  modal.appendChild(modalClose);

  let images = [];
  let currentImgIdx = 0;

  function showImage(idx) {
    if (!images.length) return;
    modalImg.style.opacity = 0;
    setTimeout(() => {
      modalImg.src = images[idx];
      modalImg.style.opacity = 1;
    }, 120);
    // Update indicators
    if (indicators) {
      indicators.innerHTML = "";
      images.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "dot" + (i === idx ? " active" : "");
        dot.addEventListener("click", () => {
          currentImgIdx = i;
          showImage(currentImgIdx);
        });
        indicators.appendChild(dot);
      });
    }
    // Show/hide arrows
    if (images.length > 1) {
      leftArrow.style.display = "";
      rightArrow.style.display = "";
    } else {
      leftArrow.style.display = "none";
      rightArrow.style.display = "none";
    }
  }

  leftArrow?.addEventListener("click", function (e) {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx - 1 + images.length) % images.length;
    showImage(currentImgIdx);
  });

  rightArrow?.addEventListener("click", function (e) {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx + 1) % images.length;
    showImage(currentImgIdx);
  });

  // Open modal with project data
  function openModal(card) {
    // Prevent multiple modals from animating at once
    if (document.body.classList.contains("modal-animating")) return;
    document.body.classList.add("modal-animating");

    // Hide elements first with smooth transitions
    const glass = document.querySelector(".bottom-glass");
    const scrollToTopBtn = document.getElementById("scroll-to-top");

    if (scrollToTopBtn) {
      scrollToTopBtn.classList.add("hidden");
    }
    if (glass) {
      glass.classList.add("hidden");
    }

    // Create streamlined backdrop with particles ONLY (no gray background)
    const backdropLayers = document.createElement("div");
    backdropLayers.style.position = "fixed";
    backdropLayers.style.top = "0";
    backdropLayers.style.left = "0";
    backdropLayers.style.width = "100vw";
    backdropLayers.style.height = "100vh";
    backdropLayers.style.zIndex = "9997";
    backdropLayers.style.pointerEvents = "none";
    backdropLayers.style.background = "transparent"; // Keep transparent

    // Particle system ONLY (remove gradient layer entirely)
    const particleLayer = document.createElement("div");
    particleLayer.style.position = "absolute";
    particleLayer.style.inset = "0";
    particleLayer.style.overflow = "hidden";

    // Create floating particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.style.position = "absolute";
      particle.style.width = Math.random() * 3 + 1 + "px";
      particle.style.height = particle.style.width;
      particle.style.background = `rgba(${Math.random() * 100 + 155}, ${
        Math.random() * 100 + 155
      }, 255, ${Math.random() * 0.4 + 0.2})`;
      particle.style.borderRadius = "50%";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.opacity = "0";
      particle.style.transform = "scale(0)";
      particle.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      particleLayer.appendChild(particle);

      // Quick particle entrance
      setTimeout(() => {
        particle.style.opacity = "1";
        particle.style.transform = `scale(1) translateX(${
          (Math.random() - 0.5) * 100
        }px) translateY(${(Math.random() - 0.5) * 100}px)`;
      }, Math.random() * 200);
    }

    // Only add particles, no gradient background
    backdropLayers.appendChild(particleLayer);
    document.body.appendChild(backdropLayers);

    // Get card position and create morphing clone
    const cardRect = card.getBoundingClientRect();
    const cardClone = card.cloneNode(true);

    // Calculate exact modal target dimensions first
    const modalTargetWidth = Math.min(1000, window.innerWidth * 0.9);
    const modalTargetHeight = Math.min(650, window.innerHeight * 0.9);
    const modalTargetLeft = (window.innerWidth - modalTargetWidth) / 2;
    const modalTargetTop = (window.innerHeight - modalTargetHeight) / 2;

    // Style the morphing clone to start exactly like the card
    cardClone.style.position = "fixed";
    cardClone.style.top = cardRect.top + "px";
    cardClone.style.left = cardRect.left + "px";
    cardClone.style.width = cardRect.width + "px";
    cardClone.style.height = cardRect.height + "px";
    cardClone.style.zIndex = "9999";
    cardClone.style.borderRadius = window.getComputedStyle(card).borderRadius;
    cardClone.style.boxShadow = "none";
    cardClone.style.background = window.getComputedStyle(card).backgroundColor;
    cardClone.style.overflow = "hidden";
    cardClone.style.pointerEvents = "none";
    cardClone.style.transform = "scale(1)";
    cardClone.style.transition =
      "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    document.body.appendChild(cardClone);

    // Hide original card smoothly
    card.style.transition = "all 0.3s ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.95)";
    card.style.pointerEvents = "none";

    // No backdrop animation since we removed the gray background

    // Prepare modal data
    const imgsAttr = card.getAttribute("data-images");
    if (imgsAttr) {
      images = imgsAttr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      images = [card.getAttribute("data-image")];
    }
    currentImgIdx = 0;
    showImage(currentImgIdx);

    modalImg.alt = card.getAttribute("data-title") + " Preview";
    modalTitle.textContent = card.getAttribute("data-title");
    modalDesc.textContent = card.getAttribute("data-description");
    modalDetails.innerHTML = card.getAttribute("data-details");
    modalGithub.href = card.getAttribute("data-github");

    // Morphing transformation to exact modal size
    setTimeout(() => {
      cardClone.style.top = modalTargetTop + "px";
      cardClone.style.left = modalTargetLeft + "px";
      cardClone.style.width = modalTargetWidth + "px";
      cardClone.style.height = modalTargetHeight + "px";
      cardClone.style.borderRadius = "24px";
      cardClone.style.boxShadow = "none";
      cardClone.style.transform = "scale(1)";

      // Fade out clone content
      Array.from(cardClone.children).forEach((child) => {
        child.style.transition = "opacity 0.3s ease";
        child.style.opacity = "0";
      });
    }, 100);

    // Replace with modal at exact same position and size
    setTimeout(() => {
      // Show modal
      modal.style.display = "flex";
      modal.style.opacity = "0";
      modal.style.visibility = "visible";
      modal.style.background = "transparent";
      modal.style.boxShadow = "none";

      const modalContent = modal.querySelector(".modal-content");
      modalContent.style.opacity = "0";
      modalContent.style.transform = "scale(1)";
      modalContent.style.transition =
        "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      // Position modal content exactly where clone is
      modalContent.style.position = "fixed";
      modalContent.style.top = modalTargetTop + "px";
      modalContent.style.left = modalTargetLeft + "px";
      modalContent.style.width = modalTargetWidth + "px";
      modalContent.style.height = modalTargetHeight + "px";
      modalContent.style.margin = "0";
      modalContent.style.borderRadius = "24px";
      modalContent.style.zIndex = "10000";
      modalContent.style.boxShadow = "none";
      modalContent.style.filter = "none";

      // Seamless transition
      setTimeout(() => {
        cardClone.style.opacity = "0";

        modal.style.opacity = "1";
        modal.classList.add("active");
        modalContent.style.opacity = "1";
        modalContent.style.transform = "scale(1)";

        // Remove clone
        setTimeout(() => {
          cardClone.remove();
        }, 300);
      }, 50);
    }, 400);

    // Final cleanup
    setTimeout(() => {
      const modalContent = modal.querySelector(".modal-content");
      modalContent.focus();

      // Reset to normal modal behavior but keep no shadows
      modalContent.style.position = "";
      modalContent.style.top = "";
      modalContent.style.left = "";
      modalContent.style.width = "";
      modalContent.style.height = "";
      modalContent.style.margin = "";
      modalContent.style.borderRadius = "";
      modalContent.style.zIndex = "";
      modalContent.style.transform = "";
      modalContent.style.transition = "";
      modalContent.style.boxShadow = "none";
      modalContent.style.filter = "none";

      modal.style.boxShadow = "none";
      modal.style.filter = "none";

      // Fade out particles
      Array.from(particleLayer.children).forEach((particle, index) => {
        setTimeout(() => {
          particle.style.opacity = "0";
          particle.style.transform = "scale(0)";
        }, index * 30);
      });

      // Remove backdrop
      setTimeout(() => {
        backdropLayers.remove();
      }, 500);

      // Restore original card
      card.style.transition = "";
      card.style.transform = "";
      card.style.opacity = "";
      card.style.pointerEvents = "";

      document.body.classList.remove("modal-animating");
    }, 900);

    document.body.style.overflow = "hidden";
  }

  // Close modal
  function closeModal() {
    const scrollToTopBtn = document.getElementById("scroll-to-top");
    if (scrollToTopBtn) {
      scrollToTopBtn.classList.remove("hidden");
    }
    const glass = document.querySelector(".bottom-glass");
    if (glass) {
      glass.classList.remove("hidden");
    }
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 220);
  }

  // Only trigger modal from the Quick View button
  document.querySelectorAll(".project.card").forEach((card) => {
    const btn = card.querySelector(".btn-primary");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      openModal(card);
      e.stopPropagation();
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        openModal(card);
        e.preventDefault();
      }
    });
  });

  modalClose.addEventListener("click", closeModal);

  // Click-away to close
  modal.addEventListener("mousedown", function (e) {
    if (e.target === modal) closeModal();
  });

  // Escape key to close
  document.addEventListener("keydown", function (e) {
    if (
      modal.style.display === "flex" &&
      (e.key === "Escape" || e.key === "Esc")
    ) {
      closeModal();
    }
  });
});

// =============================================================================
// FIREBASE FORM HANDLING
// =============================================================================

// Firebase Configuration and Form Handling
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3mtF3SUymZRu6obyxg9ppKLFdmgFyKZc",
  authDomain: "form-814f2.firebaseapp.com",
  projectId: "form-814f2",
  storageBucket: "form-814f2.appspot.com",
  messagingSenderId: "89138960600",
  appId: "1:89138960600:web:ecba88a87c611fc3905fad",
  measurementId: "G-P85MSPZWSN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================================================================
// PHONE NUMBER VALIDATION
// =============================================================================

function validatePhoneNumber(phoneNumber) {
  let cleanNumber = phoneNumber.replace(/[^\d]/g, "");
  cleanNumber = cleanNumber.replace(/^0+/, ""); // Remove leading zeros

  const isNumeric = /^\d+$/.test(cleanNumber);
  const isValidLength = cleanNumber.length >= 7 && cleanNumber.length <= 10;

  return {
    isValid: isNumeric && isValidLength,
    cleanNumber: cleanNumber,
    error: !isNumeric
      ? "Phone number must contain only numbers"
      : !isValidLength
      ? "Phone number must be between 7-10 digits"
      : null,
  };
}

function setupPhoneValidation() {
  const phoneInput = document.getElementById("contactNumber");
  const phoneError = document.getElementById("phoneError");

  if (!phoneInput || !phoneError) return;

  const allowedKeys = [8, 9, 27, 46, 35, 36, 37, 38, 39, 40]; // Navigation keys

  // Input event handler
  phoneInput.addEventListener("input", function (e) {
    let value = e.target.value;
    let cleanValue = value.replace(/[^\d\s\-\(\)]/g, "");
    let digitsOnly = cleanValue.replace(/[^\d]/g, "");
    const digitsWithoutLeadingZeros = digitsOnly.replace(/^0+/, "");

    // Handle digit limit
    if (digitsWithoutLeadingZeros.length > 10) {
      cleanValue = truncatePhoneInput(cleanValue);
      e.target.value = cleanValue;
      showPhoneWarning(phoneInput, phoneError, "Maximum 10 digits allowed");
    } else {
      removePhoneWarning(phoneInput, phoneError);
      if (value !== cleanValue) e.target.value = cleanValue;
    }

    // Validate phone number
    const validation = validatePhoneNumber(cleanValue);
    if (
      cleanValue &&
      !validation.isValid &&
      digitsWithoutLeadingZeros.length <= 10
    ) {
      showPhoneError(phoneInput, phoneError, validation.error);
    } else if (digitsWithoutLeadingZeros.length <= 10) {
      removePhoneError(phoneInput, phoneError);
    }
  });

  // Keydown event handler
  phoneInput.addEventListener("keydown", function (e) {
    const currentValue = e.target.value;
    const digitsOnly = currentValue.replace(/[^\d]/g, "");
    const digitsWithoutLeadingZeros = digitsOnly.replace(/^0+/, "");

    // Allow Ctrl combinations
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) return;

    // Prevent typing digits when at limit
    if (
      digitsWithoutLeadingZeros.length >= 10 &&
      !allowedKeys.includes(e.keyCode)
    ) {
      const isDigit =
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105);

      if (isDigit) {
        e.preventDefault();
        showPhoneWarning(
          phoneInput,
          phoneError,
          "Maximum 10 digits reached",
          true
        );
      }
    }
  });

  // Focus and blur handlers
  phoneInput.addEventListener("focus", () => {
    phoneInput.classList.remove("error");
    if (!phoneError.classList.contains("warning")) {
      phoneError.classList.remove("show");
    }
  });

  phoneInput.addEventListener("blur", function () {
    const validation = validatePhoneNumber(this.value);
    if (validation.isValid || !this.value) {
      removePhoneWarning(phoneInput, phoneError);
    }
  });
}

// Helper functions for phone validation
function truncatePhoneInput(cleanValue) {
  let digitCount = 0;
  let hasStartedCounting = false;
  let truncatedValue = "";

  for (let i = 0; i < cleanValue.length; i++) {
    const char = cleanValue[i];
    if (/\d/.test(char)) {
      if (char === "0" && !hasStartedCounting) continue;
      hasStartedCounting = true;
      digitCount++;
      if (digitCount <= 10) {
        truncatedValue += char;
      } else {
        break;
      }
    } else if (digitCount < 10) {
      truncatedValue += char;
    }
  }
  return truncatedValue;
}

function showPhoneWarning(phoneInput, phoneError, message, temporary = false) {
  phoneInput.classList.add("warning");
  phoneError.textContent = message;
  phoneError.classList.add("show", "warning");

  if (temporary) {
    setTimeout(() => {
      if (phoneError.classList.contains("warning")) {
        removePhoneWarning(phoneInput, phoneError);
      }
    }, 2000);
  }
}

function removePhoneWarning(phoneInput, phoneError) {
  phoneInput.classList.remove("warning");
  phoneError.classList.remove("warning", "show");
}

function showPhoneError(phoneInput, phoneError, message) {
  phoneInput.classList.add("error");
  phoneError.textContent = message;
  phoneError.classList.add("show");
  phoneError.classList.remove("warning");
}

function removePhoneError(phoneInput, phoneError) {
  phoneInput.classList.remove("error");
  if (!phoneError.classList.contains("warning")) {
    phoneError.classList.remove("show");
  }
}

// =============================================================================
// FORM SUBMISSION
// =============================================================================

function setupFormSubmission() {
  const form = document.getElementById("contactFormElement");

  form?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const responseMessage = document.getElementById("responseMessage");
    const submitButton = this.querySelector(".submit-button");
    const phoneInput = document.getElementById("contactNumber");
    const countryCode = document.getElementById("countryCode");
    const phoneError = document.getElementById("phoneError");

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneInput.value);
    if (!phoneValidation.isValid) {
      showPhoneError(phoneInput, phoneError, phoneValidation.error);
      showResponseMessage(
        responseMessage,
        "error",
        '<i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>Please fix the phone number error before submitting.'
      );
      return;
    }

    // Set loading state
    setSubmitButtonState(submitButton, "loading");

    // Prepare data
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    data.fullPhoneNumber = countryCode.value + phoneValidation.cleanNumber;
    data.phoneNumber = phoneValidation.cleanNumber;

    try {
      // Submit to Firebase
      const docRef = await addDoc(collection(db, "contact"), data);
      console.log("Document written with ID: ", docRef.id);

      // Show success
      showResponseMessage(
        responseMessage,
        "success",
        '<i class="fas fa-check-circle" style="margin-right: 8px;"></i>Thank you! Your message has been sent successfully.'
      );
      setSubmitButtonState(submitButton, "success");

      // Reset form after delay
      setTimeout(() => {
        this.reset();
        document.dispatchEvent(new CustomEvent("resetCountryDropdown"));
        hideResponseMessage(responseMessage);
        setSubmitButtonState(submitButton, "default");
        clearPhoneValidation(phoneInput, phoneError);
      }, 3000);
    } catch (error) {
      console.error("Error adding document: ", error);
      showResponseMessage(
        responseMessage,
        "error",
        '<i class="fas fa-times-circle" style="margin-right: 8px;"></i>There was an error submitting your request. Please try again.'
      );
      setSubmitButtonState(submitButton, "default");

      setTimeout(() => hideResponseMessage(responseMessage), 5000);
    }
  });
}

// Helper functions for form submission
function setSubmitButtonState(button, state) {
  const states = {
    default: {
      html: '<i class="fas fa-paper-plane" style="margin-right: 10px;"></i>Send Message',
      disabled: false,
    },
    loading: {
      html: '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>Sending...',
      disabled: true,
    },
    success: {
      html: '<i class="fas fa-check" style="margin-right: 10px;"></i>Message Sent!',
      disabled: false,
    },
  };

  button.innerHTML = states[state].html;
  button.disabled = states[state].disabled;
}

function showResponseMessage(element, type, message) {
  element.innerHTML = message;
  element.className = `response-message ${type} show`;
}

function hideResponseMessage(element) {
  element.classList.remove("show");
  element.innerHTML = "";
}

function clearPhoneValidation(phoneInput, phoneError) {
  phoneInput.classList.remove("error", "warning");
  phoneError.classList.remove("show", "warning");
}

// =============================================================================
// COUNTRY DROPDOWN
// =============================================================================

function setupCountryDropdown() {
  const dropdown = document.getElementById("countryDropdown");
  const selected = document.getElementById("countrySelected");
  const options = document.getElementById("countryOptions");
  const hiddenInput = document.getElementById("countryCode");

  if (!dropdown || !selected || !options || !hiddenInput) return;

  let originalText = "🇺🇸 +1 (US)";
  let filteredOptions = [];
  // Configure dropdown - disable contenteditable to prevent manual typing
  selected.setAttribute("contenteditable", "false");
  selected.setAttribute("data-placeholder", "Click to select country...");

  // Helper functions
  const getAllCountryOptions = () =>
    Array.from(options.querySelectorAll("li[data-value]")); // Dynamic separator adjustment function
  function adjustSeparatorPosition() {
    const selectedElement = document.getElementById("countrySelected");
    const dropdownElement = document.getElementById("countryDropdown");

    if (!selectedElement || !dropdownElement) {
      console.log("Elements not found for separator adjustment");
      return;
    }

    // Create a temporary element to measure text width
    const tempElement = document.createElement("span");
    tempElement.style.visibility = "hidden";
    tempElement.style.position = "absolute";
    tempElement.style.whiteSpace = "nowrap";
    tempElement.style.fontSize =
      window.getComputedStyle(selectedElement).fontSize;
    tempElement.style.fontFamily =
      window.getComputedStyle(selectedElement).fontFamily;
    tempElement.style.fontWeight =
      window.getComputedStyle(selectedElement).fontWeight;

    // Get the actual displayed text
    const displayText =
      selectedElement.textContent ||
      selectedElement.getAttribute("data-placeholder") ||
      "🇺🇸 +1 (US)";
    tempElement.textContent = displayText;

    document.body.appendChild(tempElement);
    const textWidth = tempElement.offsetWidth;
    document.body.removeChild(tempElement);

    // Add padding space for arrow and padding (60px total: 40px padding + 20px for arrow)
    const totalWidth = Math.max(120, Math.min(280, textWidth + 60));

    console.log(
      `Adjusting separator: text="${displayText}", textWidth=${textWidth}, totalWidth=${totalWidth}`
    );

    // Apply the dynamic width with smooth transition - use multiple methods to ensure it works
    dropdownElement.style.flex = `0 0 ${totalWidth}px`;
    dropdownElement.style.minWidth = `${totalWidth}px`;
    dropdownElement.style.maxWidth = `${totalWidth}px`;
    dropdownElement.style.width = `${totalWidth}px`;

    // Force a reflow to ensure styles are applied
    dropdownElement.offsetWidth;

    // Ensure the separator line aligns perfectly
    dropdownElement.style.borderRight = "1px solid #cbd5e1";

    // Update dropdown options width to match exactly when open
    if (
      dropdown.classList.contains("open") &&
      options.style.position === "fixed"
    ) {
      options.style.width = `${totalWidth}px`;
    }

    console.log(`Applied width: ${dropdownElement.style.width}`);
  }

  function filterCountries(searchTerm) {
    const countryOptions = getAllCountryOptions();
    filteredOptions = [];

    // Remove existing no-results message
    const existingNoResults = options.querySelector(".no-results");
    if (existingNoResults) existingNoResults.remove();

    countryOptions.forEach((li) => {
      const text = li.textContent.toLowerCase();
      const value = li.getAttribute("data-value").toLowerCase();

      if (
        text.includes(searchTerm.toLowerCase()) ||
        value.includes(searchTerm.toLowerCase())
      ) {
        li.classList.remove("hidden");
        filteredOptions.push(li);
      } else {
        li.classList.add("hidden");
      }
    });

    // Show no results message
    if (filteredOptions.length === 0 && searchTerm.trim()) {
      const noResultsLi = document.createElement("li");
      noResultsLi.className = "no-results";
      noResultsLi.textContent = "No countries found";
      Object.assign(noResultsLi.style, {
        padding: "20px",
        textAlign: "center",
        color: "#64748b",
        fontStyle: "italic",
      });
      options.appendChild(noResultsLi);
    }
  }

  function clearSearch() {
    getAllCountryOptions().forEach((li) => li.classList.remove("hidden"));
    const noResults = options.querySelector(".no-results");
    if (noResults) noResults.remove();
    filteredOptions = getAllCountryOptions();
  }
  function forceDropdownOnTop() {
    const rect = selected.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    Object.assign(options.style, {
      position: "fixed",
      left: rect.left + "px",
      top: rect.bottom + "px",
      width: dropdownRect.width + "px" /* Match dropdown width exactly */,
      zIndex: "2147483647",
      display: "block",
    });
    document.body.appendChild(options);
  }

  function resetDropdown() {
    dropdown.appendChild(options);
    Object.assign(options.style, {
      position: "",
      left: "",
      top: "",
      width: "",
      zIndex: "",
      display: "",
    });
  }
  function selectCountry(li) {
    const fullText = li.textContent;
    const shortFormat = getShortFormat(fullText);

    console.log(`Selecting country: ${shortFormat}`);

    originalText = shortFormat;
    selected.textContent = originalText;
    selected.style.color = "";
    hiddenInput.value = li.getAttribute("data-value");

    // Update selections
    options
      .querySelectorAll("li")
      .forEach((el) => el.classList.remove("selected"));
    li.classList.add("selected");

    // Close dropdown
    dropdown.classList.remove("open");
    resetDropdown();

    // Important: Shift separator back to fit the selected country code
    console.log(
      `Shifting separator back to fit selected country: ${shortFormat}`
    );

    setTimeout(() => {
      adjustSeparatorPosition(); // This will resize to fit the selected country
    }, 50);

    setTimeout(() => {
      adjustSeparatorPosition(); // Double-check the positioning
    }, 200);
  }

  function getShortFormat(fullText) {
    const shortNames = {
      "United States": "US",
      "United Arab Emirates": "UAE",
      "United Kingdom": "UK",
      France: "FR",
      Germany: "DE",
      Italy: "IT",
      Spain: "ES",
      Russia: "RU",
      China: "CN",
      Japan: "JP",
      "South Korea": "KR",
      India: "IN",
      Pakistan: "PK",
      Bangladesh: "BD",
      Egypt: "EG",
      "Saudi Arabia": "SA",
      Jordan: "JO",
      Lebanon: "LB",
      Malaysia: "MY",
      Singapore: "SG",
      "Hong Kong": "HK",
      Australia: "AU",
      "New Zealand": "NZ",
      Brazil: "BR",
      Mexico: "MX",
      Argentina: "AR",
      Chile: "CL",
      Colombia: "CO",
    };

    const parts = fullText.match(
      /^(🇺🇸|🇦🇪|🇬🇧|🇫🇷|🇩🇪|🇮🇹|🇪🇸|🇷🇺|🇨🇳|🇯🇵|🇰🇷|🇮🇳|🇵🇰|🇧🇩|🇪🇬|🇸🇦|🇯🇴|🇱🇧|🇲🇾|🇸🇬|🇭🇰|🇦🇺|🇳🇿|🇧🇷|🇲🇽|🇦🇷|🇨🇱|🇨🇴)\s(\+\d+)\s(.+)/
    );

    if (parts) {
      const [, flag, code, countryName] = parts;
      const shortName = shortNames[countryName] || countryName.split(" ")[0];
      return `${flag} ${code} (${shortName})`;
    }
    return fullText;
  }

  function resetCountryDropdown() {
    originalText = "🇺🇸 +1 (US)";
    selected.textContent = originalText;
    selected.style.color = "";
    hiddenInput.value = "+1";

    options
      .querySelectorAll("li")
      .forEach((el) => el.classList.remove("selected"));
    const defaultOption = options.querySelector('li[data-value="+1"]');
    if (defaultOption) defaultOption.classList.add("selected");

    dropdown.classList.remove("open");
    resetDropdown();
    clearSearch();

    // Reset separator position
    setTimeout(() => {
      adjustSeparatorPosition();
    }, 50);
  } // Event listeners
  selected.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Toggle dropdown open/closed
    if (dropdown.classList.contains("open")) {
      // Close dropdown
      dropdown.classList.remove("open");
      resetDropdown();
      // Shift back to current country's width
      adjustSeparatorPosition();
    } else {
      // Open dropdown - shift separator to make menu readable
      dropdown.classList.add("open");

      // Temporarily expand separator for better readability
      const dropdownElement = document.getElementById("countryDropdown");
      if (dropdownElement) {
        const expandedWidth = 280; // Expanded width for readability
        console.log(
          `Expanding separator for menu readability: ${expandedWidth}px`
        );

        dropdownElement.style.flex = `0 0 ${expandedWidth}px`;
        dropdownElement.style.minWidth = `${expandedWidth}px`;
        dropdownElement.style.maxWidth = `${expandedWidth}px`;
        dropdownElement.style.width = `${expandedWidth}px`;
        dropdownElement.style.borderRight = "1px solid #cbd5e1";
      }

      forceDropdownOnTop();
      clearSearch();
      setTimeout(() => {
        // Update dropdown options width to match expanded width
        if (options.style.position === "fixed") {
          options.style.width = "280px";
        }
      }, 100);
    }
  }); // Add keyboard support for accessibility
  selected.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Toggle dropdown like clicking
      if (dropdown.classList.contains("open")) {
        dropdown.classList.remove("open");
        resetDropdown();
        adjustSeparatorPosition();
      } else {
        dropdown.classList.add("open");
        forceDropdownOnTop();
        clearSearch();
        setTimeout(() => {
          adjustSeparatorPosition();
        }, 100);
      }
    } else if (e.key === "Escape") {
      if (dropdown.classList.contains("open")) {
        dropdown.classList.remove("open");
        resetDropdown();
        adjustSeparatorPosition();
      }
    }
  });
  selected.addEventListener("focus", function () {
    // Prevent focus from making the field editable
    this.blur();
  });

  selected.addEventListener("blur", function () {
    // No action needed since field is not editable
  });

  // Option clicks
  options.querySelectorAll("li[data-value]").forEach((li) => {
    li.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      selectCountry(li);
    });
  });
  // Close on outside click
  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target) && !options.contains(e.target)) {
      dropdown.classList.remove("open");
      resetDropdown();
      adjustSeparatorPosition();
    }
  });

  // Update position on scroll/resize
  ["scroll", "resize"].forEach((event) => {
    window.addEventListener(event, () => {
      if (dropdown.classList.contains("open")) forceDropdownOnTop();
      adjustSeparatorPosition();
    });
  });

  // Reset handlers
  document
    .getElementById("contactFormElement")
    ?.addEventListener("reset", function () {
      setTimeout(() => {
        resetCountryDropdown();
        const responseMessage = document.getElementById("responseMessage");
        if (responseMessage) hideResponseMessage(responseMessage);
      }, 10);
    });

  document.addEventListener("resetCountryDropdown", resetCountryDropdown);
  // Initial separator position setup - multiple calls to ensure it works
  setTimeout(() => {
    adjustSeparatorPosition();
  }, 100);

  setTimeout(() => {
    adjustSeparatorPosition();
  }, 500);

  // Also call on page load
  window.addEventListener("load", () => {
    setTimeout(() => {
      adjustSeparatorPosition();
    }, 100);
  });
}

// Form animations
function setupFormAnimations() {
  document
    .querySelectorAll(".form-group input, .form-group textarea")
    .forEach((input) => {
      input.addEventListener("focus", function () {
        this.parentElement.style.transform = "translateY(-2px)";
      });
      input.addEventListener("blur", function () {
        this.parentElement.style.transform = "translateY(0)";
      });
    });
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  setupPhoneValidation();
  setupFormSubmission();
  setupCountryDropdown();
  setupFormAnimations();
});

// =============================================================================
// EVENT HANDLERS & SCROLL MANAGEMENT
// =============================================================================

function handleScroll() {
  const currentScrollY = window.scrollY;

  // Update navbar background
  updateNavbarBackground();

  // Update section highlighting (only if not programmatic scroll)
  highlightCurrentSection();

  // Show/hide scroll-to-top button
  if (currentScrollY > 200) {
    scrollToTopBtn?.classList.add("visible");
  } else {
    scrollToTopBtn?.classList.remove("visible");
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

function handleResize() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 768) {
    navLinks?.classList.remove("active");
    menuToggle?.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function initEventListeners() {
  // Optimized scroll listener using requestAnimationFrame
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Resize listener
  window.addEventListener("resize", handleResize);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

// =============================================================================
// INITIALIZATION
// =============================================================================

function init() {
  // Check if required elements exist
  if (!navbar) {
    console.warn("Navbar element not found");
  }

  // Initialize all functionality
  initSmoothScrolling();
  initMobileMenu();
  initScrollToTop();
  initBlurRevealAnimation();
  initEventListeners();
  initTypingAnimation();
  initAboutAnimations();
  aboutSectionEnterAnimation();
  servicesSectionEnterAnimation();
  setupAnimatedPlaceholder(); // Add animated placeholder

  // Set initial states
  updateNavbarBackground();
  highlightCurrentSection();
  moveUnderlineToActiveOrHide();

  console.log("Enhanced navbar functionality initialized successfully");
}

// On window resize, reposition underline to current active link or hide
window.addEventListener("resize", moveUnderlineToActiveOrHide);

// ===== START THE APPLICATION =====
// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Debounce underline update on scroll (1 second delay)
window.addEventListener("scroll", () => {
  if (underlineScrollTimeout) clearTimeout(underlineScrollTimeout);
  underlineScrollTimeout = setTimeout(() => {
    if (!isProgrammaticScroll) {
      highlightCurrentSection(); // Only update underline if not locked
    }
  }, 1000); // 1 second delay
});

// Debounce underline update on scroll
let debounceTimeout;
window.addEventListener("scroll", () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (!isProgrammaticScroll) {
      highlightCurrentSection(); // Only update underline if not locked
    }
  }, 1000); // 1 second delay
});

// Re-run bold enforcement on scroll and resize
window.addEventListener("scroll", enforceSingleBoldNav);
window.addEventListener("resize", enforceSingleBoldNav);

// Initial enforcement
enforceSingleBoldNav();

function setupAnimatedPlaceholder() {
  // Full Name
  const nameInput = document.getElementById("name");
  if (nameInput) {
    setupFieldAnimation(
      nameInput,
      [
        "Type your name here...",
        "Enter your full name...",
        "What's your name?",
        "Please write your name...",
        "Your name goes here...",
      ],
      "Enter your full name..."
    );
  }

  // Email Address
  const emailInput = document.getElementById("email");
  if (emailInput) {
    setupFieldAnimation(
      emailInput,
      [
        "Type your email address...",
        "Enter your email...",
        "What's your email?",
        "Please write your email...",
        "yourname@example.com",
      ],
      "Enter your email address..."
    );
  }

  // Message
  const messageInput = document.getElementById("message");
  if (messageInput) {
    setupFieldAnimation(
      messageInput,
      [
        "Type your message here...",
        "How can I help you?",
        "Tell us about your project...",
        "Write your inquiry...",
        "Your message goes here...",
      ],
      "Tell us about your project or inquiry..."
    );
  }
}

function setupFieldAnimation(inputElement, placeholders, focusPlaceholder) {
  let currentPlaceholderIndex = 0;
  let currentText = "";
  let isTyping = true;
  let charIndex = 0;
  let isInputFocused = false;
  let hasUserInput = false;
  let animationTimeout;

  function typewriterEffect() {
    if (isInputFocused || hasUserInput || inputElement.value.length > 0) {
      animationTimeout = setTimeout(typewriterEffect, 100);
      return;
    }

    const currentPlaceholder = placeholders[currentPlaceholderIndex];

    if (isTyping) {
      if (charIndex < currentPlaceholder.length) {
        currentText = currentPlaceholder.substring(0, charIndex + 1);
        inputElement.setAttribute("placeholder", currentText);
        charIndex++;
        animationTimeout = setTimeout(typewriterEffect, 90);
      } else {
        isTyping = false;
        animationTimeout = setTimeout(typewriterEffect, 1500);
      }
    } else {
      if (charIndex > 0) {
        currentText = currentPlaceholder.substring(0, charIndex - 1);
        inputElement.setAttribute("placeholder", currentText);
        charIndex--;
        animationTimeout = setTimeout(typewriterEffect, 40);
      } else {
        isTyping = true;
        currentPlaceholderIndex =
          (currentPlaceholderIndex + 1) % placeholders.length;
        animationTimeout = setTimeout(typewriterEffect, 600);
      }
    }
  }

  inputElement.addEventListener("focus", () => {
    isInputFocused = true;
    inputElement.setAttribute("placeholder", focusPlaceholder);
    if (animationTimeout) clearTimeout(animationTimeout);
  });

  inputElement.addEventListener("blur", () => {
    isInputFocused = false;
    if (inputElement.value.length === 0) {
      hasUserInput = false;
      currentText = "";
      charIndex = 0;
      isTyping = true;
      animationTimeout = setTimeout(typewriterEffect, 500);
    }
  });

  inputElement.addEventListener("input", () => {
    hasUserInput = inputElement.value.length > 0;
    if (hasUserInput) {
      inputElement.setAttribute("placeholder", "");
      if (animationTimeout) clearTimeout(animationTimeout);
    }
  });

  animationTimeout = setTimeout(typewriterEffect, 800);
}

// Add enhanced phone input overflow protection
function enforcePhoneInputBounds() {
  const phoneInput = document.querySelector(".phone-number-input");
  const phoneContainer = document.querySelector(".phone-input-container");

  if (!phoneInput || !phoneContainer) return;

  // Ensure phone input never exceeds its container bounds
  phoneInput.style.width = "200px";
  phoneInput.style.minWidth = "200px";
  phoneInput.style.maxWidth = "200px";
  phoneInput.style.overflow = "hidden";
  phoneInput.style.textOverflow = "ellipsis";
  phoneInput.style.whiteSpace = "nowrap";
  phoneInput.style.boxSizing = "border-box";

  // Prevent text from spilling outside container
  phoneContainer.style.overflow = "hidden";

  // Monitor for any changes and re-enforce bounds
  const observer = new MutationObserver(() => {
    if (phoneInput.scrollWidth > phoneInput.clientWidth) {
      phoneInput.style.textAlign = "left";
      phoneInput.scrollLeft = 0;
    }
  });

  observer.observe(phoneInput, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// Initialize phone input bounds protection
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    enforcePhoneInputBounds();
  }, 100);
});
