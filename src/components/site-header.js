function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("booknest-user") || "null");
  } catch {
    return null;
  }
}

function getActivePage() {
  const body = document.body;
  return body ? body.dataset.page : "home";
}

function renderHeader() {
  const currentUser = getCurrentUser();
  const page = getActivePage();
  const navLinks = `
    <nav class="nav-links" aria-label="Main navigation">
      <a href="home.html" class="${page === "home" ? "active" : ""}">Home</a>
      <a href="products.html" class="${page === "products" || page === "product" ? "active" : ""}">Shop</a>
      <a href="sell.html" class="${page === "sell" ? "active" : ""}">Sell books</a>
      <a href="cart.html" class="${page === "cart" || page === "checkout" ? "active" : ""}">Cart <span class="cart-pill">0</span></a>
    </nav>
  `;

  const authLinks = currentUser
    ? `
      <span class="user-pill">Hi, ${currentUser.name}</span>
      <button id="logout-button" class="ghost-btn" type="button">Log out</button>
    `
    : `
      <a class="ghost-btn" href="login.html">Log in</a>
      <a class="primary-btn" href="signup.html">Sign up</a>
    `;

  return `
    <header class="topbar">
      <a class="brand-wrap" href="home.html" aria-label="BookNest home">
        <div class="brand-mark">B</div>
        <div>
          <div class="brand-name">BookNest</div>
          <small>Secondhand library</small>
        </div>
      </a>

      ${navLinks}

      <div class="header-actions">
        <label class="search-box" aria-label="Search books">
          <span>⌕</span>
          <input id="home-search" type="search" placeholder="Search books..." />
        </label>
        ${authLinks}
      </div>
    </header>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("header-root");
  if (root) {
    root.innerHTML = renderHeader();
  }

  const homeSearch = document.getElementById("home-search");
  homeSearch?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = homeSearch.value.trim();
      if (query) {
        const url = new URL("products.html", window.location.href);
        url.searchParams.set("q", query);
        window.location.href = url.toString();
      }
    }
  });

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("booknest-user");
      window.location.href = "login.html";
    });
  }
});
