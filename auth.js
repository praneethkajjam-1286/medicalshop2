/* =========================================================
   EMERAVITA – Authentication Scripts
   Shared by: login.html, signup.html
   ========================================================= */
(() => {
  "use strict";

  const html = document.documentElement;
  const $ = (id) => document.getElementById(id);

  /* Same storage keys as the home page so theme & direction carry over */
  const KEY_THEME = "careplus-theme";
  const KEY_DIR = "zenora-dir";
  const KEY_REMEMBER = "emeravita-remember-email";
  const KEY_NEW = "emeravita-new-account";

  const safe = (store) => ({
    get: (k) => { try { return store.getItem(k); } catch { return null; } },
    set: (k, v) => { try { store.setItem(k, v); } catch { /* ignore */ } },
    remove: (k) => { try { store.removeItem(k); } catch { /* ignore */ } }
  });
  const local = safe(window.localStorage);
  const session = safe(window.sessionStorage);

  /* ---------- Dark mode ---------- */
  const themeBtn = $("themeToggle");
  const syncTheme = () => {
    if (!themeBtn) return;
    const dark = html.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };
  themeBtn?.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    local.set(KEY_THEME, next);
    syncTheme();
  });
  syncTheme();

  /* ---------- RTL / LTR ---------- */
  const rtlBtn = $("rtlToggle");
  const syncDir = () => {
    if (!rtlBtn) return;
    const rtl = html.getAttribute("dir") === "rtl";
    rtlBtn.setAttribute("aria-pressed", String(rtl));
    rtlBtn.setAttribute("aria-label", rtl ? "Switch to left-to-right" : "Switch to right-to-left");
  };
  rtlBtn?.addEventListener("click", () => {
    const next = html.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    html.setAttribute("dir", next);
    local.set(KEY_DIR, next);
    syncDir();
  });
  syncDir();

  /* ---------- Keep the card centred and fully visible (no scrolling) ---------- */
  const stage = $("authStage");
  const coarse = window.matchMedia("(pointer: coarse)");
  const fit = () => {
    if (!stage) return;
    const a = document.activeElement;
    // Don't shrink the card while the phone keyboard is open
    if (coarse.matches && a && a.tagName === "INPUT" && a.type !== "checkbox") return;
    const reserve = parseFloat(getComputedStyle(stage).getPropertyValue("--reserve")) || 48;
    const scale = Math.min(1, Math.max(0.45, (window.innerHeight - reserve) / stage.offsetHeight));
    stage.style.setProperty("--fit", scale.toFixed(3));
  };
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);
  if (stage && "ResizeObserver" in window) new ResizeObserver(fit).observe(stage);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  /* ---------- Password visibility (eye icon) ---------- */
  document.querySelectorAll(".pw-toggle").forEach((btn) => {
    const input = $(btn.getAttribute("aria-controls"));
    if (!input) return;
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.classList.toggle("is-on", show);
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      const end = input.value.length;
      input.focus({ preventScroll: true });
      try { input.setSelectionRange(end, end); } catch { /* ignore */ }
    });
  });

  /* ---------- Validation ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const NAME_RE = /^[\p{L}][\p{L}\s'.-]*$/u;

  const normalizePhone = (v) => {
    let d = v.replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  };

  const rules = {
    email: (v) => !v ? "Please enter your email address."
      : !EMAIL_RE.test(v) ? "Enter a valid email, like name@example.com." : "",
    loginPassword: (v) => !v ? "Please enter your password." : "",
    firstName: (v) => !v ? "Please enter your first name."
      : (v.length < 2 || !NAME_RE.test(v)) ? "Use at least 2 letters (no numbers or symbols)." : "",
    lastName: (v) => !v ? "Please enter your last name."
      : !NAME_RE.test(v) ? "Use letters only (no numbers or symbols)." : "",
    phone: (v) => !v ? "Please enter your mobile number."
      : !normalizePhone(v) ? "Enter a valid 10-digit mobile number." : "",
    newPassword: (v) => !v ? "Please create a password."
      : (v.length < 8 || !/[A-Za-z]/.test(v) || !/\d/.test(v)) ? "Use 8+ characters with letters and at least one number." : "",
    confirmPassword: (v) => !v ? "Please confirm your password."
      : v !== ($("signupPassword")?.value || "") ? "Passwords don't match." : ""
  };

  const setError = (input, msg, shake) => {
    const field = input.closest(".field");
    const err = $(input.id + "Err");
    if (err) err.textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (!field) return;
    field.classList.toggle("is-invalid", !!msg);
    field.classList.toggle("is-valid", !msg && input.value.trim() !== "");
    if (msg && shake) {
      field.classList.remove("shake");
      void field.offsetWidth; // restart animation
      field.classList.add("shake");
    }
  };

  const validate = (input, shake = false) => {
    const rule = rules[input.dataset.rule];
    if (!rule) return true;
    const isPw = /assword/i.test(input.dataset.rule);
    const msg = rule(isPw ? input.value : input.value.trim());
    setError(input, msg, shake);
    return !msg;
  };

  /* Password strength meter */
  const strengthBox = $("pwStrength");
  const strengthLabel = $("pwLabel");
  const updateStrength = (v) => {
    if (!strengthBox) return;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) s++;
    if (v && v.length < 8) s = Math.min(s, 1);
    if (!v) s = 0;
    strengthBox.dataset.strength = String(s);
    if (strengthLabel) strengthLabel.textContent = ["Use 8+ characters", "Weak", "Fair", "Good", "Strong"][s];
  };

  /* Live validation: check on blur, re-check while typing once touched */
  document.querySelectorAll("[data-rule]").forEach((input) => {
    input.addEventListener("blur", () => { if (input.value) validate(input); });
    input.addEventListener("input", () => {
      const f = input.closest(".field");
      if (f && (f.classList.contains("is-invalid") || f.classList.contains("is-valid"))) validate(input);
      if (input.dataset.rule === "newPassword") {
        updateStrength(input.value);
        const c = $("confirmPassword");
        if (c && c.value) validate(c);
      }
    });
  });

  /* ---------- Helpers ---------- */
  const setStatus = (el, msg, type) => {
    if (!el) return;
    el.className = "form-status" + (type ? " " + type : "");
    el.textContent = msg;
  };
  const setLoading = (btn, on) => {
    btn.classList.toggle("is-loading", on);
    btn.disabled = on;
    btn.setAttribute("aria-busy", String(on));
  };
  const focusFirstInvalid = (form) => form.querySelector('[aria-invalid="true"]')?.focus();

  /* ---------- Social sign-in (Google / Apple) ---------- */
  document.querySelectorAll(".social-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.dataset.provider;
      const status = document.querySelector(".form-status");
      btn.classList.add("is-loading");
      setStatus(status, `Connecting to ${provider}…`, "info");
      // Replace this timeout with your OAuth redirect (Google Identity Services / Sign in with Apple JS)
      setTimeout(() => {
        btn.classList.remove("is-loading");
        setStatus(status, `${provider} sign-in will be available once it is connected to the server.`, "info");
      }, 1200);
    });
  });

  /* ---------- LOGIN PAGE ---------- */
  const loginForm = $("loginForm");
  if (loginForm) {
    const email = $("loginEmail");
    const pass = $("loginPassword");
    const remember = $("rememberMe");
    const status = $("loginStatus");
    const btn = loginForm.querySelector(".auth-cta");

    const fresh = session.get(KEY_NEW);
    const saved = local.get(KEY_REMEMBER);
    if (fresh) {
      email.value = fresh;
      session.remove(KEY_NEW);
      setStatus(status, "Account created! Sign in to continue.", "ok");
    } else if (saved) {
      email.value = saved;
      remember.checked = true;
    }

    $("forgotLink")?.addEventListener("click", () => {
      if (!validate(email, true)) {
        email.focus();
        setStatus(status, "Enter your email above, then tap “Forgot password?” again.", "info");
        return;
      }
      setStatus(status, `If an account exists for ${email.value.trim()}, a reset link is on its way.`, "ok");
    });

    $("demoFill")?.addEventListener("click", (e) => {
      email.value = "member@emeravita.com";
      pass.value = "Emeravita@123";
      validate(email);
      validate(pass);
      const b = e.currentTarget;
      b.classList.remove("is-filled");
      void b.offsetWidth;
      b.classList.add("is-filled");
      setStatus(status, "", "");
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      setStatus(status, "", "");
      const ok = [email, pass].map((i) => validate(i, true)).every(Boolean);
      if (!ok) { focusFirstInvalid(loginForm); return; }

      if (remember.checked) local.set(KEY_REMEMBER, email.value.trim());
      else local.remove(KEY_REMEMBER);

      setLoading(btn, true);
      // Replace with your real authentication request
      setTimeout(() => {
        setLoading(btn, false);
        btn.disabled = true;
        btn.classList.add("is-success");
        btn.querySelector(".cta-label").textContent = "Signed in";
        setStatus(status, "Welcome back! Taking you to your dashboard…", "ok");
        setTimeout(() => { window.location.href = "dashboard.html"; }, 900);
      }, 1300);
    });
  }

  /* ---------- SIGN-UP PAGE ---------- */
  const signupForm = $("signupForm");
  if (signupForm) {
    const terms = $("agreeTerms");
    const termsErr = $("agreeTermsErr");
    const status = $("signupStatus");
    const btn = signupForm.querySelector(".auth-cta");

    const checkTerms = () => {
      const ok = terms.checked;
      termsErr.textContent = ok ? "" : "Please accept the Terms & Conditions and Privacy Policy.";
      terms.setAttribute("aria-invalid", String(!ok));
      terms.closest(".check").classList.toggle("is-invalid", !ok);
      return ok;
    };
    terms.addEventListener("change", () => { if (termsErr.textContent) checkTerms(); });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      setStatus(status, "", "");
      const inputs = [...signupForm.querySelectorAll("[data-rule]")];
      const fieldsOk = inputs.map((i) => validate(i, true)).every(Boolean);
      const termsOk = checkTerms();
      if (!fieldsOk || !termsOk) { focusFirstInvalid(signupForm); return; }

      setLoading(btn, true);
      // Replace with your real registration request
      setTimeout(() => {
        setLoading(btn, false);
        btn.disabled = true;
        btn.classList.add("is-success");
        btn.querySelector(".cta-label").textContent = "Account created";
        setStatus(status, "Welcome to Emeravita! Redirecting you to sign in…", "ok");
        session.set(KEY_NEW, $("signupEmail").value.trim());
        setTimeout(() => { window.location.href = "login.html"; }, 1200);
      }, 1400);
    });
  }
})();