// ===== NAVBAR AND SCROLL FUNCTIONALITY =====

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

// ===== NAVBAR TRANSPARENCY/SOLID BACKGROUND =====
function updateNavbarBackground() {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

// --- Nav Underline Animation ---
const navLinksList = document.getElementById("nav-links");
const navUnderline = navLinksList?.querySelector(".nav-underline");
const navLinksAll = navLinksList?.querySelectorAll("a");

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

// On window resize, reposition underline to current active link or hide
window.addEventListener("resize", moveUnderlineToActiveOrHide);

// ===== UPDATE NAVIGATION HIGHLIGHTS =====
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

// ===== SECTION HIGHLIGHTING FUNCTIONALITY =====
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

// ===== CLEAR FOCUS AND HOVER EFFECTS =====
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

// ===== SMOOTH SCROLL TO SECTION =====
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

// ===== BLUR REVEAL SCROLL ANIMATION =====
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

// ===== SCROLL EVENT HANDLER =====
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

// Debounce underline update on scroll (1 second delay)
window.addEventListener("scroll", () => {
  if (underlineScrollTimeout) clearTimeout(underlineScrollTimeout);
  underlineScrollTimeout = setTimeout(() => {
    if (!isProgrammaticScroll) {
      highlightCurrentSection(); // Only update underline if not locked
    }
  }, 1000); // 1 second delay
});

// ===== SMOOTH SCROLLING FOR NAVIGATION LINKS =====
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

// ===== MOBILE MENU TOGGLE =====
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

// ===== SCROLL TO TOP FUNCTIONALITY =====
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

// ===== RESIZE HANDLER =====
function handleResize() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 768) {
    navLinks?.classList.remove("active");
    menuToggle?.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ===== EVENT LISTENERS =====
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

// ===== PERFORMANCE OPTIMIZATION =====
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

//====================================================================
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

//====================================================================
// ===== TYPING ANIMATION =====
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

// Firebase Configuration and Form Handling
// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Your Firebase configuration
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

// ===== FORM HANDLING =====
function initFormHandling() {
  const contactForm = document
    .getElementById("contactForm")
    ?.querySelector(".contactForm-form");

  if (!contactForm) {
    console.warn("Contact form not found");
    return;
  }

  contactForm.onsubmit = async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));

    console.log("Submitting data:", data); // Debug log

    try {
      // Add data to Firestore "contact" collection
      const docRef = await addDoc(collection(db, "contact"), data);
      console.log("Document written with ID: ", docRef.id); // Log document ID

      // Show the modal with the success message
      const modalMessage = document.getElementById("modalMessage");
      const modal = document.getElementById("modal");

      if (modalMessage && modal) {
        modalMessage.textContent =
          "Thank you! Your request has been submitted.";
        modal.style.display = "block";
      }

      this.reset();
    } catch (error) {
      // Show the modal with the error message
      const modalMessage = document.getElementById("modalMessage");
      const modal = document.getElementById("modal");

      if (modalMessage && modal) {
        modalMessage.textContent =
          "There was an error submitting your request. Please try again.";
        modal.style.display = "block";
      }
      console.error("Error adding document: ", error); // Log the error
    }
  };

  // Close the modal when the user clicks on <span> (x)
  const closeModal = document.getElementById("closeModal");
  if (closeModal) {
    closeModal.onclick = function () {
      const modal = document.getElementById("modal");
      if (modal) {
        modal.style.display = "none";
      }
    };
  }

  // Close the modal when the user clicks anywhere outside of the modal
  window.onclick = function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

// ===== ABOUT ANIMATIONS =====
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

// Enhance initAboutAnimations:
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

// ===== ABOUT SECTION ENTER ANIMATION =====
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

// ===== INITIALIZATION FUNCTION =====
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
  initFormHandling();
  initTypingAnimation(); // Initialize typing animation
  initAboutAnimations(); // Initialize about animations
  aboutSectionEnterAnimation();

  // Set initial states
  updateNavbarBackground();
  highlightCurrentSection();
  moveUnderlineToActiveOrHide();

  console.log("Enhanced navbar functionality initialized successfully");
}

// ===== START THE APPLICATION =====
// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

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

function getNavbarOffset() {
  // Dynamically get the navbar height (including padding/border)
  const navbarEl = document.getElementById("navbar");
  return navbarEl ? navbarEl.offsetHeight : 0;
}

function getBottomGlassOffset() {
  const glass = document.querySelector(".bottom-glass");
  return glass ? glass.offsetHeight : 0;
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

// Re-run bold enforcement on scroll and resize
window.addEventListener("scroll", enforceSingleBoldNav);
window.addEventListener("resize", enforceSingleBoldNav);

// Initial enforcement
enforceSingleBoldNav();

// Modal logic for project cards

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("project-modal");
  const modalImg = modal.querySelector(".modal-image img");
  const modalTitle = modal.querySelector(".modal-title");
  const modalDesc = modal.querySelector(".modal-description");
  const modalDetails = modal.querySelector(".modal-details");
  const modalGithub = modal.querySelector(".modal-github");
  const carouselWrapper = modal.querySelector(".carousel-wrapper");
  const leftArrow = modal.querySelector(".carousel-arrow.left");
  const rightArrow = modal.querySelector(".carousel-arrow.right");
  const indicators = modal.querySelector(".carousel-indicators");
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

  leftArrow.addEventListener("click", function (e) {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx - 1 + images.length) % images.length;
    showImage(currentImgIdx);
  });
  rightArrow.addEventListener("click", function (e) {
    e.stopPropagation();
    currentImgIdx = (currentImgIdx + 1) % images.length;
    showImage(currentImgIdx);
  });

  // Open modal with project data
  function openModal(card) {
    const glass = document.querySelector(".bottom-glass");
    const scrollToTopBtn = document.getElementById("scroll-to-top");
    if (scrollToTopBtn) {
      scrollToTopBtn.classList.add("hidden");
    }
    // Hide scroll-to-top button
    if (glass) {
      glass.classList.add("hidden"); // Hide bottom glass
    }
    // Support multiple images via data-images (comma separated), fallback to data-image
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
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("active");
      modal.querySelector(".modal-content").focus();
    }, 10);
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
