// =========================================================
// Emeravita Health Store – MEMBER LOGIN (standalone script)
// Front-end only: connect the marked spots to your backend.
// =========================================================
document.addEventListener("click", (event) => {
  const toggle = event.target instanceof Element ? event.target.closest("#themeToggle") : null;
  if (!toggle) return;

  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("careplus-theme", next); } catch { /* ignore */ }
  toggle.setAttribute("aria-pressed", String(next === "dark"));
  toggle.title = next === "dark" ? "Switch to light mode" : "Switch to dark mode";
});

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  // ---------- Theme (shared key with all pages) ----------
  const themeBtn = document.getElementById("themeToggle");
  const syncTheme = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.title = dark ? "Switch to light mode" : "Switch to dark mode";
  };
  syncTheme();

  // ---------- Direction (shared key with all pages) ----------
  const rtlBtn = document.getElementById("rtlToggle");
  const syncDir = () => {
    const rtl = root.getAttribute("dir") === "rtl";
    rtlBtn.setAttribute("aria-pressed", String(rtl));
    rtlBtn.title = rtl ? "Switch to left-to-right" : "Switch to right-to-left";
  };
  syncDir();
  rtlBtn.addEventListener("click", () => {
    const next = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    root.setAttribute("dir", next);
    store.set("careplus-dir", next);
    syncDir();
  });

  // ---------- Toast ----------
  const toastEl = document.getElementById("toast");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 2600);
  };

  // ---------- Visual panel: rotating benefits ----------
  const items = [...document.querySelectorAll("#rotator li")];
  const dots = [...document.querySelectorAll("#rotatorDots span")];
  let ri = 0;
  if (!reduce) setInterval(() => {
    items[ri].classList.remove("active"); items[ri].classList.add("leave");
    const prev = ri; setTimeout(() => items[prev].classList.remove("leave"), 600);
    ri = (ri + 1) % items.length;
    items[ri].classList.add("active");
    dots.forEach((d, i) => d.classList.toggle("on", i === ri));
  }, 3200);

  // ---------- View switching (login / register / forgot / success) ----------
  const views = Object.fromEntries([...document.querySelectorAll(".view")].map((v) => [v.dataset.view, v]));
  let current = "login";
  const show = (name) => {
    if (name === current) return;
    const out = views[current], inn = views[name];
    const swap = () => {
      out.classList.remove("active", "leaving");
      inn.classList.add("active");
      current = name;
      const first = inn.querySelector("input:not([type=checkbox]), .btn");
      if (first && name !== "success") first.focus({ preventScroll: true });
    };
    if (reduce) return swap();
    out.classList.add("leaving");
    setTimeout(swap, 280);
  };
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { e.preventDefault(); show(go.dataset.go); }
  });

  // ---------- Email / OTP segmented control ----------
  const seg = document.querySelector(".seg");
  document.querySelectorAll(".seg-btn").forEach((btn) => btn.addEventListener("click", () => {
    const m = btn.dataset.method;
    seg.classList.toggle("otp", m === "otp");
    document.querySelectorAll(".seg-btn").forEach((b) => { const on = b === btn; b.classList.toggle("active", on); b.setAttribute("aria-selected", String(on)); });
    document.querySelectorAll(".method").forEach((f) => f.classList.toggle("active", f.dataset.method === m));
  }));

  // ---------- Helpers ----------
  const fieldOf = (input) => input.closest(".field");
  const setErr = (input, msg) => {
    const f = fieldOf(input);
    f.classList.toggle("invalid", !!msg);
    f.classList.toggle("valid", !msg && input.value.trim() !== "");
    f.querySelector(".err").textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) { f.classList.remove("invalid"); void f.offsetWidth; f.classList.add("invalid"); }
  };
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const loading = (btn, on) => { btn.classList.toggle("loading", on); btn.disabled = on; };
  const fakeRequest = (ms = 1200) => new Promise((r) => setTimeout(r, reduce ? 200 : ms)); // ← replace with your API call
  const success = (title, text) => {
    document.getElementById("successTitle").textContent = title;
    document.getElementById("successText").textContent = text;
    show("success");
  };

  // Clear error while typing
  document.querySelectorAll(".field input").forEach((inp) => inp.addEventListener("input", () => {
    if (fieldOf(inp).classList.contains("invalid")) setErr(inp, "");
  }));

  // Show / hide password
  document.querySelectorAll(".eye").forEach((btn) => btn.addEventListener("click", () => {
    const input = fieldOf(btn).querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    input.classList.add("pw");
    btn.setAttribute("aria-pressed", String(show));
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  }));

  // Caps lock hint
  const lgPass = document.getElementById("lgPass");
  const caps = lgPass.closest(".field").querySelector(".caps");
  ["keydown", "keyup"].forEach((ev) => lgPass.addEventListener(ev, (e) => {
    if (e.getModifierState) caps.hidden = !e.getModifierState("CapsLock");
  }));
  lgPass.addEventListener("blur", () => { caps.hidden = true; });

  // Remember me (stores email only — never the password)
  const lgEmail = document.getElementById("lgEmail");
  const remembered = store.get("careplus-remember-email");
  if (remembered) { lgEmail.value = remembered; document.getElementById("remember").checked = true; }

  // ---------- Login: email ----------
  document.getElementById("loginEmail").addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    if (!emailOk(lgEmail.value)) { setErr(lgEmail, "Please enter a valid email address"); ok = false; } else setErr(lgEmail, "");
    if (lgPass.value.length < 6) { setErr(lgPass, "Password must be at least 6 characters"); ok = false; } else setErr(lgPass, "");
    if (!ok) return;
    const btn = e.currentTarget.querySelector("button[type=submit]");
    loading(btn, true);
    await fakeRequest();
    loading(btn, false);
    if (document.getElementById("remember").checked) store.set("careplus-remember-email", lgEmail.value.trim());
    else { try { localStorage.removeItem("careplus-remember-email"); } catch { /* ignore */ } }
    lgPass.value = "";
    success("You're signed in!", `Welcome back, ${lgEmail.value.trim().split("@")[0]}.`);
  });

  // ---------- Login: mobile OTP ----------
  const phone = document.getElementById("lgPhone");
  const otpWrap = document.getElementById("otpWrap");
  const otpBoxes = [...document.querySelectorAll("#otpBoxes input")];
  const otpGroup = document.getElementById("otpBoxes");
  const otpErr = document.querySelector(".otp-err");
  const otpSubmit = document.getElementById("otpSubmit");
  const resendBtn = document.getElementById("resendBtn");
  let otpSent = false, resendTimer;

  phone.addEventListener("input", () => { phone.value = phone.value.replace(/\D/g, "").slice(0, 10); });

  const startResend = () => {
    let s = 30;
    resendBtn.disabled = true;
    resendBtn.innerHTML = `Resend in <span id="resendT">${s}</span>s`;
    clearInterval(resendTimer);
    resendTimer = setInterval(() => {
      s--;
      if (s <= 0) { clearInterval(resendTimer); resendBtn.disabled = false; resendBtn.textContent = "Resend OTP"; }
      else document.getElementById("resendT").textContent = s;
    }, 1000);
  };
  resendBtn.addEventListener("click", () => { toast("A new OTP has been sent"); startResend(); });

  otpBoxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\D/g, "").slice(-1);
      box.classList.toggle("filled", !!box.value);
      otpGroup.classList.remove("invalid"); otpErr.textContent = "";
      if (box.value && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && i > 0) otpBoxes[i - 1].focus();
      if (e.key === "ArrowLeft" && i > 0) otpBoxes[i - 1].focus();
      if (e.key === "ArrowRight" && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
    });
    box.addEventListener("paste", (e) => {
      const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      if (!digits) return;
      e.preventDefault();
      digits.split("").forEach((d, k) => { if (otpBoxes[k]) { otpBoxes[k].value = d; otpBoxes[k].classList.add("filled"); } });
      otpBoxes[Math.min(digits.length, 6) - 1].focus();
    });
  });

  document.getElementById("loginOtp").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (!/^[6-9]\d{9}$/.test(phone.value)) { setErr(phone, "Enter a valid 10-digit mobile number"); return; }
      setErr(phone, "");
      loading(otpSubmit, true);
      await fakeRequest(900);
      loading(otpSubmit, false);
      otpSent = true;
      document.getElementById("otpTo").textContent = `+91 ${phone.value.slice(0, 5)} ${phone.value.slice(5)}`;
      otpWrap.hidden = false;
      otpSubmit.querySelector(".btn-label").textContent = "Verify & Sign In";
      otpBoxes[0].focus();
      startResend();
      toast("OTP sent to your mobile");
      return;
    }
    const code = otpBoxes.map((b) => b.value).join("");
    if (code.length < 6) {
      otpGroup.classList.remove("invalid"); void otpGroup.offsetWidth; otpGroup.classList.add("invalid");
      otpErr.textContent = "Please enter all 6 digits"; return;
    }
    loading(otpSubmit, true);
    await fakeRequest();
    loading(otpSubmit, false);
    success("You're signed in!", "Your mobile number has been verified.");
  });

  // ---------- Register ----------
  const rgPass = document.getElementById("rgPass");
  const strength = document.querySelector(".strength");
  const strengthText = document.getElementById("strengthText");
  const labels = ["Use 8+ characters with a number and a symbol", "Weak password", "Fair password", "Good password", "Strong password"];
  rgPass.addEventListener("input", () => {
    const v = rgPass.value;
    let lvl = 0;
    if (v.length >= 8) lvl++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) lvl++;
    if (/\d/.test(v)) lvl++;
    if (/[^A-Za-z0-9]/.test(v)) lvl++;
    if (!v) lvl = 0; else lvl = Math.max(1, lvl);
    strength.dataset.level = lvl;
    strengthText.textContent = labels[lvl];
  });

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("rgName");
    const email = document.getElementById("rgEmail");
    const terms = document.getElementById("rgTerms");
    const termsErr = document.querySelector(".terms-err");
    let ok = true;
    if (name.value.trim().length < 2) { setErr(name, "Please enter your full name"); ok = false; } else setErr(name, "");
    if (!emailOk(email.value)) { setErr(email, "Please enter a valid email address"); ok = false; } else setErr(email, "");
    if (rgPass.value.length < 8) { setErr(rgPass, "Use at least 8 characters"); ok = false; } else setErr(rgPass, "");
    termsErr.textContent = terms.checked ? "" : "Please accept the terms to continue";
    if (!terms.checked) ok = false;
    if (!ok) return;
    const btn = e.currentTarget.querySelector("button[type=submit]");
    loading(btn, true);
    await fakeRequest();
    loading(btn, false);
    rgPass.value = "";
    success("Welcome to Emeravita!", `Your member account is ready, ${name.value.trim().split(" ")[0]}.`);
  });

  // ---------- Forgot password ----------
  document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("fgEmail");
    if (!emailOk(email.value)) { setErr(email, "Please enter a valid email address"); return; }
    setErr(email, "");
    const btn = e.currentTarget.querySelector("button[type=submit]");
    loading(btn, true);
    await fakeRequest();
    loading(btn, false);
    success("Check your inbox", `If ${email.value.trim()} is registered, a reset link is on its way.`);
  });

  // ---------- Social buttons ----------
  document.querySelectorAll(".soc-btn").forEach((b) => b.addEventListener("click", () => {
    toast(`${b.dataset.provider} sign-in will be available once connected`);
  }));

  // ---------- Subtle 3D tilt on the visual card ----------
  const scene = document.querySelector(".v-scene");
  const gc = document.querySelector(".gc-main");
  if (scene && !reduce && window.matchMedia("(hover: hover)").matches) {
    const visual = document.querySelector(".visual");
    visual.addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rtl = root.getAttribute("dir") === "rtl";
      gc.style.animation = "none";
      gc.style.transform = `translate(${rtl ? 50 : -50}%, -50%) rotateY(${x * 22}deg) rotateX(${-y * 16}deg)`;
    });
    visual.addEventListener("mouseleave", () => { gc.style.transform = ""; gc.style.animation = ""; });
  }
});