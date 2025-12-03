// Register service worker & handle install prompt
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        console.log("[PWA] SW registered", reg.scope);
        
        // Check for updates periodically
        setInterval(() => {
          reg.update();
        }, 60000); // Check every minute
        
        // Listen for version updates
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'VERSION_UPDATE') {
            handleVersionUpdate(event.data.version);
          }
        });
      })
      .catch((err) => console.warn("[PWA] SW registration failed", err));
  });
}

// Store current version in localStorage
const STORED_VERSION_KEY = 'app-version';

function handleVersionUpdate(newVersion) {
  const storedVersion = localStorage.getItem(STORED_VERSION_KEY);
  
  if (storedVersion && storedVersion !== newVersion) {
    // New version detected
    console.log(`[PWA] Version update: ${storedVersion} → ${newVersion}`);
    
    // Show update notification using AppModal if available, otherwise native
    const message = `🎉 New version available!<br><br>` +
                   `Current: <strong>${storedVersion}</strong><br>` +
                   `Latest: <strong>${newVersion}</strong><br><br>` +
                   `Reload to get the latest features and improvements.`;
    
    if (window.AppModal) {
      window.AppModal.confirm('Update Available', message, {
        buttons: [
          { label: 'Later', value: false, className: '' },
          { label: 'Reload Now', value: true, className: 'primary', autofocus: true }
        ]
      }).then(reload => {
        if (reload) {
          localStorage.setItem(STORED_VERSION_KEY, newVersion);
          window.location.reload();
        }
      });
    } else {
      if (confirm(`New version ${newVersion} available! Reload now?`)) {
        localStorage.setItem(STORED_VERSION_KEY, newVersion);
        window.location.reload();
      }
    }
  } else if (!storedVersion) {
    // First time, just store the version
    localStorage.setItem(STORED_VERSION_KEY, newVersion);
  }
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
