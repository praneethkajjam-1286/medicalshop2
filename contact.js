/* =========================================================
   ZENORA – Contact Page Scripts (contact.js)
   Self-contained: shared header/footer behaviour + Contact
   features (live open status, orbit tilt, tabbed forms with
   validation, drag & drop upload, store map switcher, hours).
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
      const group = [...el.parentElement.children].filter((c) => c.classList.contains("ct-reveal"));
      el.style.transitionDelay = `${Math.max(group.indexOf(el), 0) * 0.1}s`;
      el.classList.add("ct-in");
      revealObs.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ""; }, 1400);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".ct-reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Store hours & live status (India time) ---------- */
  const HOURS = { 0: [8, 22], 1: [7, 23], 2: [7, 23], 3: [7, 23], 4: [7, 23], 5: [7, 23], 6: [7, 23] };
  function indiaNow() {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], hour: +get("hour") % 24, minute: +get("minute") };
  }
  function updateStatus() {
    const { day, hour, minute } = indiaNow();
    const [open, close] = HOURS[day];
    const isOpen = hour >= open && hour < close;
    const statusEl = document.getElementById("ctStatus");
    const statusText = document.getElementById("ctStatusText");
    const live = document.getElementById("ctLive");
    const liveText = document.getElementById("ctLiveText");
    statusEl.classList.toggle("is-closed", !isOpen);
    live.classList.toggle("is-closed", !isOpen);
    if (isOpen) {
      const minsLeft = (close - hour) * 60 - minute;
      statusText.textContent = minsLeft <= 60 ? `Open · closes in ${minsLeft} min` : "Open now";
      liveText.textContent = "Pharmacists online now";
    } else {
      statusText.textContent = `Closed · opens ${open}:00 AM`;
      liveText.textContent = "Closed now · WhatsApp open 24/7";
    }
    document.querySelectorAll(".ct-week li").forEach((li) => li.classList.toggle("is-today", +li.dataset.day === day));
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Hero: 3D tilt of the orbit scene ---------- */
  const orbitWrap = document.getElementById("ctOrbitWrap");
  const orbitScene = document.getElementById("ctOrbitScene");
  if (canHover && !reduceMotion && orbitWrap && orbitScene) {
    orbitWrap.addEventListener("mousemove", (e) => {
      const r = orbitWrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      orbitScene.style.transform = `rotateY(${(x * 18).toFixed(2)}deg) rotateX(${(-y * 14).toFixed(2)}deg)`;
    });
    orbitWrap.addEventListener("mouseleave", () => { orbitScene.style.transform = ""; });
  }

  /* ---------- Flip cards: tap to flip on touch screens ---------- */
  if (!canHover) {
    document.querySelectorAll(".ct-flip").forEach((card) =>
      card.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        card.classList.toggle("is-flipped");
      })
    );
  }

  /* ---------- Tabs: general / prescription ---------- */
  const tabs = document.querySelector(".ct-tabs");
  const tabGeneral = document.getElementById("tabGeneral");
  const tabRx = document.getElementById("tabRx");
  const formGeneral = document.getElementById("ctGeneral");
  const formRx = document.getElementById("ctRx");
  const success = document.getElementById("ctSuccess");

  function showTab(rx) {
    tabs.classList.toggle("is-rx", rx);
    tabGeneral.classList.toggle("is-active", !rx);
    tabRx.classList.toggle("is-active", rx);
    tabGeneral.setAttribute("aria-selected", !rx);
    tabRx.setAttribute("aria-selected", rx);
    success.hidden = true;
    [formGeneral, formRx].forEach((f) => { f.hidden = true; f.classList.remove("is-shown"); });
    const show = rx ? formRx : formGeneral;
    show.hidden = false;
    void show.offsetWidth;
    show.classList.add("is-shown");
  }
  tabGeneral.addEventListener("click", () => showTab(false));
  tabRx.addEventListener("click", () => showTab(true));
  // Links like contact.html#prescription open the prescription tab
  if (location.hash === "#prescription") {
    showTab(true);
    setTimeout(() => document.getElementById("ct-form").scrollIntoView({ behavior: "smooth" }), 300);
  }

  /* ---------- Message counter ---------- */
  const gMsg = document.getElementById("gMsg");
  const gCount = document.getElementById("gCount");
  gMsg.addEventListener("input", () => { gCount.textContent = `${gMsg.value.length} / 500`; });

  /* ---------- Validation helpers ---------- */
  const setErr = (input, bad) => {
    const field = input.closest(".ct-field");
    field.classList.remove("is-err");
    if (bad) { void field.offsetWidth; field.classList.add("is-err"); }
    return !bad;
  };
  const validPhone = (v) => /^[6-9][0-9]{9}$/.test(v.replace(/\s/g, ""));
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  document.querySelectorAll(".ct-field input, .ct-field textarea, .ct-field select").forEach((el) =>
    el.addEventListener("input", () => el.closest(".ct-field").classList.remove("is-err"))
  );

  function showSuccess(name, msg) {
    formGeneral.hidden = true;
    formRx.hidden = true;
    document.getElementById("ctSuccessName").textContent = name.split(" ")[0];
    document.getElementById("ctSuccessMsg").textContent = msg;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  formGeneral.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("gName");
    const phone = document.getElementById("gPhone");
    const email = document.getElementById("gEmail");
    const topic = document.getElementById("gTopic");
    let ok = true;
    ok = setErr(name, name.value.trim().length < 2) && ok;
    ok = setErr(phone, !validPhone(phone.value)) && ok;
    ok = setErr(email, !validEmail(email.value.trim())) && ok;
    ok = setErr(topic, !topic.value) && ok;
    ok = setErr(gMsg, gMsg.value.trim().length < 5) && ok;
    if (!ok) return;
    showSuccess(name.value.trim(), "Our care team will reply within 30 minutes during store hours.");
    formGeneral.reset();
    gCount.textContent = "0 / 500";
  });

  /* ---------- Prescription upload (drag & drop) ---------- */
  const drop = document.getElementById("ctDrop");
  const fileInput = document.getElementById("rFile");
  const dropText = document.getElementById("ctDropText");
  const dropErr = document.getElementById("ctDropErr");
  let rxFile = null;
  function takeFile(file) {
    if (!file) return;
    const okType = /\.(jpe?g|png|pdf)$/i.test(file.name);
    const okSize = file.size <= 5 * 1024 * 1024;
    if (!okType || !okSize) {
      rxFile = null;
      drop.classList.remove("has-file");
      dropText.textContent = !okType ? "Please choose a JPG, PNG or PDF" : "File is larger than 5 MB";
      dropErr.classList.add("is-on");
      return;
    }
    rxFile = file;
    drop.classList.add("has-file");
    dropErr.classList.remove("is-on");
    dropText.textContent = `Attached: ${file.name}`;
  }
  fileInput.addEventListener("change", () => takeFile(fileInput.files[0]));
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("is-over"); }));
  drop.addEventListener("drop", (e) => takeFile(e.dataTransfer.files[0]));

  formRx.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("rName");
    const phone = document.getElementById("rPhone");
    let ok = true;
    ok = setErr(name, name.value.trim().length < 2) && ok;
    ok = setErr(phone, !validPhone(phone.value)) && ok;
    if (!rxFile) { dropErr.classList.add("is-on"); ok = false; }
    if (!ok) return;
    showSuccess(name.value.trim(), "A pharmacist will check your prescription and call you within 30 minutes.");
    formRx.reset();
    rxFile = null;
    drop.classList.remove("has-file");
    dropText.textContent = "Drag & drop your prescription";
  });

  document.getElementById("ctAgain").addEventListener("click", () => showTab(tabs.classList.contains("is-rx")));

  /* ---------- Store selector → Google map ---------- */
  const mapFrame = document.querySelector(".ct-map-frame");
  const map = document.getElementById("ctMap");
  const mapName = document.getElementById("ctMapName");
  const dir = document.getElementById("ctDir");
  const mapCard = document.querySelector(".ct-map-card");
  map.addEventListener("load", () => mapFrame.classList.remove("is-loading"));
  document.querySelectorAll(".ct-store").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".ct-store").forEach((b) => b.classList.toggle("is-active", b === btn));
      const q = encodeURIComponent(btn.dataset.q);
      mapFrame.classList.add("is-loading");
      map.src = `https://www.google.com/maps?q=${q}&z=14&output=embed`;
      dir.href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
      mapName.textContent = btn.dataset.name;
      mapCard.classList.remove("is-swap");
      void mapCard.offsetWidth;
      mapCard.classList.add("is-swap");
      setTimeout(() => mapFrame.classList.remove("is-loading"), 4000);   // safety in case load never fires
    })
  );

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 1200, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".ct-count").forEach((c) => countObs.observe(c));

  /* ---------- Team cards: 3D tilt ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".ct-person").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (!card.classList.contains("ct-in")) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = "transform .12s linear, box-shadow .5s ease, border-color .5s";
        card.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(-8px)`;
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