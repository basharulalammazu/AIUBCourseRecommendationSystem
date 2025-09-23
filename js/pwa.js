// Register service worker & handle install prompt
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("[PWA] SW registered", reg.scope))
      .catch((err) => console.warn("[PWA] SW registration failed", err));
  });
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show any dedicated install button inside modal
  const btn = document.getElementById("installAppBtn");
  if (btn) btn.style.display = "inline-flex";
  // Dispatch custom event so other parts (e.g., download section shortcut) can react
  window.dispatchEvent(new CustomEvent("pwa-install-available"));
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
  // Provide subtle feedback (non-blocking)
  try {
    if (navigator.vibrate) navigator.vibrate(30);
  } catch (_) {}
});

// Expose function globally for inline scripts
window.triggerInstallPrompt = triggerInstallPrompt;

// Helper: detect standalone mode and add a class for conditional UI styling / logic
function updateDisplayModeClass() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone;
  document.documentElement.classList.toggle("pwa-installed", !!isStandalone);
}
updateDisplayModeClass();
window
  .matchMedia("(display-mode: standalone)")
  .addEventListener("change", updateDisplayModeClass);
