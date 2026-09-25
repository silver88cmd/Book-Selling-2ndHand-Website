const USERS_KEY = "booknest-users";
const USER_KEY = "booknest-user";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeId(value) {
  return String(value).replace(/\s+/g, "");
}

function isValidIdNumber(value) {
  const cleaned = normalizeId(value);
  return /^\d{8,12}$/.test(cleaned);
}

function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}

function showAuthMessage(elementId, message, isError = false) {
  const node = document.getElementById(elementId);
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("error", isError);
  node.classList.toggle("success", !isError);
}

function attachAuthHandlers() {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(signupForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const idNumber = normalizeId(formData.get("idNumber") || "");
      const password = String(formData.get("password") || "");

      if (!name || !email || !password) {
        showAuthMessage("signup-message", "Please complete all fields.", true);
        return;
      }

      if (!validateEmail(email)) {
        showAuthMessage("signup-message", "Please enter a valid email address.", true);
        return;
      }

      if (!isValidIdNumber(idNumber)) {
        showAuthMessage("signup-message", "Please enter a valid ID number with 8 to 12 digits.", true);
        return;
      }

      const users = getUsers();
      const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        showAuthMessage("signup-message", "This email is already registered. Please log in.", true);
        return;
      }

      const user = { name, email, idNumber, password };
      users.push(user);
      saveUsers(users);
      setCurrentUser({ name, email, idNumber });
      showAuthMessage("signup-message", "Account created successfully! Redirecting...", false);

      window.setTimeout(() => {
        window.location.href = "home.html";
      }, 1200);
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      const idNumber = normalizeId(formData.get("idNumber") || "");
      const password = String(formData.get("password") || "");

      if (!validateEmail(email)) {
        showAuthMessage("login-message", "Please enter a valid email address.", true);
        return;
      }

      if (!isValidIdNumber(idNumber)) {
        showAuthMessage("login-message", "Please enter a valid ID number with 8 to 12 digits.", true);
        return;
      }

      const users = getUsers();
      const user = users.find(
        (entry) =>
          entry.email.toLowerCase() === email.toLowerCase() &&
          normalizeId(entry.idNumber) === idNumber &&
          entry.password === password
      );

      if (!user) {
        showAuthMessage("login-message", "Incorrect email, ID, or password.", true);
        return;
      }

      setCurrentUser({ name: user.name, email: user.email, idNumber: user.idNumber });
      showAuthMessage("login-message", "Login successful! Redirecting...", false);

      window.setTimeout(() => {
        window.location.href = "home.html";
      }, 1200);
    });
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearCurrentUser();
      window.location.href = "login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", attachAuthHandlers);
