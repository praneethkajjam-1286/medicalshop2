/* =========================================================
   ZENORA – Home Page Scripts
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;

  /* ---------- Saved preferences (theme + direction) ---------- */
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };
  const savedTheme = store.get("careplus-theme");
  const savedDir = store.get("zenora-dir");
  if (savedTheme === "light" || savedTheme === "dark") html.setAttribute("data-theme", savedTheme);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) html.setAttribute("data-theme", "dark");
  if (savedDir) html.setAttribute("dir", savedDir);

  /* ---------- Dark mode toggle ---------- */
  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    store.set("careplus-theme", next);
  });

  /* ---------- RTL / LTR toggle (arrow icon) ---------- */
  document.getElementById("rtlToggle").addEventListener("click", () => {
    const next = html.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    html.setAttribute("dir", next);
    store.set("zenora-dir", next);
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", open);
  });
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Home dropdown (click / keyboard) ---------- */
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

  /* ---------- Header shrink + back-to-top ---------- */
  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Scroll reveal (2D + 3D) with stagger ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = `${Math.max(idx, 0) * 0.12}s`;
        el.classList.add("visible");
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.target;
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target).toLocaleString("en-IN");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".counter").forEach((c) => counterObserver.observe(c));

  /* ---------- 3D tilt on cards ---------- */
  const canHover = window.matchMedia("(hover: hover)").matches;
  if (canHover) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (!card.classList.contains("visible")) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const lift = card.classList.contains("plan-featured") && window.innerWidth > 1024 ? -14 : -6;
        card.style.transitionDelay = "0s";
        card.style.transition = "transform .15s linear, box-shadow .4s ease";
        card.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(${lift}px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transition = "transform .6s ease, box-shadow .4s ease"; card.style.transform = ""; });
    });

    /* Parallax on hero floating cards */
    const hero = document.getElementById("hero");
    const cards = document.querySelector(".hero-cards");
    if (cards) {
      hero.addEventListener("mousemove", (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        cards.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
      });
      hero.addEventListener("mouseleave", () => { cards.style.transform = ""; });
    }
  }

  /* ---------- Testimonial slider (3D) ---------- */
  const slides = [...document.querySelectorAll(".slide")];
  const dotsWrap = document.getElementById("dots");
  let current = 0;
  let timer;
  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    d.addEventListener("click", () => { go(i); restart(); });
    dotsWrap.appendChild(d);
  });
  const dots = [...dotsWrap.children];
  function go(i) {
    if (i === current && slides[i].classList.contains("active")) return;
    slides[current].classList.remove("active");
    slides[current].classList.add("leaving");
    const prev = slides[current];
    setTimeout(() => prev.classList.remove("leaving"), 700);
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots.forEach((d, k) => d.classList.toggle("active", k === current));
  }
  function restart() { clearInterval(timer); timer = setInterval(() => go(current + 1), 6000); }
  slides[0].classList.add("active");
  dots[0].classList.add("active");
  document.getElementById("nextSlide").addEventListener("click", () => { go(current + 1); restart(); });
  document.getElementById("prevSlide").addEventListener("click", () => { go(current - 1); restart(); });
  restart();

  /* ---------- Prescription enquiry form ---------- */
  const rxFile = document.getElementById("rxFile");
  const rxFileName = document.getElementById("rxFileName");
  rxFile.addEventListener("change", () => {
    rxFileName.textContent = rxFile.files.length ? rxFile.files[0].name : "Upload prescription (JPG, PNG, PDF)";
  });
  document.getElementById("rxForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("rxName").value.trim();
    const phone = document.getElementById("rxPhone").value.trim();
    const msg = document.getElementById("rxMsg");
    msg.className = "form-msg";
    if (!name || !/^[0-9]{10}$/.test(phone)) {
      msg.textContent = "Please enter your name and a valid 10-digit phone number.";
      msg.classList.add("err");
      return;
    }
    if (!rxFile.files.length) {
      msg.textContent = "Please upload your prescription.";
      msg.classList.add("err");
      return;
    }
    msg.textContent = `Thank you, ${name}! Our pharmacist will call you within 30 minutes.`;
    msg.classList.add("ok");
    e.target.reset();
    rxFileName.textContent = "Upload prescription (JPG, PNG, PDF)";
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});