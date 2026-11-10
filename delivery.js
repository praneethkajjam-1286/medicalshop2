/* =========================================================
   ZENORA – Home Delivery Page Scripts (delivery.js)
   Self-contained: shared header/footer behaviour + Delivery
   features (pincode checker, animated hero route & ETA,
   scroll-filled process line, city filter, counters,
   parallax, 3D tilt, FAQ accordion, order tracker).
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

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const group = [...el.parentElement.children].filter((c) => c.classList.contains("dl-reveal"));
      el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.1}s`;
      el.classList.add("dl-in");
      revealObs.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".dl-reveal").forEach((el) => revealObs.observe(el));



  /* ---------- 1. Pincode checker ---------- */
  const PINS = {
    "50": { city: "Hyderabad / Telangana", express: true },
    "52": { city: "Andhra Pradesh (central)", express: true },
    "53": { city: "Andhra Pradesh (north coast)", express: true },
    "51": { city: "Andhra Pradesh (south)", express: false },
    "56": { city: "Bengaluru / Karnataka", express: true },
    "57": { city: "Karnataka", express: false },
    "60": { city: "Chennai / Tamil Nadu", express: false },
    "41": { city: "Pune / Maharashtra", express: false }
  };
  const pinForm = document.getElementById("dlPin");
  const pinInput = document.getElementById("dlPinInput");
  const pinResult = document.getElementById("dlPinResult");
  const shake = (el) => { el.classList.remove("is-shake"); void el.offsetWidth; el.classList.add("is-shake"); };
  const setPinMsg = (text, cls) => {
    pinResult.className = "dl-pin-result " + cls;
    pinResult.textContent = text;
    void pinResult.offsetWidth;
    pinResult.classList.add("is-pop");
  };
  pinInput?.addEventListener("input", () => { pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6); });
  pinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      shake(pinForm);
      setPinMsg("Please enter a valid 6-digit pincode.", "is-no");
      return;
    }
    const zone = PINS[pin.slice(0, 2)];
    if (zone) {
      setPinMsg(zone.express
        ? `✓ Great news! We deliver to ${pin} (${zone.city}). Express 2-hour delivery available.`
        : `✓ We deliver to ${pin} (${zone.city}). Same-day & scheduled delivery available.`, "is-ok");
    } else {
      setPinMsg(`We don't reach ${pin} yet. We're expanding fast, so contact us to request your area.`, "is-no");
    }
  });

  /* ---------- 2. Hero route: rider travels, stops light up, ETA counts down ---------- */
  const route = document.getElementById("dlRoute");
  const rider = document.getElementById("dlRider");
  const roadFill = document.getElementById("dlRoadFill");
  const stops = [...document.querySelectorAll(".dl-stop")];
  const etaEl = document.getElementById("dlEta");
  const etaBar = document.getElementById("dlEtaBar");
  const CYCLE = 9000;
  let t0 = performance.now();
  const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  function tickRoute(now) {
    if (!route) return;
    let p = ((now - t0) % CYCLE) / CYCLE;          // 0..1 over cycle
    p = p < .85 ? ease(p / .85) : 1;               // hold at the end for a moment
    const w = route.querySelector(".dl-road").clientWidth;
    const x = 8 + p * (w - 16);
    rider.style.insetInlineStart = x + "px";
    roadFill.style.width = (p * 100) + "%";
    stops.forEach((s) => s.classList.toggle("is-on", p >= parseFloat(s.dataset.at) - 0.02));
    const eta = Math.max(0, Math.round(38 * (1 - p)));
    if (etaEl.textContent !== String(eta)) etaEl.textContent = eta;
    etaBar.style.width = (35 + p * 65) + "%";
    requestAnimationFrame(tickRoute);
  }
  if (reduceMotion) {
    stops.forEach((s) => s.classList.add("is-on"));
    roadFill.style.width = "100%";
    rider.style.insetInlineStart = "calc(100% - 8px)";
  } else {
    requestAnimationFrame(tickRoute);
  }

  /* ---------- 3. Mouse tilt (hero visual + option cards) ---------- */
  if (canHover && !reduceMotion) {
    const visual = document.getElementById("dlVisual");
    const heroEl = document.getElementById("dl-hero");
    heroEl?.addEventListener("mousemove", (e) => {
      const r = heroEl.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      visual.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg)`;
    });
    heroEl?.addEventListener("mouseleave", () => { visual.style.transform = ""; });

    document.querySelectorAll(".dl-opt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (!card.classList.contains("dl-in")) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) translateY(-10px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- 4. Process line fills while scrolling + steps light up ---------- */
  const flow = document.getElementById("dlFlow");
  const flowFill = document.getElementById("dlFlowFill");
  const flowSteps = [...document.querySelectorAll(".dl-flow-step")];
  const banner = document.querySelector(".dl-parallax");
  function onScrollFx() {
    const vh = window.innerHeight;
    if (flow) {
      const r = flow.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .3)));
      flowFill.style.width = (p * 100) + "%";
      flowSteps.forEach((s, i) => s.classList.toggle("is-lit", p >= i / (flowSteps.length - 1) - 0.05 && p > 0));
    }
    if (banner && !reduceMotion) {
      const r = banner.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        banner.style.transform = `translateY(${p * -40}px)`;
      }
    }
  }
  window.addEventListener("scroll", onScrollFx, { passive: true });
  window.addEventListener("resize", onScrollFx);
  onScrollFx();

  /* ---------- 5. City filter (state tabs + search) ---------- */
  const cityItems = [...document.querySelectorAll("#dlCities li")];
  const citySearch = document.getElementById("dlCitySearch");
  const cityEmpty = document.getElementById("dlCityEmpty");
  let stateFilter = "all";
  function filterCities() {
    const q = (citySearch?.value || "").trim().toLowerCase();
    let shown = 0;
    cityItems.forEach((li, i) => {
      const ok = (stateFilter === "all" || li.dataset.s === stateFilter) && li.textContent.toLowerCase().includes(q);
      li.hidden = !ok;
      if (ok) { li.style.animationDelay = `${shown * 0.03}s`; li.style.animation = "none"; void li.offsetWidth; li.style.animation = ""; shown++; }
    });
    cityEmpty.hidden = shown > 0;
  }
  document.querySelectorAll(".dl-state").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dl-state").forEach((b) => { b.classList.remove("is-on"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-on");
      btn.setAttribute("aria-selected", "true");
      stateFilter = btn.dataset.state;
      filterCities();
    });
  });
  citySearch?.addEventListener("input", filterCities);

  /* ---------- 6. Counters ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-IN");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".dl-count").forEach((el) => countObs.observe(el));

  /* ---------- 7. FAQ accordion ---------- */
  document.querySelectorAll(".dl-acc-item").forEach((item) => {
    const q = item.querySelector(".dl-acc-q");
    q.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      document.querySelectorAll(".dl-acc-item").forEach((i) => {
        i.classList.remove("is-open");
        i.querySelector(".dl-acc-q").setAttribute("aria-expanded", "false");
      });
      if (open) { item.classList.add("is-open"); q.setAttribute("aria-expanded", "true"); }
    });
  });

  /* ---------- 8. Order tracker (demo) ---------- */
  const trackForm = document.getElementById("dlTrack");
  const trackInput = document.getElementById("dlTrackInput");
  const trackMsg = document.getElementById("dlTrackMsg");
  const trackSteps = [...document.querySelectorAll("#dlTrackSteps li")];
  const LABELS = ["Order placed", "Pharmacist verified", "Packed & sealed", "Out for delivery", "Delivered"];
  let trackTimers = [];
  trackForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    trackTimers.forEach(clearTimeout);
    trackTimers = [];
    const id = trackInput.value.trim().toUpperCase();
    trackSteps.forEach((li) => li.classList.remove("is-done", "is-now"));
    if (!/^ZN-?\d{4,6}$/.test(id)) {
      shake(trackForm);
      trackMsg.textContent = "Please enter a valid order number, e.g. ZN-48213.";
      return;
    }
    // Demo: derive a stage from the digits so each number gives a stable result
    const digits = id.replace(/\D/g, "");
    const stage = [...digits].reduce((a, d) => a + +d, 0) % 5;   // 0..4
    trackMsg.textContent = `Looking up ${id}…`;
    for (let i = 0; i <= stage; i++) {
      trackTimers.push(setTimeout(() => {
        if (i > 0) { trackSteps[i - 1].classList.remove("is-now"); trackSteps[i - 1].classList.add("is-done"); }
        trackSteps[i].classList.add(i === 4 ? "is-done" : "is-now");
        if (i === stage) {
          trackMsg.textContent = stage === 4
            ? `${id} has been delivered. Thank you for choosing Emeravita!`
            : `${id}: ${LABELS[stage]}. ${stage === 3 ? "Your rider is about 25 min away." : "We'll text you at every step."}`;
        }
      }, 350 + i * 450));
    }
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});