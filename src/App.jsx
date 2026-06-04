import { useState } from "react";
import "./App.css";

import WelcomePage from "./pages/WelcomePage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import MainHubPage from "./pages/MainHubPage";
import SchedulePage from "./pages/SchedulePage";
import MatchPage from "./pages/MatchPage";
import ProgressPage from "./pages/ProgressPage";

function App() {
  const [page, setPage] = useState("welcome");

  const [profile, setProfile] = useState({
    name: "",
    schedule: "",
    examGoal: "",
    studyTime: "",
    focusSubject: "",
  });

  const [checkedTasks, setCheckedTasks] = useState([]);
  const [streak, setStreak] = useState(5);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  function goToPage(nextPage) {
    setPage(nextPage);
  }

  function toggleTask(index) {
    if (hasCheckedIn) return;

    if (checkedTasks.includes(index)) {
      setCheckedTasks(checkedTasks.filter((item) => item !== index));
    } else {
      setCheckedTasks([...checkedTasks, index]);
    }
  }

  function completeCheckIn(totalTasks) {
    if (checkedTasks.length < totalTasks) {
      alert("請先完成所有任務再打卡。");
      return;
    }

    if (hasCheckedIn) {
      alert("今日已完成打卡。");
      return;
    }

    setStreak(streak + 1);
    setHasCheckedIn(true);
    alert("打卡成功，連續打卡天數已更新。");
  }

  function resetDemo() {
    setPage("welcome");
    setProfile({
      name: "",
      schedule: "",
      examGoal: "",
      studyTime: "",
      focusSubject: "",
    });
    setCheckedTasks([]);
    setStreak(5);
    setHasCheckedIn(false);
  }

  return (
    <div className="app-bg">
      <div className="app-frame">
        <header className="app-header">
          <button className="brand-button" onClick={() => goToPage("welcome")}>
            <span className="brand-title">StudyBuddy AI</span>
            <span className="brand-subtitle">Learning Management</span>
          </button>

          {page !== "welcome" && (
            <button className="header-action" onClick={resetDemo}>
              Reset
            </button>
          )}
        </header>

        <main className="app-main">
          {page === "welcome" && (
            <WelcomePage onStart={() => goToPage("profile")} />
          )}

          {page === "profile" && (
            <ProfileSetupPage
              profile={profile}
              setProfile={setProfile}
              onSubmit={() => goToPage("hub")}
            />
          )}

          {page === "hub" && (
            <MainHubPage profile={profile} goToPage={goToPage} />
          )}

          {page === "schedule" && (
            <SchedulePage
              profile={profile}
              goToPage={goToPage}
              checkedTasks={checkedTasks}
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
              checkedTasks={checkedTasks}
              streak={streak}
              hasCheckedIn={hasCheckedIn}
              completeCheckIn={completeCheckIn}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;