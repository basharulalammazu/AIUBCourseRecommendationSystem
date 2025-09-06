const completedInput = document.getElementById("completed");
const searchNameInput = document.getElementById("searchName");
const coursesDiv = document.getElementById("courses");
const warningModal = document.getElementById("warningModal");
const confirmSelect = document.getElementById("confirmSelect");
const cancelSelect = document.getElementById("cancelSelect");
const closeModal = document.querySelector(".close");

let currentCourses = [];
let pendingCourse = null;

// Modal event listeners
closeModal.onclick = () => {
  warningModal.style.display = "none";
  pendingCourse = null;
};

cancelSelect.onclick = () => {
  warningModal.style.display = "none";
  pendingCourse = null;
};

confirmSelect.onclick = () => {
  if (pendingCourse) {
    const currentCompleted = completedInput.value.trim();
    const newCompleted = currentCompleted ? `${currentCompleted}, ${pendingCourse.id}` : `${pendingCourse.id}`;
    completedInput.value = newCompleted;
    displayAvailableCourses();
  }
  warningModal.style.display = "none";
  pendingCourse = null;
};

// Close modal when clicking outside
window.onclick = (event) => {
  if (event.target === warningModal) {
    warningModal.style.display = "none";
    pendingCourse = null;
  }
};

// Get department from URL
const urlParams = new URLSearchParams(window.location.search);
const dept = urlParams.get('dept');

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
    const nameMatches = !searchTerm || course.name.toLowerCase().includes(searchTerm);
    return nameMatches;
  });

  groupAndDisplayCourses(filteredCourses, searchTerm, completedSet);
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
  const hasAllPrereqs = course.prerequisites.every((pr) => completedSet.has(pr));
  const completedCredits = Array.from(completedSet).reduce((sum, id) => {
    const c = currentCourses.find(c => c.id === id);
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
  } else if (course.id === 49 && completedCredits < 100) {
    status = "Not enough credits";
    bgColor = "#fff3cd";
  } else if (course.name.toLowerCase().includes("internship") && completedCredits < 140) {
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
        const ids = currentCompleted.split(",").map(s => s.trim()).filter(id => id !== course.id.toString());
        const newCompleted = ids.join(", ");
        completedInput.value = newCompleted;
        displayAvailableCourses();
      } else if (!hasAllPrereqs) {
        // Show warning modal with prerequisite names
        pendingCourse = course;
        const missingPrereqs = course.prerequisites.filter(pr => !completedSet.has(pr));
        const missingDetails = missingPrereqs.map(id => {
          const pc = currentCourses.find(c => c.id === id);
          return pc ? `[${id}] ${pc.name}` : id;
        });
        document.getElementById("warningMessage").innerHTML =
          `This course requires the following prerequisites:<br><strong>${missingDetails.join(', ')}</strong><br><br>Are you sure you want to mark it as completed?`;
        warningModal.style.display = "block";
      } else {
        // Add the course to completed
        const currentCompleted = completedInput.value.trim();
        const newCompleted = currentCompleted ? `${currentCompleted}, ${course.id}` : `${course.id}`;
        completedInput.value = newCompleted;
        displayAvailableCourses();
      }
    });
  }

  coursesDiv.appendChild(div);
}
