import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports } from "../api/reports";
import ReportsTable from "../components/ReportsTable";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Field";
import LoadingPanel from "../components/ui/LoadingPanel";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import pageStyles from "../styles/PageLayout.module.css";
import {
  formatCategoryLabel,
  getReportPriority,
} from "../utils/reportPresentation";
import styles from "./ReportsPage.module.css";

function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    category: "all",
  });
  const municipalityLabel = user?.municipality || "votre commune";
  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());

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
              "Impossible de charger la liste des signalements."
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

  function updateFilter(key, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      category: "all",
    });
  }

  const categories = [
    ...new Set(reports.map((report) => report.category_name || "Non catégorisé")),
  ]
    .sort((leftCategory, rightCategory) =>
      formatCategoryLabel(leftCategory).localeCompare(
        formatCategoryLabel(rightCategory),
        "fr"
      )
    );

  const filteredReports = reports.filter((report) => {
    const reportPriority = getReportPriority(report);
    const searchableText = [
      report.title,
      report.description,
      formatCategoryLabel(report.category_name),
      report.municipality,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !deferredSearch || searchableText.includes(deferredSearch);
    const matchesStatus =
      filters.status === "all" || report.status === filters.status;
    const matchesPriority =
      filters.priority === "all" || reportPriority === filters.priority;
    const matchesCategory =
      filters.category === "all" ||
      (report.category_name || "Non catégorisé") === filters.category;

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesCategory
    );
  });

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== "all"
  );
  return (
    <div className={pageStyles.stack}>
      <Card tone="soft">
        <div className={pageStyles.hero}>
          <div className={pageStyles.heroHeader}>
            <div className={pageStyles.heroCopy}>
              <span className={pageStyles.eyebrow}>Gestion des signalements</span>
              <h1 className={pageStyles.title}>File opérationnelle des signalements</h1>
              <p className={pageStyles.description}>
                {`Recherchez et traitez les signalements attribués à ${municipalityLabel}. Combinez les filtres de statut, de priorité et de catégorie pour affiner rapidement la file.`}
              </p>
            </div>

            <div className={pageStyles.actions}>
              <Button as={Link} to="/map" variant="primary">
                Ouvrir la carte
              </Button>
              <Button as={Link} to="/false-reports" variant="secondary">
                Voir les archives
              </Button>
            </div>
          </div>

        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Chargement des derniers signalements, priorités et catégories de la file."
          rows={6}
          title="Chargement des signalements"
        />
      ) : (
        <>
          <Card className={styles.filtersCard}>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Filtrer la file</h2>
                <p className={pageStyles.sectionText}>
                  Recherchez par titre ou description, puis affinez la liste par statut, priorité ou catégorie.
                </p>
              </div>

              <Button
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                variant="secondary"
              >
                Réinitialiser les filtres
              </Button>
            </div>

            <div className={styles.filterGrid}>
              <Field htmlFor="report-search" label="Rechercher">
                <Input
                  id="report-search"
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Rechercher des signalements, descriptions ou lieux"
                  type="search"
                  value={filters.search}
                />
              </Field>

              <Field htmlFor="status-filter" label="Statut">
                <Select
                  id="status-filter"
                  onChange={(event) => updateFilter("status", event.target.value)}
                  value={filters.status}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolu</option>
                </Select>
              </Field>

              <Field htmlFor="priority-filter" label="Priorité">
                <Select
                  id="priority-filter"
                  onChange={(event) =>
                    updateFilter("priority", event.target.value)
                  }
                  value={filters.priority}
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </Select>
              </Field>

              <Field htmlFor="category-filter" label="Catégorie">
                <Select
                  id="category-filter"
                  onChange={(event) =>
                    updateFilter("category", event.target.value)
                  }
                  value={filters.category}
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategoryLabel(category)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <ReportsTable
            description={`${filteredReports.length} signalement${
              filteredReports.length > 1 ? "s" : ""
            } affiché${
              filteredReports.length > 1 ? "s" : ""
            } pour ${municipalityLabel}.`}
            emptyDescription="Aucun signalement ne correspond à cette combinaison de filtres. Réinitialisez les filtres ou élargissez votre recherche."
            reports={filteredReports}
            title="Tous les signalements"
          />
        </>
      )}
    </div>
  );
}

export default ReportsPage;
