// Lightweight global modal module: injects styles & markup and exposes AppModal API
(function () {
  if (window.AppModal) return; // already loaded

  // Inject styles
  const css = `
  .app-modal-root { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; z-index: 99999; }
  .app-modal-root.open { display: flex; }
  .app-modal-backdrop { position: absolute; inset: 0; background: rgba(2,6,23,0.5); backdrop-filter: blur(2px); }
  .app-modal-panel { position: relative; z-index: 2; width: min(680px, calc(100% - 40px)); border-radius: 12px; padding: 18px; box-shadow: 0 18px 40px rgba(2,8,23,0.6); background: linear-gradient(180deg,#ffffff,#fbfdff); color:#02203a; transform: translateY(12px) scale(0.995); opacity:0; transition: transform 220ms ease, opacity 180ms ease; }
  .app-modal-root.open .app-modal-panel { transform: translateY(0) scale(1); opacity:1; }
  .app-modal-title { margin:0 0 8px; font-size:1.05rem; }
  .app-modal-message { font-size:0.95rem; line-height:1.4; color:inherit; }
  .app-modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:16px; }
  .app-modal-btn { padding:8px 12px; border-radius:8px; cursor:pointer; border:1px solid rgba(0,0,0,0.06); background:#f1f5f9; }
  .app-modal-btn.primary { background:#0078d4; color:white; border:none; }
  .app-modal-close { position:absolute; right:10px; top:8px; background:transparent; border:none; font-size:1rem; cursor:pointer; }
  /* Dark mode */
  body.dark .app-modal-panel { background: linear-gradient(180deg,#061524,#03121a); color:#e6f6ff; box-shadow: 0 18px 40px rgba(0,0,0,0.7); }
  body.dark .app-modal-btn { background:#0f1724; color:#e6f6ff; border-color: rgba(255,255,255,0.04); }
  body.dark .app-modal-btn.primary { background:#1890ff; }
  @media (max-width:420px){ .app-modal-panel{ padding:14px; border-radius:10px; } }
  `;
  const style = document.createElement("style");
  style.setAttribute("data-generated", "app-modal-styles");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // Markup
  const root = document.createElement("div");
  root.className = "app-modal-root";
  root.innerHTML = `
    <div class="app-modal-backdrop" tabindex="-1"></div>
    <div class="app-modal-panel" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
      <button class="app-modal-close" aria-label="Close">✕</button>
      <h3 id="app-modal-title" class="app-modal-title">Message</h3>
      <div class="app-modal-message" id="app-modal-message"></div>
      <div class="app-modal-actions" id="app-modal-actions"></div>
    </div>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector(".app-modal-panel");
  const backdrop = root.querySelector(".app-modal-backdrop");
  const titleEl = root.querySelector("#app-modal-title");
  const msgEl = root.querySelector("#app-modal-message");
  const actionsEl = root.querySelector("#app-modal-actions");
  const closeBtn = root.querySelector(".app-modal-close");

  let resolveCurrent = null;
  let lastFocused = null;

  function trapFocus(e) {
    const focusable = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === "Escape") {
      // resolve false for confirm-like interactions
      if (resolveCurrent) {
        const r = resolveCurrent;
        resolveCurrent = null;
        hide();
        r(false);
      } else {
        hide();
      }
    }
  }

  function show(opts) {
    // opts: { title, message (html ok), buttons: [{label, value, className, autofocus}], onClose }
    lastFocused = document.activeElement;
    titleEl.textContent = opts.title || "Message";
    if (typeof opts.message === "string") msgEl.innerHTML = opts.message;
    else if (opts.message instanceof Node) {
      msgEl.innerHTML = "";
      msgEl.appendChild(opts.message);
    }
    actionsEl.innerHTML = "";

    const buttons =
      opts.buttons && opts.buttons.length
        ? opts.buttons
        : [{ label: "OK", value: true, className: "primary", autofocus: true }];

    buttons.forEach((b, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "app-modal-btn " + (b.className || "");
      btn.innerHTML = b.label || "OK";
      btn.dataset.value = typeof b.value === "undefined" ? b.label : b.value;
      btn.addEventListener("click", () => {
        const val =
          btn.dataset.value === "true"
            ? true
            : btn.dataset.value === "false"
            ? false
            : btn.dataset.value;
        if (resolveCurrent) {
          const r = resolveCurrent;
          resolveCurrent = null;
          hide();
          r(val);
        } else {
          hide();
        }
        if (typeof b.onClick === "function") b.onClick(val);
      });
      actionsEl.appendChild(btn);
      // autofocus on designated button after next paint
      if (b.autofocus) {
        requestAnimationFrame(() => requestAnimationFrame(() => btn.focus()));
      }
    });

    // show
    root.classList.add("open");
    document.addEventListener("keydown", trapFocus);
    backdrop.addEventListener("click", backdropClick);
    closeBtn.addEventListener("click", closeClick);
  }

  function backdropClick() {
    // treat as cancel if confirm was used
    if (resolveCurrent) {
      const r = resolveCurrent;
      resolveCurrent = null;
      hide();
      r(false);
    } else {
      hide();
    }
  }
  function closeClick() {
    backdropClick();
  }

  function hide() {
    root.classList.remove("open");
    document.removeEventListener("keydown", trapFocus);
    backdrop.removeEventListener("click", backdropClick);
    closeBtn.removeEventListener("click", closeClick);
    // restore focus
    if (lastFocused && typeof lastFocused.focus === "function")
      lastFocused.focus();
  }

  // Public API
  const AppModal = {
    alert(title, message) {
      return new Promise((resolve) => {
        resolveCurrent = resolve;
        show({
          title,
          message,
          buttons: [
            { label: "OK", value: true, className: "primary", autofocus: true },
          ],
        });
      });
    },
    confirm(title, message, opts) {
      // opts.buttons allows customizing labels/values. Default: Cancel/OK
      return new Promise((resolve) => {
        resolveCurrent = resolve;
        let buttons = [
          { label: "Cancel", value: false, className: "", autofocus: false },
          { label: "OK", value: true, className: "primary", autofocus: true },
        ];
        if (opts && Array.isArray(opts.buttons) && opts.buttons.length)
          buttons = opts.buttons;
        show({ title, message, buttons });
      });
    },
    show(options) {
      // generic
      return new Promise((resolve) => {
        resolveCurrent = resolve;
        show(options || {});
      });
    },
  };

  window.AppModal = AppModal;
})();
