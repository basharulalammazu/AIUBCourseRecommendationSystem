const deptSelect = document.getElementById("deptSelect");
const courseInputs = document.getElementById("courseInputs");
const completedInput = document.getElementById("completed");
const searchNameInput = document.getElementById("searchName");
const coursesDiv = document.getElementById("courses");

let currentCourses = [];

// Courses load from json file
deptSelect.addEventListener("change", () => {
  const dept = deptSelect.value;
  if (dept) {
    courseInputs.classList.remove("hidden");
    fetch(`courses_${dept}.json`)
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

completedInput.addEventListener("input", displayAvailableCourses);
searchNameInput.addEventListener("input", displayAvailableCourses);

// Clear searchId when completedInput is clicked
completedInput.addEventListener("click", () => {
  searchNameInput.value = "";
  displayAvailableCourses();
});

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
  const searchId = parseInt(searchNameInput.value.trim());
  coursesDiv.innerHTML = "";

  // Loop through courses and display available ones
  currentCourses.forEach((course) => {
    const hasAllPrereqs = course.prerequisites.every((pr) =>
      completedSet.has(pr)
    );
    const matchSearch = isNaN(searchId) || course.id === searchId;

    // Show only available courses (prerequisites completed and not completed yet)
    if (!completedSet.has(course.id) && hasAllPrereqs) {
      if (isNaN(searchId) || matchSearch) {
        addAvailableCourse(course, true);
      }
    }
  });
}

function addAvailableCourse(course, eligible) {
  const div = document.createElement("div");
  div.className = `course ${eligible ? "eligible" : "ineligible"}`;
  div.innerHTML = `
      <strong>[${course.id}] ${course.name}</strong><br>
      Credit: ${course.credit}<br>
      Prerequisites: ${
        course.prerequisites.length ? course.prerequisites.join(", ") : "None"
      }<br>
      Status: ${eligible ? "✅ Available" : "❌ Not Available"}
    `;
  coursesDiv.appendChild(div);
}
