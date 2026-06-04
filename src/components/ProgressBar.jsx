function ProgressBar({ label = "完成率", value = 0, helperText }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="progress-card">
      <div className="progress-header">
        <span>{label}</span>
        <strong>{safeValue}%</strong>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>

      {helperText && <p>{helperText}</p>}
    </div>
  );
}

export default ProgressBar;
