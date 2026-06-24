(function () {
  const STORAGE_KEYS = {
    products: "xemohinhtinh_products",
    users: "xemohinhtinh_users",
    currentUser: "xemohinhtinh_current_user",
    cart: "xemohinhtinh_cart",
    version: "xemohinhtinh_data_version"
  };
  const DATA_VERSION = "2026-06-23-flat-html-css-js";

  const ROUTES = {
    home: "../home/index.html",
    productList: "../product-list/index.html",
    productDetail: "../product-detail/index.html",
    signUp: "../sign-up/index.html",
    login: "../login/index.html"
  };

  const state = {
    products: [],
    currentPage: 1,
    perPage: 8,
    search: "",
    category: "all",
    price: "all",
    sort: "featured"
  };

  document.addEventListener("DOMContentLoaded", initApp);

  function initApp() {
    seedStorage();
    state.products = readStorage(STORAGE_KEYS.products, []);
    syncQuerySearch();
    bindNavigation();

    const page = document.body.dataset.page;
    if (page === "home") {
      renderFeaturedProducts();
      bindHomeSearch();
    }

    if (page === "product-list") {
      setupCatalog();
    }

    if (page === "product-detail") {
      setupProductDetail();
    }

    if (page === "sign-up") {
      setupSignUp();
    }

    if (page === "login") {
      setupLogin();
    }
  }

  function seedStorage() {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
    if (storedVersion !== DATA_VERSION || !localStorage.getItem(STORAGE_KEYS.products)) {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(MOCK_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
    }

    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.cart)) {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([]));
    }
  }

  function readStorage(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function bindNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navLinks = document.querySelector("[data-nav-links]");
    const page = document.body.dataset.page;
    const activePage = page === "product-detail" ? "product-list" : page;

    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === activePage) {
        link.classList.add("active");
      }
    });

    if (toggle && navLinks) {
      toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    }
  }

  function renderFeaturedProducts() {
    const container = document.querySelector("[data-featured-products]");
    if (!container) return;

    const featured = state.products.filter((product) => product.featured).slice(0, 4);
    container.innerHTML = featured.map(createProductCard).join("");
  }

  function setupCatalog() {
    const searchInput = document.querySelector("[data-search-input]");
    const categoryFilter = document.querySelector("[data-category-filter]");
    const priceFilter = document.querySelector("[data-price-filter]");
    const sortFilter = document.querySelector("[data-sort-filter]");
    const clearButton = document.querySelector("[data-clear-filters]");

    fillCategories(categoryFilter);

    if (searchInput) {
      searchInput.value = state.search;
      searchInput.addEventListener("input", () => {
        state.search = searchInput.value.trim();
        state.currentPage = 1;
        renderCatalog();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => {
        state.category = categoryFilter.value;
        state.currentPage = 1;
        renderCatalog();
      });
    }

    if (priceFilter) {
      priceFilter.addEventListener("change", () => {
        state.price = priceFilter.value;
        state.currentPage = 1;
        renderCatalog();
      });
    }

    if (sortFilter) {
      sortFilter.addEventListener("change", () => {
        state.sort = sortFilter.value;
        state.currentPage = 1;
        renderCatalog();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        state.search = "";
        state.category = "all";
        state.price = "all";
        state.sort = "featured";
        state.currentPage = 1;
        if (searchInput) searchInput.value = "";
        if (categoryFilter) categoryFilter.value = "all";
        if (priceFilter) priceFilter.value = "all";
        if (sortFilter) sortFilter.value = "featured";
        renderCatalog();
      });
    }

    renderCatalog();
  }

  function syncQuerySearch() {
    const params = new URLSearchParams(window.location.search);
    state.search = params.get("q") || "";
  }

  function bindHomeSearch() {
    const input = document.querySelector("[data-search-input]");
    const link = document.querySelector("[data-home-search-link]");

    if (!input || !link) return;

    input.addEventListener("input", () => {
      const query = input.value.trim();
      link.href = query ? ROUTES.productList + "?q=" + encodeURIComponent(query) : ROUTES.productList;
    });
  }

  function fillCategories(select) {
    if (!select) return;

    const categories = Array.from(new Set(state.products.map((product) => product.category)));
    select.innerHTML = '<option value="all">Tất cả danh mục</option>' + categories
      .map((category) => '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + "</option>")
      .join("");
  }

  function renderCatalog() {
    const list = document.querySelector("[data-product-list]");
    const count = document.querySelector("[data-result-count]");
    const pagination = document.querySelector("[data-pagination]");
    if (!list || !count || !pagination) return;

    const filtered = getFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    const start = (state.currentPage - 1) * state.perPage;
    const currentProducts = filtered.slice(start, start + state.perPage);

    count.textContent = "Hiển thị " + currentProducts.length + " / " + filtered.length + " sản phẩm";
    list.innerHTML = currentProducts.length
      ? currentProducts.map(createProductCard).join("")
      : '<div class="empty-state">Không tìm thấy sản phẩm phù hợp.</div>';

    renderPagination(pagination, totalPages);
  }

  function getFilteredProducts() {
    const keyword = normalizeText(state.search);

    return state.products
      .filter((product) => {
        const searchable = product.name + " " + product.brand + " " + product.category + " " + product.scale;
        const matchesSearch = !keyword || normalizeText(searchable).includes(keyword);
        const matchesCategory = state.category === "all" || product.category === state.category;
        const matchesPrice = matchesPriceRange(product.price, state.price);
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort(sortProducts);
  }

  function matchesPriceRange(price, range) {
    if (range === "all") return true;

    const parts = range.split("-");
    const min = Number(parts[0]);
    const max = parts[1] === "Infinity" ? Infinity : Number(parts[1]);
    return price >= min && price <= max;
  }

  function sortProducts(a, b) {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "name-asc") return a.name.localeCompare(b.name, "vi");
    return Number(b.featured) - Number(a.featured) || a.id - b.id;
  }

  function renderPagination(container, totalPages) {
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      const active = page === state.currentPage ? " active" : "";
      return '<button class="page-button' + active + '" type="button" data-page="' + page + '">' + page + "</button>";
    }).join("");

    container.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        state.currentPage = Number(button.dataset.page);
        renderCatalog();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupProductDetail() {
    const detail = document.querySelector("[data-product-detail]");
    const relatedContainer = document.querySelector("[data-related-products]");
    if (!detail || !relatedContainer) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const product = state.products.find((item) => item.id === id) || state.products[0];

    if (!product) {
      detail.innerHTML = '<div class="empty-state">Không tìm thấy sản phẩm.</div>';
      return;
    }

    document.title = product.name + " - xemohinhtinh";
    detail.innerHTML = createProductDetail(product);
    bindProductDetailEvents(product);
    renderRelatedProducts(product, relatedContainer);
  }

  function createProductDetail(product) {
    const gallery = getProductGallery(product);
    const specs = getProductSpecs(product);

    return [
      '<div class="breadcrumb"><a href="' + ROUTES.home + '">Trang chủ</a><span>/</span><a href="' + ROUTES.productList + '">Sản phẩm</a><span>/</span><strong>Chi tiết</strong></div>',
      '<section class="product-detail-layout">',
      '  <div class="detail-gallery">',
      '    <div class="detail-main-image"><img src="' + escapeHtml(gallery[0]) + '" alt="' + escapeHtml(product.name) + '" data-main-product-image></div>',
      '    <div class="detail-thumbs">',
      gallery.map((image, index) => '<button class="' + (index === 0 ? "active" : "") + '" type="button" data-thumb="' + escapeHtml(image) + '"><img src="' + escapeHtml(image) + '" alt="Ảnh sản phẩm ' + (index + 1) + '"></button>').join(""),
      "    </div>",
      "  </div>",
      '  <div class="detail-info">',
      '    <p class="eyebrow">' + escapeHtml(product.brand) + " / " + escapeHtml(product.scale) + "</p>",
      "    <h1>" + escapeHtml(product.name) + "</h1>",
      '    <p class="detail-price">' + formatCurrency(product.price) + "</p>",
      '    <p class="detail-description">' + escapeHtml(getProductDescription(product)) + "</p>",
      '    <div class="quantity-row">',
      '      <span>Số lượng</span>',
      '      <div class="quantity-control">',
      '        <button type="button" data-qty-minus>-</button>',
      '        <input type="number" min="1" max="20" value="1" data-quantity-input>',
      '        <button type="button" data-qty-plus>+</button>',
      "      </div>",
      "    </div>",
      '    <button class="primary-button detail-add-button" type="button" data-detail-add-cart>Thêm vào giỏ hàng</button>',
      '    <p class="form-message" data-detail-message></p>',
      '    <div class="spec-card">',
      "      <h2>Thông số kỹ thuật</h2>",
      "      <dl>",
      specs.map((item) => '<div><dt>' + escapeHtml(item.label) + '</dt><dd>' + escapeHtml(item.value) + "</dd></div>").join(""),
      "      </dl>",
      "    </div>",
      "  </div>",
      "</section>"
    ].join("");
  }

  function bindProductDetailEvents(product) {
    const mainImage = document.querySelector("[data-main-product-image]");
    const thumbs = document.querySelectorAll("[data-thumb]");
    const quantityInput = document.querySelector("[data-quantity-input]");
    const minus = document.querySelector("[data-qty-minus]");
    const plus = document.querySelector("[data-qty-plus]");
    const addButton = document.querySelector("[data-detail-add-cart]");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        if (mainImage) mainImage.src = thumb.dataset.thumb;
        thumbs.forEach((item) => item.classList.remove("active"));
        thumb.classList.add("active");
      });
    });

    if (minus && quantityInput) {
      minus.addEventListener("click", () => {
        quantityInput.value = Math.max(1, Number(quantityInput.value || 1) - 1);
      });
    }

    if (plus && quantityInput) {
      plus.addEventListener("click", () => {
        quantityInput.value = Math.min(20, Number(quantityInput.value || 1) + 1);
      });
    }

    if (addButton && quantityInput) {
      addButton.addEventListener("click", () => addToCart(product.id, Number(quantityInput.value || 1)));
    }
  }

  function addToCart(productId, quantity) {
    const message = document.querySelector("[data-detail-message]");
    const currentUser = readStorage(STORAGE_KEYS.currentUser, null);

    if (!currentUser) {
      showFormMessage(message, "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.", "error");
      return;
    }

    const cart = readStorage(STORAGE_KEYS.cart, []);
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    writeStorage(STORAGE_KEYS.cart, cart);
    showFormMessage(message, "Đã thêm sản phẩm vào giỏ hàng.", "success");
  }

  function renderRelatedProducts(product, container) {
    const related = state.products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 4);

    container.innerHTML = related.length
      ? related.map(createProductCard).join("")
      : '<div class="empty-state">Chưa có sản phẩm liên quan cùng danh mục.</div>';
  }

  function getProductGallery(product) {
    const relatedImages = state.products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .map((item) => item.image);

    return Array.from(new Set([product.image].concat(relatedImages, state.products.map((item) => item.image)))).slice(0, 4);
  }

  function getProductDescription(product) {
    return product.description || product.name + " là mẫu xe mô hình tỉ lệ " + product.scale + " thuộc dòng " + product.brand + ", phù hợp để trưng bày bàn làm việc, kệ sưu tầm hoặc làm quà tặng cho người mê xe diecast.";
  }

  function getProductSpecs(product) {
    return [
      { label: "Thương hiệu", value: product.brand },
      { label: "Danh mục", value: product.category },
      { label: "Tỉ lệ", value: product.scale },
      { label: "Chất liệu", value: "Diecast metal và nhựa ABS" },
      { label: "Tình trạng", value: "Hàng mới, nguyên hộp" },
      { label: "Đóng gói", value: "Hộp/vỉ theo tiêu chuẩn hãng" }
    ];
  }

  function setupSignUp() {
    const form = document.querySelector("[data-signup-form]");
    const message = document.querySelector("[data-signup-message]");
    if (!form || !message) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const fullName = String(formData.get("fullName") || "").trim();
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const password = String(formData.get("password") || "");
      const confirmPassword = String(formData.get("confirmPassword") || "");
      const users = readStorage(STORAGE_KEYS.users, []);
      const error = validateRegistration({ fullName, email, password, confirmPassword, users });

      if (error) {
        showFormMessage(message, error, "error");
        return;
      }

      users.push({
        id: Date.now(),
        fullName,
        email,
        password,
        createdAt: new Date().toISOString()
      });

      writeStorage(STORAGE_KEYS.users, users);
      showFormMessage(message, "Đăng ký thành công. Đang chuyển sang trang đăng nhập...", "success");
      form.reset();
      window.setTimeout(() => {
        window.location.href = ROUTES.login + "?registered=1";
      }, 900);
    });
  }

  function setupLogin() {
    const form = document.querySelector("[data-login-form]");
    const message = document.querySelector("[data-login-message]");
    const params = new URLSearchParams(window.location.search);

    if (message && params.get("registered") === "1") {
      showFormMessage(message, "Tài khoản đã được tạo. Bạn đăng nhập bằng email và mật khẩu vừa đăng ký.", "success");
    }

    if (!form || !message) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const password = String(formData.get("password") || "");
      const users = readStorage(STORAGE_KEYS.users, []);
      const user = users.find((item) => item.email === email && item.password === password);

      if (!user) {
        showFormMessage(message, "Email hoặc mật khẩu không đúng.", "error");
        return;
      }

      writeStorage(STORAGE_KEYS.currentUser, {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      });

      showFormMessage(message, "Đăng nhập thành công. Đang chuyển về trang chủ...", "success");
      window.setTimeout(() => {
        window.location.href = ROUTES.home;
      }, 800);
    });
  }

  function validateRegistration(data) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (data.fullName.length < 2) return "Vui lòng nhập họ và tên hợp lệ.";
    if (!emailPattern.test(data.email)) return "Email không hợp lệ.";
    if (data.users.some((user) => user.email === data.email)) return "Email này đã được đăng ký.";
    if (data.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (data.password !== data.confirmPassword) return "Mật khẩu nhập lại không khớp.";
    return "";
  }

  function createProductCard(product) {
    const detailUrl = ROUTES.productDetail + "?id=" + encodeURIComponent(product.id);

    return [
      '<article class="product-card">',
      '  <a class="product-media" href="' + detailUrl + '">',
      '    <img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '">',
      '    <span class="badge">' + escapeHtml(product.scale) + "</span>",
      "  </a>",
      '  <div class="product-body">',
      "    <h3>" + escapeHtml(product.name) + "</h3>",
      '    <p class="product-meta">' + escapeHtml(product.brand) + " - " + escapeHtml(product.category) + "</p>",
      '    <p class="product-price">' + formatCurrency(product.price) + "</p>",
      '    <a class="detail-button" href="' + detailUrl + '">Xem chi tiết</a>',
      "  </div>",
      "</article>"
    ].join("");
  }

  function showFormMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = "form-message " + type;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  }

  function normalizeText(value) {
    return value.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
