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
  const municipalityLabel = user?.municipality || "votre commune";

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
            requestError.response?.data?.message ||
              "Impossible de charger les données de la carte."
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
              <span className={pageStyles.eyebrow}>Vue cartographique</span>
              <h1 className={pageStyles.title}>Carte des signalements</h1>
              <p className={pageStyles.description}>
                {`Consultez la répartition géographique des incidents dans ${municipalityLabel}, identifiez les zones sensibles et ouvrez le signalement exact à traiter.`}
              </p>
            </div>

            <div className={pageStyles.actions}>
              <Button as={Link} to="/reports" variant="primary">
                Ouvrir les signalements
              </Button>
            </div>
          </div>

          <div className={pageStyles.summaryGrid}>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>
                Total des signalements
              </span>
              <strong className={pageStyles.summaryValue}>
                {mappedReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Signalements avec coordonnées valides sur la carte actuelle.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>En attente</span>
              <strong className={pageStyles.summaryValue}>{pendingMapped}</strong>
              <span className={pageStyles.summaryMeta}>
                Incidents ouverts nécessitant encore un suivi opérationnel.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>En cours</span>
              <strong className={pageStyles.summaryValue}>
                {inProgressMapped}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Incidents actuellement traités par les équipes communales.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Résolu</span>
              <strong className={pageStyles.summaryValue}>
                {resolvedMapped}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Incidents terminés encore visibles à titre de référence.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Chargement des positions, du style des marqueurs et du contexte cartographique."
          rows={4}
          title="Chargement de la carte"
        />
      ) : (
        <>
          <Card className={styles.legendCard}>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Légende des marqueurs</h2>
                <p className={pageStyles.sectionText}>
                  Les couleurs des marqueurs reflètent le statut pour une lecture plus rapide.
                </p>
              </div>
            </div>

            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDotPending} />
                En attente
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotProgress} />
                En cours
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotResolved} />
                Résolu
              </span>
            </div>
          </Card>

          <ReportMap
            description="Sélectionnez un marqueur ou ouvrez un signalement depuis le panneau latéral pour consulter l'incident complet."
            reports={reports}
            title="Signalements avec coordonnées valides"
          />
        </>
      )}
    </div>
  );
}

export default MapPage;
