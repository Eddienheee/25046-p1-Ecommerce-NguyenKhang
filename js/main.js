(function () {
  const STORAGE_KEYS = {
    products: "scalegarage_products",
    version: "scalegarage_data_version"
  };
  const DATA_VERSION = "2026-06-16-164-saigontoys";

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

    if (page === "products") {
      setupCatalog();
    }
  }

  function seedStorage() {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
    if (storedVersion !== DATA_VERSION || !localStorage.getItem(STORAGE_KEYS.products)) {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(MOCK_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
    }
  }

  function readStorage(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function bindNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navLinks = document.querySelector("[data-nav-links]");
    const activePage = document.body.dataset.page;

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
      link.href = query ? "products.html?q=" + encodeURIComponent(query) : "products.html";
    });
  }

  function fillCategories(select) {
    if (!select) return;

    const categories = Array.from(new Set(state.products.map((product) => product.category)));
    select.innerHTML = '<option value="all">Tất cả danh mục</option>' + categories
      .map((category) => '<option value="' + category + '">' + category + "</option>")
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

  function createProductCard(product) {
    return [
      '<article class="product-card">',
      '  <div class="product-media">',
      '    <img src="' + product.image + '" alt="' + product.name + '">',
      '    <span class="badge">' + product.scale + "</span>",
      "  </div>",
      '  <div class="product-body">',
      "    <h3>" + product.name + "</h3>",
      '    <p class="product-meta">' + product.brand + " - " + product.category + "</p>",
      '    <p class="product-price">' + formatCurrency(product.price) + "</p>",
      "  </div>",
      "</article>"
    ].join("");
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
})();
