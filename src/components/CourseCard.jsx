function CourseCard({ title, subtitle, time, note }) {
  return (
    <div className="course-card">
      <div className="course-card-main">
        <div>
          <span className="card-label">Course</span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        {time && <span className="course-time">{time}</span>}
      </div>

      {note && <p className="course-note">{note}</p>}
    </div>
  );
}

export default CourseCard;