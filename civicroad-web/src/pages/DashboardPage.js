import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports } from "../api/reports";
import ReportsTable from "../components/ReportsTable";
import StatusBadge from "../components/StatusBadge";

function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await getReports();
        if (active) {
          setReports(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load dashboard reports."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const pendingReports = reports.filter((report) => report.status === "pending");
  const inProgressReports = reports.filter(
    (report) => report.status === "in_progress"
  );
  const resolvedReports = reports.filter(
    (report) => report.status === "resolved"
  );

  const latestReports = reports.slice(0, 5);

  return (
    <div className="page-stack">
      <section className="dashboard-grid">
        <article className="stat-card">
          <p className="stat-card__label">Total reports</p>
          <p className="stat-card__value">{reports.length}</p>
          <p className="stat-card__hint">Full city issue queue across all categories.</p>
        </article>

        <article className="stat-card">
          <p className="stat-card__label">Pending</p>
          <p className="stat-card__value">{pendingReports.length}</p>
          <p className="stat-card__hint">Waiting for municipal action to begin.</p>
        </article>

        <article className="stat-card">
          <p className="stat-card__label">In progress</p>
          <p className="stat-card__value">{inProgressReports.length}</p>
          <p className="stat-card__hint">Teams already moving on site or in triage.</p>
        </article>

        <article className="stat-card">
          <p className="stat-card__label">Resolved</p>
          <p className="stat-card__value">{resolvedReports.length}</p>
          <p className="stat-card__hint">Completed issues that can be referenced later.</p>
        </article>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-state">Loading dashboard data...</div> : null}

      {!loading && !error ? (
        <section className="dashboard-columns">
          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3 className="section-title">Recent reports</h3>
                <p className="section-copy">
                  Latest issues submitted to the municipality.
                </p>
              </div>

              <Link className="button" to="/reports">
                Open full list
              </Link>
            </div>

            <ReportsTable reports={latestReports} />
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div>
                <h3 className="section-title">Priority focus</h3>
                <p className="section-copy">
                  Items that need immediate staff awareness.
                </p>
              </div>
            </div>

            <div className="focus-list">
              {pendingReports.length ? (
                pendingReports.slice(0, 4).map((report) => (
                  <Link className="focus-item" key={report.id} to={`/reports/${report.id}`}>
                    <div className="focus-item__copy">
                      <p className="focus-item__title">{report.title}</p>
                      <p className="focus-item__meta">
                        {report.category_name || "Uncategorized"}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  No pending reports right now. The queue is fully under control.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default DashboardPage;
