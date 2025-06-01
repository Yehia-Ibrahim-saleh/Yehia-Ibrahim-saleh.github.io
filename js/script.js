// Mobile Menu Toggle and Navigation
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const nav = document.querySelector("nav");

// Toggle menu on click
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active"); // Toggle the active class on nav links
  menuToggle.classList.toggle("active"); // Toggle the active class on the menu toggle
});
// Optimized navbar functionality
class NavbarController {
  constructor() {
    this.menuToggle = document.querySelector(".menu-toggle");
    this.navLinks = document.querySelector(".nav-links");
    this.nav = document.querySelector("nav");
    this.isScrolled = false;

    this.init();
  }

// Scroll effects for header
window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  header.classList.toggle("scrolled", window.scrollY > 50);
});
  init() {
    this.bindEvents();
  }

window.addEventListener("scroll", function () {
  const nav = document.querySelector("nav");
  if (window.scrollY > 50) {
    nav.classList.add("scrolled"); // Apply the 'scrolled' class to the navbar
  } else {
    nav.classList.remove("scrolled"); // Remove the 'scrolled' class when at the top
  bindEvents() {
    // Mobile menu toggle
    this.menuToggle?.addEventListener("click", () => this.toggleMenu());

    // Close menu when clicking on links (mobile)
    this.navLinks?.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && window.innerWidth <= 768) {
        this.closeMenu();
      }
    });

    // Optimized scroll handler with throttling
    let scrollTimeout;
    window.addEventListener("scroll", () => {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        this.handleScroll();
        scrollTimeout = null;
      }, 16); // ~60fps
    });

    // Close menu on resize if window becomes large
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        this.closeMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.nav.contains(e.target) &&
        this.navLinks?.classList.contains("active")
      ) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.navLinks?.classList.toggle("active");

    // Animate hamburger icon
    const icon = this.menuToggle?.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    }
  }

  closeMenu() {
    this.navLinks?.classList.remove("active");
    const icon = this.menuToggle?.querySelector("i");
    if (icon) {
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-times");
    }
  }

  handleScroll() {
    const shouldBeScrolled = window.scrollY > 50;

    if (shouldBeScrolled !== this.isScrolled) {
      this.isScrolled = shouldBeScrolled;
      this.nav?.classList.toggle("scrolled", this.isScrolled);
    }
  }
}

// Initialize navbar when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new NavbarController();
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
});}}