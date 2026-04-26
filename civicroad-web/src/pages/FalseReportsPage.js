import { useEffect, useState } from "react";
import { getFalseReports } from "../api/reports";
import { formatDate } from "../components/ReportsTable";
import { useAuth } from "../store/AuthContext";

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
    <div className="page-stack">
      <section className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">False reports</h1>
          <p className="page-header__text">
            {`Archived false reports logged for ${municipalityLabel}.`}
          </p>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      {loading ? (
        <div className="loading-state">Loading false report archive...</div>
      ) : falseReports.length ? (
        <div className="table-card">
          <div className="table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reported</th>
                  <th>Archived</th>
                </tr>
              </thead>
              <tbody>
                {falseReports.map((falseReport) => (
                  <tr key={falseReport.id}>
                    <td>
                      <p className="table-title">{falseReport.title || "Untitled report"}</p>
                      <p className="table-meta">{falseReport.description || "No description"}</p>
                    </td>
                    <td>{falseReport.category_name || "Uncategorized"}</td>
                    <td>{formatLocation(falseReport)}</td>
                    <td>{formatDate(falseReport.created_at)}</td>
                    <td>{formatDate(falseReport.deleted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          No false reports have been archived for this municipality yet.
        </div>
      )}
    </div>
  );
}

export default FalseReportsPage;
