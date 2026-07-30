export function JobStagesCard() {
  return (
    <div className="sidebar-card">
      <p className="sidebar-title">JOB STAGES</p>

      <div className="stage-row">
        <span className="dot amber"></span>
        <div>
          <strong>Assigned</strong>
          <p>Bid accepted</p>
        </div>
      </div>

      <div className="stage-row">
        <span className="dot blue"></span>
        <div>
          <strong>In Progress</strong>
          <p>Work underway</p>
        </div>
      </div>

      <div className="stage-row">
        <span className="dot green"></span>
        <div>
          <strong>Completed</strong>
          <p>Customer confirmed</p>
        </div>
      </div>
    </div>
  );
}
