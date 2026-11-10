/* =========================================================
   ZENORA – Products Page Scripts (products.js)
   Self-contained: shared header/footer behaviour + Products
   features (search, filters, sort, wishlist, cart toast,
   countdown, reveals). Does not depend on script.js.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Saved theme + direction (same keys as the other pages) ---------- */
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };
  const savedTheme = store.get("careplus-theme");
  const savedDir = store.get("zenora-dir");
  if (savedTheme === "light" || savedTheme === "dark") html.setAttribute("data-theme", savedTheme);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) html.setAttribute("data-theme", "dark");
  if (savedDir) html.setAttribute("dir", savedDir);

  /* ---------- Header controls ---------- */
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    store.set("careplus-theme", next);
  });
  document.getElementById("rtlToggle")?.addEventListener("click", () => {
    const next = html.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    html.setAttribute("dir", next);
    store.set("zenora-dir", next);
    requestAnimationFrame(moveInk);
  });

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const closeMenu = () => {
    mainNav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle?.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", open);
  });
  mainNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  document.querySelectorAll(".has-dropdown").forEach((item) => {
    const btn = item.querySelector(".dropdown-toggle");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("click", () =>
    document.querySelectorAll(".has-dropdown.open").forEach((i) => {
      i.classList.remove("open");
      i.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
    })
  );

  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 40);
    toTop?.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Hero: rotating highlighted word ---------- */
  const swap = document.getElementById("phSwap");
  const words = ["health", "family", "skin", "heart", "home"];
  let wi = 0;
  if (swap && !reduceMotion) {
    setInterval(() => {
      swap.classList.add("is-out");
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        swap.textContent = words[wi];
        swap.classList.remove("is-out");
        swap.classList.add("is-in");
        void swap.offsetWidth;          // restart transition
        swap.classList.remove("is-in");
      }, 450);
    }, 2600);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const group = [...el.parentElement.children].filter((c) => c.classList.contains("ph-reveal"));
      el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.12}s`;
      el.classList.add("ph-in");
      revealObs.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".ph-reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Product filtering, search and sorting ---------- */
  const grid = document.getElementById("phGrid");
  const cards = [...grid.querySelectorAll(".ph-card")];
  const filterBtns = [...document.querySelectorAll(".ph-filter")];
  const ink = document.getElementById("phInk");
  const result = document.getElementById("phResult");
  const empty = document.getElementById("phEmpty");
  const sortSel = document.getElementById("phSort");
  const searchForm = document.getElementById("phSearch");
  const searchInput = document.getElementById("phSearchInput");
  let activeFilter = "all";
  let query = "";

  function moveInk() {
    const active = document.querySelector(".ph-filter.is-active");
    if (!active || !ink) return;
    ink.style.left = `${active.offsetLeft}px`;
    ink.style.top = `${active.offsetTop}px`;
    ink.style.width = `${active.offsetWidth}px`;
    ink.style.height = `${active.offsetHeight}px`;
  }

  function apply() {
    let shown = 0;
    cards.forEach((card) => {
      const okCat = activeFilter === "all" || card.dataset.cat === activeFilter;
      const okQuery = !query || card.dataset.name.includes(query) || card.querySelector("h3").textContent.toLowerCase().includes(query);
      const visible = okCat && okQuery;
      if (visible) {
        if (card.classList.contains("ph-out")) {
          card.classList.remove("ph-out");
          card.style.animation = "none";
          void card.offsetWidth;            // replay the pop-in animation
          card.style.animation = "";
        }
        shown++;
      } else {
        card.classList.add("ph-out");
      }
    });
    result.textContent = `Showing ${shown} product${shown === 1 ? "" : "s"}${query ? ` for "${query}"` : ""}`;
    empty.hidden = shown !== 0;
  }

  function setFilter(value) {
    activeFilter = value;
    filterBtns.forEach((b) => {
      const on = b.dataset.filter === value;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
    });
    moveInk();
    apply();
  }

  filterBtns.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  window.addEventListener("resize", moveInk);
  moveInk();

  sortSel.addEventListener("change", () => {
    const mode = sortSel.value;
    const sorted = [...cards].sort((a, b) => {
      if (mode === "low") return a.dataset.price - b.dataset.price;
      if (mode === "high") return b.dataset.price - a.dataset.price;
      if (mode === "rating") return b.dataset.rating - a.dataset.rating;
      return a.dataset.pop - b.dataset.pop;
    });
    sorted.forEach((c) => {
      grid.appendChild(c);
      c.style.animation = "none";
      void c.offsetWidth;
      c.style.animation = "";
    });
  });

  const goToShop = () => document.getElementById("ph-shop").scrollIntoView({ behavior: "smooth" });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    query = searchInput.value.trim().toLowerCase();
    setFilter("all");
    goToShop();
  });
  searchInput.addEventListener("search", () => { if (!searchInput.value) { query = ""; apply(); } });

  document.querySelectorAll(".ph-quick-chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      searchInput.value = chip.textContent;
      query = chip.dataset.q;
      setFilter("all");
      goToShop();
    })
  );

  document.getElementById("phReset").addEventListener("click", () => {
    query = ""; searchInput.value = ""; setFilter("all");
  });

  // Category tiles jump to the shop with that filter applied
  document.querySelectorAll(".ph-cat").forEach((cat) =>
    cat.addEventListener("click", () => {
      query = ""; searchInput.value = "";
      setFilter(cat.dataset.filter);
      goToShop();
    })
  );

  /* ---------- Wishlist toggle ---------- */
  document.querySelectorAll(".ph-wish").forEach((btn) =>
    btn.addEventListener("click", () => {
      const on = btn.classList.toggle("is-on");
      btn.setAttribute("aria-pressed", on);
      showToast(on ? "Saved to wishlist" : "Removed from wishlist");
    })
  );

  /* ---------- Add to cart + toast ---------- */
  const toast = document.getElementById("phToast");
  const toastText = document.getElementById("phToastText");
  let toastTimer;
  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }
  document.querySelectorAll(".ph-add, .ph-add-text").forEach((btn) =>
    btn.addEventListener("click", () => {
      btn.classList.remove("is-added");
      void btn.offsetWidth;
      btn.classList.add("is-added");
      showToast(`${btn.dataset.name} added to cart`);
    })
  );

  /* ---------- Deal countdown (resets at midnight) ---------- */
  const hEl = document.getElementById("phH");
  const mEl = document.getElementById("phM");
  const sEl = document.getElementById("phS");
  const setDigit = (el, val) => {
    const v = String(val).padStart(2, "0");
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove("flip");
    void el.offsetWidth;
    el.classList.add("flip");
  };
  const tick = () => {
    const now = new Date();
    const end = new Date(now); end.setHours(24, 0, 0, 0);
    let diff = Math.max(0, Math.floor((end - now) / 1000));
    setDigit(hEl, Math.floor(diff / 3600)); diff %= 3600;
    setDigit(mEl, Math.floor(diff / 60));
    setDigit(sEl, diff % 60);
  };
  tick();
  setInterval(tick, 1000);

  /* ---------- Stock bar fills when visible ---------- */
  const fill = document.querySelector(".ph-stock-fill");
  if (fill) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { fill.style.width = `${fill.dataset.fill}%`; obs.disconnect(); }
    }, { threshold: 0.6 }).observe(fill);
  }

  /* ---------- 3D tilt on category tiles ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".ph-cat").forEach((tile) => {
      tile.addEventListener("mousemove", (e) => {
        if (!tile.classList.contains("ph-in")) return;
        const r = tile.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tile.style.transition = "transform .12s linear, box-shadow .5s ease";
        tile.style.transform = `perspective(1000px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px)`;
      });
      tile.addEventListener("mouseleave", () => {
        tile.style.transition = "transform .6s ease, box-shadow .5s ease";
        tile.style.transform = "";
      });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});