import FeatureButton from "../components/FeatureButton";

function MainHubPage({ profile, goToPage }) {
  // 把 weakSubjects 轉成顯示用字串（相容陣列與字串兩種格式）
  const weakDisplay = Array.isArray(profile.weakSubjects)
    ? profile.weakSubjects.join("、")
    : profile.weakSubjects || "尚未填寫";

  const preferredDisplay = Array.isArray(profile.preferredSubjects)
    ? profile.preferredSubjects.join("、")
    : profile.preferredSubjects || "尚未填寫";

  // 已匯入的課程（上傳課表 PDF 後才有）
  const courses = profile.courses || [];

  return (
    <section className="screen">
      <p className="section-label">Learning Hub</p>
      <h2 className="screen-title">歡迎，{profile.name}</h2>

      {/* 個人摘要 */}
      <div className="summary-card">
        <span>近期測驗目標</span>
        <h3>{profile.examGoal || "尚未填寫"}</h3>
        <p>可讀書時段：{profile.availableTime || "尚未填寫"}</p>
        <p>想加強科目：{weakDisplay}</p>
        <p>擅長科目：{preferredDisplay}</p>
      </div>

      {/* 功能入口 */}
      <div className="feature-list">
        <FeatureButton
          title="AI 學習排程"
          description="根據課表與近期測驗目標，產生今日學習任務。"
          meta="Plan"
          onClick={() => goToPage("schedule")}
        />

        <FeatureButton
          title="Study Buddy 配對"
          description="尋找相同科目、相近目標與重疊時段的學習夥伴。"
          meta="Match"
          onClick={() => goToPage("match")}
        />

        <FeatureButton
          title="我的讀書群組"
          description="建立群組、邀請學伴、查看群組進度"
          onClick={() => goToPage("groups")}
        />

        <FeatureButton
          title="Streak 進度追蹤"
          description="追蹤任務完成率、連續打卡與本週學習狀態。"
          meta="Track"
          onClick={() => goToPage("progress")}
        />
      </div>

      {/* 已匯入課程（上傳課表後才顯示） */}
      {courses.length > 0 && (
        <div className="section-block">
          <h3>已匯入課程</h3>
          <div className="card-list">
            {courses.map((course) => (
              <div key={course.courseCode} className="summary-card" style={{ gap: 4 }}>
                <span>{course.type}・{course.credits} 學分</span>
                <h3 style={{ fontSize: 16 }}>{course.courseName}</h3>
                <p style={{ margin: 0, fontSize: 13 }}>課號：{course.courseCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default MainHubPage;