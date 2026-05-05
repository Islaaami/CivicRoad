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
import { getReportPriority } from "../utils/reportPresentation";
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
  const municipalityLabel = user?.municipality || "your municipality";
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
              "Unable to load reports list."
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

  const categories = [...new Set(reports.map((report) => report.category_name || "Uncategorized"))]
    .sort((leftCategory, rightCategory) =>
      leftCategory.localeCompare(rightCategory)
    );

  const filteredReports = reports.filter((report) => {
    const reportPriority = getReportPriority(report);
    const searchableText = [
      report.title,
      report.description,
      report.category_name,
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
      (report.category_name || "Uncategorized") === filters.category;

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
              <span className={pageStyles.eyebrow}>Reports Management</span>
              <h1 className={pageStyles.title}>Operational report queue</h1>
              <p className={pageStyles.description}>
                {`Search and triage reports assigned to ${municipalityLabel}. Combine status, priority, and category filters to narrow the queue quickly.`}
              </p>
            </div>

            <div className={pageStyles.actions}>
              <Button as={Link} to="/map" variant="primary">
                Open map view
              </Button>
              <Button as={Link} to="/false-reports" variant="secondary">
                Archive view
              </Button>
            </div>
          </div>

        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Pulling the latest reports, priorities, and category data for the queue."
          rows={6}
          title="Loading reports"
        />
      ) : (
        <>
          <Card className={styles.filtersCard}>
            <div className={pageStyles.sectionHeader}>
              <div className={pageStyles.sectionCopy}>
                <h2 className={pageStyles.sectionTitle}>Filter the queue</h2>
                <p className={pageStyles.sectionText}>
                  Search by title or description, then refine the list by
                  workflow status, priority, or category.
                </p>
              </div>

              <Button
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                variant="secondary"
              >
                Reset filters
              </Button>
            </div>

            <div className={styles.filterGrid}>
              <Field htmlFor="report-search" label="Search">
                <Input
                  id="report-search"
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Search reports, descriptions, or locations"
                  type="search"
                  value={filters.search}
                />
              </Field>

              <Field htmlFor="status-filter" label="Status">
                <Select
                  id="status-filter"
                  onChange={(event) => updateFilter("status", event.target.value)}
                  value={filters.status}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </Field>

              <Field htmlFor="priority-filter" label="Priority">
                <Select
                  id="priority-filter"
                  onChange={(event) =>
                    updateFilter("priority", event.target.value)
                  }
                  value={filters.priority}
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </Field>

              <Field htmlFor="category-filter" label="Category">
                <Select
                  id="category-filter"
                  onChange={(event) =>
                    updateFilter("category", event.target.value)
                  }
                  value={filters.category}
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <ReportsTable
            description={`${filteredReports.length} report${
              filteredReports.length === 1 ? "" : "s"
            } shown for ${municipalityLabel}.`}
            emptyDescription="No reports match this filter combination. Reset the filters or broaden the search terms to see more results."
            reports={filteredReports}
            title="All reports"
          />
        </>
      )}
    </div>
  );
}

export default ReportsPage;
