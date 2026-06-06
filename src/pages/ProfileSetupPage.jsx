function ProfileSetupPage({ profile, setProfile, onSubmit }) {
  function updateField(key, value) {
    setProfile({
      ...profile,
      [key]: value,
    });
  }

  function handleSubmit() {
    if (!profile.name.trim()) {
      alert("請輸入使用者名稱。");
      return;
    }

    if (!profile.examGoal.trim()) {
      alert("請輸入近期測驗目標。");
      return;
    }

    onSubmit();
  }

  return (
    <section className="screen">
      <p className="section-label">Profile Setup</p>
      <h2 className="screen-title">建立你的學習檔案</h2>
      <p className="screen-description">
        請輸入基本學習資訊，系統會用這些資料生成後續的 Demo 情境。
      </p>

      <div className="form-card">
        <label>
          使用者名稱
          <input
            value={profile.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="例如：Yi-Chieh"
          />
        </label>

        <label>
          目前課表
          <textarea
            value={profile.schedule}
            onChange={(event) => updateField("schedule", event.target.value)}
            placeholder="例如：週一數學、週三英文、週五歷史"
          />
        </label>

        <label>
          近期測驗目標
          <input
            value={profile.examGoal}
            onChange={(event) => updateField("examGoal", event.target.value)}
            placeholder="例如：兩週後英文段考"
          />
        </label>

        <label>
          可讀書時段
          <input
            value={profile.studyTime}
            onChange={(event) => updateField("studyTime", event.target.value)}
            placeholder="例如：晚上 8:00 - 10:00"
          />
        </label>

        <label>
          想加強科目
          <input
            value={profile.focusSubject}
            onChange={(event) =>
              updateField("focusSubject", event.target.value)
            }
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <button className="primary-button" onClick={handleSubmit}>
          建立學習檔案
        </button>
      </div>
    </section>
  );
}

export default ProfileSetupPage;