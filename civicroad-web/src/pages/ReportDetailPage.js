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
  formatCategoryLabel,
  formatDate,
  getReportPriority,
} from "../utils/reportPresentation";
import { classNames } from "../utils/classNames";
import styles from "./ReportDetailPage.module.css";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "En attente",
    description: "En attente de revue ou d'affectation.",
  },
  {
    value: "in_progress",
    label: "En cours",
    description: "Attribué et en cours de traitement.",
  },
  {
    value: "resolved",
    label: "Résolu",
    description: "Terminé et conservé à titre de référence.",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "Faible",
    description: "Perturbation mineure avec urgence limitée.",
  },
  {
    value: "medium",
    label: "Moyenne",
    description: "Nécessite une action prochainement dans le flux normal.",
  },
  {
    value: "high",
    label: "Élevée",
    description: "Incident urgent qui demande un traitement plus rapide.",
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
            requestError.response?.data?.message ||
              "Impossible de charger le signalement."
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
        requestError.response?.data?.message ||
          "Impossible de mettre à jour le statut du signalement."
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
          "Impossible de mettre à jour la priorité du signalement."
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
      "Archiver ce signalement comme faux signalement et le retirer de la liste active ?"
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
          "Impossible d'archiver ce faux signalement pour le moment."
      );
      setFalseReportLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingPanel
        description="Chargement du résumé, des preuves, de la position sur la carte et des contrôles de traitement."
        rows={5}
        title="Chargement du détail du signalement"
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
              Retour aux signalements
            </Button>
          }
          description="Le signalement demandé est introuvable ou n'est plus disponible dans la file."
          icon="reports"
          title="Signalement indisponible"
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
          Retour aux signalements
        </Button>
      </div>

      {error ? <Notice>{error}</Notice> : null}

      <div className={styles.layout}>
        <div className={styles.primaryColumn}>
          <Card tone="soft">
            <div className={styles.badgeRow}>
              <StatusBadge status={report.status} />
              <PriorityTag priority={reportPriority} />
              <span className={styles.reportId}>
                {`Signalement n°${report.id}`}
              </span>
            </div>

            <div className={styles.summaryCopy}>
              <h1 className={styles.title}>{report.title}</h1>
              <p className={styles.description}>{report.description}</p>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Commune</span>
                <span className={styles.metaValue}>
                  {report.municipality || "Non attribuée"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Catégorie</span>
                <span className={styles.metaValue}>
                  {formatCategoryLabel(report.category_name)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Soumis le</span>
                <span className={styles.metaValue}>
                  {formatDate(report.created_at)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Preuve jointe</h2>
                <p className={pageStyles.sectionText}>
                  Consultez l'image envoyée avant d'agir sur le signalement.
                </p>
              </div>

              {reportImageUrl ? (
                <Button
                  onClick={() => setImageModalOpen(true)}
                  size="sm"
                  variant="secondary"
                >
                  Agrandir l'image
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
                description="Aucune image n'a été jointe à ce signalement."
                icon="image"
                title="Aucune image jointe"
              />
            )}
          </Card>

          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Localisation</h2>
                <p className={pageStyles.sectionText}>
                  Vérifiez la position du signalement sur la carte avant intervention ou clôture.
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
                <h2 className={pageStyles.sectionTitle}>Contrôles de traitement</h2>
                <p className={pageStyles.sectionText}>
                  Mettez à jour le statut et la gravité pour garder la file fiable.
                </p>
              </div>
            </div>

            <div className={styles.controlSection}>
              <div className={styles.controlHeader}>
                <span className={styles.controlLabel}>Statut</span>
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
                        ? "Enregistrement..."
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
                <span className={styles.controlLabel}>Priorité</span>
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
                        ? "Enregistrement..."
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
                <h2 className={pageStyles.sectionTitle}>Informations du signalement</h2>
                <p className={pageStyles.sectionText}>
                  Résumé opérationnel concis pour le tri et le suivi.
                </p>
              </div>
            </div>

            <div className={styles.factList}>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Statut actuel</span>
                <span className={styles.factValue}>
                  {formatStatusLabel(report.status)}
                </span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Priorité actuelle</span>
                <span className={styles.factValue}>
                  {formatPriorityLabel(reportPriority)}
                </span>
              </div>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>Catégorie</span>
                <span className={styles.factValue}>
                  {formatCategoryLabel(report.category_name)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Modération</h2>
                <p className={pageStyles.sectionText}>
                  Archivez les faux signalements afin de garder la file active propre.
                </p>
              </div>
            </div>

            <Button
              fullWidth
              loading={falseReportLoading}
              onClick={handleMarkFalseReport}
              variant="danger"
            >
              {falseReportLoading ? "Archivage..." : "Marquer comme faux signalement"}
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        description="Preuve en taille réelle jointe à ce signalement."
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
