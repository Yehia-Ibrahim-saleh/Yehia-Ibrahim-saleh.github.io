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

// ===== SECTION HIGHLIGHTING FUNCTIONALITY =====
function highlightCurrentSection() {
  if (isProgrammaticScroll) return;

  let current = "";
  const scrollPosition = window.scrollY + NAV_CONFIG.offset;

  // Find which section is currently in view
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }
  });

  // Only update if the active section has changed
  if (current && current !== currentActiveSection) {
    setActiveNavItem(current);
  }

  if (!current) {
    // Remove all active classes if no section is active (e.g., at the top)
    navLinksAll.forEach((link) =>
      link.classList.remove("active", "special-active")
    );
    moveUnderlineToActiveOrHide();
    return;
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
  navUnderline.style.width = linkRect.width + "px";
  navUnderline.style.left = linkRect.left - parentRect.left + "px";
  navUnderline.style.opacity = "1";
}

function moveUnderlineToActiveOrHide() {
  if (!navLinksList || !navUnderline) return;
  // Find the active link
  const active = navLinksList.querySelector("a.active");
  if (active) {
    moveUnderlineTo(active);
  } else {
    navUnderline.style.opacity = "0";
    navUnderline.style.width = "0";
  }
}

// Initialize nav underline functionality
function initNavUnderline() {
  if (!navLinksList || !navUnderline || !navLinksAll) return;

  // On window resize, reposition underline to current active link or hide
  window.addEventListener("resize", moveUnderlineToActiveOrHide);
}

// ===== UPDATE NAVIGATION HIGHLIGHTS =====
function setActiveNavItem(sectionId) {
  currentActiveSection = sectionId;

  navLinksArray.forEach((link) => {
    const linkSection = link.getAttribute("href").substring(1);
    const isActive = linkSection === sectionId;
    const isSpecial = NAV_CONFIG.specialSections.includes(linkSection);

    // Clear all states first
    link.classList.remove("active", "special-active");

    // Apply active states
    if (isActive) {
      link.classList.add("active");
      if (isSpecial) {
        link.classList.add("special-active");
      }
    }
  });

  moveUnderlineToActiveOrHide();
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
      top: section.offsetTop - NAV_CONFIG.offset,
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

// ===== SMOOTH SCROLLING FOR NAVIGATION LINKS =====
function initSmoothScrolling() {
  navLinksArray.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href.startsWith("#")) {
        e.preventDefault();

        const targetSection = href.substring(1);

        // Use our enhanced scroll function
        scrollToSection(targetSection);

        // Close mobile menu if open
        if (window.innerWidth <= 768) {
          navLinks?.classList.remove("active");
          menuToggle?.classList.remove("active");
          document.body.style.overflow = "";
        }
      }
    });

    // Enhanced hover management
    link.addEventListener("mouseenter", function () {
      if (!this.classList.contains("active")) {
        this.classList.add("hover");
      }
    });

    link.addEventListener("mouseleave", function () {
      this.classList.remove("hover");
    });

    // Handle focus events to prevent persistent focus styling
    link.addEventListener("focus", function () {
      // Only allow focus styling if not clicked
      if (!this.dataset.clicked) {
        this.classList.add("focused");
      }
    });

    link.addEventListener("blur", function () {
      this.classList.remove("focused");
      delete this.dataset.clicked;
    });

    // Track clicks to differentiate from keyboard focus
    link.addEventListener("mousedown", function () {
      this.dataset.clicked = "true";
    });

    // Do NOT move the underline on hover/focus!
    link.addEventListener("click", () => {
      setTimeout(moveUnderlineToActiveOrHide, 10);
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
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  });

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
  const part1 = "A ";
  const part2 = "Software Engineer ";
  const part3 = "Specializing in Front-end and Back-end Development";
  const typedText = part1 + part2 + part3;
  const typedDescription =
    "I'm Yehia Ibrahim, a passionate Software Engineer with a Bachelor's degree in Computer Science. I proudly hold a dual degree from the Arab Academy for Science and Technology in Alexandria, Egypt, and the University of Northampton in London, United Kingdom. As a dedicated software developer, I thrive on building impactful projects that solve real-world problems.";

  const typedTextElement = document.getElementById("typed-text");
  const typedDescriptionElement = document.getElementById("typed-description");

  // Check if elements exist
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

      // Highlight specific words
      if (currentText.endsWith("Software Engineer ")) {
        currentText = currentText.replace(
          "Software Engineer ",
          "<span class='highlight'>Software Engineer</span> "
        );
      } else if (currentText.endsWith("Front-end ")) {
        currentText = currentText.replace(
          "Front-end ",
          "<span class='highlight'>Front-end</span> "
        );
      } else if (currentText.endsWith("Back-end ")) {
        currentText = currentText.replace(
          "Back-end ",
          "<span class='highlight'>Back-end</span> "
        );
      }

      typedTextElement.innerHTML = currentText;
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

      // Highlight specific words
      if (currentDescription.endsWith("Yehia Ibrahim")) {
        currentDescription = currentDescription.replace(
          "Yehia Ibrahim",
          "<span class='highlight'>Yehia Ibrahim</span>"
        );
      } else if (
        currentDescription.endsWith("Arab Academy for Science and Technology")
      ) {
        currentDescription = currentDescription.replace(
          "Arab Academy for Science and Technology",
          "<span class='highlight'>Arab Academy for Science and Technology</span>"
        );
      } else if (currentDescription.endsWith("University of Northampton")) {
        currentDescription = currentDescription.replace(
          "University of Northampton",
          "<span class='highlight'>University of Northampton</span>"
        );
      } else if (currentDescription.endsWith("real-world problems")) {
        currentDescription = currentDescription.replace(
          "real-world problems",
          "<span class='highlight'>real-world problems</span>"
        );
      }

      typedDescriptionElement.innerHTML = currentDescription;
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
  initNavUnderline();
  initFormHandling();
  initTypingAnimation(); // Initialize typing animation

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
let underlineScrollTimeout = null;
window.addEventListener("scroll", () => {
  if (underlineScrollTimeout) clearTimeout(underlineScrollTimeout);
  underlineScrollTimeout = setTimeout(() => {
    highlightCurrentSection(); // This should call moveUnderlineToActiveOrHide()
  }, 300); // Adjust delay as needed
});
