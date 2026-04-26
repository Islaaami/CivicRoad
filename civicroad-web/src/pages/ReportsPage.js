import { useEffect, useState } from "react";
import { getReports } from "../api/reports";
import ReportsTable from "../components/ReportsTable";
import { useAuth } from "../store/AuthContext";

function ReportsPage() {
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

  return (
    <div className="page-stack">
      <section className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Reports</h1>
          <p className="page-header__text">
            {`Report table filtered to ${municipalityLabel} for municipal follow-up.`}
          </p>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? (
        <div className="loading-state">Loading reports...</div>
      ) : (
        <ReportsTable reports={reports} />
      )}
    </div>
  );
}

export default ReportsPage;
