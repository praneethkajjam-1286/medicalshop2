/* =========================================================
   ZENORA – Services Page Scripts (service.js)
   Self-contained: shared header/footer behaviour (same
   localStorage keys as Home 1: "careplus-theme", "zenora-dir")
   + Services features: scroll reveal, smooth in-page scroll,
   "View Service" navigation, accessible FAQ accordion and
   gallery lightbox. Does not depend on script.js.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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


  /* ---------- Scroll reveal (staggered per group) ---------- */
  const reveals = document.querySelectorAll(".sv-reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("sv-in"));
  } else {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const group = [...el.parentElement.children].filter((c) => c.classList.contains("sv-reveal"));
        el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.08}s`;
        el.classList.add("sv-in");
        revealObs.unobserve(el);
        setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => revealObs.observe(el));
  }

  /* ---------- Smooth scroll for in-page links (respects reduced motion) ---------- */
  document.querySelectorAll('.sv-page a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- "View Service" buttons ---------- */
  // Every button links to the one reusable details page with ?service=<id>.
  // The file name contains a space, so the URL is built with the URL API,
  // which encodes it as %20. The href is a working fallback without JS.
  const SERVICE_IDS = ["prescription-medicines", "otc-medicines", "vitamins-supplements", "personal-care", "medical-devices", "health-consultation"];
  const detailUrl = (id) => {
    const url = new URL("servicedetail.html", window.location.href);
    url.searchParams.set("service", id);
    return url.href;
  };
  document.querySelectorAll(".sv-view").forEach((btn) => {
    const id = btn.dataset.service;
    if (!SERVICE_IDS.includes(id)) return;
    btn.href = detailUrl(id);
    btn.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return; // let new-tab clicks work normally
      e.preventDefault();
      window.location.href = detailUrl(id);
    });
  });

  /* ---------- FAQ accordion (one open at a time, keyboard accessible) ---------- */
  const accButtons = [...document.querySelectorAll(".sv-acc-btn")];
  const setOpen = (btn, open) => {
    const item = btn.closest(".sv-acc-item");
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));
    item.classList.toggle("is-open", open);
    if (open) {
      panel.hidden = false;
    } else if (reduceMotion) {
      panel.hidden = true;
    } else {
      setTimeout(() => { if (btn.getAttribute("aria-expanded") === "false") panel.hidden = true; }, 450);
    }
  };
  accButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      accButtons.forEach((b) => { if (b !== btn && b.getAttribute("aria-expanded") === "true") setOpen(b, false); });
      if (willOpen) {
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        panel.hidden = false;
        requestAnimationFrame(() => setOpen(btn, true));
      } else {
        setOpen(btn, false);
      }
    });
    btn.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowDown") next = accButtons[(i + 1) % accButtons.length];
      else if (e.key === "ArrowUp") next = accButtons[(i - 1 + accButtons.length) % accButtons.length];
      else if (e.key === "Home") next = accButtons[0];
      else if (e.key === "End") next = accButtons[accButtons.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });
  if (accButtons[0]) { document.getElementById(accButtons[0].getAttribute("aria-controls")).hidden = false; setOpen(accButtons[0], true); }

  /* ---------- Gallery lightbox ---------- */
  const tiles = [...document.querySelectorAll(".sv-tile")];
  const lb = document.getElementById("svLightbox");
  const lbImg = document.getElementById("svLbImg");
  const lbCap = document.getElementById("svLbCap");
  const lbCount = document.getElementById("svLbCount");
  let lbIndex = 0;
  let lastFocus = null;

  const showSlide = (i) => {
    lbIndex = (i + tiles.length) % tiles.length;
    const tile = tiles[lbIndex];
    const img = tile.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = `${tile.querySelector(".sv-tile-cap strong").textContent} – ${tile.querySelector(".sv-tile-cap small").textContent}`;
    lbCount.textContent = `${lbIndex + 1} / ${tiles.length}`;
  };
  const openLb = (i) => {
    lastFocus = document.activeElement;
    showSlide(i);
    lb.hidden = false;
    document.body.classList.add("sv-lock");
    lb.querySelector(".sv-lb-close").focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.classList.remove("sv-lock");
    lastFocus?.focus();
  };
  tiles.forEach((tile, i) => tile.addEventListener("click", () => openLb(i)));
  lb?.querySelectorAll("[data-lb-close]").forEach((el) => el.addEventListener("click", closeLb));
  // "Previous"/"Next" follow reading direction, so in RTL the visual arrows still match.
  document.getElementById("svLbPrev")?.addEventListener("click", () => showSlide(lbIndex - 1));
  document.getElementById("svLbNext")?.addEventListener("click", () => showSlide(lbIndex + 1));
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    const rtl = html.getAttribute("dir") === "rtl";
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowRight") showSlide(lbIndex + (rtl ? -1 : 1));
    else if (e.key === "ArrowLeft") showSlide(lbIndex + (rtl ? 1 : -1));
    else if (e.key === "Tab") {
      // keep focus inside the dialog
      const focusables = [...lb.querySelectorAll("button")];
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let touchX = null;
  lb?.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb?.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const rtl = html.getAttribute("dir") === "rtl";
    if (Math.abs(dx) > 50) showSlide(lbIndex + ((dx < 0) !== rtl ? 1 : -1));
    touchX = null;
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});