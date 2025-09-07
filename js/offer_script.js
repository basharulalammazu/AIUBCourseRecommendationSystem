const completedInput = document.getElementById("completed");
const searchNameInput = document.getElementById("searchName");
const coursesDiv = document.getElementById("courses");
const warningModal = document.getElementById("warningModal");
const confirmSelect = document.getElementById("confirmSelect");
const cancelSelect = document.getElementById("cancelSelect");
const closeModal = document.querySelector(".close");
// Theme handled via theme.js
// Filter buttons
const filterAllBtn = document.getElementById("filterAllBtn");
const filterAvailableBtn = document.getElementById("filterAvailableBtn");
const filterCompletedBtn = document.getElementById("filterCompletedBtn");

let currentFilter = "all"; // all | available | completed

// Local storage keys
const THEME_KEY = "aiub-theme";

let currentCourses = [];
let myPlan = []; // removed plan feature
let pendingCourse = null;

// Debug: Log script load
console.log("Offer script loaded");
console.log(
  "Warning modal initial display:",
  getComputedStyle(warningModal).display
);

// Modal event listeners
closeModal.onclick = () => {
  console.log("Close button clicked, hiding warning modal");
  warningModal.style.display = "none";
  pendingCourse = null;
};

cancelSelect.onclick = () => {
  console.log("Cancel button clicked, hiding warning modal");
  warningModal.style.display = "none";
  pendingCourse = null;
};

confirmSelect.onclick = () => {
  console.log(
    "Confirm button clicked, processing course:",
    pendingCourse ? pendingCourse.id : "none"
  );
  if (pendingCourse) {
    const currentCompleted = completedInput.value.trim();
    const newCompleted = currentCompleted
      ? `${currentCompleted}, ${pendingCourse.id}`
      : `${pendingCourse.id}`;
    completedInput.value = newCompleted;
    displayAvailableCourses();
  }
  warningModal.style.display = "none";
  pendingCourse = null;
};

// Close modal when clicking outside
window.onclick = (event) => {
  if (event.target === warningModal) {
    console.log("Clicked outside modal, hiding warning modal");
    warningModal.style.display = "none";
    pendingCourse = null;
  }
};

// (Theme initialization removed – centralized)

// (My Plan removed)

// Get department from URL
const urlParams = new URLSearchParams(window.location.search);
const dept = urlParams.get("dept");

if (dept) {
  fetch(`course_managers/courses_${dept}.json`)
    .then((response) => response.json())
    .then((data) => {
      currentCourses = data;
      displayAvailableCourses();
    })
    .catch((error) => {
      console.error("Error loading course data:", error);
      coursesDiv.innerHTML =
        "<p style='color:red;'>Failed to load courses.</p>";
    });
} else {
  coursesDiv.innerHTML = "<p style='color:red;'>No department selected.</p>";
}

// Clear searchName input when clicking on completed input
completedInput.addEventListener("click", () => {
  searchNameInput.value = "";
  displayAvailableCourses();
});

completedInput.addEventListener("input", displayAvailableCourses);
searchNameInput.addEventListener("input", displayAvailableCourses);

function parseCompletedCourses(input) {
  const parts = input.split(",");
  const completed = new Set();
  for (const part of parts) {
    const range = part.trim().split("-").map(Number);
    if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
      for (let i = range[0]; i <= range[1]; i++) {
        completed.add(i);
      }
    } else {
      const num = parseInt(part.trim());
      if (!isNaN(num)) completed.add(num);
    }
  }
  return completed;
}

function displayAvailableCourses() {
  const completedSet = parseCompletedCourses(completedInput.value);
  const searchTerm = searchNameInput.value.trim().toLowerCase();
  coursesDiv.innerHTML = "";

  // Calculate completed credits
  const completedCourses = currentCourses.filter((c) => completedSet.has(c.id));
  const completedCredits = completedCourses.reduce(
    (sum, c) => sum + c.credit,
    0
  );

  // Show total completed credits
  const creditInfo = document.createElement("div");
  creditInfo.innerHTML = `<h4>Total Completed Credits: ${completedCredits}</h4><br>`;
  coursesDiv.appendChild(creditInfo);

  // Filter courses based on search
  const filteredCourses = currentCourses.filter((course) => {
    const nameMatches =
      !searchTerm || course.name.toLowerCase().includes(searchTerm);
    return nameMatches;
  });

  // Apply high-level filter
  const filteredByStatus = filteredCourses.filter((course) => {
    const isCompleted = completedSet.has(course.id);
    const hasAllPrereqs = course.prerequisites.every((pr) =>
      completedSet.has(pr)
    );
    const completedCredits = completedCourses.reduce(
      (sum, c) => sum + c.credit,
      0
    );
    let available = false;
    if (!isCompleted && hasAllPrereqs) {
      // Check required credits
      const hasRequiredCredits = course.requiredCredits
        ? completedCredits >= course.requiredCredits
        : true;
      // Special credit check rules
      if (!hasRequiredCredits) available = false;
      else if (
        course.name.toLowerCase().includes("internship") &&
        completedCredits < 140
      )
        available = false;
      else available = true;
    }

    if (currentFilter === "all") return true;
    if (currentFilter === "completed") return isCompleted;
    if (currentFilter === "available") return available;
    return true;
  });

  groupAndDisplayCourses(filteredByStatus, searchTerm, completedSet);
}

function groupAndDisplayCourses(courses, searchTerm, completedSet) {
  let electiveMap = {};

  if (dept === "CSE") {
    electiveMap = {
      0: "Core Courses",
      1: "Information Systems",
      2: "Software Engineering",
      3: "Computational Theory",
      4: "Computer Engineering",
    };
  } else if (dept === "EEE") {
    electiveMap = {
      0: "Core Courses",
      1: "Elective Courses",
    };
  } else if (dept === "ENGLISH") {
    electiveMap = {
      0: "Core Courses",
      1: "Linguistics & TESL",
      2: "Literature",
    };
  } else if (dept === "BBA") {
    electiveMap = {
      0: "Core Courses",
      1: "Accounting",
      2: "Business Analytics",
      3: "Business Economics (BECO)",
      4: "Finance (FIN)",
      5: "Human Resource Management (HRM)",
      6: "Innovation and Entrepreneurship Development (IED)",
      7: "International Business (IB)",
      8: "Investment Management (IM)",
      9: "Management (MGT)",
      10: "Management Information Systems (MIS)",
      11: "Marketing (MKT)",
      12: "Tourism and Hospitality Management (THM)",
      13: "Operations and Supply Chain Management (OSCM)",
    };
  } else if (dept === "IPE") {
    electiveMap = {
      0: "Core Courses",
      1: "Industrial Engineering",
      2: "System Engineering",
      3: "Production Engineering",
    };
  }

  const grouped = {};

  courses.forEach((course) => {
    const type = electiveMap[course.elective] || "Other";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(course);
  });

  for (const category in grouped) {
    const title = document.createElement("h3");
    title.textContent = category;
    coursesDiv.appendChild(title);

    grouped[category]
      .sort((a, b) => a.id - b.id)
      .forEach((course) => {
        addAvailableCourse(course, completedSet);
      });
  }
}

function addAvailableCourse(course, completedSet) {
  const isCompleted = completedSet.has(course.id);
  const hasAllPrereqs = course.prerequisites.every((pr) =>
    completedSet.has(pr)
  );
  const completedCredits = Array.from(completedSet).reduce((sum, id) => {
    const c = currentCourses.find((c) => c.id === id);
    return sum + (c ? c.credit : 0);
  }, 0);

  let status = "Available";
  let bgColor = "#e6ffe6"; // Green
  let clickable = true;

  if (isCompleted) {
    status = "Completed";
    bgColor = "#ffe6e6"; // Red
    clickable = true; // Allow toggling
  } else if (!hasAllPrereqs) {
    status = "Prerequisites not met";
    bgColor = "#fff3cd"; // Yellow
  } else if (
    course.requiredCredits &&
    completedCredits < course.requiredCredits
  ) {
    status = `Not enough credits (${completedCredits}/${course.requiredCredits})`;
    bgColor = "#fff3cd";
  } else if (
    course.name.toLowerCase().includes("internship") &&
    completedCredits < 140
  ) {
    status = "Not enough credits";
    bgColor = "#fff3cd";
  }

  const div = document.createElement("div");
  div.className = "course-card";
  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "8px";
  div.style.padding = "10px";
  div.style.margin = "10px 0";
  div.style.backgroundColor = bgColor;
  if (clickable) {
    div.style.cursor = "pointer";
  }

  div.innerHTML = `
    <strong style="font-size: 16px;">[${course.id}] ${course.name}</strong><br>
    <span><strong>Credit:</strong> ${course.credit}</span><br>
    <span><strong>Prerequisites:</strong> ${
      course.prerequisites.length ? course.prerequisites.join(", ") : "None"
    }</span><br>
    <span><strong>Status:</strong> ${status}</span>
  `;

  if (clickable) {
    div.addEventListener("click", () => {
      if (isCompleted) {
        // Remove the course from completed
        const currentCompleted = completedInput.value.trim();
        const ids = currentCompleted
          .split(",")
          .map((s) => s.trim())
          .filter((id) => id !== course.id.toString());
        const newCompleted = ids.join(", ");
        completedInput.value = newCompleted;
        displayAvailableCourses();
      } else if (
        !hasAllPrereqs ||
        (course.requiredCredits && completedCredits < course.requiredCredits)
      ) {
        // Show warning modal with prerequisite names and/or credit requirements
        console.log(
          "Prerequisites or credits not met for course:",
          course.id,
          "showing warning modal"
        );
        pendingCourse = course;
        let warningText = "";
        if (!hasAllPrereqs) {
          const missingPrereqs = course.prerequisites.filter(
            (pr) => !completedSet.has(pr)
          );
          const missingDetails = missingPrereqs.map((id) => {
            const pc = currentCourses.find((c) => c.id === id);
            return pc ? `[${id}] ${pc.name}` : id;
          });
          warningText += `This course requires the following prerequisites:<br><strong>${missingDetails.join(
            ", "
          )}</strong><br><br>`;
        }
        if (
          course.requiredCredits &&
          completedCredits < course.requiredCredits
        ) {
          warningText += `This course requires ${course.requiredCredits} completed credits. You currently have ${completedCredits} credits.<br><br>`;
        }
        warningText += "Are you sure you want to mark it as completed?";
        document.getElementById("warningMessage").innerHTML = warningText;
        warningModal.style.display = "flex";
      } else {
        // Add the course to completed
        const currentCompleted = completedInput.value.trim();
        const newCompleted = currentCompleted
          ? `${currentCompleted}, ${course.id}`
          : `${course.id}`;
        completedInput.value = newCompleted;
        displayAvailableCourses();
      }
    });
  }

  // (plan button removed)

  coursesDiv.appendChild(div);
}

// -------------- Filter Button Events --------------
function setFilter(filter) {
  currentFilter = filter;
  [filterAllBtn, filterAvailableBtn, filterCompletedBtn].forEach(
    (b) => b && b.classList.remove("filter-active")
  );
  if (filter === "all" && filterAllBtn)
    filterAllBtn.classList.add("filter-active");
  if (filter === "available" && filterAvailableBtn)
    filterAvailableBtn.classList.add("filter-active");
  if (filter === "completed" && filterCompletedBtn)
    filterCompletedBtn.classList.add("filter-active");
  displayAvailableCourses();
}

if (filterAllBtn)
  filterAllBtn.addEventListener("click", () => setFilter("all"));
if (filterAvailableBtn)
  filterAvailableBtn.addEventListener("click", () => setFilter("available"));
if (filterCompletedBtn)
  filterCompletedBtn.addEventListener("click", () => setFilter("completed"));

// (Plan management code removed)
