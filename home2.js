/* =========================================================
   ZENORA – Home 2 Scripts (home2.js)
   Self-contained: shared header/footer behaviour (same
   localStorage keys as Home 1: "careplus-theme", "zenora-dir")
   + Home 2 features: hero photo deck with progress bars,
   rotating headline word, medicine search, category rail,
   health-goal tabs, call-back form, counters, offer countdown,
   3D tilt + add-to-cart toast, testimonial slider.
   Does not depend on script.js.
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


  const isRtl = () => html.getAttribute("dir") === "rtl";

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".hm-reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("hm-in"));
  } else {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const group = [...el.parentElement.children].filter((c) => c.classList.contains("hm-reveal"));
        el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.08}s`;
        el.classList.add("hm-in");
        revealObs.unobserve(el);
        setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    // Rail cards sit side by side in a scroller, so reveal them together when the rail appears
    const railCards = [...document.querySelectorAll(".hm-cat.hm-reveal")];
    const railObs = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      railCards.forEach((card, i) => { card.style.transitionDelay = `${i * 0.08}s`; card.classList.add("hm-in"); setTimeout(() => { card.style.transitionDelay = ""; }, 1400); });
      railObs.disconnect();
    }, { threshold: 0.15 });
    const railEl = document.getElementById("hmRail");
    if (railEl) railObs.observe(railEl);
    reveals.forEach((el) => { if (!railCards.includes(el)) revealObs.observe(el); });
  }

  /* ---------- 1a. Hero photo deck (auto-advance with progress bars) ---------- */
  const deck = document.getElementById("hmDeck");
  const slides = [...deck.querySelectorAll(".hm-slide")];
  const bars = [...deck.querySelectorAll(".hm-bar")];
  const DURATION = 5000;
  deck.style.setProperty("--hm-dur", `${DURATION}ms`);
  let current = 0, timer = null, remaining = DURATION, startedAt = 0;
  const goTo = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === current));
    bars.forEach((b, k) => {
      b.classList.remove("is-active", "is-done");
      void b.offsetWidth; // restart the CSS progress animation
      if (k < current) b.classList.add("is-done");
      if (k === current) b.classList.add("is-active");
      b.setAttribute("aria-selected", String(k === current));
    });
    remaining = DURATION;
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (reduceMotion) return;
    startedAt = Date.now();
    timer = setTimeout(() => goTo(current + 1), remaining);
  };
  bars.forEach((b, k) => b.addEventListener("click", () => goTo(k)));
  deck.addEventListener("mouseenter", () => { clearTimeout(timer); remaining -= Date.now() - startedAt; deck.classList.add("is-paused"); });
  deck.addEventListener("mouseleave", () => { deck.classList.remove("is-paused"); schedule(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(timer); else goTo(current); });
  goTo(0);

  /* ---------- 1b. Rotating headline word ---------- */
  const word = document.getElementById("hmWord");
  const WORDS = ["delivered.", "personalised.", "trusted."];
  let w = 0;
  if (!reduceMotion) {
    setInterval(() => {
      w = (w + 1) % WORDS.length;
      word.classList.remove("is-swap");
      void word.offsetWidth;
      word.textContent = WORDS[w];
      word.classList.add("is-swap");
    }, 3200);
  }

  /* ---------- 1c. Search (sends the query to the Products page) ---------- */
  const searchForm = document.getElementById("hmSearch");
  const searchInput = document.getElementById("hmSearchInput");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) { searchInput.focus(); searchForm.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 }); return; }
    const url = new URL("products.html", window.location.href);
    url.searchParams.set("q", q);
    window.location.href = url.href;
  });
  document.querySelectorAll(".hm-chip").forEach((chip) => chip.addEventListener("click", () => {
    searchInput.value = chip.dataset.q;
    searchInput.focus();
  }));

  /* ---------- 2. Category rail buttons (RTL aware) ---------- */
  const rail = document.getElementById("hmRail");
  const step = () => (rail.querySelector(".hm-cat")?.offsetWidth || 280) + 22;
  const scrollRail = (dir) => rail.scrollBy({ left: dir * step() * (isRtl() ? -1 : 1), behavior: reduceMotion ? "auto" : "smooth" });
  document.getElementById("hmRailPrev").addEventListener("click", () => scrollRail(-1));
  document.getElementById("hmRailNext").addEventListener("click", () => scrollRail(1));
  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollRail(isRtl() ? -1 : 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); scrollRail(isRtl() ? 1 : -1); }
  });

  /* ---------- 3. Health-goal tabs (ARIA tabs pattern) ---------- */
  const tabs = [...document.querySelectorAll(".hm-tab")];
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const fwd = isRtl() ? "ArrowLeft" : "ArrowRight";
      const back = isRtl() ? "ArrowRight" : "ArrowLeft";
      let next = null;
      if (e.key === fwd) next = tabs[(i + 1) % tabs.length];
      else if (e.key === back) next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- 4. Call-back form ---------- */
  const callForm = document.getElementById("hmCallback");
  const nameIn = document.getElementById("hmName");
  const phoneIn = document.getElementById("hmPhone");
  const callMsg = document.getElementById("hmCallMsg");
  phoneIn.addEventListener("input", () => { phoneIn.value = phoneIn.value.replace(/\D/g, "").slice(0, 10); });
  [nameIn, phoneIn].forEach((inp) => inp.addEventListener("input", () => inp.parentElement.classList.remove("is-error")));
  callForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    if (nameIn.value.trim().length < 2) { nameIn.parentElement.classList.add("is-error"); ok = false; }
    if (!/^[6-9]\d{9}$/.test(phoneIn.value)) { phoneIn.parentElement.classList.add("is-error"); ok = false; }
    if (!ok) {
      callMsg.className = "hm-form-msg is-error";
      callMsg.textContent = "Please enter your name and a valid 10-digit mobile number.";
      return;
    }
    callMsg.className = "hm-form-msg is-ok";
    callMsg.textContent = `Thanks, ${nameIn.value.trim().split(" ")[0]}! A pharmacist will call you shortly.`;
    callForm.reset();
  });

  /* ---------- 5. Counters ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      if (reduceMotion) { el.textContent = target; countObs.unobserve(el); return; }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 1500);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(".hm-count").forEach((el) => countObs.observe(el));

  /* ---------- 6a. Offer countdown (ends next Sunday 23:59:59 local time) ---------- */
  const timerEl = document.getElementById("hmTimer");
  const end = new Date();
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  end.setHours(23, 59, 59, 0);
  const units = { d: timerEl.querySelector('[data-u="d"]'), h: timerEl.querySelector('[data-u="h"]'), m: timerEl.querySelector('[data-u="m"]'), s: timerEl.querySelector('[data-u="s"]') };
  const pad = (n) => String(n).padStart(2, "0");
  const renderTimer = () => {
    let diff = Math.max(0, end - Date.now());
    if (diff === 0) end.setDate(end.getDate() + 7), diff = end - Date.now();
    const vals = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    Object.entries(vals).forEach(([k, v]) => {
      const txt = pad(v);
      if (units[k].textContent !== txt) {
        units[k].textContent = txt;
        if (!reduceMotion) { units[k].classList.remove("is-tick"); void units[k].offsetWidth; units[k].classList.add("is-tick"); }
      }
    });
  };
  renderTimer();
  setInterval(renderTimer, 1000);

  /* ---------- 6b. 3D tilt on product cards + add-to-cart toast ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".hm-pick").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (!card.classList.contains("hm-in")) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) translateY(-8px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }
  const toast = document.getElementById("hmToast");
  let toastTimer = null;
  document.querySelectorAll(".hm-add").forEach((btn) => btn.addEventListener("click", () => {
    const label = btn.querySelector("span");
    btn.classList.add("is-added");
    label.textContent = "Added ✓";
    toast.textContent = `${btn.dataset.name} added to your cart`;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2400);
    setTimeout(() => { btn.classList.remove("is-added"); label.textContent = "Add to cart"; }, 1800);
  }));

  /* ---------- 7. Testimonial stack slider ---------- */
  const voices = [...document.querySelectorAll(".hm-voice")];
  const voiceCount = document.getElementById("hmVoiceCount");
  let v = 0, voiceTimer = null;
  const showVoice = (i) => {
    v = (i + voices.length) % voices.length;
    voices.forEach((el, k) => {
      el.classList.toggle("is-active", k === v);
      el.classList.toggle("is-next", k === (v + 1) % voices.length);
      el.setAttribute("aria-hidden", String(k !== v));
    });
    voiceCount.textContent = `${v + 1} / ${voices.length}`;
  };
  const autoVoices = () => { clearInterval(voiceTimer); if (!reduceMotion) voiceTimer = setInterval(() => showVoice(v + 1), 6000); };
  document.getElementById("hmVoicePrev").addEventListener("click", () => { showVoice(v - 1); autoVoices(); });
  document.getElementById("hmVoiceNext").addEventListener("click", () => { showVoice(v + 1); autoVoices(); });
  const stage = document.getElementById("hmVoices");
  stage.addEventListener("mouseenter", () => clearInterval(voiceTimer));
  stage.addEventListener("mouseleave", autoVoices);
  let tx = null;
  stage.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) { showVoice(v + ((dx < 0) !== isRtl() ? 1 : -1)); autoVoices(); }
    tx = null;
  });
  showVoice(0);
  autoVoices();

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});