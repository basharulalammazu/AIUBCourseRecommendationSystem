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
  });
}
