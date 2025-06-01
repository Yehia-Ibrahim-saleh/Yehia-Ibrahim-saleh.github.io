// Get DOM elements
const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const floatingHamburger = document.getElementById("floating-hamburger");

// Scroll variables
let lastScrollY = window.scrollY;
let scrollThreshold = 300;

// Scroll behavior
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  // Add scrolled class when scrolling
  if (currentScrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Hide navbar and show floating hamburger when scrolled deep
  if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY) {
    navbar.classList.add("hidden");
    floatingHamburger.classList.add("show");
  } else if (currentScrollY < scrollThreshold || currentScrollY < lastScrollY) {
    navbar.classList.remove("hidden");
    floatingHamburger.classList.remove("show");
  }

  lastScrollY = currentScrollY;
});

// Toggle mobile menu
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

// Floating hamburger click
floatingHamburger.addEventListener("click", () => {
  navbar.classList.add("show-from-floating");
  floatingHamburger.classList.remove("show");
  navLinks.classList.add("active");
  menuToggle.classList.add("active");
});

// Close menu when clicking on nav links
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("active");
    menuToggle.classList.remove("active");
    navbar.classList.remove("show-from-floating");
  }
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target) && !floatingHamburger.contains(e.target)) {
    navLinks.classList.remove("active");
    menuToggle.classList.remove("active");
    navbar.classList.remove("show-from-floating");
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
});

// Add stagger animation to menu items
function staggerMenuItems() {
  const menuItems = navLinks.querySelectorAll("li");
  menuItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
  });
}

// Initialize stagger animation
staggerMenuItems();

// Throttle scroll events for better performance
let ticking = false;

function updateScroll() {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY) {
    navbar.classList.add("hidden");
    floatingHamburger.classList.add("show");
  } else if (currentScrollY < scrollThreshold || currentScrollY < lastScrollY) {
    navbar.classList.remove("hidden");
    floatingHamburger.classList.remove("show");
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

// Optimized scroll handler
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScroll);
    ticking = true;
  }
});

// Handle keyboard navigation
menuToggle.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    menuToggle.click();
  }
});

floatingHamburger.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    floatingHamburger.click();
  }
});

// Handle escape key to close menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    navLinks.classList.remove("active");
    menuToggle.classList.remove("active");
    navbar.classList.remove("show-from-floating");
  }
});

// Add focus management for accessibility
navLinks.addEventListener("keydown", (e) => {
  const focusableElements = navLinks.querySelectorAll("a");
  const currentIndex = Array.from(focusableElements).indexOf(
    document.activeElement
  );

  if (e.key === "ArrowDown") {
    e.preventDefault();
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex].focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prevIndex =
      currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[prevIndex].focus();
  }
});
// Typing Animation
const part1 = "A ";
const part2 = "Software Engineer ";
const part3 = "Specializing in Front-end and Back-end Development";

const typedText = part1 + part2 + part3;

const typedDescription =
  "I'm Yehia Ibrahim, a passionate Software Engineer with a Bachelor's degree in Computer Science. I proudly hold a dual degree from the Arab Academy for Science and Technology in Alexandria, Egypt, and the University of Northampton in London, United Kingdom. As a dedicated software developer, I thrive on building impactful projects that solve real-world problems.";

const typedTextElement = document.getElementById("typed-text");
const typedDescriptionElement = document.getElementById("typed-description");

let textIndex = 0;
let descriptionIndex = 0;
let currentText = ""; // Store the current part of text
let currentDescription = ""; // Store the current part of description

// Function to type text and highlight specific words during typing
function type() {
  if (textIndex < typedText.length) {
    let currentChar = typedText.charAt(textIndex);
    currentText += currentChar; // Add each character progressively

    // Check for specific words and highlight AFTER they are fully typed
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

    typedTextElement.innerHTML = currentText; // Update the HTML content with highlighted words

    textIndex++;
    setTimeout(type, 65); // Adjust typing speed
  } else {
    setTimeout(typeDescription, 500); // Start typing description after typed text
  }
}

// Function to type the description and highlight specific words during typing
function typeDescription() {
  if (descriptionIndex < typedDescription.length) {
    let currentChar = typedDescription.charAt(descriptionIndex);
    currentDescription += currentChar; // Add each character progressively

    // Check for specific words and highlight AFTER they are fully typed
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

    typedDescriptionElement.innerHTML = currentDescription; // Update description content with highlighted words

    descriptionIndex++;
    setTimeout(typeDescription, 15); // Adjust typing speed
  }
}

// Start typing animation
type();

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

// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document
    .getElementById("contactForm")
    .querySelector(".contactForm-form");

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
      document.getElementById("modalMessage").textContent =
        "Thank you! Your request has been submitted.";
      document.getElementById("modal").style.display = "block";

      this.reset();
    } catch (error) {
      // Show the modal with the error message
      document.getElementById("modalMessage").textContent =
        "There was an error submitting your request. Please try again.";
      document.getElementById("modal").style.display = "block";
      console.error("Error adding document: ", error); // Log the error
    }
  };

  // Close the modal when the user clicks on <span> (x)
  document.getElementById("closeModal").onclick = function () {
    document.getElementById("modal").style.display = "none";
  };

  // Close the modal when the user clicks anywhere outside of the modal
  window.onclick = function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
});
