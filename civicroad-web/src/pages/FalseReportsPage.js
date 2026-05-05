import { useEffect, useState } from "react";
import { getFalseReports } from "../api/reports";
import PriorityTag from "../components/PriorityTag";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingPanel from "../components/ui/LoadingPanel";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import pageStyles from "../styles/PageLayout.module.css";
import {
  formatCategoryLabel,
  formatDate,
} from "../utils/reportPresentation";
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

  return falseReport.municipality || "Localisation inconnue";
}

function FalseReportsPage() {
  const { user } = useAuth();
  const [falseReports, setFalseReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const municipalityLabel = user?.municipality || "votre commune";

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
              "Impossible de charger les archives des faux signalements."
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
              <span className={pageStyles.eyebrow}>Archives</span>
              <h1 className={pageStyles.title}>Archives des faux signalements</h1>
              <p className={pageStyles.description}>
                {`Consultez les faux signalements archivés de ${municipalityLabel} afin de conserver un historique clair sans encombrer la file active.`}
              </p>
            </div>
          </div>

          <div className={pageStyles.summaryGrid}>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>
                Signalements archivés
              </span>
              <strong className={pageStyles.summaryValue}>
                {falseReports.length}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Faux signalements conservés pour consultation interne.
              </span>
            </div>
            <div className={pageStyles.summaryCard}>
              <span className={pageStyles.summaryLabel}>Dernier archivage</span>
              <strong className={pageStyles.summaryValue}>
                {falseReports[0] ? formatDate(falseReports[0].deleted_at) : "--"}
              </strong>
              <span className={pageStyles.summaryMeta}>
                Action de modération la plus récente enregistrée.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Chargement des signalements archivés, horodatages de modération et métadonnées."
          rows={5}
          title="Chargement des archives"
        />
      ) : falseReports.length ? (
        <Card className={sharedTableStyles.card} padding="none">
          <div className={sharedTableStyles.header}>
            <div className={sharedTableStyles.headerCopy}>
              <h2 className={sharedTableStyles.title}>Faux signalements archivés</h2>
              <p className={sharedTableStyles.description}>
                Les signalements invalides sont retirés de la file active mais restent visibles ici pour traçabilité.
              </p>
            </div>
          </div>

          <div className={sharedTableStyles.scroll}>
            <table className={sharedTableStyles.table}>
              <thead>
                <tr>
                  <th>Signalement</th>
                  <th>Catégorie</th>
                  <th>Priorité</th>
                  <th>Localisation</th>
                  <th>Signalé le</th>
                  <th>Archivé le</th>
                </tr>
              </thead>
              <tbody>
                {falseReports.map((falseReport) => (
                  <tr className={sharedTableStyles.row} key={falseReport.id}>
                    <td>
                      <div className={styles.reportCell}>
                        <div className={styles.copy}>
                          <p className={styles.title}>
                            {falseReport.title || "Signalement sans titre"}
                          </p>
                          <p className={styles.description}>
                            {falseReport.description || "Aucune description fournie."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={sharedTableStyles.secondaryText}>
                      {formatCategoryLabel(falseReport.category_name)}
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
            description="Aucun signalement n'a encore été archivé comme faux signalement pour cette commune."
            icon="archive"
            title="Les archives sont vides"
          />
        </Card>
      )}
    </div>
  );
}

export default FalseReportsPage;
