const fs = require("fs");
const path = require("path");

const dataFilePath =
  process.env.PROGRESS_DATA_FILE ||
  path.join(__dirname, "../data/progress.json");
const profileFilePath =
  process.env.PROFILE_DATA_FILE || path.join(__dirname, "../data/profile.json");
const MAX_TASKS = 100;

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreviousDateKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

function createProgressState() {
  return {
    tasks: [],
    taskDate: getDateKey(),
    streak: 0,
    lastCheckInDate: null,
    checkInDates: [],
  };
}

function readStore() {
  try {
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
    return data && typeof data.users === "object" ? data : { users: {} };
  } catch {
    return { users: {} };
  }
}

function writeStore(store) {
  fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), "utf-8");
}

function getUserId(req) {
  const userId =
    req.get?.("x-user-id") || req.query?.userId || req.body?.userId;
  const normalizedUserId = userId ? String(userId) : "";

  return /^\d+$/.test(normalizedUserId) ? normalizedUserId : null;
}

function userExists(userId) {
  try {
    const profiles = JSON.parse(fs.readFileSync(profileFilePath, "utf-8"));
    return (
      Array.isArray(profiles) &&
      profiles.some((profile) => String(profile.id) === userId)
    );
  } catch {
    return false;
  }
}

function getUserProgress(store, userId) {
  if (!store.users[userId]) {
    store.users[userId] = createProgressState();
  }

  const progress = store.users[userId];
  const today = getDateKey();

  if (progress.taskDate !== today) {
    progress.tasks = progress.tasks.map((task) => ({
      ...task,
      isCompleted: false,
    }));
    progress.taskDate = today;
  }

  return progress;
}

function getProgressPayload(progress) {
  const totalTasks = progress.tasks.length;
  const completedTasks = progress.tasks.filter(
    (task) => task.isCompleted,
  ).length;

  return {
    tasks: progress.tasks,
    totalTasks,
    completedTasks,
    completionRate:
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    streak: progress.streak,
    hasCheckedIn: progress.lastCheckInDate === getDateKey(),
    lastCheckInDate: progress.lastCheckInDate,
    checkInDates: progress.checkInDates,
  };
}

function withUserProgress(req, res, handler) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      status: "error",
      message: "缺少或無效的使用者 ID。",
    });
  }

  if (!userExists(userId)) {
    return res.status(403).json({
      status: "error",
      message: "找不到使用者。",
    });
  }

  const store = readStore();
  const progress = getUserProgress(store, userId);
  const response = handler(progress);
  writeStore(store);

  return response;
}

function getProgress(req, res) {
  return withUserProgress(req, res, (progress) =>
    res.status(200).json({
      status: "success",
      data: getProgressPayload(progress),
    }),
  );
}

function replaceTasks(req, res) {
  const tasks = req.body?.tasks;

  if (!Array.isArray(tasks) || tasks.length > MAX_TASKS) {
    return res.status(400).json({
      status: "error",
      message: `tasks 必須是陣列，且最多 ${MAX_TASKS} 項。`,
    });
  }

  return withUserProgress(req, res, (progress) => {
    const existingTasks = new Map(
      progress.tasks.map((task) => [String(task.id), task]),
    );

    progress.tasks = tasks.map((task) => {
      const id = String(task.id);
      const existingTask = existingTasks.get(id);

      return {
        id,
        isCompleted:
          typeof task.isCompleted === "boolean"
            ? task.isCompleted
            : Boolean(existingTask?.isCompleted),
      };
    });

    return res.status(200).json({
      status: "success",
      data: getProgressPayload(progress),
    });
  });
}

function completeTask(req, res) {
  return withUserProgress(req, res, (progress) => {
    if (progress.lastCheckInDate === getDateKey()) {
      return res.status(409).json({
        status: "error",
        message: "今日已完成打卡，無法修改任務。",
      });
    }

    const task = progress.tasks.find(
      (item) => item.id === String(req.params.id),
    );

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "找不到指定任務。",
      });
    }

    const requestedValue = req.body?.isCompleted ?? req.body?.completed;
    task.isCompleted =
      typeof requestedValue === "boolean" ? requestedValue : true;

    return res.status(200).json({
      status: "success",
      data: getProgressPayload(progress),
    });
  });
}

function checkIn(req, res) {
  return withUserProgress(req, res, (progress) => {
    const payload = getProgressPayload(progress);
    const today = getDateKey();

    if (payload.totalTasks === 0 || payload.completedTasks < payload.totalTasks) {
      return res.status(400).json({
        status: "error",
        message: "請先完成所有今日任務再打卡。",
        data: payload,
      });
    }

    if (progress.lastCheckInDate === today) {
      return res.status(409).json({
        status: "error",
        message: "今日已完成打卡。",
        data: payload,
      });
    }

    progress.streak =
      progress.lastCheckInDate === getPreviousDateKey(today)
        ? progress.streak + 1
        : 1;
    progress.lastCheckInDate = today;
    progress.checkInDates = [...new Set([...progress.checkInDates, today])];

    return res.status(200).json({
      status: "success",
      message: "打卡成功。",
      data: getProgressPayload(progress),
    });
  });
}

module.exports = {
  getProgress,
  replaceTasks,
  completeTask,
  checkIn,
};
