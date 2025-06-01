// ----------------------
// 1. Mobile Menu Toggle
// ----------------------
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const nav = document.querySelector("nav");

menuToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  header?.classList.toggle("scrolled", window.scrollY > 50);
});

window.addEventListener("scroll", function () {
  const nav = document.querySelector("nav");
  if (window.scrollY > 50) {
    nav?.classList.add("scrolled");
  } else {
    nav?.classList.remove("scrolled");
  }
});

// ----------------------
// 2. Typing Effect
// ----------------------
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
let currentText = "";
let currentDescription = "";

function type() {
  if (textIndex < typedText.length) {
    let currentChar = typedText.charAt(textIndex);
    currentText += currentChar;

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

type();

// ----------------------
// 3. Firebase Form Handling
// ----------------------
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

document
  .getElementById("contactForm")
  ?.querySelector(".contactForm-form").onsubmit = async function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const data = {};
  formData.forEach((value, key) => (data[key] = value));

  try {
    const docRef = await addDoc(collection(db, "contact"), data);

    document.getElementById("modalMessage").textContent =
      "Thank you! Your request has been submitted.";
    document.getElementById("modal").style.display = "block";

    this.reset();
  } catch (error) {
    document.getElementById("modalMessage").textContent =
      "There was an error submitting your request. Please try again.";
    document.getElementById("modal").style.display = "block";
    console.error("Error adding document: ", error);
  }
};

document.getElementById("closeModal")?.addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

window.addEventListener("click", function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
