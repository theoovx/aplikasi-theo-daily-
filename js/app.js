"use strict";

/* =========================================================
   THEO DAILY
   APP CORE + NAVIGATION + SCHEDULE
========================================================= */

const STORAGE_KEY = "theoDailyData";

const defaultData = {
  tasks: [
    {
      id: 1,
      title: "Start your day",
      time: "07:00",
      completed: false,
      days: [0, 1, 2, 3, 4, 5, 6]
    },
    {
      id: 2,
      title: "Take a shower",
      time: "07:30",
      completed: false,
      days: [0, 1, 2, 3, 4, 5, 6]
    },
    {
      id: 3,
      title: "Work on your project",
      time: "09:00",
      completed: false,
      days: [0, 1, 2, 3, 4, 5, 6]
    }
  ],

  habits: [],
  goals: [],
  transactions: [],

  groomingItems: [
    { id: 1, title: "Mandi", completed: false },
    { id: 2, title: "Sabun badan", completed: false },
    { id: 3, title: "Sikat gigi", completed: false },
    { id: 4, title: "Ganti baju", completed: false },
    { id: 5, title: "Rapihin rambut", completed: false }
  ],

  holidayMode: false,

  theme: "paper"
};

let data = loadData();

/* =========================================================
   STORAGE
========================================================= */

function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultData);
    }

    const parsed =
      JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...parsed,
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks
        : [],
      habits: Array.isArray(parsed.habits)
        ? parsed.habits
        : [],
      goals: Array.isArray(parsed.goals)
        ? parsed.goals
        : [],
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
      groomingItems: Array.isArray(parsed.groomingItems)
        ? parsed.groomingItems
        : structuredClone(defaultData.groomingItems),
      holidayMode: typeof parsed.holidayMode === "boolean"
        ? parsed.holidayMode
        : false
    };

  } catch (error) {

    console.error(
      "Failed to load data:",
      error
    );

    return structuredClone(defaultData);
  }
}


function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


/* =========================================================
   DATE
========================================================= */

function getLocalDateKey(date = new Date()) {

  const year = date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const day =
    String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function formatDate(date = new Date()) {

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);

}


function updateDates() {

  const date =
    formatDate();

  const currentDate =
    document.getElementById(
      "currentDate"
    );

  const scheduleDate =
    document.getElementById(
      "scheduleDate"
    );

  if (currentDate) {
    currentDate.textContent =
      date;
  }

  if (scheduleDate) {
    scheduleDate.textContent =
      date;
  }

}


/* =========================================================
   TODAY TASKS
========================================================= */

function getTodayTasks() {

  const today =
    new Date().getDay();

  return data.tasks
    .filter(task => {

      if (!Array.isArray(task.days)) {
        return true;
      }

      return task.days.includes(today);

    })
    .sort((a, b) =>
      a.time.localeCompare(b.time)
    );

}


/* =========================================================
   DAILY RESET
========================================================= */

function resetDailyTasks() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const lastReset =
    localStorage.getItem(
      "theoDailyLastReset"
    );

  if (lastReset === today) {
    return;
  }

  data.tasks.forEach(task => {
    task.completed = false;
  });

  data.groomingItems.forEach(item => {
    item.completed = false;
  });

  localStorage.setItem(
    "theoDailyLastReset",
    today
  );

  saveData();

}


/* =========================================================
   HOME TASKS
========================================================= */

function renderTasks() {

  const taskList =
    document.getElementById(
      "taskList"
    );

  const taskCount =
    document.getElementById(
      "taskCount"
    );

  if (!taskList) {
    return;
  }

  const tasks =
    getTodayTasks();

  if (taskCount) {
    taskCount.textContent =
      tasks.length;
  }

  if (tasks.length === 0) {

    taskList.innerHTML = `
      <div class="empty-state">
        <div>✓</div>
        <p>No tasks for today.</p>
        <span>Add something to your schedule.</span>
      </div>
    `;

    updateProgress();

    return;
  }

  taskList.innerHTML =
    tasks.map(task => `

      <button
        class="task-item ${task.completed ? "completed" : ""}"
        data-task-id="${task.id}"
        type="button"
      >

        <span class="task-check">
          ${task.completed ? "✓" : ""}
        </span>

        <span class="task-info">

          <strong>
            ${escapeHTML(task.title)}
          </strong>

          <small>
            ${task.time}
          </small>

        </span>

      </button>

    `).join("");

  document
    .querySelectorAll(".task-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          toggleTask(
            Number(
              button.dataset.taskId
            )
          );

        }
      );

    });

  updateProgress();

}


/* =========================================================
   TOGGLE TASK
========================================================= */

function toggleTask(id) {

  const task =
    data.tasks.find(
      task => task.id === id
    );

  if (!task) {
    return;
  }

  task.completed =
    !task.completed;

  saveData();

  renderTasks();
  renderSchedule();
  updateProgress();
  updateNextReminder();
  updateSuggestion();
  updateProgressPage();

}


/* =========================================================
   PROGRESS
========================================================= */

function getProgress() {

  const tasks =
    getTodayTasks();

  const total =
    tasks.length;

  const completed =
    tasks.filter(
      task => task.completed
    ).length;

  const percent =
    total === 0
      ? 0
      : Math.round(
          completed / total * 100
        );

  return {
    total,
    completed,
    percent
  };

}


function updateProgress() {

  const {
    total,
    completed,
    percent
  } = getProgress();

  const completedElement =
    document.getElementById(
      "completedCount"
    );

  const totalElement =
    document.getElementById(
      "totalCount"
    );

  const percentElement =
    document.getElementById(
      "progressPercent"
    );

  const fillElement =
    document.getElementById(
      "progressFill"
    );

  if (completedElement) {
    completedElement.textContent =
      completed;
  }

  if (totalElement) {
    totalElement.textContent =
      total;
  }

  if (percentElement) {
    percentElement.textContent =
      `${percent}%`;
  }

  if (fillElement) {
    fillElement.style.width =
      `${percent}%`;
  }

}


/* =========================================================
   PROGRESS PAGE
========================================================= */

function updateProgressPage() {

  const {
    total,
    completed,
    percent
  } = getProgress();

  const bigPercent =
    document.getElementById(
      "progressBigPercent"
    );

  const bigFill =
    document.getElementById(
      "progressBigFill"
    );

  const statCompleted =
    document.getElementById(
      "statCompleted"
    );

  const statTotal =
    document.getElementById(
      "statTotal"
    );

  if (bigPercent) {
    bigPercent.textContent =
      `${percent}%`;
  }

  if (bigFill) {
    bigFill.style.width =
      `${percent}%`;
  }

  if (statCompleted) {
    statCompleted.textContent =
      completed;
  }

  if (statTotal) {
    statTotal.textContent =
      total;
  }

}


/* =========================================================
   NEXT REMINDER
========================================================= */

function updateNextReminder() {

  const title =
    document.getElementById(
      "nextReminder"
    );

  const time =
    document.getElementById(
      "nextReminderTime"
    );

  if (!title || !time) {
    return;
  }

  const tasks =
    getTodayTasks();

  const now =
    new Date();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  const upcoming =
    tasks.find(task => {

      if (task.completed) {
        return false;
      }

      const [
        hour,
        minute
      ] =
        task.time
          .split(":")
          .map(Number);

      return (
        hour * 60 + minute
        >= currentMinutes
      );

    });

  if (!upcoming) {

    title.textContent =
      "No upcoming reminder";

    time.textContent =
      "--:--";

    return;
  }

  title.textContent =
    upcoming.title;

  time.textContent =
    upcoming.time;

}


/* =========================================================
   SUGGESTION
========================================================= */

function updateSuggestion() {

  const title =
    document.getElementById(
      "suggestionTitle"
    );

  const description =
    document.getElementById(
      "suggestionDescription"
    );

  if (!title || !description) {
    return;
  }

  const tasks =
    getTodayTasks();

  const incomplete =
    tasks.filter(
      task => !task.completed
    );

  if (tasks.length === 0) {

    title.textContent =
      "Start your day";

    description.textContent =
      "Add one small thing to your schedule.";

    return;
  }

  if (incomplete.length === 0) {

    title.textContent =
      "Day completed";

    description.textContent =
      "You finished everything planned for today.";

    return;
  }

  const next =
    incomplete[0];

  title.textContent =
    next.title;

  description.textContent =
    `${next.time} • One thing at a time.`;

}


/* =========================================================
   SCHEDULE PAGE
========================================================= */

function renderSchedule() {

  const list =
    document.getElementById(
      "scheduleList"
    );

  const count =
    document.getElementById(
      "scheduleCount"
    );

  if (!list) {
    return;
  }

  const tasks =
    getTodayTasks();

  if (count) {
    count.textContent =
      tasks.length;
  }

  if (tasks.length === 0) {

    list.innerHTML = `
      <div class="empty-state">
        <div>+</div>
        <p>No schedule yet.</p>
        <span>Add your first activity above.</span>
      </div>
    `;

    return;
  }

  list.innerHTML =
    tasks.map(task => `

      <div
        class="schedule-item task-item ${task.completed ? "completed" : ""}"
        data-task-id="${task.id}"
      >

        <button
          class="task-check schedule-check"
          data-action="toggle"
          type="button"
        >
          ${task.completed ? "✓" : ""}
        </button>

        <div class="task-info">

          <strong>
            ${escapeHTML(task.title)}
          </strong>

          <small>
            ${task.time}
          </small>

        </div>

        <button
          class="schedule-delete"
          data-action="delete"
          type="button"
        >
          ×
        </button>

      </div>

    `).join("");

  list
    .querySelectorAll(
      ".schedule-item"
    )
    .forEach(item => {

      const id =
        Number(
          item.dataset.taskId
        );

      const toggle =
        item.querySelector(
          '[data-action="toggle"]'
        );

      const remove =
        item.querySelector(
          '[data-action="delete"]'
        );

      toggle.addEventListener(
        "click",
        () => {
          toggleTask(id);
        }
      );

      remove.addEventListener(
        "click",
        () => {
          deleteTask(id);
        }
      );

    });

}


/* =========================================================
   ADD SCHEDULE
========================================================= */

function setupScheduleForm() {

  const form =
    document.getElementById(
      "scheduleForm"
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const titleInput =
        document.getElementById(
          "scheduleTitle"
        );

      const timeInput =
        document.getElementById(
          "scheduleTime"
        );

      const repeatInput =
        document.getElementById(
          "scheduleRepeat"
        );

      const title =
        titleInput.value.trim();

      const time =
        timeInput.value;

      const repeat =
        repeatInput.value;

      if (!title || !time) {
        return;
      }

      const today =
        new Date().getDay();

      const newTask = {

        id: Date.now(),

        title,

        time,

        completed: false,

        days:
          repeat === "daily"
            ? [0, 1, 2, 3, 4, 5, 6]
            : [today]

      };

      data.tasks.push(
        newTask
      );

      saveData();

      form.reset();

      renderTasks();
      renderSchedule();
      updateProgress();
      updateNextReminder();
      updateSuggestion();
      updateProgressPage();

    }
  );

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(id) {

  const task =
    data.tasks.find(
      task => task.id === id
    );

  if (!task) {
    return;
  }

  data.tasks =
    data.tasks.filter(
      task => task.id !== id
    );

  saveData();

  renderTasks();
  renderSchedule();
  updateProgress();
  updateNextReminder();
  updateSuggestion();
  updateProgressPage();

}


/* =========================================================
   MINIMUM DAY
========================================================= */

function setupMinimumDay() {

  const buttons =
    document.querySelectorAll(
      ".minimum-day-trigger"
    );

  if (!buttons.length) {
    return;
  }

  buttons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const today =
        new Date().getDay();

      const existing =
        data.tasks.find(task =>
          task.title === "Minimum Day" &&
          task.days?.includes(today)
        );

      if (existing) {

        existing.completed =
          !existing.completed;

      } else {

        data.tasks.push({

          id: Date.now(),

          title: "Minimum Day",

          time: getCurrentTime(),

          completed: false,

          days: [today]

        });

      }

      saveData();

      renderTasks();
      renderSchedule();
      updateProgress();
      updateNextReminder();
      updateSuggestion();
      updateProgressPage();

    }
  );

  });

}




/* =========================================================
   REMINDER ENGINE
========================================================= */

let notifiedReminders = new Set();

function setupNotifications() {
  if (!("Notification" in window)) {
    console.log("Notifications are not supported.");
    return;
  }

  if (Notification.permission === "default") {
    document.addEventListener("click", requestNotificationPermission, {
      once: true
    });
  }
}

function requestNotificationPermission() {
  Notification.requestPermission().then(permission => {
    console.log("Notification permission:", permission);
  });
}

function checkReminders() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (data.holidayMode) return;

  const now = new Date();
  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  const today = now.getDay();
  const todayKey = getLocalDateKey();

  data.tasks.forEach(task => {
    if (task.completed) return;
    if (!task.time) return;
    if (task.time !== currentTime) return;

    if (Array.isArray(task.days) && !task.days.includes(today)) {
      return;
    }

    const reminderKey = `reminder-${todayKey}-${task.id}`;

    if (sessionStorage.getItem(reminderKey)) {
      return;
    }

    sessionStorage.setItem(reminderKey, "1");

    new Notification("THEO DAILY 🔔", {
      body: task.title
    });
  });
}




/* =========================================================
   HABITS
========================================================= */

function renderHabits() {
  const list = document.getElementById("habitList");
  const count = document.getElementById("habitCount");

  if (!list) return;

  if (count) {
    count.textContent = data.habits.length;
  }

  if (data.habits.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>✓</div>
        <p>No habits yet.</p>
        <span>Add one small habit to track.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = data.habits.map(habit => `
    <button
      class="task-item ${habit.completed ? "completed" : ""}"
      data-habit-id="${habit.id}"
      type="button"
    >
      <span class="task-check">
        ${habit.completed ? "✓" : ""}
      </span>

      <span class="task-info">
        <strong>${escapeHTML(habit.title)}</strong>
        <small>Streak: ${habit.streak || 0} day${habit.streak === 1 ? "" : "s"}</small>
      </span>
    </button>
  `).join("");

  list.querySelectorAll("[data-habit-id]").forEach(item => {
    item.addEventListener("click", () => {
      toggleHabit(Number(item.dataset.habitId));
    });
  });
}

function toggleHabit(id) {
  const habit = data.habits.find(h => h.id === id);
  if (!habit) return;

  const today = getLocalDateKey();

  if (habit.lastCompleted === today) {
    habit.completed = false;
    saveData();
    renderHabits();
    return;
  }

  habit.completed = true;

  if (habit.lastCompleted) {
    const last = new Date(habit.lastCompleted);
    const current = new Date(today);

    const difference =
      Math.round(
        (current - last) / 86400000
      );

    if (difference === 1) {
      habit.streak = (habit.streak || 0) + 1;
    } else {
      habit.streak = 1;
    }
  } else {
    habit.streak = 1;
  }

  habit.lastCompleted = today;

  saveData();
  renderHabits();
}

function setupHabitForm() {
  const form = document.getElementById("habitForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const input =
      document.getElementById("habitTitle");

    const title = input.value.trim();

    if (!title) return;

    data.habits.push({
      id: Date.now(),
      title,
      completed: false,
      streak: 0,
      lastCompleted: null
    });

    saveData();

    input.value = "";

    renderHabits();
  });
}



/* =========================================================
   GOALS
========================================================= */

function renderGoals() {
  const list = document.getElementById("goalList");
  const count = document.getElementById("goalCount");

  if (!list) return;

  if (count) {
    count.textContent = data.goals.length;
  }

  if (data.goals.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>🎯</div>
        <p>No goals yet.</p>
        <span>Add something you want to achieve.</span>
      </div>
    `;
    return;
  }

  list.innerHTML = data.goals.map(goal => `
    <div class="card goal-card">
      <strong>${escapeHTML(goal.title)}</strong>

      <div style="margin-top:12px;">
        <div style="display:flex;justify-content:space-between;">
          <small>Progress</small>
          <small>${goal.progress}%</small>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value="${goal.progress}"
          data-goal-id="${goal.id}"
          class="goal-progress"
        >
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".goal-progress").forEach(input => {
    input.addEventListener("input", () => {
      const goal = data.goals.find(
        g => g.id === Number(input.dataset.goalId)
      );

      if (!goal) return;

      goal.progress = Number(input.value);
      saveData();

      const value = input.parentElement.querySelector("small:last-child");
      if (value) {
        value.textContent = `${goal.progress}%`;
      }
    });
  });
}

function setupGoalForm() {
  const form = document.getElementById("goalForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const titleInput = document.getElementById("goalTitle");
    const progressInput = document.getElementById("goalProgress");

    const title = titleInput.value.trim();

    if (!title) return;

    data.goals.push({
      id: Date.now(),
      title,
      progress: Math.min(
        100,
        Math.max(0, Number(progressInput.value) || 0)
      )
    });

    saveData();

    titleInput.value = "";
    progressInput.value = "0";

    renderGoals();
  });
}


/* =========================================================
   FOCUS / ANTI-MALES
========================================================= */

const focusActivities = {
  low: [
    "Rapikan tempat tidur.",
    "Mandi dan ganti pakaian.",
    "Minum air.",
    "Rapikan meja selama 5 menit.",
    "Bereskan file atau foto yang tidak diperlukan."
  ],

  normal: [
    "Kerjakan satu tugas dari Schedule.",
    "Belajar skill selama 20 menit.",
    "Rapikan kamar.",
    "Kerjakan sedikit project THEO DAILY.",
    "Baca kembali catatan yang sudah dibuat."
  ],

  high: [
    "Kerjakan project selama 30 menit.",
    "Belajar materi baru.",
    "Latihan coding.",
    "Kerjakan tugas yang paling sulit dulu.",
    "Buat satu improvement untuk project."
  ]
};

let currentEnergy = "normal";

function suggestActivity() {
  const list = focusActivities[currentEnergy];

  const activity =
    list[Math.floor(Math.random() * list.length)];

  const output =
    document.getElementById("focusSuggestion");

  if (output) {
    output.textContent = activity;
  }
}

function startMinimumDay() {
  const output =
    document.getElementById("focusSuggestion");

  if (output) {
    output.textContent =
      "Minimum Day: mandi → makan → rapikan tempat → 1 tugas kecil → istirahat.";
  }
}

function setupFocus() {
  const suggestButton =
    document.getElementById("suggestActivityButton");

  if (suggestButton) {
    suggestButton.addEventListener(
      "click",
      suggestActivity
    );
  }

  document
    .querySelectorAll(".minimum-day-trigger")
    .forEach(button => {
      button.addEventListener(
        "click",
        startMinimumDay
      );
    });

  document
    .querySelectorAll(".energy-button")
    .forEach(button => {
      button.addEventListener("click", () => {

        currentEnergy =
          button.dataset.energy;

        document
          .querySelectorAll(".energy-button")
          .forEach(item =>
            item.classList.remove("active")
          );

        button.classList.add("active");

        suggestActivity();
      });
    });
}


/* =========================================================
   HOLIDAY MODE
========================================================= */

function updateHolidayMode() {
  const status =
    document.getElementById("holidayStatus");

  const button =
    document.getElementById("holidayToggle");

  if (!status || !button) return;

  status.textContent =
    data.holidayMode ? "ON" : "OFF";

  button.textContent =
    data.holidayMode ? "Turn Off" : "Turn On";
}

function setupHolidayMode() {
  const button =
    document.getElementById("holidayToggle");

  if (!button) return;

  button.addEventListener("click", () => {
    data.holidayMode = !data.holidayMode;
    saveData();
    updateHolidayMode();

    const output =
      document.getElementById("focusSuggestion");

    if (data.holidayMode && output) {
      output.textContent =
        "Holiday Mode: mandi → makan → 1 tugas kecil → aktivitas santai. Reminder notifikasi dimatikan sementara.";
    }
  });

  updateHolidayMode();
}


/* =========================================================
   BACKUP / RESTORE
========================================================= */

function setupNotificationButton() {
  const button = document.getElementById("notificationButton");

  if (!button) return;

  button.addEventListener("click", () => {
    requestNotificationPermission();
  });
}

function setupBackup() {

  const exportButton =
    document.getElementById("exportDataButton");

  const importInput =
    document.getElementById("importDataInput");

  if (exportButton) {
    exportButton.addEventListener("click", () => {

      const backup = {
        app: "THEO DAILY",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        data
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        `theo-daily-backup-${getLocalDateKey()}.json`;

      link.click();

      URL.revokeObjectURL(url);
    });
  }

  if (importInput) {
    importInput.addEventListener("change", event => {

      const file =
        event.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = () => {

        try {

          const backup =
            JSON.parse(reader.result);

          if (
            !backup.data ||
            typeof backup.data !== "object"
          ) {
            throw new Error("Invalid backup");
          }

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(backup.data)
          );

          alert(
            "Backup berhasil dipulihkan. Aplikasi akan dimuat ulang."
          );

          location.reload();

        } catch (error) {

          alert(
            "File backup tidak valid."
          );

        }
      };

      reader.readAsText(file);
    });
  }
}


/* =========================================================
   SCHEDULE TEMPLATES
========================================================= */

const scheduleTemplates = {
  ojt: [
    { title: "Berangkat OJT", time: "07:00" },
    { title: "Mulai kerja OJT", time: "08:00" },
    { title: "Istirahat siang", time: "12:00" },
    { title: "Pulang OJT", time: "16:00" }
  ],
  kerja: [
    { title: "Berangkat kerja", time: "07:30" },
    { title: "Mulai kerja", time: "08:30" },
    { title: "Istirahat siang", time: "12:00" },
    { title: "Pulang kerja", time: "17:00" }
  ],
  sekolah: [
    { title: "Berangkat sekolah", time: "06:30" },
    { title: "Kelas dimulai", time: "07:00" },
    { title: "Istirahat", time: "10:00" },
    { title: "Pulang sekolah", time: "15:00" }
  ],
  kuliah: [
    { title: "Berangkat kuliah", time: "07:00" },
    { title: "Kelas dimulai", time: "08:00" },
    { title: "Istirahat", time: "12:00" },
    { title: "Selesai kuliah", time: "16:00" }
  ]
};

function applyScheduleTemplate(name) {

  const template = scheduleTemplates[name];

  if (!template) return;

  const confirmed = confirm(
    `Tambah ${template.length} jadwal template "${name.toUpperCase()}" ke Schedule kamu?`
  );

  if (!confirmed) return;

  template.forEach((item, i) => {
    data.tasks.push({
      id: Date.now() + i,
      title: item.title,
      time: item.time,
      completed: false,
      days: [0, 1, 2, 3, 4, 5, 6]
    });
  });

  saveData();
  renderTasks();
  renderSchedule();
  updateProgress();

}

function setupScheduleTemplates() {

  document.querySelectorAll("[data-template]").forEach(button => {
    button.addEventListener("click", () => {
      applyScheduleTemplate(button.dataset.template);
    });
  });

}


/* =========================================================
   GROOMING
========================================================= */

function renderGrooming() {

  const listEl =
    document.getElementById("groomingList");

  if (!listEl) return;

  listEl.innerHTML =
    data.groomingItems.map(item => `
      <button
        class="task-item ${item.completed ? "completed" : ""}"
        data-grooming-id="${item.id}"
        type="button"
      >
        <span class="task-check">
          ${item.completed ? "✓" : ""}
        </span>
        <div class="task-info">
          <strong>${escapeHTML(item.title)}</strong>
        </div>
      </button>
    `).join("");

  listEl.querySelectorAll("[data-grooming-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleGrooming(Number(btn.dataset.groomingId));
    });
  });

}

function toggleGrooming(id) {

  const item =
    data.groomingItems.find(i => i.id === id);

  if (!item) return;

  item.completed = !item.completed;

  saveData();
  renderGrooming();

}

function setupGroomingForm() {

  const form =
    document.getElementById("groomingForm");

  if (!form) return;

  form.addEventListener("submit", event => {

    event.preventDefault();

    const input =
      document.getElementById("groomingTitle");

    const title = input.value.trim();

    if (!title) return;

    data.groomingItems.push({
      id: Date.now(),
      title,
      completed: false
    });

    saveData();

    input.value = "";

    renderGrooming();

  });

}


/* =========================================================
   MONEY
========================================================= */

function formatRupiah(amount) {

  const value =
    Math.round(Number(amount) || 0);

  return "Rp" + value.toLocaleString("id-ID");

}

function getMoneyBalance() {

  return data.transactions.reduce(
    (sum, trx) =>
      trx.type === "income"
        ? sum + trx.amount
        : sum - trx.amount,
    0
  );

}

function renderMoney() {

  const balanceEl =
    document.getElementById("moneyBalance");

  const listEl =
    document.getElementById("moneyTransactionList");

  if (balanceEl) {
    balanceEl.textContent =
      formatRupiah(getMoneyBalance());
  }

  if (!listEl) {
    return;
  }

  if (data.transactions.length === 0) {

    listEl.innerHTML = `
      <div class="empty-state">
        <div>Rp</div>
        <p>No transactions yet.</p>
        <span>Your money activity will appear here.</span>
      </div>
    `;

    return;
  }

  const sorted =
    [...data.transactions].sort(
      (a, b) => b.id - a.id
    );

  listEl.innerHTML =
    sorted.map(trx => `
      <div class="schedule-item task-item" data-trx-id="${trx.id}">

        <span class="task-check">
          ${trx.type === "income" ? "+" : "−"}
        </span>

        <div class="task-info">
          <strong>${escapeHTML(trx.title)}</strong>
          <small>${trx.type === "income" ? "Income" : "Expense"} • ${formatRupiah(trx.amount)} • ${trx.date}</small>
        </div>

        <button class="schedule-delete" data-trx-delete="${trx.id}" type="button">×</button>

      </div>
    `).join("");

  listEl.querySelectorAll("[data-trx-delete]").forEach(button => {
    button.addEventListener("click", () => {
      deleteTransaction(Number(button.dataset.trxDelete));
    });
  });

}

function deleteTransaction(id) {

  data.transactions =
    data.transactions.filter(
      trx => trx.id !== id
    );

  saveData();
  renderMoney();

}

function addTransaction(type) {

  const title =
    prompt(
      type === "income"
        ? "Sumber pemasukan:"
        : "Untuk apa pengeluaran ini:"
    );

  if (!title || !title.trim()) {
    return;
  }

  const amountInput =
    prompt("Jumlah (Rp):");

  const amount =
    Number(amountInput);

  if (!amountInput || isNaN(amount) || amount <= 0) {
    alert("Jumlah tidak valid.");
    return;
  }

  data.transactions.push({
    id: Date.now(),
    type,
    title: title.trim(),
    amount,
    date: getLocalDateKey()
  });

  saveData();
  renderMoney();

}

function setupMoney() {

  const incomeButton =
    document.getElementById("addIncome");

  const expenseButton =
    document.getElementById("addExpense");

  if (incomeButton) {
    incomeButton.addEventListener(
      "click",
      () => addTransaction("income")
    );
  }

  if (expenseButton) {
    expenseButton.addEventListener(
      "click",
      () => addTransaction("expense")
    );
  }

}


/* =========================================================
   DAILY REVIEW
========================================================= */

function setupReview() {

  const progress =
    document.getElementById("reviewProgress");

  const note =
    document.getElementById("reviewNote");

  const saveButton =
    document.getElementById("saveReviewButton");

  if (progress) {

    const tasks =
      getTodayTasks();

    const completed =
      tasks.filter(task => task.completed).length;

    progress.textContent =
      `${completed} dari ${tasks.length} task selesai hari ini.`;
  }

  document
    .querySelectorAll(".review-mood")
    .forEach(button => {

      button.addEventListener("click", () => {

        document
          .querySelectorAll(".review-mood")
          .forEach(item =>
            item.classList.remove("active")
          );

        button.classList.add("active");

        data.todayMood =
          button.dataset.mood;
      });
    });

  if (saveButton) {

    saveButton.addEventListener("click", () => {

      data.review = {
        date: getLocalDateKey(),
        mood: data.todayMood || null,
        note: note ? note.value.trim() : ""
      };

      saveData();

      alert("Daily review tersimpan.");
    });
  }
}


/* =========================================================
   FOCUS TIMER
========================================================= */

let timerInterval = null;
let timerSeconds = 25 * 60;

function updateTimerDisplay() {

  const display =
    document.getElementById("timerDisplay");

  if (!display) return;

  const minutes =
    Math.floor(timerSeconds / 60);

  const seconds =
    timerSeconds % 60;

  display.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {

  if (timerInterval) return;

  timerInterval = setInterval(() => {

    if (timerSeconds <= 0) {

      clearInterval(timerInterval);
      timerInterval = null;

      alert("Focus session selesai.");

      return;
    }

    timerSeconds--;

    updateTimerDisplay();

  }, 1000);
}

function pauseTimer() {

  if (!timerInterval) return;

  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {

  pauseTimer();

  const duration =
    document.getElementById("timerDuration");

  timerSeconds =
    Number(duration ? duration.value : 25) * 60;

  updateTimerDisplay();
}

function setupTimer() {

  const start =
    document.getElementById("timerStart");

  const pause =
    document.getElementById("timerPause");

  const reset =
    document.getElementById("timerReset");

  const duration =
    document.getElementById("timerDuration");

  if (start) {
    start.addEventListener(
      "click",
      startTimer
    );
  }

  if (pause) {
    pause.addEventListener(
      "click",
      pauseTimer
    );
  }

  if (reset) {
    reset.addEventListener(
      "click",
      resetTimer
    );
  }

  if (duration) {
    duration.addEventListener(
      "change",
      resetTimer
    );
  }

  updateTimerDisplay();
}


/* =========================================================
   DAILY OVERVIEW
========================================================= */

function updateDailyOverview() {

  const date =
    document.getElementById("todayDate");

  const tasks =
    document.getElementById("overviewTasks");

  const habits =
    document.getElementById("overviewHabits");

  const goals =
    document.getElementById("overviewGoals");

  if (date) {
    date.textContent =
      new Date().toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "short"
        }
      );
  }

  const todayTasks =
    getTodayTasks();

  const completedTasks =
    todayTasks.filter(
      task => task.completed
    ).length;

  if (tasks) {
    tasks.textContent =
      `${completedTasks}/${todayTasks.length}`;
  }

  if (habits) {
    const completedHabits =
      data.habits.filter(
        habit => habit.completed
      ).length;

    habits.textContent =
      completedHabits;
  }

  if (goals) {

    if (!data.goals.length) {
      goals.textContent = "0%";
    } else {

      const total =
        data.goals.reduce(
          (sum, goal) =>
            sum + Number(goal.progress || 0),
          0
        );

      const average =
        Math.round(
          total / data.goals.length
        );

      goals.textContent =
        `${average}%`;
    }
  }
}

/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item, .widget-card[data-page]");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;
      if (!page) return;

      const targetId = `${page}Page`;
      const target = document.getElementById(targetId);

      if (!target) {
        console.error("Page tidak ditemukan:", targetId);
        return;
      }

      document.querySelectorAll(".page").forEach(section => {
        section.hidden = true;
      });

      target.hidden = false;

      navItems.forEach(nav => {
        nav.classList.remove("active");
      });

      item.classList.add("active");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      if (page === "schedule") renderSchedule();
      if (page === "progress") updateProgressPage();
      if (page === "habits") renderHabits();
      if (page === "goals") renderGoals();
      if (page === "money") renderMoney();
      if (page === "grooming") renderGrooming();
      if (page === "focus") suggestActivity();
      if (page === "review") setupReview();
      if (page === "timer") updateTimerDisplay();
    });
  });
}
function applyTheme(theme) {

  const themes = [
    "paper",
    "mint",
    "sky",
    "sunset",
    "mono"
  ];

  if (!themes.includes(theme)) {
    theme = "paper";
  }

  document.documentElement.dataset.theme =
    theme;

  data.theme =
    theme;

  saveData();

}


/* =========================================================
   UTILITIES
========================================================= */

function getCurrentTime() {

  const now =
    new Date();

  const hour =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  return `${hour}:${minute}`;

}


function escapeHTML(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshApp() {

  updateDates();

  renderTasks();

  renderSchedule();

  updateProgress();

  updateProgressPage();

  updateNextReminder();

  updateSuggestion();

}


/* =========================================================
   INIT
========================================================= */

function init() {

  resetDailyTasks();

  applyTheme(
    data.theme
  );

  setupNavigation();

  setupScheduleForm();
  setupHabitForm();
  setupGoalForm();
  setupFocus();
  setupHolidayMode();
  setupBackup();
  setupNotificationButton();
  setupNotifications();
  checkReminders();
  setupMoney();
  renderMoney();
  setupGroomingForm();
  renderGrooming();
  setupScheduleTemplates();
  setupReview();
  setupTimer();
  updateDailyOverview();

  setupMinimumDay();

  refreshApp();

  setInterval(
    () => {

      updateDates();
      updateNextReminder();
      updateSuggestion();
      checkReminders();

    },
    60000
  );

  console.log(
    "THEO DAILY is running."
  );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


    
/* === THEO WIDGET NAV === */
document.querySelectorAll(".widget-card[data-page]").forEach(card => {
  card.addEventListener("click", () => {
    const page = card.dataset.page;
    const target = document.getElementById(`${page}Page`);

    if (!target) {
      console.error("Widget page tidak ditemukan:", `${page}Page`);
      return;
    }

    document.querySelectorAll(".page").forEach(section => {
      section.hidden = true;
    });

    target.hidden = false;

    card.classList.add("widget-card-pressed");
    setTimeout(() => card.classList.remove("widget-card-pressed"), 160);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (page === "schedule") renderSchedule();
    if (page === "progress") updateProgressPage();
    if (page === "habits") renderHabits();
    if (page === "goals") renderGoals();
    if (page === "money") renderMoney();
    if (page === "grooming") renderGrooming();
    if (page === "focus") suggestActivity();
    if (page === "review") setupReview();
    if (page === "timer") updateTimerDisplay();
  });
});



/* === THEO WIDGET NAV FINAL === */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".widget-card[data-page]").forEach(card => {
    card.addEventListener("click", () => {
      const page = card.dataset.page;
      const target = document.getElementById(page + "Page");

      if (!target) {
        console.error("Widget page tidak ditemukan:", page + "Page");
        return;
      }

      document.querySelectorAll(".page").forEach(section => {
        section.hidden = true;
      });

      target.hidden = false;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      if (page === "habits" && typeof renderHabits === "function") renderHabits();
      if (page === "goals" && typeof renderGoals === "function") renderGoals();
      if (page === "grooming" && typeof renderGrooming === "function") renderGrooming();
      if (page === "focus" && typeof suggestActivity === "function") suggestActivity();
      if (page === "timer" && typeof updateTimerDisplay === "function") updateTimerDisplay();
      if (page === "review" && typeof setupReview === "function") setupReview();
    });
  });
});
