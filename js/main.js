(function () {
  const STORAGE_KEYS = {
    products: "xemohinhtinh_products",
    users: "xemohinhtinh_users",
    currentUser: "xemohinhtinh_current_user",
    cart: "xemohinhtinh_cart",
    orders: "xemohinhtinh_orders",
    lastOrder: "xemohinhtinh_last_order",
    version: "xemohinhtinh_data_version"
  };
  const DATA_VERSION = "2026-06-23-flat-html-css-js";

  const ROUTES = {
    home: "../home/index.html",
    productList: "../product-list/index.html",
    productDetail: "../product-detail/index.html",
    signUp: "../sign-up/index.html",
    login: "../login/index.html",
    cart: "../cart/index.html",
    checkout: "../checkout/index.html",
    orderConfirmation: "../order-confirmation/index.html",
    myAccount: "../my-account/index.html"
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

    if (page === "cart") {
      setupCart();
    }

    if (page === "checkout") {
      setupCheckout();
    }

    if (page === "order-confirmation") {
      setupOrderConfirmation();
    }

    if (page === "my-account") {
      setupMyAccount();
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

    if (!localStorage.getItem(STORAGE_KEYS.orders)) {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify([]));
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
    let activePage = page;
    const currentUser = readStorage(STORAGE_KEYS.currentUser, null);

    if (page === "product-detail") {
      activePage = "product-list";
    }

    if (page === "checkout" || page === "order-confirmation") {
      activePage = "cart";
    }

    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === activePage) {
        link.classList.add("active");
      }
    });

    updateAuthNavigation(currentUser);

    if (toggle && navLinks) {
      toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    }
  }

  function updateAuthNavigation(currentUser) {
    document.body.classList.toggle("is-logged-in", Boolean(currentUser));
    renderCartCount(currentUser);

    document.querySelectorAll("[data-user-name]").forEach((nameElement) => {
      if (!currentUser) return;
      nameElement.textContent = currentUser.fullName;
    });

    document.querySelectorAll("[data-user-email]").forEach((emailElement) => {
      if (!currentUser) return;
      emailElement.textContent = currentUser.email;
    });

    document.querySelectorAll("[data-user-menu]").forEach((menu) => {
      const toggle = menu.querySelector("[data-user-menu-toggle]");
      if (!toggle) return;

      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    });

    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEYS.currentUser);
        document.body.classList.remove("is-logged-in");
        window.location.href = ROUTES.home;
      });
    });

    document.addEventListener("click", closeUserMenus);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeUserMenus();
    });
  }

  function closeUserMenus() {
    document.querySelectorAll("[data-user-menu]").forEach((menu) => {
      menu.classList.remove("open");
      const toggle = menu.querySelector("[data-user-menu-toggle]");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
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
    const existing = cart.find((item) => {
      const belongsToUser = String(item.userId || currentUser.id) === String(currentUser.id);
      return belongsToUser && Number(item.productId) === Number(productId);
    });

    if (existing) {
      existing.quantity = Math.min(20, Number(existing.quantity || 1) + clampQuantity(quantity));
      existing.userId = currentUser.id;
    } else {
      cart.push({ productId, quantity: clampQuantity(quantity), userId: currentUser.id });
    }

    writeStorage(STORAGE_KEYS.cart, cart);
    renderCartCount(currentUser);
    showFormMessage(message, "Đã thêm sản phẩm vào giỏ hàng.", "success");
  }

  function setupCart() {
    const currentUser = requireLogin("cart");
    const cartPage = document.querySelector("[data-cart-page]");
    if (!currentUser || !cartPage) return;

    renderCartPage(currentUser);
  }

  function renderCartPage(currentUser) {
    const cartList = document.querySelector("[data-cart-list]");
    const subtotalElement = document.querySelector("[data-cart-subtotal]");
    const totalElement = document.querySelector("[data-cart-total]");
    const checkoutLink = document.querySelector("[data-checkout-link]");
    if (!cartList || !subtotalElement || !totalElement || !checkoutLink) return;

    const lines = getCartLines(currentUser);
    const total = calculateTotal(lines);

    if (!lines.length) {
      cartList.innerHTML = [
        '<div class="empty-state">',
        "  <strong>Giỏ hàng đang trống.</strong>",
        "  <p>Chọn thêm vài mẫu xe mô hình 1:64 trước khi thanh toán nha.</p>",
        '  <a class="primary-button" href="' + ROUTES.productList + '">Xem sản phẩm</a>',
        "</div>"
      ].join("");
      checkoutLink.classList.add("disabled");
      checkoutLink.setAttribute("aria-disabled", "true");
    } else {
      cartList.innerHTML = lines.map(createCartItem).join("");
      checkoutLink.classList.remove("disabled");
      checkoutLink.removeAttribute("aria-disabled");
      bindCartItemEvents(currentUser);
    }

    subtotalElement.textContent = formatCurrency(total);
    totalElement.textContent = formatCurrency(total);
    renderCartCount(currentUser);
  }

  function createCartItem(line) {
    const detailUrl = ROUTES.productDetail + "?id=" + encodeURIComponent(line.product.id);

    return [
      '<article class="cart-item" data-cart-product="' + line.product.id + '">',
      '  <a class="cart-thumb" href="' + detailUrl + '"><img src="' + escapeHtml(line.product.image) + '" alt="' + escapeHtml(line.product.name) + '"></a>',
      '  <div class="cart-info">',
      '    <h3><a href="' + detailUrl + '">' + escapeHtml(line.product.name) + "</a></h3>",
      '    <p>' + escapeHtml(line.product.brand) + " - " + escapeHtml(line.product.scale) + "</p>",
      '    <button class="remove-button" type="button" data-remove-cart>Xóa sản phẩm</button>',
      "  </div>",
      '  <p class="cart-unit">' + formatCurrency(line.product.price) + "</p>",
      '  <div class="quantity-control cart-quantity">',
      '    <button type="button" data-cart-minus>-</button>',
      '    <input type="number" min="1" max="20" value="' + line.quantity + '" data-cart-quantity>',
      '    <button type="button" data-cart-plus>+</button>',
      "  </div>",
      '  <p class="cart-line-total">' + formatCurrency(line.lineTotal) + "</p>",
      "</article>"
    ].join("");
  }

  function bindCartItemEvents(currentUser) {
    document.querySelectorAll("[data-cart-product]").forEach((item) => {
      const productId = Number(item.dataset.cartProduct);
      const quantityInput = item.querySelector("[data-cart-quantity]");
      const minus = item.querySelector("[data-cart-minus]");
      const plus = item.querySelector("[data-cart-plus]");
      const remove = item.querySelector("[data-remove-cart]");

      if (minus && quantityInput) {
        minus.addEventListener("click", () => {
          updateCartQuantity(currentUser, productId, Number(quantityInput.value || 1) - 1);
        });
      }

      if (plus && quantityInput) {
        plus.addEventListener("click", () => {
          updateCartQuantity(currentUser, productId, Number(quantityInput.value || 1) + 1);
        });
      }

      if (quantityInput) {
        quantityInput.addEventListener("change", () => {
          updateCartQuantity(currentUser, productId, Number(quantityInput.value || 1));
        });
      }

      if (remove) {
        remove.addEventListener("click", () => {
          removeCartItem(currentUser, productId);
        });
      }
    });
  }

  function updateCartQuantity(currentUser, productId, nextQuantity) {
    const quantity = clampQuantity(nextQuantity);
    const cart = getCurrentUserCart(currentUser).map((item) => {
      if (Number(item.productId) !== Number(productId)) return item;
      return { productId: Number(item.productId), quantity, userId: currentUser.id };
    });

    saveCurrentUserCart(currentUser, cart);
    renderCartPage(currentUser);
  }

  function removeCartItem(currentUser, productId) {
    const cart = getCurrentUserCart(currentUser)
      .filter((item) => Number(item.productId) !== Number(productId));

    saveCurrentUserCart(currentUser, cart);
    renderCartPage(currentUser);
  }

  function setupCheckout() {
    const currentUser = requireLogin("checkout");
    const checkoutPage = document.querySelector("[data-checkout-page]");
    if (!currentUser || !checkoutPage) return;

    const lines = getCartLines(currentUser);
    if (!lines.length) {
      checkoutPage.innerHTML = [
        '<div class="empty-state">',
        "  <strong>Chưa có sản phẩm để thanh toán.</strong>",
        "  <p>Giỏ hàng của bạn đang trống, hãy chọn sản phẩm trước khi qua bước thanh toán.</p>",
        '  <a class="primary-button" href="' + ROUTES.productList + '">Xem sản phẩm</a>',
        "</div>"
      ].join("");
      return;
    }

    renderCheckoutSummary(lines);
    bindCheckoutForm(currentUser, lines);
  }

  function renderCheckoutSummary(lines) {
    const itemsContainer = document.querySelector("[data-checkout-items]");
    const totalElement = document.querySelector("[data-checkout-total]");
    const subtotalElement = document.querySelector("[data-checkout-subtotal]");
    if (!itemsContainer || !totalElement || !subtotalElement) return;

    const total = calculateTotal(lines);
    itemsContainer.innerHTML = lines.map((line) => [
      '<article class="mini-order-item">',
      '  <img src="' + escapeHtml(line.product.image) + '" alt="' + escapeHtml(line.product.name) + '">',
      "  <div>",
      "    <h3>" + escapeHtml(line.product.name) + "</h3>",
      "    <p>" + line.quantity + " x " + formatCurrency(line.product.price) + "</p>",
      "  </div>",
      '  <strong>' + formatCurrency(line.lineTotal) + "</strong>",
      "</article>"
    ].join("")).join("");

    subtotalElement.textContent = formatCurrency(total);
    totalElement.textContent = formatCurrency(total);
  }

  function bindCheckoutForm(currentUser, lines) {
    const form = document.querySelector("[data-checkout-form]");
    const message = document.querySelector("[data-checkout-message]");
    const fullNameInput = document.querySelector("[data-checkout-name]");
    if (!form || !message) return;

    if (fullNameInput && currentUser.fullName) {
      fullNameInput.value = currentUser.fullName;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const fullName = String(formData.get("fullName") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const address = String(formData.get("address") || "").trim();
      const error = validateCheckout({ fullName, phone, address });

      if (error) {
        showFormMessage(message, error, "error");
        return;
      }

      const order = createOrder(currentUser, lines, { fullName, phone, address });
      const orders = readStorage(STORAGE_KEYS.orders, []);
      orders.push(order);
      writeStorage(STORAGE_KEYS.orders, orders);
      writeStorage(STORAGE_KEYS.lastOrder, order.id);
      saveCurrentUserCart(currentUser, []);

      showFormMessage(message, "Đã ghi nhận đơn hàng. Đang chuyển đến màn hình xác nhận...", "success");
      window.setTimeout(() => {
        window.location.href = ROUTES.orderConfirmation + "?order=" + encodeURIComponent(order.id);
      }, 800);
    });
  }

  function validateCheckout(data) {
    const phonePattern = /^[0-9]{9,11}$/;

    if (data.fullName.length < 2) return "Vui lòng nhập họ tên người nhận.";
    if (!phonePattern.test(data.phone)) return "Số điện thoại chỉ gồm 9 đến 11 chữ số.";
    if (data.address.length < 8) return "Vui lòng nhập địa chỉ giao hàng rõ hơn.";
    return "";
  }

  function createOrder(currentUser, lines, shippingInfo) {
    const orderId = "XM" + Date.now();

    return {
      id: orderId,
      userId: currentUser.id,
      customer: shippingInfo,
      items: lines.map((line) => ({
        productId: line.product.id,
        name: line.product.name,
        image: line.product.image,
        price: line.product.price,
        quantity: line.quantity,
        lineTotal: line.lineTotal
      })),
      total: calculateTotal(lines),
      status: "Đã ghi nhận",
      createdAt: new Date().toISOString()
    };
  }

  function setupOrderConfirmation() {
    const currentUser = requireLogin("orderConfirmation");
    const confirmationPage = document.querySelector("[data-order-confirmation-page]");
    if (!currentUser || !confirmationPage) return;

    const params = new URLSearchParams(window.location.search);
    renderOrderConfirmation(confirmationPage, currentUser, params.get("order"));
  }

  function renderOrderConfirmation(container, currentUser, orderId) {
    const orders = getUserOrders(currentUser);
    const fallbackId = readStorage(STORAGE_KEYS.lastOrder, "");
    const order = orders.find((item) => item.id === orderId) || orders.find((item) => item.id === fallbackId);

    if (!order) {
      container.innerHTML = [
        '<div class="empty-state">',
        "  <strong>Không tìm thấy đơn hàng cần xem.</strong>",
        "  <p>Đơn hàng có thể không thuộc tài khoản hiện tại hoặc đã bị xóa khỏi localStorage.</p>",
        '  <a class="primary-button" href="' + ROUTES.productList + '">Tiếp tục mua hàng</a>',
        "</div>"
      ].join("");
      return;
    }

    document.title = "Xác nhận đơn hàng - xemohinhtinh";
    container.innerHTML = [
      '<section class="order-success-card">',
      '  <div class="success-mark">✓</div>',
      "  <p class=\"eyebrow\">Xác nhận đơn hàng</p>",
      "  <h1>Đặt hàng thành công</h1>",
      "  <p>Đơn hàng " + escapeHtml(order.id) + " đã được ghi nhận vào tài khoản của bạn.</p>",
      '  <div class="order-info-grid">',
      '    <div><span>Mã đơn hàng</span><strong>' + escapeHtml(order.id) + "</strong></div>",
      '    <div><span>Ngày đặt</span><strong>' + escapeHtml(formatDate(order.createdAt)) + "</strong></div>",
      '    <div><span>Người nhận</span><strong>' + escapeHtml(order.customer.fullName) + "</strong></div>",
      '    <div><span>Số điện thoại</span><strong>' + escapeHtml(order.customer.phone) + "</strong></div>",
      '    <div><span>Địa chỉ</span><strong>' + escapeHtml(order.customer.address) + "</strong></div>",
      '    <div><span>Trạng thái</span><strong>' + escapeHtml(order.status) + "</strong></div>",
      '    <div><span>Tổng tiền</span><strong>' + formatCurrency(order.total) + "</strong></div>",
      "  </div>",
      '  <div class="success-actions">',
      '    <a class="primary-button" href="' + ROUTES.productList + '">Tiếp tục mua hàng</a>',
      '    <a class="secondary-button light" href="' + ROUTES.myAccount + '">Xem lịch sử đơn hàng</a>',
      "  </div>",
      "</section>",
      '<aside class="summary-card">',
      "  <h2>Sản phẩm đã đặt</h2>",
      '  <div class="mini-order-list">',
      order.items.map((item) => [
        '<article class="mini-order-item">',
        '  <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">',
        "  <div>",
        "    <h3>" + escapeHtml(item.name) + "</h3>",
        "    <p>" + item.quantity + " x " + formatCurrency(item.price) + "</p>",
        "  </div>",
        "  <strong>" + formatCurrency(item.lineTotal) + "</strong>",
        "</article>"
      ].join("")).join(""),
      "  </div>",
      "</aside>"
    ].join("");
  }

  function setupMyAccount() {
    const currentUser = requireLogin("myAccount");
    const accountPage = document.querySelector("[data-my-account-page]");
    if (!currentUser || !accountPage) return;

    renderMyAccount(accountPage, currentUser);
  }

  function renderMyAccount(container, currentUser) {
    const orders = getUserOrders(currentUser);
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    container.innerHTML = [
      '<aside class="account-profile-card">',
      '  <div class="account-avatar">XM</div>',
      '  <p class="eyebrow">Thông tin cá nhân</p>',
      "  <h2>" + escapeHtml(currentUser.fullName) + "</h2>",
      '  <dl class="account-detail-list">',
      '    <div><dt>Email</dt><dd>' + escapeHtml(currentUser.email) + "</dd></div>",
      '    <div><dt>Mã tài khoản</dt><dd>#' + escapeHtml(currentUser.id) + "</dd></div>",
      '    <div><dt>Số đơn hàng</dt><dd>' + orders.length + " đơn</dd></div>",
      '    <div><dt>Tổng đã đặt</dt><dd>' + formatCurrency(totalSpent) + "</dd></div>",
      "  </dl>",
      '  <a class="primary-button full" href="' + ROUTES.productList + '">Tiếp tục mua sắm</a>',
      "</aside>",
      '<section class="orders-panel">',
      '  <div class="panel-heading">',
      "    <div>",
      '      <p class="eyebrow">Lịch sử đặt hàng</p>',
      "      <h2>Đơn hàng của bạn</h2>",
      "    </div>",
      "  </div>",
      '  <div class="order-history-list">',
      orders.length ? orders.map(createOrderHistoryCard).join("") : [
        '<div class="empty-state">',
        "  <strong>Bạn chưa có đơn hàng nào.</strong>",
        "  <p>Các đơn hàng sau khi thanh toán sẽ xuất hiện tại đây.</p>",
        '  <a class="primary-button" href="' + ROUTES.productList + '">Xem sản phẩm</a>',
        "</div>"
      ].join(""),
      "  </div>",
      "</section>"
    ].join("");
  }

  function createOrderHistoryCard(order) {
    return [
      '<article class="history-order-card">',
      '  <div class="history-order-header">',
      "    <div>",
      "      <h3>" + escapeHtml(order.id) + "</h3>",
      '      <p>Ngày đặt: ' + escapeHtml(formatDate(order.createdAt)) + "</p>",
      "    </div>",
      '    <span class="order-status">' + escapeHtml(order.status) + "</span>",
      "  </div>",
      '  <div class="history-order-meta">',
      "    <div><span>Người nhận</span><strong>" + escapeHtml(order.customer.fullName) + "</strong></div>",
      "    <div><span>Số điện thoại</span><strong>" + escapeHtml(order.customer.phone) + "</strong></div>",
      "    <div><span>Tổng tiền</span><strong>" + formatCurrency(order.total) + "</strong></div>",
      "  </div>",
      '  <div class="history-order-items">',
      order.items.map((item) => [
        '<div class="history-order-item">',
        '  <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">',
        "  <div>",
        "    <strong>" + escapeHtml(item.name) + "</strong>",
        "    <span>" + item.quantity + " x " + formatCurrency(item.price) + "</span>",
        "  </div>",
        "</div>"
      ].join("")).join(""),
      "  </div>",
      '  <a class="detail-button compact" href="' + ROUTES.orderConfirmation + "?order=" + encodeURIComponent(order.id) + '">Xem chi tiết</a>',
      "</article>"
    ].join("");
  }

  function getUserOrders(currentUser) {
    return readStorage(STORAGE_KEYS.orders, [])
      .filter((order) => String(order.userId) === String(currentUser.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function requireLogin(redirectPage) {
    const currentUser = readStorage(STORAGE_KEYS.currentUser, null);

    if (!currentUser) {
      window.location.href = ROUTES.login + "?redirect=" + encodeURIComponent(redirectPage);
      return null;
    }

    return currentUser;
  }

  function getCurrentUserCart(currentUser) {
    if (!currentUser) return [];

    return readStorage(STORAGE_KEYS.cart, [])
      .filter((item) => String(item.userId || currentUser.id) === String(currentUser.id))
      .map((item) => ({
        productId: Number(item.productId),
        quantity: clampQuantity(item.quantity),
        userId: currentUser.id
      }));
  }

  function saveCurrentUserCart(currentUser, nextCart) {
    const allCartItems = readStorage(STORAGE_KEYS.cart, []);
    const otherUsersCart = allCartItems.filter((item) => item.userId && String(item.userId) !== String(currentUser.id));
    const normalizedCart = nextCart.map((item) => ({
      productId: Number(item.productId),
      quantity: clampQuantity(item.quantity),
      userId: currentUser.id
    }));

    writeStorage(STORAGE_KEYS.cart, otherUsersCart.concat(normalizedCart));
    renderCartCount(currentUser);
  }

  function getCartLines(currentUser) {
    return getCurrentUserCart(currentUser)
      .map((item) => {
        const product = state.products.find((productItem) => Number(productItem.id) === Number(item.productId));
        if (!product) return null;
        return {
          product,
          quantity: clampQuantity(item.quantity),
          lineTotal: product.price * clampQuantity(item.quantity)
        };
      })
      .filter(Boolean);
  }

  function calculateTotal(lines) {
    return lines.reduce((sum, line) => sum + line.lineTotal, 0);
  }

  function renderCartCount(currentUser) {
    const count = currentUser
      ? getCurrentUserCart(currentUser).reduce((sum, item) => sum + clampQuantity(item.quantity), 0)
      : 0;

    document.querySelectorAll("[data-cart-count]").forEach((element) => {
      element.textContent = String(count);
      element.hidden = count === 0;
    });
  }

  function clampQuantity(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 1;
    return Math.min(20, Math.max(1, Math.floor(number)));
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

      const redirectRoute = getRedirectRoute(params.get("redirect"));
      showFormMessage(message, redirectRoute ? "Đăng nhập thành công. Đang chuyển đến trang cần truy cập..." : "Đăng nhập thành công. Đang chuyển về trang chủ...", "success");
      window.setTimeout(() => {
        window.location.href = redirectRoute || ROUTES.home;
      }, 800);
    });
  }

  function getRedirectRoute(routeName) {
    const routes = {
      cart: ROUTES.cart,
      checkout: ROUTES.checkout,
      orderConfirmation: ROUTES.orderConfirmation,
      myAccount: ROUTES.myAccount,
      home: ROUTES.home,
      productList: ROUTES.productList
    };

    return routes[routeName] || "";
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

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa có ngày";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
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
