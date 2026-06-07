import { useState, useRef } from "react";
import { updateUserProfile } from "../services/userApi";

function TimeInput({ value, onChange }) {
  const inputRef = useRef(null);

  function openTimePicker() {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef.current?.focus();
    }
  }

  return (
    <div className="time-input-wrapper">
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={onChange}
        className="time-input"
      />

      <button
        type="button"
        className="time-picker-button"
        onClick={openTimePicker}
        aria-label="Show time picker"
      >
        🕒
      </button>
    </div>
  );
}

function DateInput({ value, onChange }) {
  const inputRef = useRef(null);

  function openDatePicker() {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef.current?.focus();
    }
  }

  return (
    <div className="date-input-wrapper">
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={onChange}
        className="date-input"
      />

      <button
        type="button"
        className="date-picker-button"
        onClick={openDatePicker}
        aria-label="Show date picker"
      >
        📅
      </button>
    </div>
  );
}

function EditProfilePage({ profile, setProfile, goToPage }) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    examGoal: profile.examGoal || "",
    examDate: profile.examDate || "",
    dailyStudyHours: profile.dailyStudyHours || "",
    preferredSubjects: profile.preferredSubjects || "",
    weakSubjects: profile.weakSubjects || "",
    availableStartTime: profile.availableStartTime || "",
    availableEndTime: profile.availableEndTime || "",
    wakeTime: profile.wakeTime || "",
    sleepTime: profile.sleepTime || "",
  });

  function updateField(key, value) {
    setFormData({
      ...formData,
      [key]: value,
    });
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      alert("請輸入使用者名稱。");
      return;
    }

    if (!formData.examGoal.trim()) {
      alert("請輸入近期測驗目標。");
      return;
    }

    if (!formData.examDate) {
      alert("請選擇考試日期。");
      return;
    }

    if (!formData.dailyStudyHours.trim()) {
      alert("請輸入每天可讀書時間。");
      return;
    }

    if (!formData.availableStartTime || !formData.availableEndTime) {
      alert("請選擇可讀書開始與結束時間。");
      return;
    }

    if (formData.availableStartTime >= formData.availableEndTime) {
      alert("可讀書結束時間必須晚於開始時間。");
      return;
    }

    if (!profile.id) {
      alert("找不到使用者 ID，請重新登入。");
      return;
    }

    try {
      const result = await updateUserProfile(profile.id, formData);

      localStorage.setItem(
        "studybuddy-profile",
        JSON.stringify(result.data)
      );

      setProfile(result.data);

      alert("個人資料已更新。");

      goToPage("hub");
    } catch (error) {
      console.error("更新個人資料失敗：", error);
      alert(error.message || "更新失敗，請稍後再試。");
    }
  }

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("hub")}>
        ← 回主頁
      </button>

      <p className="section-label">Edit Profile</p>
      <h2 className="screen-title">修改個人資料</h2>
      <p className="screen-description">
        你可以更新備考目標、可讀書時間、加強科目與作息資料。
      </p>

      <div className="form-card">
        <label>
          使用者名稱
          <input
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="例如：Yi-Chieh"
          />
        </label>

        <label>
          近期測驗目標
          <input
            value={formData.examGoal}
            onChange={(event) => updateField("examGoal", event.target.value)}
            placeholder="例如：兩週後英文段考 85 分"
          />
        </label>

        <label>
          考試日期
          <DateInput
            value={formData.examDate}
            onChange={(event) => updateField("examDate", event.target.value)}
          />
        </label>

        <label>
          每天可讀書時間，小時
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.dailyStudyHours}
            onChange={(event) =>
              updateField("dailyStudyHours", event.target.value)
            }
            placeholder="例如：3"
          />
        </label>

        <label>
          偏好科目
          <input
            value={formData.preferredSubjects}
            onChange={(event) =>
              updateField("preferredSubjects", event.target.value)
            }
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <label>
          想加強科目
          <input
            value={formData.weakSubjects}
            onChange={(event) =>
              updateField("weakSubjects", event.target.value)
            }
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <label>
          可讀書開始時間
          <TimeInput
            value={formData.availableStartTime}
            onChange={(event) =>
              updateField("availableStartTime", event.target.value)
            }
          />
        </label>

        <label>
          可讀書結束時間
          <TimeInput
            value={formData.availableEndTime}
            onChange={(event) =>
              updateField("availableEndTime", event.target.value)
            }
          />
        </label>

        <label>
          起床時間
          <TimeInput
            value={formData.wakeTime}
            onChange={(event) => updateField("wakeTime", event.target.value)}
          />
        </label>

        <label>
          睡覺時間
          <TimeInput
            value={formData.sleepTime}
            onChange={(event) => updateField("sleepTime", event.target.value)}
          />
        </label>

        <button className="primary-button" onClick={handleSave}>
          儲存修改
        </button>
      </div>
    </section>
  );
}

export default EditProfilePage;