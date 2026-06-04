function FeatureButton({ title, description, meta, onClick }) {
  return (
    <button className="feature-button" onClick={onClick}>
      <div className="feature-button-content">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        {meta && <span className="feature-button-meta">{meta}</span>}
      </div>
    </button>
  );
}

export default FeatureButton;