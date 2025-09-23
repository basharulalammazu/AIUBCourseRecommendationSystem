// Theme handled by theme.js

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
  // Attempt to restore previously selected courses now that options exist
  restoreSelectedCourses();
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
    const d = day.trim().toUpperCase();
    if (d === "ST") return ["S", "T"];
    if (d === "MW") return ["M", "W"];
    if (d === "TH" || d === "THU" || d === "THUR" || d === "THURS")
      return ["TH"]; // Thursday variations
    // Normalize long names to short tokens used by UI filters
    const map = {
      SUNDAY: "S",
      SUN: "S",
      MON: "M",
      MONDAY: "M",
      TUE: "T",
      TUES: "T",
      TUESDAY: "T",
      WED: "W",
      WEDNESDAY: "W",
      THURSDAY: "TH",
      FRI: "F",
      FRIDAY: "F",
      SAT: "SA",
      SATURDAY: "SA",
    };
    if (map[d]) return [map[d]];
    // Already maybe a single token like S/M/T/W/TH/F/SA
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
          day: singleDay, // now guaranteed short form compatible with day filter checkboxes
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

// Attach change listeners to filters to log (does not auto-regenerate to avoid confusion)
document.addEventListener("DOMContentLoaded", () => {
  const dayCbs = document.querySelectorAll(".day-filter");
  dayCbs.forEach((cb) =>
    cb.addEventListener("change", () => {
      console.log(
        "[Filters] Day selection changed:",
        Array.from(document.querySelectorAll(".day-filter:checked")).map(
          (c) => c.value
        )
      );
      persistFilters();
    })
  );
  const st = document.getElementById("startTimeFilter");
  const et = document.getElementById("endTimeFilter");
  if (st)
    st.addEventListener("change", () => {
      console.log("[Filters] Earliest start changed to", st.value);
      persistFilters();
    });
  if (et)
    et.addEventListener("change", () => {
      console.log("[Filters] Latest end changed to", et.value);
      persistFilters();
    });

  // Advanced constraint listeners
  const maxDaysEl = document.getElementById("maxDaysInput");
  const maxGapEl = document.getElementById("maxGapInput");
  const lunchStartEl = document.getElementById("lunchStartInput");
  const lunchEndEl = document.getElementById("lunchEndInput");
  if (maxDaysEl)
    maxDaysEl.addEventListener("change", () => {
      console.log("[Filters] Max Days ->", maxDaysEl.value);
      persistFilters();
    });
  if (maxGapEl)
    maxGapEl.addEventListener("change", () => {
      console.log("[Filters] Max Gap ->", maxGapEl.value);
      persistFilters();
    });
  if (lunchStartEl || lunchEndEl)
    [lunchStartEl, lunchEndEl].forEach((el) => {
      if (!el) return;
      el.addEventListener("change", () => {
        console.log(
          "[Filters] Lunch Window ->",
          lunchStartEl && lunchStartEl.value,
          lunchEndEl && lunchEndEl.value
        );
        persistFilters();
      });
    });

  // Attempt restoration of filters from localStorage now (before courses loaded)
  restoreFilters();
});

// ----------------- Persistence Helpers -----------------
function persistFilters() {
  try {
    const data = {
      days: Array.from(document.querySelectorAll(".day-filter")).map((cb) => ({
        v: cb.value,
        c: cb.checked,
      })),
      earliest: document.getElementById("startTimeFilter")?.value || "",
      latest: document.getElementById("endTimeFilter")?.value || "",
      maxDays: document.getElementById("maxDaysInput")?.value || "",
      maxGap: document.getElementById("maxGapInput")?.value || "",
      lunchStart: document.getElementById("lunchStartInput")?.value || "",
      lunchEnd: document.getElementById("lunchEndInput")?.value || "",
      topCount: document.getElementById("topCountInput")?.value || "",
    };
    localStorage.setItem("routineFilters", JSON.stringify(data));
  } catch (e) {
    console.warn("[Persist] Failed to save filters", e);
  }
  persistSelectedCourses();
}

function restoreFilters() {
  try {
    const raw = localStorage.getItem("routineFilters");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.days) {
      const map = new Map(data.days.map((d) => [d.v, d.c]));
      document.querySelectorAll(".day-filter").forEach((cb) => {
        if (map.has(cb.value)) cb.checked = map.get(cb.value);
      });
    }
    if (data.earliest) {
      const el = document.getElementById("startTimeFilter");
      if (el) el.value = data.earliest;
    }
    if (data.latest) {
      const el = document.getElementById("endTimeFilter");
      if (el) el.value = data.latest;
    }
    if (data.maxDays) {
      const el = document.getElementById("maxDaysInput");
      if (el) el.value = data.maxDays;
    }
    if (data.maxGap) {
      const el = document.getElementById("maxGapInput");
      if (el) el.value = data.maxGap;
    }
    if (data.lunchStart) {
      const el = document.getElementById("lunchStartInput");
      if (el) el.value = data.lunchStart;
    }
    if (data.lunchEnd) {
      const el = document.getElementById("lunchEndInput");
      if (el) el.value = data.lunchEnd;
    }
    if (data.topCount) {
      const el = document.getElementById("topCountInput");
      if (el) el.value = data.topCount;
    }
    console.log("[Persist] Filters restored");
  } catch (e) {
    console.warn("[Persist] Failed to restore filters", e);
  }
}

function persistSelectedCourses() {
  try {
    const selected = $("#courseMultiSelect").val() || [];
    localStorage.setItem("routineSelectedCourses", JSON.stringify(selected));
  } catch (e) {
    console.warn("[Persist] Failed saving courses", e);
  }
}

function restoreSelectedCourses() {
  try {
    const raw = localStorage.getItem("routineSelectedCourses");
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      $("#courseMultiSelect").val(arr).trigger("change");
      console.log("[Persist] Selected courses restored");
    }
  } catch (e) {
    console.warn("[Persist] Failed restoring courses", e);
  }
}
function clearRoutineFilters() {
  try {
    localStorage.removeItem("routineFilters");
    localStorage.removeItem("routineSelectedCourses");
  } catch (e) {
    console.warn("[Persist] clear failed", e);
  }
  // Reset checkboxes
  document.querySelectorAll(".day-filter").forEach((cb) => (cb.checked = true));
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setVal("startTimeFilter", "08:00");
  setVal("endTimeFilter", "20:00");
  setVal("maxDaysInput", "");
  setVal("maxGapInput", "");
  setVal("lunchStartInput", "12:00");
  setVal("lunchEndInput", "13:00");
  setVal("topCountInput", "3");
  // Clear course selections (if select2 initialized)
  if (window.$) {
    $("#courseMultiSelect").val(null).trigger("change");
  } else {
    const sel = document.getElementById("courseMultiSelect");
    if (sel) Array.from(sel.options).forEach((o) => (o.selected = false));
  }
  console.log("[Persist] Filters & selections cleared");
  const out = document.getElementById("routineOutput");
  if (out)
    out.innerHTML =
      '<p style="opacity:.7">Filters reset. Re-generate to view routines.</p>';
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
  // Read day/time filters
  const allowedDays = Array.from(
    document.querySelectorAll(".day-filter:checked")
  ).map((cb) => cb.value);
  const earliestStartInput = document.getElementById("startTimeFilter");
  const latestEndInput = document.getElementById("endTimeFilter");
  const earliestStart = earliestStartInput
    ? convertTo24Hour(earliestStartInput.value)
    : 0; // default 00:00
  const latestEnd = latestEndInput ? convertTo24Hour(latestEndInput.value) : 24; // default end of day

  console.log(
    "Filter constraints => Days:",
    allowedDays,
    "Earliest:",
    earliestStart,
    "Latest:",
    latestEnd
  );

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

  // Apply filter constraints to each candidate routine (all sections chosen so far conflict-free)
  const filteredResults = results.filter((routine) => {
    // Each routine: array of section objects {title, section, times:[...]}
    for (const section of routine) {
      for (const t of section.times) {
        // Day exclusion
        if (allowedDays.length && !allowedDays.includes(t.day)) {
          return false;
        }
        // Time window exclusion
        if (t.start < earliestStart || t.end > latestEnd) {
          return false;
        }
      }
    }
    return true;
  });

  console.log(
    `Generated ${results.length} total routines, ${filteredResults.length} after applying day/time filters.`
  );

  // ----------------- Soft Constraint Inputs -----------------
  const maxDaysInput = document.getElementById("maxDaysInput");
  const maxGapInput = document.getElementById("maxGapInput");
  const lunchStartEl = document.getElementById("lunchStartInput");
  const lunchEndEl = document.getElementById("lunchEndInput");
  const topCountEl = document.getElementById("topCountInput");

  const maxDays =
    maxDaysInput && maxDaysInput.value
      ? parseInt(maxDaysInput.value, 10)
      : null;
  const maxGapHours =
    maxGapInput && maxGapInput.value ? parseFloat(maxGapInput.value) : null;
  const lunchStart =
    lunchStartEl && lunchStartEl.value
      ? convertTo24Hour(lunchStartEl.value)
      : null;
  const lunchEnd =
    lunchEndEl && lunchEndEl.value ? convertTo24Hour(lunchEndEl.value) : null;
  const topCount =
    topCountEl && topCountEl.value
      ? Math.min(Math.max(parseInt(topCountEl.value, 10) || 3, 1), 50)
      : 3;

  console.log("Soft constraint preferences =>", {
    maxDays,
    maxGapHours,
    lunchStart,
    lunchEnd,
    topCount,
  });

  function scoreRoutine(routine) {
    const byDay = {};
    routine.forEach((section) => {
      section.times.forEach((t) => {
        if (!byDay[t.day]) byDay[t.day] = [];
        byDay[t.day].push({ start: t.start, end: t.end });
      });
    });

    const activeDays = Object.keys(byDay).length;
    let totalSpread = 0; // sum of (latest - earliest) per day
    let totalGap = 0; // sum of gaps across all days
    let largestGap = 0; // max single gap among all days
    let lunchOverlapMinutes = 0; // minutes in lunch window

    Object.values(byDay).forEach((list) => {
      list.sort((a, b) => a.start - b.start);
      const earliest = list[0].start;
      const latest = list[list.length - 1].end;
      totalSpread += latest - earliest;
      for (let i = 0; i < list.length - 1; i++) {
        const gap = list[i + 1].start - list[i].end;
        if (gap > 0) {
          totalGap += gap;
          if (gap > largestGap) largestGap = gap;
        }
      }
    });

    // Lunch overlap calculation (soft penalty). We'll treat numeric hours * 60 for precision.
    if (lunchStart !== null && lunchEnd !== null) {
      const windowStart = lunchStart;
      const windowEnd = lunchEnd;
      routine.forEach((section) => {
        section.times.forEach((t) => {
          const overlap = Math.max(
            0,
            Math.min(t.end, windowEnd) - Math.max(t.start, windowStart)
          );
          lunchOverlapMinutes += overlap * 60; // convert hours -> minutes
        });
      });
    }

    // Base components (lower better):
    // activeDays, totalSpread, totalGap
    let score = 0;
    const WEIGHTS = {
      activeDays: 1000, // strong preference to reduce active days
      spread: 100, // compact daily window
      gaps: 50, // reduce idle time
      overDayPenalty: 1200, // penalty per day beyond maxDays
      largeGapPenalty: 400, // penalty applied if largestGap exceeds maxGapHours
      lunchPerMinute: 2, // penalty per lunch-overlap minute
    };

    score += activeDays * WEIGHTS.activeDays;
    score += totalSpread * WEIGHTS.spread;
    score += totalGap * WEIGHTS.gaps;

    let penalties = { overDays: 0, gap: 0, lunch: 0 };

    if (maxDays && activeDays > maxDays) {
      const over = activeDays - maxDays;
      const p = over * WEIGHTS.overDayPenalty;
      score += p;
      penalties.overDays = p;
    }
    if (maxGapHours !== null && largestGap > maxGapHours) {
      const gapOver = largestGap - maxGapHours; // hours over
      const p = gapOver * WEIGHTS.largeGapPenalty;
      score += p;
      penalties.gap = p;
    }
    if (lunchOverlapMinutes > 0) {
      const p = lunchOverlapMinutes * WEIGHTS.lunchPerMinute;
      score += p;
      penalties.lunch = p;
    }

    return {
      score,
      components: {
        activeDays,
        totalSpread,
        totalGap,
        largestGap,
        lunchOverlapMinutes,
        penalties,
      },
    };
  }

  const baseSet = filteredResults; // after strict conflict + day/time filter only
  let infoBanner = null; // no advanced hard filtering now
  const scored = baseSet.map((r) => {
    const meta = scoreRoutine(r);
    return { routine: r, score: meta.score, meta };
  });
  scored.sort((a, b) => a.score - b.score);

  const outputDiv = document.getElementById("routineOutput");
  outputDiv.innerHTML = "";
  if (scored.length === 0) {
    let reason = "No valid routines found without conflicts.";
    if (results.length === 0) {
      reason =
        "No conflict-free combination of the selected course sections exists (before applying filters).";
    } else if (filteredResults.length === 0) {
      reason =
        "All conflict-free combinations were excluded by day/time window filters.";
    }
    outputDiv.innerHTML = `<p>${reason}</p>`;
    return;
  }

  if (infoBanner) {
    const note = document.createElement("div");
    note.style.margin = "8px 0 12px";
    note.style.padding = "8px 12px";
    note.style.border = "1px solid #eab308";
    note.style.background = "#fef9c3";
    note.style.borderRadius = "6px";
    note.style.fontSize = "0.9rem";
    note.textContent = infoBanner;
    outputDiv.appendChild(note);
  }

  scored.slice(0, topCount).forEach((entry, index) => {
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
    const comp = entry.meta.components;
    heading.textContent = `🗓️ Routine Option ${
      index + 1
    } (Score ${entry.score.toFixed(1)})`;
    outputDiv.appendChild(heading);

    // Debug summary (optional, hidden if no penalties)
    if (comp.penalties.overDays || comp.penalties.gap || comp.penalties.lunch) {
      const pen = document.createElement("div");
      pen.style.fontSize = "0.75rem";
      pen.style.opacity = "0.75";
      pen.textContent = `Penalties -> Days: ${comp.penalties.overDays.toFixed(
        0
      )}, Gap: ${comp.penalties.gap.toFixed(
        0
      )}, Lunch: ${comp.penalties.lunch.toFixed(0)}`;
      outputDiv.appendChild(pen);
    }

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
