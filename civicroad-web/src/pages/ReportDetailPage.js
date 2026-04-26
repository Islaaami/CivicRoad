import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAssetUrl } from "../api/client";
import { getReport, markReportAsFalse, updateReportStatus } from "../api/reports";
import ReportMap from "../components/ReportMap";
import { formatDate } from "../components/ReportsTable";
import StatusBadge, { formatStatusLabel } from "../components/StatusBadge";

const STATUS_OPTIONS = ["pending", "in_progress", "resolved"];

function ReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState("");
  const [falseReportLoading, setFalseReportLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReport() {
      try {
        const data = await getReport(reportId);
        if (active) {
          setReport(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message || "Unable to load report."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      active = false;
    };
  }, [reportId]);

  async function handleStatusChange(nextStatus) {
    if (!report || nextStatus === report.status) {
      return;
    }

    setStatusLoading(nextStatus);
    setError("");

    try {
      const updatedReport = await updateReportStatus(report.id, nextStatus);
      setReport(updatedReport);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update report status."
      );
    } finally {
      setStatusLoading("");
    }
  }

  async function handleMarkFalseReport() {
    if (!report || falseReportLoading) {
      return;
    }

    const confirmed = window.confirm(
      "Archive this report as a false report and remove it from the active report list?"
    );

    if (!confirmed) {
      return;
    }

    setFalseReportLoading(true);
    setError("");

    try {
      await markReportAsFalse(report.id);
      navigate("/false-reports");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to archive this false report right now."
      );
      setFalseReportLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-state">Loading report details...</div>;
  }

  if (error && !report) {
    return <div className="error-banner">{error}</div>;
  }

  if (!report) {
    return <div className="empty-state">This report could not be found.</div>;
  }

  const reportImageUrl = getAssetUrl(report.image_url);

  return (
    <div className="page-stack">
      <section className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Report detail</h1>
          <p className="page-header__text">
            Review the issue, confirm location, and move the status forward.
          </p>
        </div>

        <Link className="ghost-button" to="/reports">
          Back to reports
        </Link>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="detail-layout">
        <article className="detail-card">
          <StatusBadge status={report.status} />
          <h2 className="detail-card__title">{report.title}</h2>
          <div className="detail-card__meta">
            <span>{report.category_name || "Uncategorized"}</span>
            <span>{formatDate(report.created_at)}</span>
          </div>
          <p className="detail-card__description">{report.description}</p>

          {reportImageUrl ? (
            <button
              className="image-preview-button"
              onClick={() => setImageModalOpen(true)}
              type="button"
            >
              <img
                alt={report.title}
                className="report-image"
                src={reportImageUrl}
              />
            </button>
          ) : (
            <div className="empty-state">
              No image was attached to this report.
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-item__label">Municipality</span>
              <span className="detail-item__value">
                {report.municipality || "Unassigned"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-item__label">Category</span>
              <span className="detail-item__value">
                {report.category_name || "Uncategorized"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-item__label">Current status</span>
              <span className="detail-item__value">
                {formatStatusLabel(report.status)}
              </span>
            </div>
          </div>
        </article>

        <aside className="page-stack">
          <section className="status-card">
            <div className="section-heading">
              <div>
                <h3 className="section-title">Update status</h3>
                <p className="section-copy">
                  Move the issue through the municipality workflow.
                </p>
              </div>
            </div>

            <div className="status-controls">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  className={
                    status === report.status
                      ? "status-button is-active"
                      : "status-button"
                  }
                  disabled={Boolean(statusLoading)}
                  onClick={() => handleStatusChange(status)}
                  type="button"
                >
                  {statusLoading === status
                    ? "Saving..."
                    : formatStatusLabel(status)}
                </button>
              ))}
            </div>
          </section>

          <section className="status-card">
            <div className="section-heading">
              <div>
                <h3 className="section-title">Moderation</h3>
                <p className="section-copy">
                  Remove false submissions from the live queue and keep an archive log.
                </p>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="danger-button"
                disabled={falseReportLoading}
                onClick={handleMarkFalseReport}
                type="button"
              >
                {falseReportLoading ? "Archiving..." : "Mark as False Report"}
              </button>
            </div>
          </section>

          <section className="section-card">
            <div className="section-heading">
              <div>
                <h3 className="section-title">Location</h3>
                <p className="section-copy">Map position for this report.</p>
              </div>
            </div>

            <ReportMap compact reports={[report]} />
          </section>
        </aside>
      </section>

      {imageModalOpen && reportImageUrl ? (
        <div
          className="image-modal"
          onClick={() => setImageModalOpen(false)}
          role="presentation"
        >
          <div
            className="image-modal__panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Full-size report image"
          >
            <button
              className="image-modal__close"
              onClick={() => setImageModalOpen(false)}
              type="button"
            >
              Close
            </button>
            <img
              alt={report.title}
              className="image-modal__image"
              src={reportImageUrl}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReportDetailPage;
