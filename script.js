const deptSelect = document.getElementById("deptSelect");
const offerCoursesBtn = document.getElementById("offerCoursesBtn");
const routineGeneratorBtn = document.getElementById("routineGeneratorBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// ✅ Add this line to target the dev section
const devSection = document.getElementById("dev-section");

console.log("Screen width:", window.innerWidth);
window.addEventListener("resize", () => {
  console.log("Resized screen width:", window.innerWidth);
});

deptSelect.addEventListener("change", () => {
  const dept = deptSelect.value.trim();
  if (!dept) {
    offerCoursesBtn.classList.add('disabled');
    offerCoursesBtn.setAttribute('aria-disabled','true');
    offerCoursesBtn.href = 'javascript:void(0)';
  } else {
    offerCoursesBtn.classList.remove('disabled');
    offerCoursesBtn.removeAttribute('aria-disabled');
    offerCoursesBtn.href = `offer_courses.html?dept=${dept}`;
  }
});

let currentCourses = [];

// Theme Toggle & Persistence
const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedTheme = localStorage.getItem('aiub-theme');
if (storedTheme === 'dark' || (!storedTheme && userPrefersDark)) {
  document.body.classList.add('dark');
  if(themeToggleBtn) themeToggleBtn.textContent = '☀️';
}

if(themeToggleBtn){
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('aiub-theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  });
}

// Footer Year
const yearEl = document.getElementById('year');
if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

// Intersection Observer for stagger fade-in (progressive enhancement)
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.style.animationPlayState = 'running'; observer.unobserve(e.target); }
  });
},{ threshold:0.15 });

document.querySelectorAll('.fade-in').forEach(el=>{
  // ensure animation only starts when visible
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});


