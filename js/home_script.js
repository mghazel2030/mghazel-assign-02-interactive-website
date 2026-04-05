/*
   =========================================================
   File: home_script.js: 
   =========================================================
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================-
   The JS file for the home and contact pages
   ========================================================= 
   Developer: Mohsen Ghazel
   Version: 31-Mar-2026
   ========================================================= 
*/

/* 
=========================================================
Contact Form:
========================================================= 
*/
// Get the contact form 
const form = document.getElementById('contact-form');

// Event-listener
form.addEventListener('submit', (e) => {
  // A validation flag of the user input
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

  // Validate Name: Make sure name-length is at least 2 chars
  const name = document.getElementById('name');
  if (name.value.trim().length < 2) {
    showError('name-error', 'Name must be at least 2 characters.');
    isValid = false;
  }

  // Validate Email - using regex for accuracy: 
  // Make sure e-mail address has the format: user@server.domain
  const email = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    showError('email-error', 'Please enter a valid email address.');
    isValid = false;
  }

  // Validate Message: Make sure the message is at least 10 chars long
  const message = document.getElementById('message');
  if (message.value.trim().length < 10) {
    showError('message-error', 'Message must be at least 10 characters.');
    isValid = false;
  }

  // In case of invalid input
  if (!isValid) {
    e.preventDefault(); // Stop form submission
  }
});

// Display the error message
function showError(id, message) {
  const errorElement = document.getElementById(id);
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}
