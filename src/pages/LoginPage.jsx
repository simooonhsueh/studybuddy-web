import { useState } from "react";
import { loginUserProfile } from "../services/userApi";

function LoginPage({ setProfile, onLoginSuccess, goToPage }) {
  const [name, setName] = useState("");

  async function handleLogin() {
    if (!name.trim()) {
      alert("請輸入使用者名稱。");
      return;
    }

    try {
      const result = await loginUserProfile(name);

      localStorage.setItem(
        "studybuddy-profile",
        JSON.stringify(result.data)
      );

      setProfile(result.data);

      onLoginSuccess();
    } catch (error) {
      console.error("登入失敗：", error);
      alert(error.message || "登入失敗，請確認使用者名稱。");
    }
  }

  return (
    <section className="screen">
      <button className="back-button" onClick={() => goToPage("welcome")}>
        ← 回首頁
      </button>

      <p className="section-label">Login</p>
      <h2 className="screen-title">使用名稱登入</h2>
      <p className="screen-description">
        請輸入你建立學習檔案時使用的名稱，系統會載入你的學習資料。
      </p>

      <div className="form-card">
        <label>
          使用者名稱
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="請輸入使用者名稱"
          />
        </label>

        <button className="primary-button" onClick={handleLogin}>
          登入
        </button>
      </div>
    </section>
  );
}

export default LoginPage;