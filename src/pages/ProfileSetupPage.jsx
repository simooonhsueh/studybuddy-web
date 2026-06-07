import { useRef, useState } from "react";
import { saveUserProfile } from "../services/userApi";

function ProfileSetupPage({ profile, setProfile, onSubmit, goToPage }) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function updateField(key, value) {
    setProfile({
      ...profile,
      [key]: value,
    });
  }

  async function handleScheduleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("⏳ 解析中...");

    const formData = new FormData();
    formData.append("schedule", file);

    try {
      const res = await fetch("http://localhost:5000/api/user/parse-schedule", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.status === "success") {
        const courseNames = result.data
          .map((course) => course.courseName)
          .join("、");

        setProfile((prev) => ({
          ...prev,
          preferredSubjects: courseNames,
          courses: result.data,
        }));

        setUploadStatus(`✅ 成功匯入 ${result.data.length} 堂課！`);
      } else {
        setUploadStatus("❌ 解析失敗，請確認是否為選課表 PDF");
      }
    } catch (error) {
      console.error("上傳課表失敗：", error);
      setUploadStatus("❌ 上傳失敗，請確認後端是否運行");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit() {
    if (!profile.name?.trim()) {
      alert("請輸入使用者名稱。");
      return;
    }

    if (!profile.examGoal?.trim()) {
      alert("請輸入近期測驗目標。");
      return;
    }

    if (!profile.examDate) {
      alert("請選擇考試日期。");
      return;
    }

    if (!profile.dailyStudyHours || !String(profile.dailyStudyHours).trim()) {
      alert("請輸入每天可讀書時間。");
      return;
    }

    if (!profile.availableStartTime || !profile.availableEndTime) {
      alert("請選擇可讀書開始與結束時間。");
      return;
    }

    if (profile.availableStartTime >= profile.availableEndTime) {
      alert("可讀書結束時間必須晚於開始時間。");
      return;
    }

    try {
      const result = await saveUserProfile(profile);

      localStorage.setItem("studybuddy-profile", JSON.stringify(result.data));

      setProfile(result.data);

      onSubmit();
    } catch (error) {
      console.error("儲存使用者資料失敗：", error);
      alert(error.message || "儲存失敗，請稍後再試。");
    }
  }

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("welcome")}>
        ← 回首頁
      </button>

      <p className="section-label">Profile Setup</p>
      <h2 className="screen-title">建立你的學習檔案</h2>
      <p className="screen-description">
        請輸入備考目標、考試日期與每天可讀時間，系統會用這些資料產生學習計畫與推薦學伴。
      </p>

      <div className="form-card">
        <div className="schedule-upload-section">
          <p className="upload-hint">📋 有成大選課表？直接上傳自動填入！</p>

          <label className={`upload-button${isUploading ? " disabled" : ""}`}>
            {isUploading ? "解析中..." : "上傳課表 PDF"}
            <input
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleScheduleUpload}
              disabled={isUploading}
            />
          </label>

          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>

        <label>
          使用者名稱
          <input
            value={profile.name || ""}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="例如：Yi-Chieh"
          />
        </label>

        <label>
          近期測驗目標
          <input
            value={profile.examGoal || ""}
            onChange={(event) => updateField("examGoal", event.target.value)}
            placeholder="例如：兩週後英文段考 85 分"
          />
        </label>

        <label>
          考試日期
          <DateInput
            value={profile.examDate || ""}
            onChange={(event) => updateField("examDate", event.target.value)}
          />
        </label>

        <label>
          每天可讀書時間，小時
          <input
            type="number"
            min="0"
            step="0.5"
            value={profile.dailyStudyHours || ""}
            onChange={(event) =>
              updateField("dailyStudyHours", event.target.value)
            }
            placeholder="例如：3"
          />
        </label>

        <label>
          可讀書開始時間
          <TimeInput
            value={profile.availableStartTime || ""}
            onChange={(event) =>
              updateField("availableStartTime", event.target.value)
            }
          />
        </label>

        <label>
          可讀書結束時間
          <TimeInput
            value={profile.availableEndTime || ""}
            onChange={(event) =>
              updateField("availableEndTime", event.target.value)
            }
          />
        </label>

        <label>
          偏好科目
          <input
            value={profile.preferredSubjects || ""}
            onChange={(event) =>
              updateField("preferredSubjects", event.target.value)
            }
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <label>
          想加強科目
          <input
            value={profile.weakSubjects || ""}
            onChange={(event) => updateField("weakSubjects", event.target.value)}
            placeholder="例如：英文閱讀、數學函數"
          />
        </label>

        <label>
          進度公開範圍
          <select
            value={profile.progressVisibility || "public"}
            onChange={(event) =>
              updateField("progressVisibility", event.target.value)
            }
          >
            <option value="public">公開給所有人</option>
            <option value="group">只公開給群組成員</option>
            <option value="private">只有自己可見</option>
          </select>
        </label>

        <label>
          起床時間
          <TimeInput
            value={profile.wakeTime || ""}
            onChange={(event) => updateField("wakeTime", event.target.value)}
          />
        </label>

        <label>
          睡覺時間
          <TimeInput
            value={profile.sleepTime || ""}
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

export default ProfileSetupPage;