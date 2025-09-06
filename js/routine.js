// ---- Theme Initialization (shared pattern) ----
const themeToggleBtn = document.getElementById("themeToggleBtn");
(function initTheme() {
  const stored = localStorage.getItem("aiub-theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && prefersDark)) {
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
})();

function showSpinner() {
  document.getElementById("loadingSpinner").style.display = "block";
}
function hideSpinner() {
  document.getElementById("loadingSpinner").style.display = "none";
}

let scheduleData = [];

document
  .getElementById("fileInput")
  .addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "xlsx") {
      handleExcel(file);
    } else if (ext === "pdf") {
      handlePDF(file);
    } else {
      alert("Unsupported file type");
    }
  });

function parseTableFormat(lines) {
  const parsed = [];

  console.log("Processing lines:", lines); // Debug log

  // Concatenate all lines into one big text
  const fullText = lines.join(" ");

  // Parse the full text
  const spaceParsed = parseSpaceSeparatedFormat(fullText);
  parsed.push(...spaceParsed);

  console.log("Parsed data from space format:", parsed); // Debug log
  return parsed;
}

function parseSpaceSeparatedFormat(text) {
  const parsed = [];

  // Split by multiple spaces and filter out empty strings
  const parts = text.split(/\s+/).filter((part) => part.trim() !== "");
  console.log("Space separated parts:", parts.slice(0, 50)); // debug

  // Find the start of actual course data (after "ROOM")
  let startIndex = 0;
  const roomIndex = parts.indexOf("ROOM");
  if (roomIndex !== -1) {
    startIndex = roomIndex + 1;
  }

  for (let i = startIndex; i < parts.length - 7; i++) {
    // Detect course row (5-digit CODE)
    if (/^\d{5}$/.test(parts[i])) {
      const code = parts[i];
      const courseId = parts[i + 1];

      // Collect course title until we hit a single letter (section)
      let courseName = "";
      let sectionIndex = i + 2;
      while (
        sectionIndex < parts.length &&
        !/^[A-Z]$/.test(parts[sectionIndex])
      ) {
        if (sectionIndex > i + 2) courseName += " ";
        courseName += parts[sectionIndex];
        sectionIndex++;
      }

      if (sectionIndex < parts.length - 5) {
        const section = parts[sectionIndex];
        let timeStart = parts[sectionIndex + 1];
        let timeEnd, day, room;

        // Sometimes TIME is formatted as "8:0-9:30"
        if (parts[sectionIndex + 2] === "-") {
          timeEnd = parts[sectionIndex + 3];
          day = parts[sectionIndex + 4];
          room = parts[sectionIndex + 5];
        } else if (parts[sectionIndex + 1].includes("-")) {
          const [s, e] = parts[sectionIndex + 1].split("-");
          timeStart = s;
          timeEnd = e;
          day = parts[sectionIndex + 2];
          room = parts[sectionIndex + 3];
        } else {
          timeEnd = parts[sectionIndex + 2];
          day = parts[sectionIndex + 3];
          room = parts[sectionIndex + 4];
        }

        const entry = {
          "Course Title": courseName.trim(),
          "Course ID": courseId,
          CODE: code,
          Section: section,
          times: [
            {
              day: day,
              startRaw: timeStart.includes(":") ? timeStart : timeStart + ":00",
              endRaw: timeEnd.includes(":") ? timeEnd : timeEnd + ":00",
              start: convertTo24Hour(timeStart + ":00"),
              end: convertTo24Hour(timeEnd + ":00"),
              room: room,
            },
          ],
        };

        // ✅ Check for LABORATORY immediately after lecture tokens
        let j = sectionIndex + 6;
        if (
          j < parts.length &&
          parts[j].toUpperCase().startsWith("LABORATORY")
        ) {
          let labStart = parts[j + 1] || "";
          let labEnd, labDay, labRoom;

          if (parts[j + 2] === "-") {
            labEnd = parts[j + 3];
            labDay = parts[j + 4];
            labRoom = parts[j + 5];
            j += 6;
          } else if (parts[j + 1].includes("-")) {
            const [ls, le] = parts[j + 1].split("-");
            labStart = ls;
            labEnd = le;
            labDay = parts[j + 2];
            labRoom = parts[j + 3];
            j += 4;
          } else {
            labEnd = parts[j + 2];
            labDay = parts[j + 3];
            labRoom = parts[j + 4];
            j += 5;
          }

          entry.times.push({
            day: labDay,
            startRaw: labStart.includes(":") ? labStart : labStart + ":00",
            endRaw: labEnd.includes(":") ? labEnd : labEnd + ":00",
            start: convertTo24Hour(labStart + ":00"),
            end: convertTo24Hour(labEnd + ":00"),
            room: labRoom,
          });

          i = j; // skip past lab tokens
        } else {
          i = sectionIndex + 5;
        }

        parsed.push(entry);
      }
    }
  }

  console.log("Parsed " + parsed.length + " courses (lectures + labs).");
  return parsed;
}

function convertTo24Hour(time) {
  if (!time) return 0;
  const cleaned = time.trim();
  const parts = cleaned.split(/\s+/); // may contain AM/PM as separate token
  let timePart = parts[0];
  let modifier = parts[1] ? parts[1].toLowerCase() : null;
  // Drop trailing seconds if present (HH:MM:SS)
  const hm = timePart.split(":");
  let hours = parseInt(hm[0], 10);
  let minutes = parseInt(hm[1] || "0", 10);
  if (modifier === "pm" && hours < 12) hours += 12;
  if (modifier === "am" && hours === 12) hours = 0;
  if (!modifier) {
    // Heuristic: schedule uses 1,2,3,4,5,6 for afternoon/evening (13-18)
    if (hours >= 1 && hours <= 6) hours += 12; // treat as 13..18
  }
  return hours + minutes / 60;
}

// Helper to normalize course titles by removing bracketed qualifiers like [FST/FE]
function removeBrackets(title) {
  if (!title || typeof title !== "string") return title;
  return title
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function handleExcel(file) {
  showSpinner();
  const reader = new FileReader();
  reader.onload = function (e) {
    const workbook = XLSX.read(e.target.result, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    // Filter out Freshman status rows
    const filtered = json.filter((row) => {
      const statusVal = (row["Status"] || row["STATUS"] || "")
        .toString()
        .trim()
        .toLowerCase();
      return statusVal !== "freshman";
    });
    if (filtered.length !== json.length) {
      console.log(
        `Filtered out ${
          json.length - filtered.length
        } Freshman rows from Excel input.`
      );
    }
    // Detect format type
    // Format A (old): columns COURSE / SEC / TIME / DAY / ROOM
    // Format B (new sample): Class ID, Course Code, Status, Capacity, Count, Course Title, Section, Faculty, Type, Day, Start Time, End Time, Room, Department
    function normalizeDay(d) {
      if (!d) return d;
      const dl = d.toString().trim().toLowerCase();
      if (dl.startsWith("sun")) return "SUN";
      if (dl.startsWith("mon")) return "MON";
      if (dl.startsWith("tue")) return "TUE";
      if (dl.startsWith("wed")) return "WED";
      if (dl.startsWith("thu")) return "THU";
      if (dl.startsWith("fri")) return "FRI";
      if (dl.startsWith("sat")) return "SAT";
      return d; // already maybe S/M/T etc.
    }

    const converted = filtered.map((row) => {
      const hasNewHeaders =
        Object.prototype.hasOwnProperty.call(row, "Course Title") &&
        Object.prototype.hasOwnProperty.call(row, "Start Time");
      if (hasNewHeaders) {
        const rawTitle =
          row["Course Title"] || row["COURSE"] || row["Course"] || "";
        const section = row["Section"] || row["SEC"] || "";
        const title =
          rawTitle.length > 4
            ? rawTitle.slice(0, -(section.length + 2)).trim()
            : rawTitle; // remove last 4 chars
        const dayRaw = row["Day"] || row["DAY"] || "";
        const day = normalizeDay(dayRaw);
        const startRaw = (row["Start Time"] || "").toString().trim();
        const endRaw = (row["End Time"] || "").toString().trim();
        return {
          "Course Title": title,
          "Course ID": row["Course ID"] || row["Class ID"] || "",
          CODE: row["Course Code"] || row["CODE"] || "",
          Section: section,
          Day: day,
          Room: row["Room"] || row["ROOM"] || "",
          times: [
            {
              day: day,
              startRaw: startRaw,
              endRaw: endRaw,
              start: convertTo24Hour(startRaw),
              end: convertTo24Hour(endRaw),
              room: row["Room"] || row["ROOM"] || "",
            },
          ],
        };
      } else {
        // Fallback to old format
        const time = row["TIME"] || "";
        const start = time.includes("-") ? time.split("-")[0].trim() : "";
        const end = time.includes("-") ? time.split("-")[1].trim() : "";
        const startRaw = start ? start + ":00" : "";
        const endRaw = end ? end + ":00" : "";
        return {
          "Course Title": (function () {
            const rt = row["COURSE"] || row["Course"] || "";
            return rt.length > 4 ? rt.slice(0, -4).trim() : rt;
          })(),
          "Course ID": row["Course ID"] || "",
          CODE: row["CODE"] || "",
          Section: row["SEC"] || "",
          Day: row["DAY"] || "",
          Room: row["ROOM"] || "",
          times: [
            {
              day: row["DAY"] || "",
              startRaw: startRaw,
              endRaw: endRaw,
              start: convertTo24Hour(startRaw),
              end: convertTo24Hour(endRaw),
              room: row["ROOM"] || "",
            },
          ],
        };
      }
    });

    console.log("Converted Excel rows:", converted);
    parseRows(converted);
    hideSpinner();
  };
  reader.readAsBinaryString(file);
}

async function handlePDF(file) {
  showSpinner();
  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str).join(" ");
      text += strings + "\n";
    }

    console.log("Extracted PDF text:", text.substring(0, 200) + "..."); // Debug log (truncated)

    const lines = text.split("\n").filter((line) => line.trim() !== "");

    const parsed = parseTableFormat(lines);
    console.log("Parsed data:", parsed); // Debug log

    parseRows(parsed);
    hideSpinner();
  };
  reader.readAsArrayBuffer(file);
}

function updateCourseDropdown() {
  console.log("Updating course dropdown with data:", scheduleData); // Debug log

  const uniqueTitles = [...new Set(scheduleData.map((item) => item.title))];

  console.log("Unique course titles:", uniqueTitles); // Debug log

  const multiSelect = document.getElementById("courseMultiSelect");
  multiSelect.innerHTML = "";

  if (uniqueTitles.length === 0) {
    alert(
      "No courses found in the uploaded file. Please check the file format."
    );
    return;
  }

  uniqueTitles.forEach((title) => {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;
    multiSelect.appendChild(option);
  });

  setTimeout(() => {
    $("#courseMultiSelect").select2({
      placeholder: "Search and select courses",
      width: "resolve",
    });
  }, 0);

  alert(
    `File uploaded successfully! Found ${uniqueTitles.length} unique courses.`
  );
  // Reveal hidden selection & generate button
  showSelectionControls();
}
function showSelectionControls() {
  const courseLabel = document.querySelector('label[for="courseMultiSelect"]');
  const selectEl = document.getElementById("courseMultiSelect");
  const genBtn = document.getElementById("generateBtn");
  [courseLabel, selectEl, genBtn].forEach((el) => {
    if (el) {
      el.classList.remove("hidden");
    }
  });
}

function parseRows(rows) {
  console.log("parseRows input:", rows); // Debug log

  const grouped = {}; // key: title__section -> {title, section, times: [...]} (times already expanded below)

  function expandCompositeDays(day) {
    if (!day) return [];
    const d = day.trim();
    if (d === "ST") return ["S", "T"];
    if (d === "MW") return ["M", "W"];
    if (d === "TH") return ["TH"]; // Thursday single token
    // Sometimes single letter already
    return [d];
  }

  rows.forEach((row) => {
    // Preserve bracket qualifiers (e.g., [FBA/FASS] vs [FST/FE]) so they are distinct courses
    const title = (row["Course Title"] || "").trim();
    const section = row["Section"] || "A";
    const key = `${title}__${section}`;
    const originalTimes = row.times || [];
    const expandedTimes = [];
    originalTimes.forEach((t) => {
      const days = expandCompositeDays(t.day);
      days.forEach((singleDay) => {
        // Clone & normalize
        let startNum = convertTo24Hour(t.startRaw);
        let endNum = convertTo24Hour(t.endRaw);
        if (endNum <= startNum) {
          endNum += 12; // adjust for afternoon wrap
        }
        expandedTimes.push({
          ...t,
          day: singleDay,
          start: startNum,
          end: endNum,
        });
      });
    });

    if (!grouped[key]) {
      grouped[key] = { title, section, times: expandedTimes };
    } else {
      grouped[key].times.push(...expandedTimes);
    }
  });

  // Transform into scheduleData: [{title, sections:[{section, times:[...]}, ...]}]
  const byTitle = {};
  Object.values(grouped).forEach((entry) => {
    if (!byTitle[entry.title])
      byTitle[entry.title] = { title: entry.title, sections: [] };
    byTitle[entry.title].sections.push({
      section: entry.section,
      times: entry.times,
    });
  });
  scheduleData = Object.values(byTitle);
  console.log("Final scheduleData (section grouped):", scheduleData);

  updateCourseDropdown();
}

function hasConflict(a, b) {
  if (a.day !== b.day) return false;
  return !(a.end <= b.start || b.end <= a.start);
}

function forwardChecking(variables, assignment, domains, results, depth = 0) {
  if (assignment.length === variables.length) {
    results.push([...assignment]);
    return;
  }

  const varIndex = assignment.length;
  const variable = variables[varIndex];

  for (let option of domains[variable]) {
    let conflict = false;

    for (let i = 0; i < assignment.length; i++) {
      const other = assignment[i];
      if (hasConflict(option, other)) {
        conflict = true;
        break;
      }
    }

    if (!conflict) {
      assignment.push(option);
      forwardChecking(variables, assignment, domains, results, depth + 1);
      assignment.pop();
    }
  }
}

function generateRoutines() {
  const selectedCourses = $("#courseMultiSelect").val() || [];
  if (!selectedCourses.length) {
    alert("Please select at least one course");
    return;
  }

  // Build domains where each option = whole section with all its sessions
  const domains = {};
  selectedCourses.forEach((course) => {
    const courseEntry = scheduleData.find((e) => e.title === course);
    if (!courseEntry) {
      domains[course] = [];
      return;
    }
    domains[course] = courseEntry.sections.map((sec) => ({
      title: courseEntry.title,
      section: sec.section,
      times: sec.times,
    }));
  });

  const variables = selectedCourses;
  const results = [];
  function search(idx, current) {
    if (idx === variables.length) {
      results.push([...current]);
      return;
    }
    const course = variables[idx];
    for (const option of domains[course]) {
      let conflict = false;
      for (const chosen of current) {
        for (const t1 of option.times) {
          for (const t2 of chosen.times) {
            if (hasConflict(t1, t2)) {
              conflict = true;
              break;
            }
          }
          if (conflict) break;
        }
        if (conflict) break;
      }
      if (!conflict) {
        current.push(option);
        search(idx + 1, current);
        current.pop();
      }
    }
  }
  search(0, []);

  function computeCompactScore(routine) {
    const byDay = {};
    routine.forEach((section) => {
      section.times.forEach((t) => {
        if (!byDay[t.day]) byDay[t.day] = [];
        byDay[t.day].push({ start: t.start, end: t.end });
      });
    });

    let activeDays = Object.keys(byDay).length;
    let totalGap = 0;
    let totalSpread = 0;

    Object.values(byDay).forEach((list) => {
      list.sort((a, b) => a.start - b.start);
      let earliest = list[0].start;
      let latest = list[list.length - 1].end;

      // Spread = total occupied window per day
      totalSpread += latest - earliest;

      // Gaps inside day
      for (let i = 0; i < list.length - 1; i++) {
        let gap = list[i + 1].start - list[i].end;
        if (gap > 0) totalGap += gap;
      }
    });

    // Weighted score: fewer days first, then less spread, then less gap
    return activeDays * 1000 + totalSpread * 100 + totalGap;
  }

  const scored = results.map((r) => ({
    routine: r,
    score: computeCompactScore(r),
  }));
  scored.sort((a, b) => a.score - b.score);

  const outputDiv = document.getElementById("routineOutput");
  outputDiv.innerHTML = "";
  if (scored.length === 0) {
    outputDiv.innerHTML = "<p>No valid routines found without conflicts.</p>";
    return;
  }

  scored.slice(0, 3).forEach((entry, index) => {
    const routine = entry.routine;
    const groups = {};
    routine.forEach((sectionChoice) => {
      const key = sectionChoice.title + "||" + sectionChoice.section;
      if (!groups[key])
        groups[key] = {
          title: sectionChoice.title,
          section: sectionChoice.section,
          sessions: [],
        };
      sectionChoice.times.forEach((session) => {
        groups[key].sessions.push({
          day: session.day,
          startRaw: session.startRaw,
          endRaw: session.endRaw,
          room: session.room || "N/A",
          startNum: convertTo24Hour(session.startRaw),
        });
      });
    });

    const dayOrder = ["S", "M", "T", "W", "TH", "F", "SA"];
    const dayIndex = (d) => {
      const i = dayOrder.indexOf(d);
      return i === -1 ? 99 : i;
    };
    Object.values(groups).forEach((g) => {
      g.sessions.sort((a, b) => {
        const di = dayIndex(a.day) - dayIndex(b.day);
        return di !== 0 ? di : a.startNum - b.startNum;
      });
    });
    function cleanTime(t) {
      if (!t) return "";
      return t.replace(/:00(?=\s|$)/, "").trim();
    }

    const heading = document.createElement("h3");
    heading.textContent = `🗓️ Routine Option ${index + 1}`;
    outputDiv.appendChild(heading);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML =
      "<tr><th>Course Title</th><th>Section</th><th>Day</th><th>Start</th><th>End</th><th>Room</th></tr>";
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    Object.values(groups)
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((group) => {
        group.sessions.forEach((s) => {
          const tr = document.createElement("tr");
          const startDisp = cleanTime(s.startRaw);
          const endDisp = cleanTime(s.endRaw);
          tr.innerHTML = `<td>${group.title}</td><td>${group.section}</td><td>${s.day}</td><td>${startDisp}</td><td>${endDisp}</td><td>${s.room}</td>`;
          tbody.appendChild(tr);
        });
      });
    table.appendChild(tbody);
    outputDiv.appendChild(table);
  });
}

// ----------------- Helpers -----------------

function backtrack(courseKeys, idx, current, results, courseGroups) {
  if (idx === courseKeys.length) {
    results.push([...current]);
    return;
  }

  let courseId = courseKeys[idx];
  for (let section of courseGroups[courseId]) {
    if (!clashes(section, current)) {
      current.push(section);
      backtrack(courseKeys, idx + 1, current, results, courseGroups);
      current.pop();
    }
  }
}

function clashes(section, chosen) {
  for (let s of chosen) {
    for (let t1 of section.times || []) {
      for (let t2 of s.times || []) {
        if (t1.day === t2.day && !(t1.end <= t2.start || t2.end <= t1.start)) {
          return true; // overlap
        }
      }
    }
  }
  return false;
}

// Calculate total idle minutes per day
function calcGap(routine) {
  let byDay = {};
  routine.forEach((sec) => {
    (sec.times || []).forEach((t) => {
      if (!byDay[t.day]) byDay[t.day] = [];
      byDay[t.day].push([t.start, t.end]);
    });
  });

  let totalGap = 0;
  for (let d in byDay) {
    let slots = byDay[d].sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < slots.length; i++) {
      let gap = slots[i][0] - slots[i - 1][1];
      if (gap > 0) totalGap += gap;
    }
  }
  return totalGap;
}
