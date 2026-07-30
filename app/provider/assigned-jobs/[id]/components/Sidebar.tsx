export function JobStagesSidebar() {
  return (
    <div className="aj-sidebar-card">
      <p className="aj-sidebar-label">JOB STAGES</p>
      <div className="stages-list">
        <div className="stage-row">
          <span className="stage-dot dot-amber" />
          <div>
            <p className="stage-name">Assigned</p>
            <p className="stage-sub">Bid accepted, work not started</p>
          </div>
        </div>
        <div className="stage-row">
          <span className="stage-dot dot-blue" />
          <div>
            <p className="stage-name">In Progress</p>
            <p className="stage-sub">You've started the work</p>
          </div>
        </div>
        <div className="stage-row">
          <span className="stage-dot dot-green" />
          <div>
            <p className="stage-name">Completed</p>
            <p className="stage-sub">Customer has confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelpSidebar() {
  return (
    <div className="aj-sidebar-card help-card">
      <p className="aj-sidebar-label">NEED HELP?</p>
      <p className="help-text">
        If a customer is unresponsive or the job scope changes significantly,
        contact support.
      </p>
      <button className="btn-support">Contact Support</button>
    </div>
  );
}
