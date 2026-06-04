function WelcomePage({ onStart }) {
  return (
    <section className="screen welcome-screen">
      <div className="hero-panel">

        <h1>StudyBuddy AI</h1>
        <p className="hero-subtitle">Learn Smarter, Together.</p>

        <p className="hero-description">
          建立個人學習檔案後，系統會根據課表、近期測驗目標與可讀書時段，
          提供學習排程、學伴配對與進度追蹤功能。
        </p>

        <button className="primary-button" onClick={onStart}>
          開始建立學習檔案
        </button>
      </div>

      <div className="overview-grid">
        <div>
          <span>01</span>
          <h3>AI 學習排程</h3>
          <p>將測驗目標拆解為每日可完成任務。</p>
        </div>

        <div>
          <span>02</span>
          <h3>學伴配對</h3>
          <p>根據科目、目標與時段推薦學習夥伴。</p>
        </div>

        <div>
          <span>03</span>
          <h3>進度追蹤</h3>
          <p>以完成率與連續打卡建立學習節奏。</p>
        </div>
      </div>
    </section>
  );
}

export default WelcomePage;