const initialState = {
  tasks: [],
  streak: 0,
  lastCheckInDate: null,
  checkInDates: [],
};

let progressState = structuredClone(initialState);

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getProgressPayload() {
  const totalTasks = progressState.tasks.length;
  const completedTasks = progressState.tasks.filter(
    (task) => task.completed,
  ).length;

  return {
    totalTasks,
    completedTasks,
    completionRate:
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    streak: progressState.streak,
    hasCheckedIn: progressState.lastCheckInDate === getDateKey(),
    lastCheckInDate: progressState.lastCheckInDate,
    checkInDates: progressState.checkInDates,
  };
}

export function getProgress(_req, res) {
  return res.json(getProgressPayload());
}

export function replaceTasks(req, res) {
  const { tasks } = req.body;

  if (!Array.isArray(tasks)) {
    return res.status(400).json({ message: "tasks 必須是陣列。" });
  }

  progressState.tasks = tasks.map((task) => ({
    id: String(task.id),
    completed: Boolean(task.completed),
  }));

  return res.json(getProgressPayload());
}

export function completeTask(req, res) {
  const task = progressState.tasks.find(
    (item) => item.id === String(req.params.id),
  );

  if (!task) {
    return res.status(404).json({ message: "找不到指定任務。" });
  }

  task.completed =
    typeof req.body.completed === "boolean" ? req.body.completed : true;

  return res.json({
    task,
    progress: getProgressPayload(),
  });
}

export function checkIn(_req, res) {
  const progress = getProgressPayload();
  const today = getDateKey();

  if (
    progress.totalTasks === 0 ||
    progress.completedTasks < progress.totalTasks
  ) {
    return res.status(400).json({
      message: "請先完成所有今日任務再打卡。",
      progress,
    });
  }

  if (progressState.lastCheckInDate === today) {
    return res.status(409).json({
      message: "今日已完成打卡。",
      progress,
    });
  }

  progressState.streak += 1;
  progressState.lastCheckInDate = today;
  progressState.checkInDates = [
    ...new Set([...progressState.checkInDates, today]),
  ];

  return res.json({
    message: "打卡成功。",
    progress: getProgressPayload(),
  });
}

export function resetProgressForTests() {
  progressState = structuredClone(initialState);
}
