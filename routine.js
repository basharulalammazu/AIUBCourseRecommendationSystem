let scheduleData = [];

document
  .getElementById("fileInput")
  .addEventListener("change", handleFileUpload);

function handleFileUpload(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    // Store the extracted course schedule data
    scheduleData = json.map((row) => ({
      course: row["Course Code"] || row["Course"], // adjust based on column headers
      section: row["Section"],
      day: row["Day"],
      start: row["Start Time"],
      end: row["End Time"],
    }));

    alert("File uploaded and data loaded!");
  };

  reader.readAsArrayBuffer(file);
}

function generateRoutine() {
  const courses = document
    .getElementById("courseInput")
    .value.split(",")
    .map((c) => c.trim().toUpperCase());
  const days = parseInt(document.getElementById("daysCount").value);
  const container = document.getElementById("routineContainer");
  container.innerHTML = "";

  if (!courses.length || isNaN(days)) {
    alert("Please enter course names and day count.");
    return;
  }

  const filtered = scheduleData.filter((entry) =>
    courses.includes(entry.course)
  );
  const grouped = {};

  // Group by course name
  filtered.forEach((entry) => {
    if (!grouped[entry.course]) grouped[entry.course] = [];
    grouped[entry.course].push(entry);
  });

  // Recursive backtracking to generate combinations without conflicts
  const routines = [];
  function backtrack(path = [], index = 0) {
    if (index === courses.length) {
      routines.push([...path]);
      return;
    }

    const course = courses[index];
    for (const option of grouped[course] || []) {
      if (!hasConflict(path, option)) {
        path.push(option);
        backtrack(path, index + 1);
        path.pop();
      }
    }
  }

  function hasConflict(path, candidate) {
    return path.some(
      (p) =>
        p.day === candidate.day &&
        p.start < candidate.end &&
        p.end > candidate.start
    );
  }

  backtrack();

  // Filter routines based on day count
  const filteredRoutines = routines.filter((r) => {
    const uniqueDays = new Set(r.map((x) => x.day));
    return uniqueDays.size <= days;
  });

  if (!filteredRoutines.length) {
    container.innerHTML =
      "<p>No routines possible with the current constraints.</p>";
    return;
  }

  filteredRoutines.forEach((routine, i) => {
    const div = document.createElement("div");
    div.className = "routine";
    div.innerHTML =
      `<h4>Routine ${i + 1}</h4>` +
      routine
        .map(
          (c) =>
            `<p>${c.course} - Section ${c.section} - ${c.day} (${c.start} to ${c.end})</p>`
        )
        .join("");
    container.appendChild(div);
  });
}
