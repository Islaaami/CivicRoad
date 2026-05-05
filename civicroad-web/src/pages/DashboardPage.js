import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports } from "../api/reports";
import PriorityTag from "../components/PriorityTag";
import ReportsTable from "../components/ReportsTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingPanel from "../components/ui/LoadingPanel";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import pageStyles from "../styles/PageLayout.module.css";
import {
  formatDate,
  getReportPriority,
} from "../utils/reportPresentation";
import styles from "./DashboardPage.module.css";

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const municipalityLabel = user?.municipality || "your municipality";

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
  const highPriorityReports = reports.filter(
    (report) => getReportPriority(report) === "high"
  );
  const latestReports = reports.slice(0, 5);
  const focusReports = reports
    .filter(
      (report) =>
        report.status === "pending" || report.status === "in_progress"
    )
    .slice()
    .sort((leftReport, rightReport) => {
      const leftPriority = getReportPriority(leftReport) || "none";
      const rightPriority = getReportPriority(rightReport) || "none";
      const priorityDifference =
        PRIORITY_ORDER[leftPriority] - PRIORITY_ORDER[rightPriority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(rightReport.created_at) - new Date(leftReport.created_at);
    })
    .slice(0, 5);

  return (
    <div className={pageStyles.stack}>
      <Card tone="soft">
        <div className={pageStyles.hero}>
          <div className={pageStyles.heroHeader}>
            <div className={pageStyles.heroCopy}>
              <span className={pageStyles.eyebrow}>Operations Snapshot</span>
              <h1 className={pageStyles.title}>Keep the city queue moving.</h1>
              <p className={pageStyles.description}>
                {`Monitor the active service queue for ${municipalityLabel}, spot urgent cases early, and jump into the latest reports without losing context.`}
              </p>
            </div>

            <div className={pageStyles.actions}>
              <Button as={Link} to="/reports" variant="primary">
                Open reports
              </Button>
              <Button as={Link} to="/map" variant="secondary">
                View map
              </Button>
            </div>
          </div>

          <div className={pageStyles.summaryGrid}>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Total reports</span>
              <strong className={pageStyles.summaryValue}>{reports.length}</strong>
              <span className={pageStyles.summaryMeta}>
                Live queue currently assigned to your municipality.
              </span>
            </div>

            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Pending</span>
              <strong className={pageStyles.summaryValue}>
                {pendingReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Waiting for municipal follow-up or assignment.
              </span>
            </div>

            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>In progress</span>
              <strong className={pageStyles.summaryValue}>
                {inProgressReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Already being worked by the operations team.
              </span>
            </div>

            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>High priority</span>
              <strong className={pageStyles.summaryValue}>
                {highPriorityReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Needs faster attention due to service severity.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Preparing the latest queue summary, focus list, and recent report activity."
          rows={5}
          title="Loading dashboard"
        />
      ) : null}

      {!loading && !error ? (
        <div className={styles.layout}>
          <ReportsTable
            action={
              <Button as={Link} to="/reports" variant="secondary">
                Full list
              </Button>
            }
            description={`Newest submissions routed to ${municipalityLabel}.`}
            reports={latestReports}
            title="Recent reports"
          />

          <div className={styles.sideColumn}>
            <Card>
              <div className={pageStyles.sectionHeader}>
                <div className={pageStyles.sectionCopy}>
                  <h2 className={pageStyles.sectionTitle}>Priority focus</h2>
                  <p className={pageStyles.sectionText}>
                    Quick access to the reports that deserve the most immediate
                    staff awareness.
                  </p>
                </div>
              </div>

              <div className={styles.focusList}>
                {focusReports.length ? (
                  focusReports.map((report) => (
                    <Link
                      className={styles.focusItem}
                      key={report.id}
                      to={`/reports/${report.id}`}
                    >
                      <div className={styles.focusCopy}>
                        <p className={styles.focusTitle}>{report.title}</p>
                        <p className={styles.focusMeta}>
                          {`${report.category_name || "Uncategorized"} - ${formatDate(
                            report.created_at
                          )}`}
                        </p>
                      </div>
                      <div className={styles.focusBadges}>
                        <PriorityTag
                          priority={getReportPriority(report)}
                          size="sm"
                        />
                        <StatusBadge size="sm" status={report.status} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className={styles.emptyText}>
                    No reports need immediate attention right now.
                  </p>
                )}
              </div>
            </Card>

            <Card tone="subtle">
              <div className={pageStyles.sectionHeader}>
                <div className={pageStyles.sectionCopy}>
                  <h2 className={pageStyles.sectionTitle}>Workflow balance</h2>
                  <p className={pageStyles.sectionText}>
                    A quick distribution of active work across the queue.
                  </p>
                </div>
              </div>

              <div className={styles.metricList}>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Pending</span>
                  <strong className={styles.metricValue}>
                    {pendingReports.length}
                  </strong>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>In progress</span>
                  <strong className={styles.metricValue}>
                    {inProgressReports.length}
                  </strong>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Resolved</span>
                  <strong className={styles.metricValue}>
                    {reports.length -
                      pendingReports.length -
                      inProgressReports.length}
                  </strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardPage;
