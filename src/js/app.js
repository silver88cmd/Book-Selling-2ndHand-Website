const CART_KEY = "booknest-cart";
const LISTING_KEY = "booknest-listing";
const USER_KEY = "booknest-user";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function requireAuth() {
  const user = getCurrentUser();
  const protectedPages = ["home", "products", "product", "sell", "cart", "checkout"];
  const page = document.body.dataset.page || "home";
  if (!user && protectedPages.includes(page)) {
    window.location.href = "login.html";
  }
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cart-count, #cart-count-inline").forEach((element) => {
    element.textContent = totalItems;
  });
}

function showToast(message) {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

function addToCart(id, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, qty });
  }

  saveCart(cart);
  updateCartBadge();
  showToast("Book added to cart");
}

function getBookById(id) {
  return window.BOOKS.find((book) => book.id === Number(id)) || window.BOOKS[0];
}

function renderHomeBooks() {
  const grid = document.getElementById("home-book-grid");
  if (!grid) return;

  grid.innerHTML = window.BOOKS.slice(0, 6)
    .map(
      (book) => `
        <article class="book-card">
          <img src="${book.image}" alt="${book.title}" />
          <div class="book-body">
            <div class="book-meta">
              <span class="book-category">${book.category}</span>
              <span class="rating">★ ${book.rating}</span>
            </div>
            <h3>${book.title}</h3>
            <p class="author">by ${book.author}</p>
            <div class="book-bottom">
              <span class="price">$${book.price}</span>
              <span class="condition">${book.condition}</span>
            </div>
            <div class="book-actions">
              <button class="small-btn add-to-cart" data-id="${book.id}">Add to cart</button>
              <a class="small-btn" href="product.html?id=${book.id}">View</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });
}

function renderProductsPage() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const chips = document.querySelectorAll(".chip");
  const searchInput = document.getElementById("product-search");
  const sortSelect = document.getElementById("sort-select");
  const params = new URLSearchParams(window.location.search);
  let activeCategory = params.get("category") || "All";

  if (searchInput && params.get("q")) {
    searchInput.value = params.get("q");
  }

  chips.forEach((chip) => {
    chip.classList.toggle("active", (chip.dataset.category || "All") === activeCategory);
  });

  function applyFilters() {
    const query = (searchInput?.value || "").trim().toLowerCase();

    let filtered = window.BOOKS.filter((book) => {
      const matchesCategory = activeCategory === "All" || book.category === activeCategory;
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    const sortValue = sortSelect?.value || "featured";
    if (sortValue === "low") filtered.sort((a, b) => a.price - b.price);
    if (sortValue === "high") filtered.sort((a, b) => b.price - a.price);
    if (sortValue === "rating") filtered.sort((a, b) => b.rating - a.rating);

    grid.innerHTML = filtered.length
      ? filtered
          .map(
            (book) => `
              <article class="book-card">
                <img src="${book.image}" alt="${book.title}" />
                <div class="book-body">
                  <div class="book-meta">
                    <span class="book-category">${book.category}</span>
                    <span class="rating">★ ${book.rating}</span>
                  </div>
                  <h3>${book.title}</h3>
                  <p class="author">by ${book.author}</p>
                  <div class="book-bottom">
                    <span class="price">$${book.price}</span>
                    <span class="condition">${book.condition}</span>
                  </div>
                  <div class="book-actions">
                    <button class="small-btn add-to-cart" data-id="${book.id}">Add to cart</button>
                    <a class="small-btn" href="product.html?id=${book.id}">View</a>
                  </div>
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state"><h3>No books match your filters</h3><p>Try another search or category.</p></div>`;

    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.category || "All";
      chips.forEach((item) => item.classList.toggle("active", item === chip));
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);
  applyFilters();
}

function renderProductPage() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const book = getBookById(params.get("id") || 1);

  container.innerHTML = `
    <div class="layout-2col">
      <div class="product-detail-card">
        <img class="detail-image" src="${book.image}" alt="${book.title}" />
      </div>
      <div class="product-detail-card detail-content">
        <span class="eyebrow">${book.category}</span>
        <h2>${book.title}</h2>
        <div class="detail-meta">
          <span>by ${book.author}</span>
          <span>★ ${book.rating}</span>
          <span>${book.condition}</span>
        </div>

        <div class="detail-price">
          <strong>$${book.price}</strong>
          <span class="condition">In stock</span>
        </div>

        <div class="detail-actions">
          <button class="primary-btn add-to-cart" data-id="${book.id}">Add to cart</button>
          <a class="secondary-btn" href="products.html">Continue shopping</a>
        </div>

        <div class="info-block">
          <h3>About this book</h3>
          <p>${book.description}</p>
        </div>

        <div class="info-block">
          <h3>Book details</h3>
          <ul>
            ${book.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;

  container.querySelector(".add-to-cart")?.addEventListener("click", () => addToCart(book.id));
}

function initSellPage() {
  const form = document.getElementById("sell-form");
  const preview = document.getElementById("listing-preview");
  const savedListing = JSON.parse(localStorage.getItem(LISTING_KEY) || "null");

  if (savedListing && preview) {
    preview.innerHTML = `
      <img src="${savedListing.image || "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80"}" alt="${savedListing.title}" />
      <div>
        <div class="book-category">${savedListing.category}</div>
        <h4>${savedListing.title}</h4>
        <p>by ${savedListing.author}</p>
        <strong>$${savedListing.price}</strong>
      </div>
    `;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const listing = {
      title: formData.get("title") || "Your Book",
      author: formData.get("author") || "Unknown Author",
      category: formData.get("category") || "General",
      price: formData.get("price") || 15,
      condition: formData.get("condition") || "Good",
      image: formData.get("image") || "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80"
    };

    localStorage.setItem(LISTING_KEY, JSON.stringify(listing));

    if (preview) {
      preview.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" />
        <div>
          <div class="book-category">${listing.category}</div>
          <h4>${listing.title}</h4>
          <p>by ${listing.author}</p>
          <strong>$${listing.price}</strong>
        </div>
      `;
    }

    const successBox = document.getElementById("success-box");
    if (successBox) {
      successBox.textContent = `Your book listing for ${listing.title} is live and ready for buyers.`;
      successBox.style.display = "block";
    }

    form.reset();
  });
}

function renderCartPage() {
  const cartList = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  if (!cartList || !summary) return;

  const cart = getCart();

  if (!cart.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse the shelves and add a few favorites.</p>
        <a class="primary-btn" href="products.html">Start shopping</a>
      </div>
    `;
    summary.innerHTML = `
      <h3>Order summary</h3>
      <div class="summary-row"><span>Subtotal</span><strong>$0</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>$0</strong></div>
      <div class="summary-row"><span>Total</span><strong>$0</strong></div>
      <a class="primary-btn" href="products.html">Browse books</a>
    `;
    return;
  }

  const cartEntries = cart
    .map((entry) => ({ ...entry, book: getBookById(entry.id) }))
    .filter((entry) => entry.book);

  const subtotal = cartEntries.reduce((sum, entry) => sum + entry.book.price * entry.qty, 0);
  const shipping = subtotal > 35 ? 0 : 7;
  const total = subtotal + shipping;

  cartList.innerHTML = cartEntries
    .map(
      (entry) => `
        <div class="cart-item">
          <img src="${entry.book.image}" alt="${entry.book.title}" />
          <div>
            <h4>${entry.book.title}</h4>
            <p class="author">by ${entry.book.author}</p>
            <p class="price">$${entry.book.price}</p>
            <div class="qty-controls">
              <button data-action="minus" data-id="${entry.book.id}">−</button>
              <div class="qty-value">${entry.qty}</div>
              <button data-action="plus" data-id="${entry.book.id}">+</button>
            </div>
          </div>
          <div>
            <button class="remove-link" data-action="remove" data-id="${entry.book.id}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");

  summary.innerHTML = `
    <h3>Order summary</h3>
    <div class="summary-row"><span>Subtotal</span><strong>$${subtotal}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>$${shipping}</strong></div>
    <div class="summary-row"><span>Total</span><strong>$${total}</strong></div>
    <a class="primary-btn" href="checkout.html">Proceed to checkout</a>
  `;

  cartList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const action = button.dataset.action;
      let updated = getCart();

      if (action === "plus") {
        const item = updated.find((entry) => entry.id === id);
        if (item) item.qty += 1;
      }

      if (action === "minus") {
        const item = updated.find((entry) => entry.id === id);
        if (item && item.qty > 1) item.qty -= 1;
      }

      if (action === "remove") {
        updated = updated.filter((entry) => entry.id !== id);
      }

      saveCart(updated);
      renderCartPage();
      updateCartBadge();
    });
  });
}

function renderCheckoutPage() {
  const checkoutPanel = document.getElementById("checkout-panel");
  const orderBox = document.getElementById("order-summary");
  if (!checkoutPanel || !orderBox) return;

  const cart = getCart();
  if (!cart.length) {
    orderBox.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Add books before checking out.</p>
        <a class="primary-btn" href="products.html">Continue shopping</a>
      </div>
    `;
    checkoutPanel.innerHTML = "";
    return;
  }

  const cartEntries = cart
    .map((entry) => ({ ...entry, book: getBookById(entry.id) }))
    .filter((entry) => entry.book);

  const subtotal = cartEntries.reduce((sum, entry) => sum + entry.book.price * entry.qty, 0);
  const shipping = subtotal > 35 ? 0 : 7;
  const total = subtotal + shipping;

  orderBox.innerHTML = cartEntries
    .map(
      (entry) => `
        <li>
          <div class="summary-row">
            <span>${entry.book.title} x ${entry.qty}</span>
            <strong>$${entry.book.price * entry.qty}</strong>
          </div>
        </li>
      `
    )
    .join("") + `
      <li class="summary-row"><span>Shipping</span><strong>$${shipping}</strong></li>
      <li class="summary-row"><span>Total</span><strong>$${total}</strong></li>
    `;

  checkoutPanel.innerHTML = `
    <h3>Shipping details</h3>
    <form id="checkout-form">
      <div class="checkout-grid">
        <input type="text" placeholder="Full name" required />
        <input type="email" placeholder="Email" required />
        <input type="text" placeholder="Street address" class="form-full" required />
        <input type="text" placeholder="City" required />
        <input type="text" placeholder="ZIP code" required />
        <select required>
          <option value="">Country</option>
          <option>United States</option>
          <option>Canada</option>
          <option>United Kingdom</option>
          <option>Australia</option>
        </select>
      </div>
      <div class="form-actions checkout-submit">
        <button class="primary-btn" type="submit">Place order</button>
      </div>
    </form>
  `;

  document.getElementById("checkout-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    updateCartBadge();

    const confirmation = document.getElementById("confirmation-box");
    if (confirmation) confirmation.style.display = "block";

    orderBox.innerHTML = `
      <li class="summary-row"><span>Order number</span><strong>#BN-${Date.now().toString().slice(-6)}</strong></li>
      <li class="summary-row"><span>Payment</span><strong>Card •••• 2468</strong></li>
      <li class="summary-row"><span>Status</span><strong>Confirmed</strong></li>
    `;

    checkoutPanel.innerHTML = `
      <div class="success-box">Order placed successfully! Your books are on the way.</div>
      <div class="form-actions">
        <a href="home.html" class="primary-btn">Back to home</a>
      </div>
    `;
  });
}

function initSearchFromHome() {
  const input = document.getElementById("home-search");
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = input.value.trim();
      if (query) {
        const url = new URL("products.html", window.location.href);
        url.searchParams.set("q", query);
        window.location.href = url.toString();
      }
    }
  });
}

function initProductsSearchFromUrl() {
  const searchInput = document.getElementById("product-search");
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (searchInput && q) {
    searchInput.value = q;
  }
}

function initCategoryCards() {
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      const url = new URL("products.html", window.location.href);
      url.searchParams.set("category", category);
      window.location.href = url.toString();
    });
  });
}

function initPage() {
  requireAuth();
  updateCartBadge();
  renderHomeBooks();
  renderProductsPage();
  renderProductPage();
  initSellPage();
  renderCartPage();
  renderCheckoutPage();
  initSearchFromHome();
  initProductsSearchFromUrl();
  initCategoryCards();
}

document.addEventListener("DOMContentLoaded", initPage);
