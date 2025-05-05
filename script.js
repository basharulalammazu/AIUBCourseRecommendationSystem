const deptSelect = document.getElementById("deptSelect");
const courseInputs = document.getElementById("courseInputs");
const completedInput = document.getElementById("completed");
const searchNameInput = document.getElementById("searchName");
const coursesDiv = document.getElementById("courses");

// ✅ Add this line to target the dev section
const devSection = document.getElementById("dev-section");

console.log("Screen width:", window.innerWidth);
window.addEventListener("resize", () => {
  console.log("Resized screen width:", window.innerWidth);
});

deptSelect.addEventListener("change", () => {
  if (deptSelect.value === "") {
    devSection.style.display = "block"; // Show when no dept is selected
    courseInputs.classList.add("hidden");
  } else {
    devSection.style.display = "none"; // Hide when a dept is selected
    courseInputs.classList.remove("hidden");
  }
});

let currentCourses = [];

deptSelect.addEventListener("change", () => {
  const dept = deptSelect.value;
  if (dept) {
    courseInputs.classList.remove("hidden");
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
    courseInputs.classList.add("hidden");
    coursesDiv.innerHTML = "";
  }
});

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

  if (completedSet.size === 0 && searchTerm == "") {
    // Show all courses if completed list is empty
    groupAndDisplayCourses(currentCourses, searchTerm, null);
    return;
  }

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

  const eligibleCourses = currentCourses.filter((course) => {
    const hasAllPrereqs = course.prerequisites.every((pr) =>
      completedSet.has(pr)
    );
    const isAlreadyCompleted = completedSet.has(course.id);
    const nameMatches =
      !searchTerm || course.name.toLowerCase().includes(searchTerm);

    if (isAlreadyCompleted || !hasAllPrereqs || !nameMatches) return false;

    if (course.id === 49 && completedCredits < 100) return false;

    if (
      course.name.toLowerCase().includes("internship") &&
      completedCredits < 140
    )
      return false;

    return true;
  });

  groupAndDisplayCourses(eligibleCourses, searchTerm, true);
}

function groupAndDisplayCourses(courses, searchTerm, eligible) {
  const dept = deptSelect.value;
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
  } else if (dept === "ENG") {
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
        addAvailableCourse(course, eligible);
      });
  }
}

function addAvailableCourse(course, eligible) {
  const div = document.createElement("div");
  div.className = "course-card";
  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "8px";
  div.style.padding = "10px";
  div.style.margin = "10px 0";
  div.style.backgroundColor = eligible ? "#e6ffe6" : "#ffe6e6"; // Green for eligible, red for not

  div.innerHTML = `
    <strong style="font-size: 16px;">[${course.id}] ${course.name}</strong><br>
    <span><strong>Credit:</strong> ${course.credit}</span><br>
    <span><strong>Prerequisites:</strong> ${
      course.prerequisites.length ? course.prerequisites.join(", ") : "None"
    }</span><br>
    <span><strong>Status:</strong> ${
      eligible ? "✅ Available" : "❌ Not Available"
    }</span>
  `;
  coursesDiv.appendChild(div);
}
