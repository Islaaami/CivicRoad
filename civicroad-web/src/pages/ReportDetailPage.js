import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAssetUrl } from "../api/client";
import {
  getReport,
  markReportAsFalse,
  updateReportPriority,
  updateReportStatus,
} from "../api/reports";
import Icon from "../components/Icon";
import PriorityTag, { formatPriorityLabel } from "../components/PriorityTag";
import ReportMap from "../components/ReportMap";
import StatusBadge, { formatStatusLabel } from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingPanel from "../components/ui/LoadingPanel";
import Modal from "../components/ui/Modal";
import Notice from "../components/ui/Notice";
import pageStyles from "../styles/PageLayout.module.css";
import {
  formatDate,
  getReportPriority,
} from "../utils/reportPresentation";
import { classNames } from "../utils/classNames";
import styles from "./ReportDetailPage.module.css";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    description: "Waiting for review or assignment.",
  },
  {
    value: "in_progress",
    label: "In Progress",
    description: "Assigned and being worked.",
  },
  {
    value: "resolved",
    label: "Resolved",
    description: "Completed and ready for reference.",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "Low",
    description: "Minor disruption with limited urgency.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Needs action soon within normal workflow.",
  },
  {
    value: "high",
    label: "High",
    description: "Urgent issue that deserves faster handling.",
  },
];

function ReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState("");
  const [priorityLoading, setPriorityLoading] = useState("");
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

  async function handlePriorityChange(nextPriority) {
    if (!report || nextPriority === getReportPriority(report)) {
      return;
    }

    setPriorityLoading(nextPriority);
    setError("");

    try {
      const updatedReport = await updateReportPriority(report.id, nextPriority);
      setReport(updatedReport);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update report priority."
      );
    } finally {
      setPriorityLoading("");
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
    return (
      <LoadingPanel
        description="Loading the report summary, evidence, map position, and workflow controls."
        rows={5}
        title="Loading report details"
      />
    );
  }

  if (error && !report) {
    return <Notice>{error}</Notice>;
  }

  if (!report) {
    return (
      <Card>
        <EmptyState
          action={
            <Button as={Link} to="/reports" variant="secondary">
              Back to reports
            </Button>
          }
          description="The requested report could not be found or is no longer available in the queue."
          icon="reports"
          title="Report unavailable"
        />
      </Card>
    );
  }

  const reportImageUrl = getAssetUrl(report.image_url);
  const reportPriority = getReportPriority(report);

  return (
    <div className={pageStyles.stack}>
      <div className={styles.toolbar}>
        <Button
          as={Link}
          icon={<Icon name="arrowLeft" size={16} />}
          size="sm"
          to="/reports"
          variant="secondary"
        >
          Back to reports
        </Button>
      </div>

      {error ? <Notice>{error}</Notice> : null}

      <div className={styles.layout}>
        <div className={styles.primaryColumn}>
          <Card tone="soft">
            <div className={styles.badgeRow}>
              <StatusBadge status={report.status} />
              <PriorityTag priority={reportPriority} />
              <span className={styles.reportId}>Report #{report.id}</span>
            </div>

            <div className={styles.summaryCopy}>
              <h1 className={styles.title}>{report.title}</h1>
              <p className={styles.description}>{report.description}</p>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Municipality</span>
                <span className={styles.metaValue}>
                  {report.municipality || "Unassigned"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>
                  {report.category_name || "Uncategorized"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Submitted</span>
                <span className={styles.metaValue}>
                  {formatDate(report.created_at)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Attached evidence</h2>
                <p className={pageStyles.sectionText}>
                  Review the submitted image before taking action on the report.
                </p>
              </div>

              {reportImageUrl ? (
                <Button
                  onClick={() => setImageModalOpen(true)}
                  size="sm"
                  variant="secondary"
                >
                  Expand image
                </Button>
              ) : null}
            </div>

            {reportImageUrl ? (
              <button
                className={styles.imageButton}
                onClick={() => setImageModalOpen(true)}
                type="button"
              >
                <img
                  alt={report.title}
                  className={styles.reportImage}
                  src={reportImageUrl}
                />
              </button>
            ) : (
              <EmptyState
                compact
                description="The citizen did not attach an image to this report."
                icon="image"
                title="No image attached"
              />
            )}
          </Card>

          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Location</h2>
                <p className={pageStyles.sectionText}>
                  Confirm the report position on the map before dispatching or resolving the issue.
                </p>
              </div>
            </div>

            <ReportMap compact reports={[report]} showList={false} />
          </Card>
        </div>

        <div className={styles.sideColumn}>
          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Workflow controls</h2>
                <p className={pageStyles.sectionText}>
                  Update the service state and severity so the queue stays accurate.
                </p>
              </div>
            </div>

            <div className={styles.controlSection}>
              <div className={styles.controlHeader}>
                <span className={styles.controlLabel}>Status</span>
                <span className={styles.controlValue}>
                  {formatStatusLabel(report.status)}
                </span>
              </div>

              <div className={styles.optionGrid}>
                {STATUS_OPTIONS.map((statusOption) => (
                  <button
                    className={classNames(
                      styles.optionButton,
                      report.status === statusOption.value &&
                        styles.optionButtonActive
                    )}
                    disabled={Boolean(statusLoading)}
                    key={statusOption.value}
                    onClick={() => handleStatusChange(statusOption.value)}
                    type="button"
                  >
                    <span className={styles.optionTitle}>
                      {statusLoading === statusOption.value
                        ? "Saving..."
                        : statusOption.label}
                    </span>
                    <span className={styles.optionDescription}>
                      {statusOption.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlSection}>
              <div className={styles.controlHeader}>
                <span className={styles.controlLabel}>Priority</span>
                <span className={styles.controlValue}>
                  {formatPriorityLabel(reportPriority)}
                </span>
              </div>

              <div className={styles.optionGrid}>
                {PRIORITY_OPTIONS.map((priorityOption) => (
                  <button
                    className={classNames(
                      styles.optionButton,
                      reportPriority === priorityOption.value &&
                        styles.optionButtonActive
                    )}
                    disabled={Boolean(priorityLoading)}
                    key={priorityOption.value}
                    onClick={() => handlePriorityChange(priorityOption.value)}
                    type="button"
                  >
                    <span className={styles.optionTitle}>
                      {priorityLoading === priorityOption.value
                        ? "Saving..."
                        : priorityOption.label}
                    </span>
                    <span className={styles.optionDescription}>
                      {priorityOption.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card tone="subtle">
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Report facts</h2>
                <p className={pageStyles.sectionText}>
                  A concise operational summary for triage and follow-up.
                </p>
              </div>
            </div>

            <div className={styles.factList}>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Current status</span>
                <span className={styles.factValue}>
                  {formatStatusLabel(report.status)}
                </span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Current priority</span>
                <span className={styles.factValue}>
                  {formatPriorityLabel(reportPriority)}
                </span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Category</span>
                <span className={styles.factValue}>
                  {report.category_name || "Uncategorized"}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Moderation</h2>
                <p className={pageStyles.sectionText}>
                  Archive false submissions so the active operations queue stays clean.
                </p>
              </div>
            </div>

            <Button
              fullWidth
              loading={falseReportLoading}
              onClick={handleMarkFalseReport}
              variant="danger"
            >
              {falseReportLoading ? "Archiving..." : "Mark as false report"}
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        description="Full-size evidence submitted with this report."
        onClose={() => setImageModalOpen(false)}
        open={imageModalOpen && Boolean(reportImageUrl)}
        title={report.title}
      >
        {reportImageUrl ? (
          <img
            alt={report.title}
            className={styles.modalImage}
            src={reportImageUrl}
          />
        ) : null}
      </Modal>
    </div>
  );
}

export default ReportDetailPage;
