const themeToggleBtn = document.getElementById("themeToggleBtn");

// Theme Toggle & Persistence
const userPrefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;
const storedTheme = localStorage.getItem("aiub-theme");
if (storedTheme === "dark" || (!storedTheme && userPrefersDark)) {
  document.body.classList.add("dark");
  if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("aiub-theme", isDark ? "dark" : "light");
    themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
    swapFavicon(isDark);
  });
}

// ----------------- Dynamic Icon Theming -----------------
function ensureFaviconTags() {
  if (!document.querySelector('link[id="app-favicon"]')) {
    const link = document.createElement("link");
    link.id = "app-favicon";
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[id="app-maskable"]')) {
    const link = document.createElement("link");
    link.id = "app-maskable";
    link.rel = "icon";
    link.type = "image/png";
    link.setAttribute("purpose", "maskable");
    document.head.appendChild(link);
  }
}

function swapFavicon(isDark) {
  try {
    ensureFaviconTags();
    const fav = document.getElementById("app-favicon");
    const mask = document.getElementById("app-maskable");
    // Expect icons/icon-192.png (light) & icons/icon-192-dark.png (dark) etc.
    const base = isDark ? "icons/icon-192-dark.png" : "icons/icon-192.png";
    const maskable = isDark
      ? "icons/maskable-512-dark.png"
      : "icons/maskable-512.png";
    if (fav) fav.href = base;
    if (mask) mask.href = maskable;
  } catch (e) {
    console.warn("[Icons] swap failed", e);
  }
}

// Initial icon set on load
swapFavicon(document.body.classList.contains("dark"));
