import { saveUserProfile } from "../services/userApi";

function ProfileSetupPage({ profile, setProfile, onSubmit }) {
  function updateField(key, value) {
    setProfile({
      ...profile,
      [key]: value,
    });
  }

  async function handleSubmit() {
    if (!profile.name.trim()) {
      alert("請輸入使用者名稱。");
      return;
    }

    if (!profile.examGoal.trim()) {
      alert("請輸入近期測驗目標。");
      return;
    }

    if (!profile.examDate) {
      alert("請選擇考試日期。");
      return;
    }

    if (!profile.dailyStudyHours.trim()) {
      alert("請輸入每天可讀書時間。");
      return;
    }

    if (!profile.availableTime.trim()) {
      alert("請輸入可讀書時段。");
      return;
    }

    try {
      localStorage.setItem("studybuddy-profile", JSON.stringify(profile));

      await saveUserProfile(profile);

      onSubmit();
    } catch (error) {
      console.error("儲存使用者資料失敗：", error);

      alert("後端儲存失敗，但已先儲存在瀏覽器。");

      onSubmit();
    }
  }

  return (
    <section className="screen">
      <p className="section-label">Profile Setup</p>
      <h2 className="screen-title">建立你的學習檔案</h2>
      <p className="screen-description">
        請輸入備考目標、考試日期與每天可讀時間，系統會用這些資料產生學習計畫與推薦學伴。
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
          近期測驗目標
          <input
            value={profile.examGoal}
            onChange={(event) => updateField("examGoal", event.target.value)}
            placeholder="例如：兩週後英文段考 85 分"
          />
        </label>

        <label>
          考試日期
          <input
            type="date"
            value={profile.examDate}
            onChange={(event) => updateField("examDate", event.target.value)}
          />
        </label>

        <label>
          每天可讀書時間，小時
          <input
            type="number"
            min="0"
            step="0.5"
            value={profile.dailyStudyHours}
            onChange={(event) =>
              updateField("dailyStudyHours", event.target.value)
            }
            placeholder="例如：3"
          />
        </label>

        <label>
          偏好科目
          <input
            value={profile.preferredSubjects}
            onChange={(event) =>
              updateField("preferredSubjects", event.target.value)
            }
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <label>
          想加強科目
          <input
            value={profile.weakSubjects}
            onChange={(event) => updateField("weakSubjects", event.target.value)}
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <label>
          可讀書時段
          <input
            value={profile.availableTime}
            onChange={(event) =>
              updateField("availableTime", event.target.value)
            }
            placeholder="例如：晚上 8:00 - 11:00"
          />
        </label>

        <label>
          起床時間
          <input
            type="time"
            value={profile.wakeTime}
            onChange={(event) => updateField("wakeTime", event.target.value)}
          />
        </label>

        <label>
          睡覺時間
          <input
            type="time"
            value={profile.sleepTime}
            onChange={(event) => updateField("sleepTime", event.target.value)}
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