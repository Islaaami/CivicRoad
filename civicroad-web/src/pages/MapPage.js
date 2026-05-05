import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMapReports } from "../api/reports";
import ReportMap from "../components/ReportMap";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingPanel from "../components/ui/LoadingPanel";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import pageStyles from "../styles/PageLayout.module.css";
import styles from "./MapPage.module.css";

function MapPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const municipalityLabel = user?.municipality || "your municipality";

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await getMapReports();
        if (active) {
          setReports(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message || "Unable to load map data."
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

  const mappedReports = reports.filter(
    (report) =>
      Number.isFinite(Number(report.latitude)) &&
      Number.isFinite(Number(report.longitude))
  );
  const pendingMapped = mappedReports.filter(
    (report) => report.status === "pending"
  ).length;
  const inProgressMapped = mappedReports.filter(
    (report) => report.status === "in_progress"
  ).length;
  const resolvedMapped = mappedReports.filter(
    (report) => report.status === "resolved"
  ).length;

  return (
    <div className={pageStyles.stack}>
      <Card tone="soft">
        <div className={pageStyles.hero}>
          <div className={pageStyles.heroHeader}>
            <div className={pageStyles.heroCopy}>
              <span className={pageStyles.eyebrow}>Spatial Intelligence</span>
              <h1 className={pageStyles.title}>Citywide report map</h1>
              <p className={pageStyles.description}>
                {`Review the spatial distribution of issues in ${municipalityLabel}, identify hotspots, and open the exact report that needs action.`}
              </p>
            </div>

            <div className={pageStyles.actions}>
              <Button as={Link} to="/reports" variant="primary">
                Open reports
              </Button>
            </div>
          </div>

          <div className={pageStyles.summaryGrid}>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Total</span>
              <strong className={pageStyles.summaryValue}>
                {mappedReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Reports with valid coordinates on the current map view.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Pending</span>
              <strong className={pageStyles.summaryValue}>{pendingMapped}</strong>
              <span className={pageStyles.summaryMeta}>
                Open incidents that still need operational follow-up.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>In Progress</span>
              <strong className={pageStyles.summaryValue}>
                {inProgressMapped}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Issues currently being worked by municipal teams.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Resolved</span>
              <strong className={pageStyles.summaryValue}>
                {resolvedMapped}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Completed issues still available for reference on the map.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Loading report locations, marker styling, and map-side report context."
          rows={4}
          title="Loading report map"
        />
      ) : (
        <>
          <Card className={styles.legendCard}>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Marker legend</h2>
                <p className={pageStyles.sectionText}>
                  Marker colors reflect workflow status so teams can scan the map faster.
                </p>
              </div>
            </div>

            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDotPending} />
                Pending
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotProgress} />
                In Progress
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotResolved} />
                Resolved
              </span>
            </div>
          </Card>

          <ReportMap
            description="Select a marker or open a report from the side panel to review the full incident."
            reports={reports}
            title="Reports with valid coordinates"
          />
        </>
      )}
    </div>
  );
}

export default MapPage;
