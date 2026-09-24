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

  settings: { name: "Theo", accent: "orange" },

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
  }
  if (typeof liveRefresh === "function") liveRefresh();
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
    "id-ID",
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

  const today = getLocalDateKey();

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

function hashText(text) {
  return [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
}

let homeIdeaCache = { key: "", text: "" };
function homeIdea() {
  const key = getLocalDateKey() + "-" + new Date().getHours();
  if (homeIdeaCache.key !== key) {
    homeIdeaCache = {
      key,
      text: pickNext("home", [...focusActivities.low, ...focusActivities.normal, ...timeIdeas[dayPart()]])
    };
  }
  return homeIdeaCache.text;
}

function updateSuggestion() {
  const title = document.getElementById("suggestionTitle");
  const description = document.getElementById("suggestionDescription");
  if (!title || !description) return;

  const tasks = getTodayTasks();
  const incomplete = tasks.filter(task => !task.completed);

  if (tasks.length === 0) {
    title.textContent = "Hari masih kosong";
    description.textContent = homeIdea();
    return;
  }

  if (incomplete.length === 0) {
    title.textContent = "Semua beres";
    description.textContent = `Santai dulu. Ide: ${homeIdea()}`;
    return;
  }

  const next = incomplete[0];
  title.textContent = next.title;
  description.textContent =
    `${next.time} • ${nudges[hashText(getLocalDateKey() + next.id) % nudges.length]}`;
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
      class="task-item ${isHabitDone(habit) ? "completed" : ""}"
      data-habit-id="${habit.id}"
      type="button"
    >
      <span class="task-check">
        ${isHabitDone(habit) ? "✓" : ""}
      </span>

      <span class="task-info">
        <strong>${escapeHTML(habit.title)}</strong>
        <small>Streak: ${habitStreak(habit)} hari</small>
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
    habit.lastCompleted = habit.prevCompleted || null;
    habit.streak = habit.prevStreak || 0;
  } else {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    habit.prevCompleted = habit.lastCompleted || null;
    habit.prevStreak = habit.streak || 0;
    habit.streak = habit.lastCompleted === getLocalDateKey(y)
      ? (habit.streak || 0) + 1
      : 1;
    habit.lastCompleted = today;
  }

  habit.completed = habit.lastCompleted === today;

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
    "Minum segelas air dulu.",
    "Rapikan tempat tidur, 2 menit aja.",
    "Mandi air hangat, ganti baju bersih.",
    "Buka jendela, cari udara segar 5 menit.",
    "Cuci piring atau gelas yang numpuk.",
    "Rapikan meja, cukup satu sisi.",
    "Hapus 10 foto atau file yang nggak kepakai.",
    "Duduk santai, dengerin satu lagu sampai habis.",
    "Jalan kaki sebentar keliling rumah atau depan gang.",
    "Charge HP dan siapkan barang buat besok.",
    "Peregangan leher dan bahu, 3 menit.",
    "Bales satu chat yang dari kemarin ketunda."
  ],

  normal: [
    "Kerjakan satu task dari Schedule, yang paling ringan dulu.",
    "Belajar satu topik baru selama 20 menit, pakai timer.",
    "Tulis 3 hal yang mau kamu selesaikan hari ini.",
    "Kerjakan project THEO DAILY, satu fitur kecil aja.",
    "Baca ulang catatan kemarin, tandai yang belum selesai.",
    "Bersihkan satu sudut kamar sampai rapi.",
    "Coba satu resep atau menu simpel yang belum pernah dibuat.",
    "Rapikan folder Download, buang yang sudah nggak dipakai.",
    "Latihan skill 25 menit, lalu istirahat 5 menit.",
    "Catat pengeluaran hari ini di tab Money.",
    "Chat orang yang udah lama nggak ngobrol.",
    "Cari satu tutorial pendek dan langsung praktikkan."
  ],

  high: [
    "Kerjakan project 45 menit tanpa buka medsos.",
    "Ambil tugas yang paling kamu hindari, mulai 15 menit dulu.",
    "Latihan coding: bikin satu fitur kecil dari nol.",
    "Baca satu bab materi, lalu tulis ringkasannya sendiri.",
    "Perbaiki satu bug yang udah lama kamu biarkan.",
    "Susun rencana minggu ini: 3 target, masing-masing ada langkah pertama.",
    "Kerjakan dua sesi fokus 25 menit berturut-turut.",
    "Bikin satu improvement di project, lalu commit.",
    "Olahraga 20 menit, habis itu langsung kerjakan tugas berat.",
    "Review Goals dan naikkan progress yang sudah jalan.",
    "Belajar hal baru yang agak di luar zona nyaman.",
    "Selesaikan satu hal yang tertunda lebih dari seminggu."
  ]
};

const timeIdeas = {
  pagi: [
    "Sarapan dulu sebelum mulai apa-apa.",
    "Jemur badan 5 menit di dekat jendela.",
    "Tentukan satu prioritas hari ini.",
    "Cek jadwal hari ini, geser yang nggak realistis."
  ],
  siang: [
    "Istirahat makan, jauh dari layar sebentar.",
    "Minum air, jam segini biasanya udah kurang cairan.",
    "Cek task, sisa berapa yang masih bisa dikejar.",
    "Rebahan 10 menit boleh, pasang alarm."
  ],
  sore: [
    "Jalan sore sebentar, cari udara segar.",
    "Beresin yang belum kelar sebelum malam.",
    "Mandi sore biar badan segar lagi.",
    "Siapkan baju dan barang buat besok."
  ],
  malam: [
    "Isi Review hari ini, singkat aja.",
    "Taruh HP jauh dari kasur 30 menit sebelum tidur.",
    "Tulis satu hal yang berjalan baik hari ini.",
    "Rapikan meja dan cek jadwal besok."
  ]
};

const nudges = [
  "Satu hal dulu.",
  "Mulai 5 menit aja.",
  "Nggak perlu sempurna.",
  "Pelan-pelan, yang penting jalan.",
  "Habis ini boleh istirahat.",
  "Kamu bisa."
];

let currentEnergy = "normal";

function dayPart(now = new Date()) {
  const h = now.getHours();
  return h < 11 ? "pagi" : h < 15 ? "siang" : h < 18 ? "sore" : "malam";
}

// Kocok sekali, habiskan semua sebelum ngulang, dan tidak pernah kembar berurutan.
const suggestBags = {};
function pickNext(key, list) {
  let bag = suggestBags[key];
  if (!bag || !bag.items.length) {
    const items = list.map((_, i) => i);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    if (bag && items.length > 1 && items[items.length - 1] === bag.last) {
      items.unshift(items.pop());
    }
    bag = suggestBags[key] = { items, last: bag ? bag.last : -1 };
  }
  bag.last = bag.items.pop();
  return list[bag.last];
}

function suggestActivity() {
  const part = dayPart();
  const text = Math.random() < 0.35
    ? pickNext("time-" + part, timeIdeas[part])
    : pickNext(currentEnergy, focusActivities[currentEnergy]);

  const output = document.getElementById("focusSuggestion");
  if (output) output.textContent = text;
  return text;
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

  const template = data.templates[name];

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
  const grid = document.getElementById("templateGrid");
  if (!grid) return;
  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-template]");
    if (button) applyScheduleTemplate(button.dataset.template);
  });
  renderTemplateButtons();
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

  if (setupReview.bound) return;
  setupReview.bound = true;

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
        habit => isHabitDone(habit)
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
  document.addEventListener("click", event => {
    const el = event.target.closest("[data-page]");
    if (el) showPage(el.dataset.page);
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

  ensureDefaults();
  applyAccent();
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
  setupSettings();
  setupAvatar();

  const versionEl = document.getElementById("appVersion");
  if (versionEl) versionEl.textContent = "2.1 (20260924c)";

  refreshApp();

  startLive();

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

/* =========================================================
   THEO v2 — NAVIGATION, LIVE ENGINE, SETTINGS
========================================================= */

const NAV_PAGES = ["home", "schedule", "progress", "money", "widgets"];

function showPage(page) {
  const target = document.getElementById(page + "Page");
  if (!target) {
    console.error("Page tidak ditemukan:", page + "Page");
    return;
  }
  document.querySelectorAll(".page").forEach(p => { p.hidden = true; });
  target.hidden = false;

  const navPage = NAV_PAGES.includes(page) ? page : "widgets";
  document.querySelectorAll(".nav-item").forEach(n =>
    n.classList.toggle("active", n.dataset.page === navPage)
  );
  window.scrollTo({ top: 0 });

  const hooks = {
    schedule: renderSchedule, progress: updateProgressPage,
    habits: renderHabits, goals: renderGoals, money: renderMoney,
    grooming: renderGrooming, focus: suggestActivity,
    timer: updateTimerDisplay, review: setupReview, settings: renderSettings
  };
  if (hooks[page]) hooks[page]();
}

/* ---------- helpers ---------- */

const pad2 = n => String(n).padStart(2, "0");

function isHabitDone(habit) {
  return habit.lastCompleted === getLocalDateKey();
}

function habitStreak(habit) {
  if (!habit.lastCompleted) return 0;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const ok = habit.lastCompleted === getLocalDateKey() ||
             habit.lastCompleted === getLocalDateKey(y);
  return ok ? (habit.streak || 0) : 0;
}

/* ---------- defaults + accent ---------- */

const ACCENTS = {
  orange: { label: "Oranye", hex: "#FF5A00", rgb: "255,90,0", hover: "#FF7024" },
  blue:   { label: "Biru",   hex: "#3B82F6", rgb: "59,130,246", hover: "#60A5FA" },
  green:  { label: "Hijau",  hex: "#22C55E", rgb: "34,197,94", hover: "#4ADE80" },
  violet: { label: "Ungu",   hex: "#8B5CF6", rgb: "139,92,246", hover: "#A78BFA" },
  pink:   { label: "Pink",   hex: "#EC4899", rgb: "236,72,153", hover: "#F472B6" }
};

function ensureDefaults() {
  data.settings = { name: "Theo", accent: "orange", ...(data.settings || {}) };
  if (!data.templates || typeof data.templates !== "object" || Array.isArray(data.templates)) {
    data.templates = structuredClone(scheduleTemplates);
  }
  data.habits.forEach(h => { h.completed = isHabitDone(h); });
}

function applyAccent() {
  const a = ACCENTS[data.settings.accent] || ACCENTS.orange;
  const s = document.documentElement.style;
  s.setProperty("--accent", a.hex);
  s.setProperty("--ui-accent", a.hex);
  s.setProperty("--accent-hover", a.hover);
  s.setProperty("--accent-rgb", a.rgb);
}

/* ---------- live engine ---------- */

function updateClock(now = new Date()) {
  const el = document.getElementById("liveClock");
  if (el) el.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
}

function updateGreeting(now = new Date()) {
  const h = now.getHours();
  const g = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
  const name = data.settings.name || "Theo";
  const el = document.getElementById("homeGreeting");
  if (el) el.textContent = `${g}, ${name}.`;
  paintAvatar(document.getElementById("profileButton"));
  paintAvatar(document.getElementById("avatarPreview"));
}

function liveRefresh() {
  if (liveRefresh.busy) return;
  liveRefresh.busy = true;
  try {
    updateDates();
    updateGreeting();
    updateDailyOverview();
    updateProgress();
    updateNextReminder();
    updateSuggestion();
    const visible = id => { const el = document.getElementById(id); return el && !el.hidden; };
    if (visible("progressPage")) updateProgressPage();
    if (visible("schedulePage")) renderSchedule();
  } catch (error) {
    console.error("liveRefresh:", error);
  } finally {
    liveRefresh.busy = false;
  }
}

function renderAll() {
  renderTasks();
  renderSchedule();
  renderHabits();
  renderGoals();
  renderGrooming();
  renderMoney();
  renderTemplateButtons();
  renderSettings();
  liveRefresh();
}

function rolloverDay() {
  resetDailyTasks();
  ensureDefaults();
  notifiedReminders.clear();
  renderTasks();
  renderHabits();
  renderGrooming();
  liveRefresh();
}

let liveDay = "";
let liveMinute = "";

function tick() {
  const now = new Date();
  updateClock(now);

  const day = getLocalDateKey(now);
  if (day !== liveDay) {
    const first = liveDay === "";
    liveDay = day;
    if (!first) rolloverDay();
  }

  const minute = getCurrentTime();
  if (minute !== liveMinute) {
    liveMinute = minute;
    liveRefresh();
    checkReminders();
  }
}

function startLive() {
  tick();
  setInterval(tick, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  window.addEventListener("storage", e => {
    if (e.key !== STORAGE_KEY) return;
    data = loadData();
    ensureDefaults();
    applyAccent();
    renderAll();
  });
}

/* ---------- schedule templates (editable) ---------- */

function renderTemplateButtons() {
  const grid = document.getElementById("templateGrid");
  if (!grid) return;
  const names = Object.keys(data.templates);
  grid.innerHTML = names.length
    ? names.map(n => `<button class="theme-button" type="button" data-template="${escapeHTML(n)}">${escapeHTML(n.charAt(0).toUpperCase() + n.slice(1))}</button>`).join("")
    : `<p class="settings-note">Belum ada template. Buat di Settings.</p>`;
}

/* ---------- settings ---------- */

const LIST_EDITORS = [
  { key: "groomingItems", label: "Grooming", ph: "Rutinitas baru",
    make: t => ({ id: Date.now(), title: t, completed: false }), after: () => renderGrooming() },
  { key: "habits", label: "Habits", ph: "Habit baru",
    make: t => ({ id: Date.now(), title: t, completed: false, streak: 0, lastCompleted: null }), after: () => renderHabits() },
  { key: "goals", label: "Goals", ph: "Goal baru",
    make: t => ({ id: Date.now(), title: t, progress: 0 }), after: () => renderGoals() }
];

function renderDefaultsEditor() {
  const box = document.getElementById("defaultsEditor");
  if (!box) return;
  const esc = escapeHTML;

  const lists = LIST_EDITORS.map(L => `
    <div class="edit-group"><h3>${L.label}</h3>
      ${data[L.key].map(it => `
        <div class="edit-row">
          <input type="text" maxlength="60" value="${esc(it.title)}" data-list="${L.key}" data-id="${it.id}" aria-label="Nama ${L.label}">
          <button class="icon-btn" type="button" data-del-list="${L.key}" data-id="${it.id}" aria-label="Hapus">✕</button>
        </div>`).join("")}
      <div class="edit-row">
        <input type="text" maxlength="60" placeholder="${L.ph}" data-new="${L.key}">
        <button class="mini-button" type="button" data-add-list="${L.key}">Tambah</button>
      </div>
    </div>`).join("");

  const tpls = Object.entries(data.templates).map(([name, rows]) => `
    <div class="edit-group">
      <h3><span>Template ${esc(name)}</span>
        <button class="mini-button" type="button" data-del-tpl="${esc(name)}">Hapus</button></h3>
      ${rows.map((r, i) => `
        <div class="edit-row">
          <input type="text" maxlength="60" value="${esc(r.title)}" data-tpl="${esc(name)}" data-i="${i}" data-f="title" aria-label="Kegiatan">
          <input type="time" value="${esc(r.time)}" data-tpl="${esc(name)}" data-i="${i}" data-f="time" aria-label="Jam">
          <button class="icon-btn" type="button" data-del-row="${esc(name)}" data-i="${i}" aria-label="Hapus">✕</button>
        </div>`).join("")}
      <button class="mini-button" type="button" data-add-row="${esc(name)}">Tambah jadwal</button>
    </div>`).join("");

  box.innerHTML = lists +
    `<div class="edit-group"><h3>Template jadwal</h3></div>` + tpls +
    `<div class="edit-row"><input type="text" maxlength="20" placeholder="Nama template baru" data-new-tpl>
       <button class="mini-button" type="button" data-add-tpl>Buat</button></div>`;
}

function renderSettings() {
  const name = document.getElementById("settingsName");
  if (name && document.activeElement !== name) name.value = data.settings.name;

  const row = document.getElementById("accentRow");
  if (row) {
    row.innerHTML = Object.entries(ACCENTS).map(([k, a]) =>
      `<button class="swatch" type="button" style="--sw:${a.hex}" data-accent="${k}" aria-label="${a.label}" aria-pressed="${data.settings.accent === k}"></button>`
    ).join("");
  }

  const status = document.getElementById("notifStatus");
  if (status) {
    status.textContent = !("Notification" in window) ? "Browser ini tidak mendukung notifikasi."
      : Notification.permission === "granted" ? "Notifikasi aktif."
      : Notification.permission === "denied" ? "Notifikasi diblokir. Izinkan lewat setelan situs di browser."
      : "Notifikasi belum diaktifkan.";
  }

  if (!document.getElementById("defaultsEditor").contains(document.activeElement)) {
    renderDefaultsEditor();
  }
}

function setupSettings() {
  const name = document.getElementById("settingsName");
  if (name) {
    name.addEventListener("input", () => {
      data.settings.name = name.value.trim().slice(0, 24) || "Theo";
      saveData();
    });
  }

  const row = document.getElementById("accentRow");
  if (row) {
    row.addEventListener("click", e => {
      const b = e.target.closest("[data-accent]");
      if (!b) return;
      data.settings.accent = b.dataset.accent;
      applyAccent();
      saveData();
      renderSettings();
    });
  }

  const notif = document.getElementById("settingsNotifButton");
  if (notif) {
    notif.addEventListener("click", () => {
      if (!("Notification" in window)) return;
      Notification.requestPermission().then(renderSettings);
    });
  }

  const reset = document.getElementById("resetDataButton");
  if (reset) {
    reset.addEventListener("click", () => {
      if (!confirm("Hapus SEMUA data (task, habit, goal, uang, pengaturan)? Tidak bisa dibatalkan.")) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("theoDailyLastReset");
      location.reload();
    });
  }

  const box = document.getElementById("defaultsEditor");
  if (!box) return;
  const save = () => { saveData(); renderDefaultsEditor(); };
  const editor = key => LIST_EDITORS.find(l => l.key === key);

  box.addEventListener("change", e => {
    const t = e.target;
    const v = t.value.trim();
    if (t.dataset.list) {
      const item = data[t.dataset.list].find(x => x.id === Number(t.dataset.id));
      if (!item) return;
      if (!v) { t.value = item.title; return; }
      item.title = v;
      saveData();
      editor(t.dataset.list).after();
    } else if (t.dataset.tpl) {
      const rowData = (data.templates[t.dataset.tpl] || [])[Number(t.dataset.i)];
      if (!rowData) return;
      if (!v) { t.value = rowData[t.dataset.f]; return; }
      rowData[t.dataset.f] = v;
      saveData();
    }
  });

  box.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const d = b.dataset;

    if (d.delList) {
      if (!confirm("Hapus item ini?")) return;
      data[d.delList] = data[d.delList].filter(x => x.id !== Number(d.id));
      editor(d.delList).after();
      save();
    } else if (d.addList) {
      const input = box.querySelector(`[data-new="${d.addList}"]`);
      const v = input.value.trim();
      if (!v) return;
      data[d.addList].push(editor(d.addList).make(v));
      editor(d.addList).after();
      save();
    } else if (d.delRow !== undefined) {
      data.templates[d.delRow].splice(Number(d.i), 1);
      save();
    } else if (d.addRow !== undefined) {
      data.templates[d.addRow].push({ title: "Kegiatan baru", time: "08:00" });
      save();
    } else if (d.delTpl !== undefined) {
      if (!confirm(`Hapus template "${d.delTpl}"?`)) return;
      delete data.templates[d.delTpl];
      save();
      renderTemplateButtons();
    } else if ("addTpl" in d) {
      const input = box.querySelector("[data-new-tpl]");
      const v = input.value.trim().toLowerCase();
      if (!v || data.templates[v]) return;
      data.templates[v] = [{ title: "Kegiatan baru", time: "08:00" }];
      save();
      renderTemplateButtons();
    }
  });
}

/* ---------- foto profil ---------- */

function paintAvatar(el) {
  if (!el) return;
  const photo = data.settings.avatar;
  el.classList.toggle("has-photo", !!photo);
  if (photo) {
    el.style.setProperty("background-image", `url("${photo}")`, "important");
    el.textContent = "";
  } else {
    el.style.removeProperty("background-image");
    el.textContent = (data.settings.name || "Theo").trim().slice(0, 2).toUpperCase();
  }
}

function setupAvatar() {
  const input = document.getElementById("avatarInput");
  const remove = document.getElementById("avatarRemove");

  if (input) {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 256;
        canvas.getContext("2d").drawImage(
          img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256
        );
        URL.revokeObjectURL(url);
        data.settings.avatar = canvas.toDataURL("image/jpeg", 0.85);
        saveData();
        input.value = "";
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert("Foto tidak bisa dibaca. Coba foto lain.");
      };

      img.src = url;
    });
  }

  if (remove) {
    remove.addEventListener("click", () => {
      delete data.settings.avatar;
      saveData();
    });
  }
}
