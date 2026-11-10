/* =========================================================
   ZENORA – About Page Scripts (about.js)
   Self-contained: shared header/footer behaviour + About-only
   animations. Does not depend on script.js.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Saved theme + direction (same keys as home page) ---------- */
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

  /* ---------- Scroll-driven effects (one rAF loop) ---------- */
  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  const parallaxEls = [...document.querySelectorAll(".ab-parallax")];
  const timeline = document.getElementById("abTimeline");
  const tlFill = document.getElementById("abTlFill");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 40);
    toTop?.classList.toggle("show", y > 600);

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        // image is 118% tall; shift it between about -14% and -1% as the frame crosses the screen
        const r = el.parentElement.getBoundingClientRect();
        const p = Math.min(Math.max((r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight, -1), 1);
        const speed = parseFloat(el.dataset.speed || "0.08");
        el.style.transform = `translateY(${(-7.5 + p * speed * 80).toFixed(2)}%)`;
      });
    }

    if (timeline && tlFill) {
      const r = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.65;
      const progress = Math.min(Math.max((start - r.top) / r.height, 0), 1);
      tlFill.style.height = `${(progress * 100).toFixed(1)}%`;
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Reveal on scroll (staggered) ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const group = [...el.parentElement.children].filter((c) => c.classList.contains("ab-reveal"));
      el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.12}s`;
      el.classList.add("ab-in");
      revealObs.unobserve(el);
      // clear the delay afterwards so hover transitions stay snappy
      setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".ab-reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Counters ---------- */
  const animateCount = (el, target, duration = 1800) => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, +entry.target.dataset.target);
      countObs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".ab-count").forEach((c) => countObs.observe(c));

  /* ---------- Progress rings ---------- */
  const CIRC = 2 * Math.PI * 52;
  const ringObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const ring = entry.target;
      const value = +ring.dataset.value;
      ring.querySelector(".ab-ring-val").style.strokeDashoffset = (CIRC * (1 - value / 100)).toFixed(2);
      animateCount(ring.querySelector(".ab-ring-num b"), value, 2000);
      ringObs.unobserve(ring);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".ab-ring").forEach((r) => ringObs.observe(r));

  /* ---------- Hero collage: 3D mouse parallax ---------- */
  const visual = document.getElementById("abHeroVisual");
  const collage = document.getElementById("abCollage");
  if (canHover && !reduceMotion && visual && collage) {
    visual.addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      collage.style.transform = `rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 12).toFixed(2)}deg)`;
    });
    visual.addEventListener("mouseleave", () => { collage.style.transform = ""; });
  }

  /* ---------- Team cards: 3D tilt ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".ab-member").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (!card.classList.contains("ab-in")) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = "transform .12s linear, box-shadow .5s ease, border-color .5s";
        card.style.transform = `perspective(900px) rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .6s ease, box-shadow .5s ease, border-color .5s";
        card.style.transform = "";
      });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});