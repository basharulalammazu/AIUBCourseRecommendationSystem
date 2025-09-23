// PWA registration & Install prompt handling + Settings Modal utilities
let swRegistration = null;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        swRegistration = reg;
        window.__latestSWReg = reg; // used by settings modal logic
        console.log("[PWA] SW registered", reg.scope);
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          console.log("[PWA] Update found, installing...");
          newWorker &&
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  showUpdateToast();
                  if (window.__refreshSWStatus) window.__refreshSWStatus();
                }
              }
            });
        });
      })
      .catch((err) => console.warn("[PWA] SW registration failed", err));
  });
}

function showUpdateToast() {
  if (document.getElementById("swUpdateToast")) return;
  const toast = document.createElement("div");
  toast.id = "swUpdateToast";
  toast.style.position = "fixed";
  toast.style.bottom = "1rem";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#0f172a";
  toast.style.color = "#f1f5f9";
  toast.style.padding = "10px 16px";
  toast.style.border = "1px solid #38bdf8";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "1000";
  toast.style.fontSize = "0.9rem";
  toast.textContent = "New version available";
  const btn = document.createElement("button");
  btn.textContent = "Reload";
  btn.style.marginLeft = "12px";
  btn.style.padding = "4px 10px";
  btn.style.cursor = "pointer";
  btn.onclick = () => activateUpdate();
  toast.appendChild(btn);
  document.body.appendChild(toast);
}

function activateUpdate() {
  if (!swRegistration || !swRegistration.waiting) {
    // Try to find waiting manually
    if (swRegistration && swRegistration.installing) {
      swRegistration.installing.postMessage("SKIP_WAITING");
    }
  } else {
    swRegistration.waiting.postMessage("SKIP_WAITING");
  }
  setTimeout(() => window.location.reload(), 500);
}

function checkForUpdates() {
  if (!swRegistration) return;
  swRegistration.update().then(() => {
    console.log("[PWA] Manual update check triggered");
    if (window.__refreshSWStatus) window.__refreshSWStatus();
  });
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("installAppBtn");
  if (btn) btn.style.display = "inline-flex";
});

function triggerInstallPrompt() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    const btn = document.getElementById("installAppBtn");
    if (btn) btn.style.display = "none";
  });
}

window.addEventListener("appinstalled", () => {
  console.log("[PWA] App installed");
  const btn = document.getElementById("installAppBtn");
  if (btn) btn.style.display = "none";
});

// ================= Settings Modal & Maintenance Functions =================
(() => {
  const g = window;
  let settingsInitialized = false;
  let lastStatusCheck = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function detectDisplayMode() {
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    )
      return "standalone";
    if (window.navigator.standalone) return "standalone (iOS)";
    return "browser";
  }

  async function refreshSWStatus() {
    const now = Date.now();
    if (now - lastStatusCheck < 1000) return; // throttle rapid calls
    lastStatusCheck = now;
    const el = byId("swStatusDisplay");
    const applyBtn = byId("applyUpdateBtn");
    if (!el) return;
    if (!("serviceWorker" in navigator)) {
      el.textContent = "unsupported";
      return;
    }
    const reg = g.__latestSWReg;
    if (!reg) {
      el.textContent = "registering...";
      if (applyBtn) applyBtn.style.display = "none";
      return;
    }
    let state = "active";
    if (reg.waiting) state = "update ready";
    else if (reg.installing) state = "installing";
    else if (!reg.active) state = "pending";
    el.textContent = state;
    if (applyBtn)
      applyBtn.style.display = reg.waiting ? "inline-block" : "none";
  }

  function populateStaticInfo() {
    const vEl = byId("appVersionDisplay");
    const dEl = byId("displayModeDisplay");
    if (vEl) {
      const meta = document.querySelector('meta[name="app-version"]');
      const ver = meta ? meta.getAttribute("content") : "dev";
      vEl.textContent = ver;
      // update changelog link text if present
      const changeLink = document.querySelector(".changelog-link");
      if (changeLink) {
        changeLink.textContent = `View changelog (v${ver}) ↗`;
      }
    }
    if (dEl) {
      dEl.textContent = detectDisplayMode();
    }
  }

  function openSettingsModal() {
    const modal = byId("settingsModal");
    if (!modal) {
      console.warn("Settings modal missing on this page");
      return;
    }
    modal.style.display = "flex";
    populateStaticInfo();
    // offline/online toggle for changelog external vs local
    const isOnline = navigator.onLine;
    const linkEl = document.querySelector(".changelog-link");
    if (linkEl) {
      if (isOnline) {
        linkEl.href =
          "https://github.com/basharulalammazu/AIUB-Offered-Courses/releases";
      } else {
        linkEl.href = "changelog.html";
      }
      linkEl.style.opacity = isOnline ? "1" : ".85";
      linkEl.title = isOnline
        ? "View latest releases on GitHub"
        : "Offline copy";
    }
    refreshSWStatus();
    if (!settingsInitialized) {
      settingsInitialized = true;
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (!reg) return;
          ["installing", "waiting", "active"].forEach((k) => {
            if (reg[k]) reg[k].addEventListener("statechange", refreshSWStatus);
          });
          reg.addEventListener("updatefound", refreshSWStatus);
        });
      }
    }
  }

  function closeSettingsModal() {
    const modal = byId("settingsModal");
    if (modal) modal.style.display = "none";
  }

  async function clearAppCaches() {
    if (!("caches" in window)) {
      alert("Cache API not supported");
      return;
    }
    if (!confirm("Delete all application caches?")) return;
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      alert("Caches cleared. Assets will re-cache on next load.");
      refreshSWStatus();
    } catch (e) {
      console.error(e);
      alert("Failed to clear caches: " + e.message);
    }
  }

  async function resetAllData() {
    if (
      !confirm(
        "This will clear caches, local & session storage, then reload. Continue?"
      )
    )
      return;
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Reset error", e);
    }
    setTimeout(() => location.reload(), 350);
  }

  if (typeof g.checkForUpdates !== "function") {
    g.checkForUpdates = function () {
      if (g.__latestSWReg) {
        g.__latestSWReg.update().then(refreshSWStatus);
      } else if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((r) => {
          g.__latestSWReg = r;
          if (r) r.update().then(refreshSWStatus);
        });
      }
    };
  }
  if (typeof g.activateUpdate !== "function") {
    g.activateUpdate = function () {
      const reg = g.__latestSWReg;
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      setTimeout(() => location.reload(), 400);
    };
  }

  g.openSettingsModal = openSettingsModal;
  g.closeSettingsModal = closeSettingsModal;
  g.clearAppCaches = clearAppCaches;
  g.resetAllData = resetAllData;
  g.__refreshSWStatus = refreshSWStatus;
})();
