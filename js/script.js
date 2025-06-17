// =============================================================================
// GLOBAL VARIABLES & DOM ELEMENTS
// =============================================================================

const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("nav-links");
const menuToggle = document.getElementById("menu-toggle");
const scrollToTopBtn = document.getElementById("scroll-to-top");
const sections = document.querySelectorAll("section[id]");
const navLinksArray = document.querySelectorAll('.nav-links a[href^="#"]');
const navLinksList = document.getElementById("nav-links");
const navUnderline = navLinksList?.querySelector(".nav-underline");
const navLinksAll = navLinksList?.querySelectorAll("a");

// Variables for scroll tracking
let lastScrollY = window.scrollY;
let ticking = false;
let isProgrammaticScroll = false;
let currentActiveSection = null;
let scrollTimeout;
let underlineScrollTimeout = null;
let debounceTimeout;

// Configuration
const NAV_CONFIG = {
  offset: 100,
  specialSections: ["contactForm"],
  scrollEndDelay: 300,
};

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
  const active = navLinksList.querySelector("a.active");
  if (active) {
    moveUnderlineTo(active);
  } else {
    navUnderline.style.opacity = "0";
    navUnderline.style.width = "0";
  }
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

function enforceSingleBoldNav() {
  navLinksAll.forEach((link) => {
    if (!link.classList.contains("active") && !link.matches(":hover")) {
      link.style.fontWeight = "500";
      link.style.color = "var(--primary-text, #222)";
    } else if (link.classList.contains("active")) {
      link.style.fontWeight = "700";
      link.style.color = "var(--primary-blue)";
    }
  });
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

  const visibleTop = scrollY + navbarHeight;
  const visibleBottom = scrollY + window.innerHeight - bottomGlassHeight;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + scrollY;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (sectionBottom > visibleTop && sectionTop < visibleBottom) {
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
    link.blur();
    link.style.pointerEvents = "none";
    void link.offsetWidth;
    link.style.pointerEvents = "";
    link.classList.remove("no-hover", "hover");
  });
}

function scrollToSection(sectionId) {
  clearTimeout(scrollTimeout);
  isProgrammaticScroll = true;
  const section = document.getElementById(sectionId);

  if (section) {
    clearAllNavEffects();
    setActiveNavItem(sectionId);
    window.scrollTo({
      top: section.offsetTop - getNavbarOffset(),
      behavior: "smooth",
    });
    scrollTimeout = setTimeout(() => {
      isProgrammaticScroll = false;
      highlightCurrentSection();
    }, NAV_CONFIG.scrollEndDelay);
  }
}

function getNavbarOffset() {
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

        if (window.innerWidth <= 768) {
          navLinks?.classList.remove("active");
          menuToggle?.classList.remove("active");
          document.body.style.overflow = "";
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
          highlightCurrentSection();
        }, 1000);
      }
    });
  });
}

function initMobileMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isActive = navLinks.classList.contains("active");

    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");

    if (!isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  menuToggle.addEventListener("click", function () {
    const isActive = menuToggle.classList.contains("active");
    const lines = document.querySelectorAll(".hamburger-line");

    const animations = [
      "waveMotion1 2s infinite ease-in-out",
      "waveMotion2 2.5s infinite ease-in-out",
      "waveMotion3 1.8s infinite ease-in-out",
    ];

    lines.forEach((line, index) => {
      if (isActive) {
        line.style.animation = "none";
      } else {
        line.style.animation = "none";
        line.offsetHeight;
        line.style.animation = animations[index];
      }
    });
  });

  navLinksArray.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  });

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
    clearAllNavEffects();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Premium scroll handler - Glass effect
if (!window.premiumScrollHandlerInitialized) {
  const config = {
    blur: { max: 24, height: 120 },
    activateAt: 80,
    bottomThreshold: 150,
  };

  function updateGlassEffect() {
    const currentScrollY = window.scrollY;
    const isScrolledUp = currentScrollY < config.activateAt;
    const isAtBottom =
      window.innerHeight + currentScrollY >=
      document.documentElement.scrollHeight - config.bottomThreshold;
    const isActive = !isScrolledUp && !isAtBottom;
    const scrollRatio = Math.min(1, (currentScrollY - config.activateAt) / 100);

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

    const topButton = document.querySelector(".scroll-to-top");
    if (topButton) {
      topButton.classList.toggle("visible", !isScrolledUp);
    }
  }

  if (!document.querySelector(".bottom-glass")) {
    const glass = document.createElement("div");
    glass.className = "bottom-glass";
    document.body.appendChild(glass);

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
  updateGlassEffect();
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

  type();
}

// =============================================================================
// ABOUT SECTION ANIMATIONS
// =============================================================================

function animateWords(card) {
  const p = card.querySelector("p");
  if (!p) return;
  const html = p.innerHTML;
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

  const serviceCards = servicesSection.querySelectorAll(".service");

  function checkServicesInView() {
    const rect = servicesSection.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;

    if (rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.1) {
      servicesSection.classList.add("section-visible");
      serviceCards.forEach((card) => {
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
  setTimeout(checkServicesInView, 100);
}

// =============================================================================
// PROJECT MODAL FUNCTIONALITY
// =============================================================================

function initProjectModal() {
  const modal = document.getElementById("project-modal");
  if (!modal) return;

  const modalImg = modal.querySelector(".modal-image img");
  const modalTitle = modal.querySelector(".modal-title");
  const modalDesc = modal.querySelector(".modal-description");
  const modalDetails = modal.querySelector(".modal-details");
  const modalGithub = modal.querySelector(".modal-github");
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

  function openModal(card) {
    const glass = document.querySelector(".bottom-glass");
    const scrollToTopBtn = document.getElementById("scroll-to-top");

    if (scrollToTopBtn) scrollToTopBtn.classList.add("hidden");
    if (glass) glass.classList.add("hidden");

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

  function closeModal() {
    const scrollToTopBtn = document.getElementById("scroll-to-top");
    const glass = document.querySelector(".bottom-glass");

    if (scrollToTopBtn) scrollToTopBtn.classList.remove("hidden");
    if (glass) glass.classList.remove("hidden");

    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 220);
  }

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
  modal.addEventListener("mousedown", function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (
      modal.style.display === "flex" &&
      (e.key === "Escape" || e.key === "Esc")
    ) {
      closeModal();
    }
  });
}

// =============================================================================
// FIREBASE FORM HANDLING
// =============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3mtF3SUymZRu6obyxg9ppKLFdmgFyKZc",
  authDomain: "form-814f2.firebaseapp.com",
  projectId: "form-814f2",
  storageBucket: "form-814f2.appspot.com",
  messagingSenderId: "89138960600",
  appId: "1:89138960600:web:ecba88a87c611fc3905fad",
  measurementId: "G-P85MSPZWSN",
};

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

  form.addEventListener("submit", async function (e) {
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

  let originalText = "🇺🇸 +1 (US)";
  let filteredOptions = [];

  // Configure dropdown
  selected.setAttribute("contenteditable", "true");
  selected.setAttribute(
    "data-placeholder",
    "Type to search or click to browse..."
  );

  // Helper functions
  const getAllCountryOptions = () =>
    Array.from(options.querySelectorAll("li[data-value]"));

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
    Object.assign(options.style, {
      position: "fixed",
      left: rect.left + "px",
      top: rect.bottom + "px",
      width: rect.width + "px",
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
  }

  // Event listeners
  selected.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!dropdown.classList.contains("open")) {
      dropdown.classList.add("open");
      forceDropdownOnTop();
      clearSearch();
      selected.textContent = "";
      selected.focus();
    }
  });

  selected.addEventListener("input", function () {
    const searchTerm = this.textContent.trim();
    if (!dropdown.classList.contains("open") && searchTerm) {
      dropdown.classList.add("open");
      forceDropdownOnTop();
    }
    searchTerm ? filterCountries(searchTerm) : clearSearch();
  });

  selected.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      selected.textContent = originalText;
      selected.style.color = "";
      dropdown.classList.remove("open");
      resetDropdown();
      selected.blur();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) selectCountry(filteredOptions[0]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!dropdown.classList.contains("open")) {
        dropdown.classList.add("open");
        forceDropdownOnTop();
        clearSearch();
      }
      if (filteredOptions.length > 0) filteredOptions[0].focus();
    }
  });

  selected.addEventListener("focus", function () {
    if (!this.textContent.trim()) this.style.color = "#94a3b8";
  });

  selected.addEventListener("blur", function () {
    setTimeout(() => {
      if (!dropdown.classList.contains("open") && !this.textContent.trim()) {
        selected.textContent = originalText;
        selected.style.color = "";
      }
    }, 100);
  });

  options.querySelectorAll("li[data-value]").forEach((li) => {
    li.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      selectCountry(li);
    });
  });

  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target) && !options.contains(e.target)) {
      dropdown.classList.remove("open");
      resetDropdown();
    }
  });

  ["scroll", "resize"].forEach((event) => {
    window.addEventListener(event, () => {
      if (dropdown.classList.contains("open")) forceDropdownOnTop();
    });
  });

  document
    .getElementById("contactFormElement")
    .addEventListener("reset", function () {
      setTimeout(() => {
        resetCountryDropdown();
        const responseMessage = document.getElementById("responseMessage");
        if (responseMessage) hideResponseMessage(responseMessage);
      }, 10);
    });

  document.addEventListener("resetCountryDropdown", resetCountryDropdown);
}

// =============================================================================
// EVENT HANDLERS & SCROLL MANAGEMENT
// =============================================================================

function handleScroll() {
  const currentScrollY = window.scrollY;
  updateNavbarBackground();
  highlightCurrentSection();

  if (currentScrollY > 200) {
    scrollToTopBtn?.classList.add("visible");
  } else {
    scrollToTopBtn?.classList.remove("visible");
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

function handleResize() {
  if (window.innerWidth > 768) {
    navLinks?.classList.remove("active");
    menuToggle?.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function initEventListeners() {
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

  window.addEventListener("resize", handleResize);
  window.addEventListener("resize", moveUnderlineToActiveOrHide);

  window.addEventListener("scroll", () => {
    if (underlineScrollTimeout) clearTimeout(underlineScrollTimeout);
    underlineScrollTimeout = setTimeout(() => {
      if (!isProgrammaticScroll) {
        highlightCurrentSection();
      }
    }, 1000);
  });

  window.addEventListener("scroll", () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (!isProgrammaticScroll) {
        highlightCurrentSection();
      }
    }, 1000);
  });

  window.addEventListener("scroll", enforceSingleBoldNav);
  window.addEventListener("resize", enforceSingleBoldNav);
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
  if (!navbar) {
    console.warn("Navbar element not found");
  }

  initSmoothScrolling();
  initMobileMenu();
  initScrollToTop();
  initBlurRevealAnimation();
  initEventListeners();
  initTypingAnimation();
  initAboutAnimations();
  aboutSectionEnterAnimation();
  servicesSectionEnterAnimation();

  updateNavbarBackground();
  highlightCurrentSection();
  moveUnderlineToActiveOrHide();
  enforceSingleBoldNav();

  console.log("Enhanced navbar functionality initialized successfully");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("DOMContentLoaded", initProjectModal);
} else {
  init();
  initProjectModal();
}
