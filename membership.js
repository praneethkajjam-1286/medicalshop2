/* =========================================================
   ZENORA – Membership Page Scripts (membership.js)
   Self-contained: shared header/footer behaviour + Membership
   features (3D card deck, billing toggle, stories stack,
   FAQ accordion, reveals). Does not depend on script.js.
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

  /* ---------- Scroll: header, back-to-top, banner parallax ---------- */
  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  const parallax = document.querySelector(".mb-parallax");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 40);
    toTop?.classList.toggle("show", y > 600);
    if (parallax && !reduceMotion) {
      const r = parallax.parentElement.getBoundingClientRect();
      const p = Math.min(Math.max((r.top + r.height / 2 - innerHeight / 2) / innerHeight, -1), 1);
      parallax.style.transform = `translateY(${(p * 9).toFixed(2)}%)`;
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const group = [...el.parentElement.children].filter((c) => c.classList.contains("mb-reveal"));
      el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.1}s`;
      el.classList.add("mb-in");
      revealObs.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".mb-reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Counters ---------- */
  const countUp = (el, target, duration = 1800) => {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => countUp(e.target, +e.target.dataset.target), 1200);
      countObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".mb-count").forEach((c) => countObs.observe(c));

  /* ---------- Hero: 3D tilt of the card deck ---------- */
  const deckWrap = document.getElementById("mbDeckWrap");
  const deck = document.getElementById("mbDeck");
  if (canHover && !reduceMotion && deckWrap && deck) {
    deckWrap.addEventListener("mousemove", (e) => {
      const r = deckWrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      deck.style.transform = `rotateY(${(x * 22).toFixed(2)}deg) rotateX(${(-y * 16).toFixed(2)}deg)`;
    });
    deckWrap.addEventListener("mouseleave", () => { deck.style.transform = ""; });
  }

  /* ---------- Billing toggle (monthly / yearly) ---------- */
  const billing = document.getElementById("mbBilling");
  const lblM = document.getElementById("mbLblMonthly");
  const lblY = document.getElementById("mbLblYearly");
  billing?.addEventListener("click", () => {
    const yearly = billing.getAttribute("aria-checked") !== "true";
    billing.setAttribute("aria-checked", yearly);
    billing.setAttribute("aria-label", yearly ? "Switch to monthly billing" : "Switch to yearly billing");
    lblM.classList.toggle("is-on", !yearly);
    lblY.classList.toggle("is-on", yearly);
    document.querySelectorAll(".mb-amt").forEach((amt) => {
      const value = +(yearly ? amt.dataset.yearly : amt.dataset.monthly);
      amt.textContent = value.toLocaleString("en-IN");
      amt.classList.remove("mb-flip");
      void amt.offsetWidth;
      amt.classList.add("mb-flip");
      amt.nextElementSibling.textContent = yearly ? "/year" : "/month";
    });
  });

  /* ---------- Member stories: 3D stacked carousel ---------- */
  const stories = [...document.querySelectorAll(".mb-story")];
  const dotsWrap = document.getElementById("mbDots");
  let current = 0;
  let autoTimer;
  stories.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Show story ${i + 1}`);
    d.addEventListener("click", () => { show(i); restart(); });
    dotsWrap.appendChild(d);
  });
  const dots = [...dotsWrap.children];
  function layout() {
    const n = stories.length;
    stories.forEach((s, i) => {
      s.classList.remove("is-active", "is-next", "is-after");
      const offset = (i - current + n) % n;
      if (offset === 0) s.classList.add("is-active");
      else if (offset === 1) s.classList.add("is-next");
      else if (offset === 2) s.classList.add("is-after");
      s.setAttribute("aria-hidden", offset !== 0);
    });
    dots.forEach((d, i) => d.classList.toggle("is-on", i === current));
  }
  function show(i) {
    if (i === current) return;
    const leaving = stories[current];
    leaving.classList.add("is-leaving");
    setTimeout(() => leaving.classList.remove("is-leaving"), 700);
    current = (i + stories.length) % stories.length;
    layout();
  }
  function restart() {
    clearInterval(autoTimer);
    if (!reduceMotion) autoTimer = setInterval(() => show(current + 1), 6500);
  }
  document.getElementById("mbNext").addEventListener("click", () => { show(current + 1); restart(); });
  document.getElementById("mbPrev").addEventListener("click", () => { show(current - 1); restart(); });
  layout();
  restart();

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".mb-acc-item").forEach((item) => {
    const q = item.querySelector(".mb-acc-q");
    q.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      document.querySelectorAll(".mb-acc-item.is-open").forEach((o) => {
        o.classList.remove("is-open");
        o.querySelector(".mb-acc-q").setAttribute("aria-expanded", "false");
      });
      if (open) {
        item.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});