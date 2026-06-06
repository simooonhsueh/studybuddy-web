import { useEffect, useState } from "react";
import "./App.css";

import WelcomePage from "./pages/WelcomePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import MainHubPage from "./pages/MainHubPage";
import SchedulePage from "./pages/SchedulePage";
import MatchPage from "./pages/MatchPage";
import ProgressPage from "./pages/ProgressPage";
import LoginPage from "./pages/LoginPage";
import { taskTemplates } from "./data/mockData";
import {
  clearProgressState,
  defaultProgressState,
  getLocalDateKey,
} from "./services/progressStorage";
import {
  checkInProgress,
  getProgress,
  syncProgressTasks,
  updateProgressTask,
} from "./services/progressApi";

function toProgressState(data) {
  return {
    checkedTasks: data.tasks
      .filter((task) => task.isCompleted)
      .map((task) => Number(task.id)),
    taskDate: getLocalDateKey(),
    streak: data.streak,
    lastCheckInDate: data.lastCheckInDate,
    checkInDates: data.checkInDates,
  };
}

function App() {
  const [page, setPage] = useState("welcome");

  const [profile, setProfile] = useState({
    name: "",
    examGoal: "",
    examDate: "",
    dailyStudyHours: "",
    preferredSubjects: "",
    weakSubjects: "",
    availableTime: "",
    wakeTime: "",
    sleepTime: "",
  });

  const [progressState, setProgressState] = useState(defaultProgressState);
  const today = getLocalDateKey();
  const hasCheckedIn = progressState.lastCheckInDate === today;

  useEffect(() => {
    if (!profile.id) {
      return;
    }

    let cancelled = false;

    async function loadUserProgress() {
      try {
        let data = await getProgress(profile.id);

        if (data.totalTasks === 0) {
          data = await syncProgressTasks(
            profile.id,
            taskTemplates.map((_, index) => ({ id: String(index) })),
          );
        }

        if (!cancelled) {
          setProgressState(toProgressState(data));
        }
      } catch (error) {
        console.error("載入 Progress 失敗：", error);
        if (!cancelled) {
          alert("無法載入學習進度，請確認後端服務已啟動。");
        }
      }
    }

    loadUserProgress();

    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  function goToPage(nextPage) {
    setPage(nextPage);
  }

  async function toggleTask(index) {
    if (hasCheckedIn) return;

    if (!profile.id) {
      alert("請先登入或建立學習檔案。");
      return;
    }

    try {
      const isCompleted = !progressState.checkedTasks.includes(index);
      const data = await updateProgressTask(profile.id, index, isCompleted);
      setProgressState(toProgressState(data));
    } catch (error) {
      console.error("更新任務失敗：", error);
      alert(error.message || "更新任務失敗，請稍後再試。");
    }
  }

  async function completeCheckIn(totalTasks) {
    if (progressState.checkedTasks.length < totalTasks) {
      alert("請先完成所有任務再打卡。");
      return;
    }

    if (hasCheckedIn) {
      alert("今日已完成打卡。");
      return;
    }

    try {
      const data = await checkInProgress(profile.id);
      setProgressState(toProgressState(data));
      alert("打卡成功，連續打卡天數已更新。");
    } catch (error) {
      console.error("打卡失敗：", error);
      alert(error.message || "打卡失敗，請稍後再試。");
    }
  }

  function resetDemo() {
    setPage("welcome");
    setProfile({
      name: "",
      examGoal: "",
      examDate: "",
      dailyStudyHours: "",
      preferredSubjects: "",
      weakSubjects: "",
      availableTime: "",
      wakeTime: "",
      sleepTime: "",
    });
    setProgressState(defaultProgressState);
    clearProgressState();
  }

  return (
    <div className="app-bg">
      <div className="app-frame">
        <header className="app-header">
          <button className="brand-button" onClick={() => goToPage("welcome")}>
            <span className="brand-title">StudyBuddy AI</span>
            <span className="brand-subtitle">Learning Management</span>
          </button>

          {page !== "welcome" && page !== "login" && page !== "profile" && (
            <button className="header-action" onClick={resetDemo}>
              Log out
            </button>
          )}
        </header>

        <main className="app-main">
          {page === "welcome" && (
            <WelcomePage
              onStart={() => goToPage("profile")}
              onLogin={() => goToPage("login")}
            />
          )}

          {page === "login" && (
            <LoginPage
              setProfile={setProfile}
              onLoginSuccess={() => goToPage("hub")}
              goToPage={goToPage}
            />
          )}

          {page === "profile" && (
            <ProfileSetupPage
              profile={profile}
              setProfile={setProfile}
              onSubmit={() => goToPage("hub")}
              goToPage={goToPage}
            />
          )}

          {page === "hub" && (
            <MainHubPage profile={profile} goToPage={goToPage} />
          )}

          {page === "schedule" && (
            <SchedulePage
              profile={profile}
              goToPage={goToPage}
              checkedTasks={progressState.checkedTasks}
              toggleTask={toggleTask}
            />
          )}

          {page === "match" && (
            <MatchPage profile={profile} goToPage={goToPage} />
          )}

          {page === "progress" && (
            <ProgressPage
              profile={profile}
              goToPage={goToPage}
              checkedTasks={progressState.checkedTasks}
              streak={progressState.streak}
              hasCheckedIn={hasCheckedIn}
              checkInDates={progressState.checkInDates}
              completeCheckIn={completeCheckIn}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
