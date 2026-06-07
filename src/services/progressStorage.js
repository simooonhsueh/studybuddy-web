const STORAGE_KEY = "studybuddy-progress";

export const defaultProgressState = {
  checkedTasks: [],
  taskDate: null,
  streak: 0,
  lastCheckInDate: null,
  checkInDates: [],
};

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function loadProgressState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!savedState) return defaultProgressState;

    const today = getLocalDateKey();
    const isToday = savedState.taskDate === today;

    return {
      ...defaultProgressState,
      ...savedState,
      checkedTasks: isToday && Array.isArray(savedState.checkedTasks)
        ? savedState.checkedTasks
        : [],
      taskDate: today,
      checkInDates: Array.isArray(savedState.checkInDates)
        ? savedState.checkInDates
        : [],
    };
  } catch {
    return defaultProgressState;
  }
}

export function saveProgressState(progressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));
}

export function clearProgressState() {
  localStorage.removeItem(STORAGE_KEY);
}
