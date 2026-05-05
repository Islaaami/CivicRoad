import { useEffect, useState } from "react";
import { getFalseReports } from "../api/reports";
import PriorityTag from "../components/PriorityTag";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingPanel from "../components/ui/LoadingPanel";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import pageStyles from "../styles/PageLayout.module.css";
import { formatDate } from "../utils/reportPresentation";
import sharedTableStyles from "../components/DataTable.module.css";
import styles from "./FalseReportsPage.module.css";

function formatLocation(falseReport) {
  if (falseReport.address) {
    return falseReport.address;
  }

  if (
    Number.isFinite(Number(falseReport.latitude)) &&
    Number.isFinite(Number(falseReport.longitude))
  ) {
    return `${Number(falseReport.latitude).toFixed(5)}, ${Number(falseReport.longitude).toFixed(5)}`;
  }

  return falseReport.municipality || "Unknown location";
}

function FalseReportsPage() {
  const { user } = useAuth();
  const [falseReports, setFalseReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const municipalityLabel = user?.municipality || "your municipality";

  useEffect(() => {
    let active = true;

    async function loadFalseReports() {
      try {
        const data = await getFalseReports();

        if (active) {
          setFalseReports(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load false report archive."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFalseReports();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={pageStyles.stack}>
      <Card tone="soft">
        <div className={pageStyles.hero}>
          <div className={pageStyles.heroHeader}>
            <div className={pageStyles.heroCopy}>
              <span className={pageStyles.eyebrow}>Archive Review</span>
              <h1 className={pageStyles.title}>False reports archive</h1>
              <p className={pageStyles.description}>
                {`Review archived false submissions from ${municipalityLabel} so moderation decisions remain visible without cluttering the active queue.`}
              </p>
            </div>
          </div>

          <div className={pageStyles.summaryGrid}>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Archived reports</span>
              <strong className={pageStyles.summaryValue}>
                {falseReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Historical false submissions retained for internal review.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Latest archive</span>
              <strong className={pageStyles.summaryValue}>
                {falseReports[0] ? formatDate(falseReports[0].deleted_at) : "--"}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Most recent moderation action currently on record.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Loading archived reports, moderation timestamps, and historical metadata."
          rows={5}
          title="Loading archive"
        />
      ) : falseReports.length ? (
        <Card className={sharedTableStyles.card} padding="none">
          <div className={sharedTableStyles.header}>
            <div className={sharedTableStyles.headerCopy}>
              <h2 className={sharedTableStyles.title}>Archived false reports</h2>
              <p className={sharedTableStyles.description}>
                False submissions are removed from the live queue but remain visible here for accountability.
              </p>
            </div>
          </div>

          <div className={sharedTableStyles.scroll}>
            <table className={sharedTableStyles.table}>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Reported</th>
                  <th>Archived</th>
                </tr>
              </thead>
              <tbody>
                {falseReports.map((falseReport) => (
                  <tr className={sharedTableStyles.row} key={falseReport.id}>
                    <td>
                      <div className={styles.reportCell}>
                        <div className={styles.copy}>
                          <p className={styles.title}>
                            {falseReport.title || "Untitled report"}
                          </p>
                          <p className={styles.description}>
                            {falseReport.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={sharedTableStyles.secondaryText}>
                      {falseReport.category_name || "Uncategorized"}
                    </td>
                    <td>
                      <PriorityTag
                        priority={falseReport.priority}
                        size="sm"
                      />
                    </td>
                    <td className={sharedTableStyles.secondaryText}>
                      <span className={styles.location}>
                        {formatLocation(falseReport)}
                      </span>
                    </td>
                    <td className={sharedTableStyles.secondaryText}>
                      {formatDate(falseReport.created_at)}
                    </td>
                    <td className={sharedTableStyles.secondaryText}>
                      {formatDate(falseReport.deleted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            description="No reports have been archived as false submissions for this municipality yet."
            icon="archive"
            title="Archive is empty"
          />
        </Card>
      )}
    </div>
  );
}

export default FalseReportsPage;
